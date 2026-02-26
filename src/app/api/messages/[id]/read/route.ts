import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendEventToUser } from '@/app/api/events/route';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the message
    const message = await db.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'پیام یافت نشد' },
        { status: 404 }
      );
    }

    // Check if user is the receiver
    if (message.receiverId !== session.userId) {
      return NextResponse.json(
        { error: 'شما اجازه علامت‌گذاری این پیام را ندارید' },
        { status: 403 }
      );
    }

    // Mark as read
    const updatedMessage = await db.message.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });

    // Notify sender via SSE that message was read
    sendEventToUser(message.senderId, 'message_read', {
      messageId: id,
      readAt: updatedMessage.readAt,
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { error: 'خطا در علامت‌گذاری' },
      { status: 500 }
    );
  }
}
