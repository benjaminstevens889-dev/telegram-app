import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Leave group
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

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    // Check if user is member
    if (!group.members.some(m => m.id === session.userId)) {
      return NextResponse.json({ error: 'شما عضو این گروه نیستید' }, { status: 400 });
    }

    // If owner leaves, delete the group and all related data
    if (group.ownerId === session.userId) {
      // Delete all group messages
      await db.groupMessage.deleteMany({ where: { groupId } });
      // Delete all group mutes
      await db.groupMute.deleteMany({ where: { groupId } });
      // Delete the group
      await db.group.delete({ where: { id: groupId } });
      return NextResponse.json({ message: 'گروه حذف شد', deleted: true });
    }

    // Leave group
    await db.group.update({
      where: { id: groupId },
      data: {
        members: { disconnect: { id: session.userId } }
      }
    });

    return NextResponse.json({ message: 'از گروه خارج شدید' });
  } catch (error) {
    console.error('Leave group error:', error);
    return NextResponse.json({ error: 'خطا در خروج از گروه' }, { status: 500 });
  }
}
