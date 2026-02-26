import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the chat request
    const chatRequest = await db.chatRequest.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!chatRequest) {
      return NextResponse.json(
        { error: 'درخواست یافت نشد' },
        { status: 404 }
      );
    }

    // Check if user is the receiver
    if (chatRequest.receiverId !== session.userId) {
      return NextResponse.json(
        { error: 'شما اجازه قبول این درخواست را ندارید' },
        { status: 403 }
      );
    }

    // Check if already processed
    if (chatRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'این درخواست قبلاً پردازش شده است' },
        { status: 400 }
      );
    }

    // Update request status
    await db.chatRequest.update({
      where: { id },
      data: { status: 'accepted' },
    });

    // Check if chat already exists between these users
    const existingChat = await db.chat.findFirst({
      where: {
        participants: {
          every: {
            id: {
              in: [chatRequest.senderId, chatRequest.receiverId],
            },
          },
        },
      },
    });

    let chat;

    if (existingChat) {
      // Chat exists but was deleted by one of the users - restore it
      const deletedBy = existingChat.deletedBy ? JSON.parse(existingChat.deletedBy) : [];
      const updatedDeletedBy = deletedBy.filter((id: string) => id !== chatRequest.senderId && id !== chatRequest.receiverId);

      chat = await db.chat.update({
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
    } else {
      // Create new chat
      chat = await db.chat.create({
        data: {
          participants: {
            connect: [
              { id: chatRequest.senderId },
              { id: chatRequest.receiverId },
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
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Accept chat request error:', error);
    return NextResponse.json(
      { error: 'خطا در قبول درخواست' },
      { status: 500 }
    );
  }
}
