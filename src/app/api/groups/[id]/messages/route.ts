import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - Get group messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { id: groupId } = await params;

    // Check membership
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (!group.members.some(m => m.id === session.userId)) {
      return NextResponse.json({ error: 'شما عضو این گروه نیستید' }, { status: 403 });
    }

    const messages = await db.groupMessage.findMany({
      where: { 
        groupId,
        isSent: true 
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get group messages error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پیام‌ها' }, { status: 500 });
  }
}

// POST - Send message to group (immediate or scheduled, with reply support)
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
    const body = await request.json();
    const { content, messageType, fileUrl, fileName, fileSize, fileType, duration, scheduledAt, replyToId } = body;

    // Check membership
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'گروه یافت نشد' }, { status: 404 });
    }

    if (!group.members.some(m => m.id === session.userId)) {
      return NextResponse.json({ error: 'شما عضو این گروه نیستید' }, { status: 403 });
    }

    // Check if muted (only for immediate messages)
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    
    if (!isScheduled) {
      const mute = await db.groupMute.findUnique({
        where: {
          userId_groupId: { userId: session.userId, groupId }
        }
      });

      if (mute && new Date() < mute.until) {
        const remaining = Math.ceil((mute.until.getTime() - Date.now()) / 60000);
        return NextResponse.json({ 
          error: `شما ${remaining} دقیقه سکوت هستید` 
        }, { status: 403 });
      }
    }

    // Create message
    const message = await db.groupMessage.create({
      data: {
        content: content || '',
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        fileSize,
        fileType,
        duration,
        senderId: session.userId,
        groupId,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
        isSent: !isScheduled,
        replyToId: replyToId || null,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          }
        }
      }
    });

    // Update unread count for all members except sender
    if (!isScheduled) {
      for (const member of group.members) {
        if (member.id !== session.userId) {
          await db.groupUnread.upsert({
            where: {
              userId_groupId: { userId: member.id, groupId }
            },
            update: {
              unreadCount: { increment: 1 }
            },
            create: {
              userId: member.id,
              groupId,
              unreadCount: 1
            }
          });
        }
      }
    }

    return NextResponse.json({ message, isScheduled });
  } catch (error) {
    console.error('Send group message error:', error);
    return NextResponse.json({ error: 'خطا در ارسال پیام' }, { status: 500 });
  }
}
