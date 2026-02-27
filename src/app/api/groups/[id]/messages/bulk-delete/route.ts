import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Bulk delete group messages
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

    const { id: groupId } = await params;
    const body = await request.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'هیچ پیامی انتخاب نشده' },
        { status: 400 }
      );
    }

    // Check membership
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (!group.members.some(m => m.id === session.userId)) {
      return NextResponse.json({ error: 'شما عضو این گروه نیستید' }, { status: 403 });
    }

    // Get messages to verify
    const messages = await db.groupMessage.findMany({
      where: {
        id: { in: messageIds }
      }
    });

    // Only allow deleting own messages (or all if owner)
    const canDeleteAll = group.ownerId === session.userId;
    const ownMessages = messages.filter(m => m.senderId === session.userId);
    
    if (!canDeleteAll && ownMessages.length !== messages.length) {
      return NextResponse.json(
        { error: 'فقط می‌توانید پیام‌های خود را حذف کنید' },
        { status: 403 }
      );
    }

    // Delete messages
    await db.groupMessage.deleteMany({
      where: {
        id: { in: messageIds }
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: messageIds.length 
    });
  } catch (error) {
    console.error('Bulk delete group messages error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پیام‌ها' },
      { status: 500 }
    );
  }
}
