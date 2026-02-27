import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - Get all chats for current user
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const chats = await db.chat.findMany({
      where: {
        participants: {
          some: {
            id: session.userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get unread counts for each chat
    const chatIds = chats.map(c => c.id);
    const unreadCounts = await db.message.groupBy({
      by: ['chatId'],
      where: {
        chatId: { in: chatIds },
        receiverId: session.userId,
        readAt: null,
      },
      _count: true,
    });

    // Create a map of chatId -> unread count
    const unreadMap = new Map(
      unreadCounts.map(uc => [uc.chatId, uc._count])
    );

    // Filter out deleted chats and format response
    const formattedChats = chats
      .filter((chat) => {
        const deletedBy = chat.deletedBy ? JSON.parse(chat.deletedBy) : [];
        return !deletedBy.includes(session.userId);
      })
      .map((chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p.id !== session.userId
        );

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          otherParticipant,
          lastMessage: chat.messages[0] || null,
          unreadCount: unreadMap.get(chat.id) || 0,
        };
      });

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت چت‌ها' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat
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
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: 'شناسه شرکت‌کننده الزامی است' },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await db.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Check if chat already exists (that hasn't been deleted by current user)
    const allChats = await db.chat.findMany({
      where: {
        participants: {
          every: {
            id: {
              in: [session.userId, participantId],
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
      // Chat exists but was deleted - restore it
      const deletedBy = existingChat.deletedBy ? JSON.parse(existingChat.deletedBy) : [];
      const updatedDeletedBy = deletedBy.filter((id: string) => id !== session.userId && id !== participantId);

      const restoredChat = await db.chat.update({
        where: { id: existingChat.id },
        data: {
          deletedBy: updatedDeletedBy.length > 0 ? JSON.stringify(updatedDeletedBy) : null,
        },
        include: {
          participants: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      const otherParticipant = restoredChat.participants.find(
        (p) => p.id !== session.userId
      );

      return NextResponse.json({
        chat: {
          id: restoredChat.id,
          createdAt: restoredChat.createdAt,
          otherParticipant,
        },
      });
    }

    // Create chat
    const chat = await db.chat.create({
      data: {
        participants: {
          connect: [
            { id: session.userId },
            { id: participantId },
          ],
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    const otherParticipant = chat.participants.find(
      (p) => p.id !== session.userId
    );

    return NextResponse.json({
      chat: {
        id: chat.id,
        createdAt: chat.createdAt,
        otherParticipant,
      },
    });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد چت' },
      { status: 500 }
    );
  }
}
