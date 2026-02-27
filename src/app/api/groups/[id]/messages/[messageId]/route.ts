import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// DELETE - Delete group message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { id: groupId, messageId } = await params;

    const message = await db.groupMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: 'پیام یافت نشد' }, { status: 404 });
    }

    if (message.groupId !== groupId) {
      return NextResponse.json({ error: 'پیام متعلق به این گروه نیست' }, { status: 400 });
    }

    if (message.senderId !== session.userId) {
      return NextResponse.json({ error: 'فقط فرستنده می‌تواند پیام را حذف کند' }, { status: 403 });
    }

    await db.groupMessage.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ message: 'پیام حذف شد' });
  } catch (error) {
    console.error('Delete group message error:', error);
    return NextResponse.json({ error: 'خطا در حذف پیام' }, { status: 500 });
  }
}
