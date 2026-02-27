import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Bulk delete messages
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageIds, deleteType } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'هیچ پیامی انتخاب نشده' },
        { status: 400 }
      );
    }

    // Get messages to verify ownership
    const messages = await db.message.findMany({
      where: {
        id: { in: messageIds }
      }
    });

    // Verify user is sender or receiver of all messages
    for (const msg of messages) {
      if (msg.senderId !== session.userId && msg.receiverId !== session.userId) {
        return NextResponse.json(
          { error: 'شما اجازه حذف برخی پیام‌ها را ندارید' },
          { status: 403 }
        );
      }
    }

    if (deleteType === 'both') {
      // Delete for both - only if user is sender
      const senderMessages = messages.filter(m => m.senderId === session.userId);
      await db.message.deleteMany({
        where: {
          id: { in: senderMessages.map(m => m.id) }
        }
      });
    } else {
      // Delete for me only - add to deletedFor
      for (const msg of messages) {
        const deletedFor = msg.deletedFor ? JSON.parse(msg.deletedFor) : [];
        if (!deletedFor.includes(session.userId)) {
          deletedFor.push(session.userId);
        }
        await db.message.update({
          where: { id: msg.id },
          data: { deletedFor: JSON.stringify(deletedFor) }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: messageIds.length 
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پیام‌ها' },
      { status: 500 }
    );
  }
}
