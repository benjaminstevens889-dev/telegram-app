import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await db.user.findMany({
      where: {
        username: {
          contains: username.toLowerCase(),
        },
        NOT: {
          id: session.userId,
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'خطا در جستجو' },
      { status: 500 }
    );
  }
}
