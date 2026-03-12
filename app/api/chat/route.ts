import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { AI_MODEL_NAME, AI_SYSTEM_INSTRUCTION } from '../../../src/config/aiConfig';
import { callNvidiaChat } from '../../../src/lib/nvidiaChat';
import { prisma } from '../../../src/lib/prisma';

type ChatRole = 'user' | 'model';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type RateInfo = { count: number; windowStart: number };
const RATE_LIMIT_WINDOW_MS = 60_000; // دقيقة واحدة
const RATE_LIMIT_MAX_REQUESTS = 60;  // حد الطلبات في الإنتاج
const rateStore = new Map<string, RateInfo>();

function checkRateLimit(_ip: string | null | undefined): { ok: boolean; retryAfterMs?: number } {
  // تعطيل حد الطلبات إلا في الإنتاج لتجنب 429 من طرفنا (الـ 429 يأتي من Gemini فقط)
  if (process.env.NODE_ENV !== 'production') {
    return { ok: true };
  }

  const key = _ip || 'unknown';
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
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - elapsed;
    return { ok: false, retryAfterMs };
  }

  current.count += 1;
  rateStore.set(key, current);
  return { ok: true };
}

export const maxDuration = 60; // ثوانٍ — زيادة زمن تنفيذ الدالة على Vercel قدر الإمكان

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

    const body = (await req.json()) as {
      messages?: ChatMessage[];
      persist?: boolean;
      title?: string;
      userId?: string | null;
      stream?: boolean;
    };
    const { messages, persist, title: conversationTitle, userId, stream: wantStream } = body;

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'قائمة الرسائل غير صالحة.' }, { status: 400 });
    }

    const MAX_MESSAGES = 20;
    const MAX_CONTENT_LENGTH = 50_000;
    const trimmed = messages.slice(-MAX_MESSAGES);
    for (const m of trimmed) {
      if (typeof m.content !== 'string' || m.content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: `كل رسالة يجب ألا تتجاوز ${MAX_CONTENT_LENGTH} حرفاً.` },
          { status: 400 },
        );
      }
      if (m.role !== 'user' && m.role !== 'model') {
        return NextResponse.json({ error: 'دور الرسالة غير صالح.' }, { status: 400 });
      }
    }

    const historyParts = trimmed.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    let lastError: any;

    // محاولة Gemini أولاً (إن وجد المفتاح)
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const maxRetries = 3;
      const baseDelayMs = 4000;
      const maxDelayMs = 15000;

      // استجابة تدريجية (streaming) لظهور النص بسرعة
      if (wantStream) {
        try {
          const stream = ai.models.generateContentStream({
            model: AI_MODEL_NAME,
            contents: historyParts,
            config: {
              systemInstruction: AI_SYSTEM_INSTRUCTION,
            },
          });
          let fullContent = '';
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of await stream) {
                  const res = chunk as { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
                  const part =
                    typeof res?.text === 'string'
                      ? res.text
                      : res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                  if (part) {
                    fullContent += part;
                    controller.enqueue(encoder.encode(JSON.stringify({ delta: part }) + '\n'));
                  }
                }
                let conversationId: string | undefined;
                if (persist && prisma && fullContent) {
                  try {
                    const title = typeof conversationTitle === 'string' ? conversationTitle.trim().slice(0, 255) || 'بحث جديد' : 'بحث جديد';
                    const allMessages = [...trimmed, { role: 'model' as const, content: fullContent }];
                    const conv = await prisma.conversation.create({
                      data: {
                        title,
                        userId: typeof userId === 'string' && userId.trim() ? userId.trim() : null,
                        messages: {
                          create: allMessages.map((m) => ({ role: m.role, content: m.content })),
                        },
                      },
                    });
                    conversationId = conv.id;
                  } catch (_) {
                    // تجاهل فشل الحفظ
                  }
                }
                controller.enqueue(encoder.encode(JSON.stringify({ done: true, content: fullContent, conversationId }) + '\n'));
              } catch (e: any) {
                controller.enqueue(encoder.encode(JSON.stringify({ error: e?.message ?? 'Stream error' }) + '\n'));
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
          // نقع في السلوك العادي غير الـ stream أدناه
        }
      }

      if (!wantStream || lastError) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const result = await ai.models.generateContent({
              model: AI_MODEL_NAME,
              contents: historyParts,
              config: {
                systemInstruction: AI_SYSTEM_INSTRUCTION,
              },
            });

            const res = result as { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const text =
              typeof res?.text === 'string'
                ? res.text
                : res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

            if (persist && prisma) {
              try {
                const title = typeof conversationTitle === 'string' ? conversationTitle.trim().slice(0, 255) || 'بحث جديد' : 'بحث جديد';
                const allMessages = [...trimmed, { role: 'model' as const, content: text }];
                const conv = await prisma.conversation.create({
                  data: {
                    title,
                    userId: typeof userId === 'string' && userId.trim() ? userId.trim() : null,
                    messages: {
                      create: allMessages.map((m) => ({ role: m.role, content: m.content })),
                    },
                  },
                });
                return NextResponse.json({ content: text, conversationId: conv.id });
              } catch (_) {
                // تجاهل فشل الحفظ، نُرجع المحتوى فقط
              }
            }
            return NextResponse.json({ content: text });
          } catch (err: any) {
            lastError = err;
            const is429 =
              err?.status === 429 ||
              err?.httpStatusCode === 429 ||
              err?.statusCode === 429 ||
              err?.message?.includes?.('429') ||
              err?.message?.includes?.('Too Many Requests') ||
              err?.message?.includes?.('quota') ||
              err?.message?.includes?.('rate') ||
              err?.code === 'RESOURCE_EXHAUSTED';

            if (is429 && attempt < maxRetries) {
              const expDelay = Math.min(baseDelayMs * Math.pow(2, Math.min(attempt, 4)), maxDelayMs);
              const jitter = Math.random() * 3000;
              const delay = Math.floor(expDelay + jitter);
              // eslint-disable-next-line no-console
              console.warn(`[api/chat] Gemini 429 attempt ${attempt + 1}/${maxRetries + 1}, retry after ${Math.round(delay / 1000)}s`);
              await new Promise((r) => setTimeout(r, delay));
              continue;
            }
            break;
          }
        }
      }
    }

    // عند فشل Gemini أو غياب المفتاح: استخدام NVIDIA إن وجد Nivedi_api_key
    if (nvidiaKey) {
      const nvResult = await callNvidiaChat(trimmed, nvidiaKey);
      if ('content' in nvResult) {
        const text = nvResult.content;
        if (persist && prisma) {
          try {
            const title = typeof conversationTitle === 'string' ? conversationTitle.trim().slice(0, 255) || 'بحث جديد' : 'بحث جديد';
            const allMessages = [...trimmed, { role: 'model' as const, content: text }];
            const conv = await prisma.conversation.create({
              data: {
                title,
                userId: typeof userId === 'string' && userId.trim() ? userId.trim() : null,
                messages: {
                  create: allMessages.map((m) => ({ role: m.role, content: m.content })),
                },
              },
            });
            return NextResponse.json({ content: text, conversationId: conv.id });
          } catch (_) {
            // تجاهل فشل الحفظ
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
    console.error('[next-api] Error in /api/chat:', error);

    if (error?.status === 401 || error?.code === 'UNAUTHENTICATED') {
      return NextResponse.json(
        {
          error:
            'حدثت مشكلة في مفتاح الاتصال بخدمة الذكاء الاصطناعي. الرجاء مراجعة إعدادات الخادم.',
        },
        { status: 500 },
      );
    }

    if (
      error?.status === 429 ||
      error?.httpStatusCode === 429 ||
      error?.code === 'RESOURCE_EXHAUSTED'
    ) {
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

