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
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'لطفاً رمز عبور خود را وارد کنید' },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Delete all user's messages
    await db.message.deleteMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
    });

    // Delete all user's chat requests
    await db.chatRequest.deleteMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
    });

    // Get all chats where user is a participant
    const chats = await db.chat.findMany({
      where: {
        participants: {
          some: { id: user.id },
        },
      },
    });

    // Delete all chats
    for (const chat of chats) {
      await db.chat.delete({
        where: { id: chat.id },
      });
    }

    // Delete user
    await db.user.delete({
      where: { id: user.id },
    });

    // Clear session
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف حساب کاربری' },
      { status: 500 }
    );
  }
}
