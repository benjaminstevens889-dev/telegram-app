import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Mute user in group
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
    const { memberId, minutes } = await request.json();

    if (!memberId || !minutes || minutes < 1) {
      return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 });
    }

    // Check if user is owner
    const group = await db.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (group.ownerId !== session.userId) {
      return NextResponse.json({ error: 'فقط مالک می‌تواند کاربر را سکوت کند' }, { status: 403 });
    }

    // Cannot mute owner
    if (memberId === group.ownerId) {
      return NextResponse.json({ error: 'نمی‌توانید مالک را سکوت کنید' }, { status: 400 });
    }

    // Calculate mute expiry
    const until = new Date(Date.now() + minutes * 60 * 1000);

    // Create or update mute
    const mute = await db.groupMute.upsert({
      where: {
        userId_groupId: { userId: memberId, groupId }
      },
      create: {
        userId: memberId,
        groupId,
        until
      },
      update: {
        until
      }
    });

    return NextResponse.json({ mute, message: `کاربر برای ${minutes} دقیقه سکوت شد` });
  } catch (error) {
    console.error('Mute user error:', error);
    return NextResponse.json({ error: 'خطا در سکوت کردن کاربر' }, { status: 500 });
  }
}

// DELETE - Unmute user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 });
    }

    const group = await db.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (group.ownerId !== session.userId) {
      return NextResponse.json({ error: 'فقط مالک می‌تواند سکوت را بردارد' }, { status: 403 });
    }

    await db.groupMute.deleteMany({
      where: { userId: memberId, groupId }
    });

    return NextResponse.json({ message: 'سکوت کاربر برداشته شد' });
  } catch (error) {
    console.error('Unmute error:', error);
    return NextResponse.json({ error: 'خطا در برداشتن سکوت' }, { status: 500 });
  }
}
