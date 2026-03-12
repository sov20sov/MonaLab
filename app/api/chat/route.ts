import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { callNvidiaChat } from '../../../src/lib/nvidiaChat';
import {
  AI_MODEL_NAME,
  AI_SYSTEM_INSTRUCTION,
  AI_GENERATION_CONFIG,
} from '../../../src/config/aiConfig';
import { prisma } from '../../../src/lib/prisma';

type ChatRole = 'user' | 'model';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type RateInfo = { count: number; windowStart: number };
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateStore = new Map<string, RateInfo>();

function checkRateLimit(ip: string | null | undefined): {
  ok: boolean;
  retryAfterMs?: number;
} {
  // تم إلغاء حد الطلبات لكل مستخدم حالياً
  return { ok: true };
}

function is429Error(err: any): boolean {
  return (
    err?.status === 429 ||
    err?.httpStatusCode === 429 ||
    err?.statusCode === 429 ||
    err?.message?.includes?.('429') ||
    err?.message?.includes?.('Too Many Requests') ||
    err?.message?.includes?.('quota') ||
    err?.message?.includes?.('rate') ||
    err?.code === 'RESOURCE_EXHAUSTED'
  );
}

function humanizeError(err: any): string {
  const msg: string = err?.message ?? '';

  if (
    is429Error(err) ||
    msg.includes('quota') ||
    msg.includes('exceeded')
  ) {
    return 'وصل حد الطلبات أو الحصة المجانية. انتظر دقيقة ثم اضغط «إعادة المحاولة».';
  }
  if (err?.status === 401) {
    return 'حدثت مشكلة في مفتاح الاتصال بخدمة الذكاء الاصطناعي. الرجاء مراجعة إعدادات الخادم.';
  }
  if (err?.status === 400 || msg.includes('invalid')) {
    return 'حدث خطأ في صياغة الطلب. حاول إعادة صياغة رسالتك.';
  }
  if (msg === 'TIMEOUT' || msg.includes('timeout') || msg.includes('Timeout')) {
    return 'انتهت مهلة الاتصال بخدمة الذكاء الاصطناعي. الرجاء المحاولة مجدداً.';
  }
  if (msg.includes('network') || msg.includes('connect') || msg.includes('ECONNREFUSED')) {
    return 'فشل الاتصال بخدمة الذكاء الاصطناعي. تحقق من اتصال الإنترنت وحاول مجدداً.';
  }
  return 'حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms),
    ),
  ]);
}

async function persistConversation(
  trimmed: ChatMessage[],
  aiContent: string,
  conversationTitle: string | undefined,
  userId: string | null | undefined,
): Promise<string | undefined> {
  if (!prisma || !aiContent) return undefined;
  try {
    const title =
      typeof conversationTitle === 'string'
        ? conversationTitle.trim().slice(0, 255) || 'بحث جديد'
        : 'بحث جديد';
    const allMessages = [
      ...trimmed,
      { role: 'model' as const, content: aiContent },
    ];
    const conv = await prisma.conversation.create({
      data: {
        title,
        userId:
          typeof userId === 'string' && userId.trim() ? userId.trim() : null,
        messages: {
          create: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      },
    });
    return conv.id;
  } catch {
    return undefined;
  }
}

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 50_000;
// نقلل المهلة حتى لا يتجاوز التنفيذ حدود Vercel (حوالي 10 ثوانٍ)
const NVIDIA_CALL_TIMEOUT_MS = 9_000;
const KEEP_ALIVE_INTERVAL_MS = 8_000;

export async function POST(req: NextRequest) {
  try {
    const nvidiaKey = (process.env.NVIDIA_API_KEY ?? '').trim();

    if (!nvidiaKey) {
      return NextResponse.json(
        {
          error:
            'أضف NVIDIA_API_KEY في .env أو .env.local ثم أعد تشغيل السيرفر.',
        },
        { status: 500 },
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip');

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.ok) {
      const retryAfter = Math.ceil(
        (rateCheck.retryAfterMs ?? RATE_LIMIT_WINDOW_MS) / 1000,
      );
      return NextResponse.json(
        {
          error:
            'تم تجاوز حد الطلبات. الرجاء الانتظار ثم المحاولة مجدداً.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        },
      );
    }

    const body = (await req.json()) as {
      messages?: ChatMessage[];
      persist?: boolean;
      title?: string;
      userId?: string | null;
      stream?: boolean;
    };
    const {
      messages,
      persist,
      title: conversationTitle,
      userId,
      stream: wantStream,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'قائمة الرسائل غير صالحة.' },
        { status: 400 },
      );
    }

    const trimmed = messages.slice(-MAX_MESSAGES);
    for (const m of trimmed) {
      if (
        typeof m.content !== 'string' ||
        m.content.length > MAX_CONTENT_LENGTH
      ) {
        return NextResponse.json(
          {
            error: `كل رسالة يجب ألا تتجاوز ${MAX_CONTENT_LENGTH} حرفاً.`,
          },
          { status: 400 },
        );
      }
      if (m.role !== 'user' && m.role !== 'model') {
        return NextResponse.json(
          { error: 'دور الرسالة غير صالح.' },
          { status: 400 },
        );
      }
    }

    const maxRetries = 2;
    const baseDelayMs = 3_000;
    const maxDelayMs = 8_000;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await withTimeout(
          callNvidiaChat(trimmed, nvidiaKey),
          NVIDIA_CALL_TIMEOUT_MS,
        );

        if ('error' in result) {
          throw new Error(result.error);
        }

        const text = result.content;

        if (persist) {
          const conversationId = await persistConversation(
            trimmed,
            text,
            conversationTitle,
            userId,
          );
          if (conversationId) {
            return NextResponse.json({
              content: text,
              conversationId,
            });
          }
        }

        return NextResponse.json({ content: text });
      } catch (err: any) {
        lastError = err;

        if (
          (is429Error(err) || err?.message === 'TIMEOUT') &&
          attempt < maxRetries
        ) {
          const expDelay = Math.min(
            baseDelayMs * Math.pow(2, attempt),
            maxDelayMs,
          );
          const jitter = Math.random() * 2_000;
          const delay = Math.floor(expDelay + jitter);
          // eslint-disable-next-line no-console
          console.warn(
            `[api/chat] NVIDIA attempt ${attempt + 1}/${maxRetries + 1} (${err?.message}), retry after ${Math.round(delay / 1000)}s`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break;
      }
    }

    throw lastError ?? new Error('لا يوجد مزوّد ذكاء اصطناعي متاح.');
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[api/chat] Error:', error);

    const statusCode = is429Error(error)
      ? 429
      : error?.message === 'TIMEOUT'
        ? 504
        : 500;

    const detail =
      typeof error?.message === 'string'
        ? error.message
        : typeof error?.toString === 'function'
          ? error.toString()
          : null;

    return NextResponse.json(
      {
        error: humanizeError(error),
        ...(detail && { detail }),
      },
      { status: statusCode },
    );
  }
}
