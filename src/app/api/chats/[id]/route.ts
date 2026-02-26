import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

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
    const body = await request.json();
    const { deleteType } = body;

    // Get the chat
    const chat = await db.chat.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'چت یافت نشد' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p) => p.id === session.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'شما اجازه حذف این چت را ندارید' },
        { status: 403 }
      );
    }

    const otherParticipant = chat.participants.find(
      (p) => p.id !== session.userId
    );

    if (deleteType === 'me') {
      // Delete for current user only
      const deletedBy = chat.deletedBy ? JSON.parse(chat.deletedBy) : [];
      if (!deletedBy.includes(session.userId)) {
        deletedBy.push(session.userId);
      }
      await db.chat.update({
        where: { id },
        data: {
          deletedBy: JSON.stringify(deletedBy),
        },
      });
    } else if (deleteType === 'both') {
      // Delete for both participants - completely remove the chat
      // First delete all messages
      await db.message.deleteMany({
        where: { chatId: id },
      });

      // Delete any chat requests between these two users so they can send new requests
      if (otherParticipant) {
        await db.chatRequest.deleteMany({
          where: {
            OR: [
              { senderId: session.userId, receiverId: otherParticipant.id },
              { senderId: otherParticipant.id, receiverId: session.userId },
            ],
          },
        });
      }

      // Delete the chat completely
      await db.chat.delete({
        where: { id },
      });
    } else if (deleteType === 'receiver' && otherParticipant) {
      // Delete for receiver only
      const deletedBy = chat.deletedBy ? JSON.parse(chat.deletedBy) : [];
      if (!deletedBy.includes(otherParticipant.id)) {
        deletedBy.push(otherParticipant.id);
      }
      await db.chat.update({
        where: { id },
        data: {
          deletedBy: JSON.stringify(deletedBy),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف چت' },
      { status: 500 }
    );
  }
}
