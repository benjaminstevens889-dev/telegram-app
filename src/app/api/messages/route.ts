import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendEventToUser } from '@/app/api/events/route';

// GET - Get messages for a chat
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
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'شناسه چت الزامی است' },
        { status: 400 }
      );
    }

    // Verify user is participant
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'چت یافت نشد' },
        { status: 404 }
      );
    }

    const isParticipant = chat.participants.some(
      (p) => p.id === session.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'شما اجازه دسترسی به این چت را ندارید' },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await db.message.findMany({
      where: {
        chatId,
        OR: [
          { deletedFor: null },
          {
            deletedFor: {
              not: JSON.stringify([session.userId]),
            },
          },
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
        createdAt: 'asc',
      },
    });

    // Filter messages where deletedFor doesn't contain current user
    const filteredMessages = messages.filter((msg) => {
      if (!msg.deletedFor) return true;
      const deletedFor = JSON.parse(msg.deletedFor);
      return !deletedFor.includes(session.userId);
    });

    return NextResponse.json({ messages: filteredMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیام‌ها' },
      { status: 500 }
    );
  }
}

// POST - Send a message
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
    const { chatId, content, receiverId, messageType, fileUrl, fileName, fileSize, fileType, duration } = body;

    if (!chatId || !receiverId) {
      return NextResponse.json(
        { error: 'همه فیلدها الزامی است' },
        { status: 400 }
      );
    }

    if (!content && messageType !== 'file' && messageType !== 'voice') {
      return NextResponse.json(
        { error: 'محتوای پیام الزامی است' },
        { status: 400 }
      );
    }

    // Verify user is participant
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'چت یافت نشد' },
        { status: 404 }
      );
    }

    const isParticipant = chat.participants.some(
      (p) => p.id === session.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'شما اجازه ارسال پیام در این چت را ندارید' },
        { status: 403 }
      );
    }

    // Create message
    const message = await db.message.create({
      data: {
        content: content || (messageType === 'voice' ? 'پیام صوتی' : 'فایل'),
        messageType: messageType || 'text',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
        duration: duration || null,
        senderId: session.userId,
        receiverId,
        chatId,
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

    // Send real-time notification to receiver via SSE
    sendEventToUser(receiverId, 'new_message', message);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پیام' },
      { status: 500 }
    );
  }
}
