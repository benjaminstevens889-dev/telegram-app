import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

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
    const { newUsername, password } = body;

    // Validation
    if (!newUsername || !password) {
      return NextResponse.json(
        { error: 'نام کاربری جدید و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      return NextResponse.json(
        { error: 'نام کاربری باید بین ۳ تا ۲۰ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, currentUser.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Check if new username already exists
    if (newUsername.toLowerCase() !== currentUser.username) {
      const existingUser = await db.user.findUnique({
        where: { username: newUsername.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'این نام کاربری قبلاً استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // Update username
    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: {
        username: newUsername.toLowerCase(),
      },
    });

    // Update session
    session.username = updatedUser.username;
    await session.save();

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'خطا در انتقال حساب' },
      { status: 500 }
    );
  }
}
