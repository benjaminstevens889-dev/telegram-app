import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - Get all groups for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const groups = await db.group.findMany({
      where: {
        members: {
          some: { id: session.userId }
        }
      },
      include: {
        members: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        owner: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, displayName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'خطا در دریافت گروه‌ها' }, { status: 500 });
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'نام گروه باید حداقل ۲ حرف باشد' }, { status: 400 });
    }

    // Create group with owner as first member
    const group = await db.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: session.userId,
        members: {
          connect: { id: session.userId }
        }
      },
      include: {
        members: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        owner: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد گروه' }, { status: 500 });
  }
}
