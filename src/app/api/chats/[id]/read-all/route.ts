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

    const { id: chatId } = await params;

    // Verify user is participant in this chat
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: { id: session.userId }
        }
      },
      include: {
        participants: true
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'چت یافت نشد' },
        { status: 404 }
      );
    }

    // Find the other participant (sender of messages)
    const otherParticipant = chat.participants.find(p => p.id !== session.userId);

    // Mark all unread messages in this chat as read
    const result = await db.message.updateMany({
      where: {
        chatId,
        receiverId: session.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    // Notify the sender via SSE that their messages were read
    if (otherParticipant && result.count > 0) {
      sendEventToUser(otherParticipant.id, 'messages_read', {
        chatId,
        count: result.count,
      });
    }

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return NextResponse.json(
      { error: 'خطا در علامت‌گذاری' },
      { status: 500 }
    );
  }
}
