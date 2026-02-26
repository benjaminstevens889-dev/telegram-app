import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendEventToUser } from '@/app/api/events/route';

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('type') || 'me'; // 'me' or 'both'

    // Get the message
    const message = await db.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: { participants: true }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'پیام یافت نشد' },
        { status: 404 }
      );
    }

    // Check if user is participant in this chat
    const isParticipant = message.chat.participants.some(
      (p) => p.id === session.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'شما اجازه حذف این پیام را ندارید' },
        { status: 403 }
      );
    }

    // Check if user is the sender for "delete for both"
    if (deleteType === 'both' && message.senderId !== session.userId) {
      return NextResponse.json(
        { error: 'فقط فرستنده می‌تواند پیام را برای هر دو طرف حذف کند' },
        { status: 403 }
      );
    }

    // Find the other participant
    const otherParticipant = message.chat.participants.find(
      (p) => p.id !== session.userId
    );

    if (deleteType === 'both') {
      // Delete for both - actually delete the message
      await db.message.delete({
        where: { id }
      });

      // Notify the other participant via SSE
      if (otherParticipant) {
        sendEventToUser(otherParticipant.id, 'message_deleted', {
          messageId: id,
          chatId: message.chatId,
        });
      }

      return NextResponse.json({ 
        success: true, 
        deletedFor: 'both',
        messageId: id 
      });
    } else {
      // Delete for me only - add user to deletedFor array
      const currentDeletedFor = message.deletedFor 
        ? JSON.parse(message.deletedFor) 
        : [];
      
      if (!currentDeletedFor.includes(session.userId)) {
        currentDeletedFor.push(session.userId);
      }

      await db.message.update({
        where: { id },
        data: {
          deletedFor: JSON.stringify(currentDeletedFor)
        }
      });

      return NextResponse.json({ 
        success: true, 
        deletedFor: 'me',
        messageId: id 
      });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پیام' },
      { status: 500 }
    );
  }
}
