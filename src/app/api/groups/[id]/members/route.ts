import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - Add member to group
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
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'نام کاربری الزامی است' }, { status: 400 });
    }

    // Check if user is owner
    const group = await db.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (group.ownerId !== session.userId) {
      return NextResponse.json({ error: 'فقط مالک می‌تواند عضو اضافه کند' }, { status: 403 });
    }

    // Find user by username
    const userToAdd = await db.user.findUnique({
      where: { username: username.trim() },
      include: { groups: { where: { id: groupId } } }
    });

    if (!userToAdd) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // Check if already member - check directly from user's groups
    if (userToAdd.groups.length > 0) {
      return NextResponse.json({ error: 'این کاربر قبلاً عضو گروه است' }, { status: 400 });
    }

    // Add member
    const updatedGroup = await db.group.update({
      where: { id: groupId },
      data: {
        members: { connect: { id: userToAdd.id } }
      },
      include: {
        members: { select: { id: true, username: true, displayName: true, avatar: true } },
        owner: { select: { id: true, username: true, displayName: true, avatar: true } }
      }
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'خطا در اضافه کردن عضو' }, { status: 500 });
  }
}

// DELETE - Remove member from group
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

    // Check if user is owner
    const group = await db.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (group.ownerId !== session.userId) {
      return NextResponse.json({ error: 'فقط مالک می‌تواند عضو حذف کند' }, { status: 403 });
    }

    // Cannot remove owner
    if (memberId === group.ownerId) {
      return NextResponse.json({ error: 'نمی‌توانید مالک را حذف کنید' }, { status: 400 });
    }

    // Remove member
    const updatedGroup = await db.group.update({
      where: { id: groupId },
      data: {
        members: { disconnect: { id: memberId } }
      },
      include: {
        members: { select: { id: true, username: true, displayName: true, avatar: true } },
        owner: { select: { id: true, username: true, displayName: true, avatar: true } }
      }
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: 'خطا در حذف عضو' }, { status: 500 });
  }
}
