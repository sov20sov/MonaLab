import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!prisma) {
    return NextResponse.json({ error: 'قاعدة البيانات غير متوفرة.' }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'معرّف المحادثة مطلوب.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'المحادثة غير موجودة.' }, { status: 404 });
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/conversations/[id]] GET', e);
    return NextResponse.json(
      { error: 'فشل جلب المحادثة.' },
      { status: 500 },
    );
  }
}
