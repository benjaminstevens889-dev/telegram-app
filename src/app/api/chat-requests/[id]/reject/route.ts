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
        { error: 'شما اجازه رد این درخواست را ندارید' },
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
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject chat request error:', error);
    return NextResponse.json(
      { error: 'خطا در رد درخواست' },
      { status: 500 }
    );
  }
}
