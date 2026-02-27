import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEventToUser } from '@/app/api/events/route';

// Check and send scheduled messages - called by client every 10 seconds
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const now = new Date();

    // Find scheduled messages FROM this user that are due
    const myScheduled = await db.message.findMany({
      where: {
        senderId: userId,
        scheduledAt: { lte: now },
        isSent: false,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    // Find scheduled group messages FROM this user
    const myGroupScheduled = await db.groupMessage.findMany({
      where: {
        senderId: userId,
        scheduledAt: { lte: now },
        isSent: false,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        group: {
          include: { members: true },
        },
      },
    });

    // Send private messages
    for (const msg of myScheduled) {
      await db.message.update({
        where: { id: msg.id },
        data: { isSent: true },
      });
      sendEventToUser(msg.receiverId, 'new_message', msg);
    }

    // Send group messages
    for (const msg of myGroupScheduled) {
      await db.groupMessage.update({
        where: { id: msg.id },
        data: { isSent: true },
      });
      for (const member of msg.group.members) {
        if (member.id !== userId) {
          sendEventToUser(member.id, 'new_group_message', msg);
        }
      }
    }

    return NextResponse.json({
      sent: myScheduled.length + myGroupScheduled.length,
    });
  } catch (error) {
    console.error('Check scheduled error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
