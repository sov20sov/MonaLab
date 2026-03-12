import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  AI_MODEL_NAME,
  AI_SYSTEM_INSTRUCTION,
  AI_GENERATION_CONFIG,
} from '../../../src/config/aiConfig';
import { callNvidiaChat } from '../../../src/lib/nvidiaChat';
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
  if (process.env.NODE_ENV !== 'production') return { ok: true };

  const key = ip || 'unknown';
  const now = Date.now();
  const current = rateStore.get(key);

  if (!current) {
    rateStore.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  const elapsed = now - current.windowStart;
  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { ok: false, retryAfterMs: RATE_LIMIT_WINDOW_MS - elapsed };
  }

  current.count += 1;
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

export async function POST(req: NextRequest) {
  try {
    const geminiKey = (
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      ''
    ).trim();
    const nvidiaKey = (process.env.Nivedi_api_key ?? '').trim();

    if (!geminiKey && !nvidiaKey) {
      return NextResponse.json(
        {
          error:
            'أضف GEMINI_API_KEY أو Nivedi_api_key في .env أو .env.local ثم أعد تشغيل السيرفر.',
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

    const historyParts = trimmed.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const geminiConfig = {
      systemInstruction: AI_SYSTEM_INSTRUCTION,
      ...AI_GENERATION_CONFIG,
    };

    let lastError: any;

    /* ── Gemini ── */
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const maxRetries = 3;
      const baseDelayMs = 4_000;
      const maxDelayMs = 15_000;

      /* streaming path */
      if (wantStream) {
        try {
          const streamResult = ai.models.generateContentStream({
            model: AI_MODEL_NAME,
            contents: historyParts,
            config: geminiConfig,
          });

          let fullContent = '';
          const encoder = new TextEncoder();

          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of await streamResult) {
                  const res = chunk as {
                    text?: string;
                    candidates?: Array<{
                      content?: {
                        parts?: Array<{ text?: string }>;
                      };
                    }>;
                  };
                  const part =
                    typeof res?.text === 'string'
                      ? res.text
                      : (res?.candidates?.[0]?.content?.parts?.[0]?.text ??
                        '');
                  if (part) {
                    fullContent += part;
                    controller.enqueue(
                      encoder.encode(
                        JSON.stringify({ delta: part }) + '\n',
                      ),
                    );
                  }
                }

                let conversationId: string | undefined;
                if (persist) {
                  conversationId = await persistConversation(
                    trimmed,
                    fullContent,
                    conversationTitle,
                    userId,
                  );
                }

                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      done: true,
                      content: fullContent,
                      conversationId,
                    }) + '\n',
                  ),
                );
              } catch (e: any) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      error: e?.message ?? 'خطأ أثناء توليد الرد.',
                    }) + '\n',
                  ),
                );
              } finally {
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        } catch (streamErr: any) {
          lastError = streamErr;
          // eslint-disable-next-line no-console
          console.warn(
            '[api/chat] Streaming failed, falling back to non-streaming:',
            streamErr?.message,
          );
        }
      }

      /* non-streaming path (also fallback if streaming threw) */
      if (!wantStream || lastError) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const result = await ai.models.generateContent({
              model: AI_MODEL_NAME,
              contents: historyParts,
              config: geminiConfig,
            });

            const res = result as {
              text?: string;
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
              }>;
            };
            const text =
              typeof res?.text === 'string'
                ? res.text
                : (res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');

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

            if (is429Error(err) && attempt < maxRetries) {
              const expDelay = Math.min(
                baseDelayMs * Math.pow(2, Math.min(attempt, 4)),
                maxDelayMs,
              );
              const jitter = Math.random() * 3_000;
              const delay = Math.floor(expDelay + jitter);
              // eslint-disable-next-line no-console
              console.warn(
                `[api/chat] Gemini 429 attempt ${attempt + 1}/${maxRetries + 1}, retry after ${Math.round(delay / 1000)}s`,
              );
              await new Promise((r) => setTimeout(r, delay));
              continue;
            }
            break;
          }
        }
      }
    }

    /* ── NVIDIA fallback ── */
    if (nvidiaKey) {
      const nvResult = await callNvidiaChat(trimmed, nvidiaKey);
      if ('content' in nvResult) {
        const text = nvResult.content;
        if (persist) {
          const conversationId = await persistConversation(
            trimmed,
            text,
            conversationTitle,
            userId,
          );
          if (conversationId) {
            return NextResponse.json({ content: text, conversationId });
          }
        }
        return NextResponse.json({ content: text });
      }
      // eslint-disable-next-line no-console
      console.warn('[api/chat] NVIDIA fallback error:', nvResult.error);
      lastError = new Error(nvResult.error);
    }

    throw lastError ?? new Error('لا يوجد مزوّد ذكاء اصطناعي متاح.');
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[api/chat] Error:', error);

    if (error?.status === 401 || error?.code === 'UNAUTHENTICATED') {
      return NextResponse.json(
        {
          error:
            'حدثت مشكلة في مفتاح الاتصال بخدمة الذكاء الاصطناعي. الرجاء مراجعة إعدادات الخادم.',
        },
        { status: 500 },
      );
    }

    if (is429Error(error)) {
      return NextResponse.json(
        {
          error:
            'وصل حد الطلبات المجاني من Gemini. انتظر دقيقة ثم اضغط «إعادة المحاولة».',
        },
        { status: 429 },
      );
    }

    const detail =
      process.env.NODE_ENV === 'development' && error
        ? String(error?.message ?? error?.toString?.() ?? error)
        : null;

    return NextResponse.json(
      {
        error:
          'حدث خطأ غير متوقع أثناء معالجة الطلب في الخادم. الرجاء المحاولة لاحقاً.',
        ...(detail && { detail }),
      },
      { status: 500 },
    );
  }
}
