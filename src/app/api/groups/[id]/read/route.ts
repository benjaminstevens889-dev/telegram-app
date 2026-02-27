import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Mark group messages as read (clear unread count)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { id: groupId } = await params;

    // Verify user is member
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

    // Clear unread count for this user in this group
    await db.groupUnread.upsert({
      where: {
        userId_groupId: { userId: session.userId, groupId }
      },
      update: {
        unreadCount: 0
      },
      create: {
        userId: session.userId,
        groupId,
        unreadCount: 0
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark group as read error:', error);
    return NextResponse.json({ error: 'خطا در علامت‌گذاری' }, { status: 500 });
  }
}
