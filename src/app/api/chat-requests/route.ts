import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - Get all chat requests for current user
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const requests = await db.chatRequest.findMany({
      where: {
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get chat requests error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست‌ها' },
      { status: 500 }
    );
  }
}

// POST - Send a new chat request
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
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'شناسه گیرنده الزامی است' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Check if pending request already exists
    const existingRequest = await db.chatRequest.findFirst({
      where: {
        OR: [
          { senderId: session.userId, receiverId, status: 'pending' },
          { senderId: receiverId, receiverId: session.userId, status: 'pending' },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'درخواست چت قبلاً ارسال شده است' },
        { status: 400 }
      );
    }

    // Delete any old rejected/accepted requests between these users
    await db.chatRequest.deleteMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId },
          { senderId: receiverId, receiverId: session.userId },
        ],
        status: { in: ['rejected', 'accepted'] },
      },
    });

    // Check if chat already exists (that hasn't been deleted by current user)
    const allChats = await db.chat.findMany({
      where: {
        participants: {
          every: {
            id: {
              in: [session.userId, receiverId],
            },
          },
        },
      },
    });

    // Filter out chats that were deleted by current user
    const existingChat = allChats.find(chat => {
      const deletedBy = chat.deletedBy ? JSON.parse(chat.deletedBy) : [];
      return !deletedBy.includes(session.userId);
    });

    if (existingChat) {
      return NextResponse.json(
        { error: 'چت با این کاربر قبلاً وجود دارد' },
        { status: 400 }
      );
    }

    // Create chat request
    const chatRequest = await db.chatRequest.create({
      data: {
        senderId: session.userId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ request: chatRequest });
  } catch (error) {
    console.error('Send chat request error:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال درخواست' },
      { status: 500 }
    );
  }
}
