import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

function noDb() {
  return NextResponse.json({ error: 'قاعدة البيانات غير متوفرة.' }, { status: 503 });
}

const MAX_TITLE = 255;
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 100_000;

export async function GET() {
  if (!prisma) return noDb();
  try {
    const list = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json(
      list.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c._count.messages,
      })),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/conversations] GET', e);
    return NextResponse.json(
      { error: 'فشل جلب قائمة المحادثات.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!prisma) return noDb();
  try {
    const body = (await req.json()) as {
      title?: string;
      messages?: Array<{ role: 'user' | 'model'; content: string }>;
    };
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, MAX_TITLE) || 'بحث جديد' : 'بحث جديد';
    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];

    for (const m of messages) {
      if (m.role !== 'user' && m.role !== 'model') {
        return NextResponse.json({ error: 'دور الرسالة غير صالح.' }, { status: 400 });
      }
      if (typeof m.content !== 'string' || m.content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ error: 'محتوى إحدى الرسائل غير صالح أو طويل جداً.' }, { status: 400 });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        messages: {
          create: messages.map((m) => ({
            role: m.role as 'user' | 'model',
            content: m.content,
          })),
        },
      },
    });

    return NextResponse.json({ id: conversation.id, title: conversation.title, createdAt: conversation.createdAt });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/conversations] POST', e);
    return NextResponse.json(
      { error: 'فشل حفظ المحادثة.' },
      { status: 500 },
    );
  }
}
