import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import ZAI from 'z-ai-web-dev-sdk';

// Get or create AI user
async function getOrCreateAIUser() {
  let aiUser = await db.user.findUnique({
    where: { username: 'ai_assistant' }
  });

  if (!aiUser) {
    aiUser = await db.user.create({
      data: {
        username: 'ai_assistant',
        password: 'ai_not_loginable_' + Date.now(),
        displayName: '🤖 دستیار هوشمند',
        avatar: null,
      }
    });
  }

  return aiUser;
}

// Get or create chat between user and AI
async function getOrCreateAIChat(userId: string, aiUserId: string) {
  // Find existing chat
  const existingChats = await db.chat.findMany({
    where: {
      participants: {
        every: {
          id: { in: [userId, aiUserId] }
        }
      }
    },
    include: {
      participants: true
    }
  });

  // Filter to find chat with exactly these 2 participants
  const chat = existingChats.find(c => c.participants.length === 2);
  
  if (chat) return chat;

  // Create new chat
  return db.chat.create({
    data: {
      participants: {
        connect: [{ id: userId }, { id: aiUserId }]
      }
    },
    include: {
      participants: true
    }
  });
}

// POST - Send message to AI and get response
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'پیام خالی است' }, { status: 400 });
    }

    // Get or create AI user
    const aiUser = await getOrCreateAIUser();
    
    // Get or create chat
    const chat = await getOrCreateAIChat(session.userId, aiUser.id);

    // Save user message
    await db.message.create({
      data: {
        content: message.trim(),
        senderId: session.userId,
        receiverId: aiUser.id,
        chatId: chat.id,
      }
    });

    // Get AI response using z-ai-web-dev-sdk
    let aiResponse: string;
    
    try {
      console.log('Creating ZAI instance...');
      const zai = await ZAI.create();
      console.log('ZAI instance created, calling chat completions...');
      
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `تو یک دستیار هوشمند و دوست‌داشتنی هستی که به زبان فارسی صحبت می‌کنی.
- همیشه مودب و مهربان باش
- پاسخ‌های کوتاه و مفید بده
- اگر سوال نامفهوم است، بخواه واضح‌تر توضیح دهد
- می‌توانی در مورد هر موضوعی کمک کنی
- از ایموجی‌های زیبا استفاده کن 🌟💫✨`
          },
          {
            role: 'user',
            content: message.trim()
          }
        ],
      });

      console.log('Completion result:', JSON.stringify(completion, null, 2));
      
      aiResponse = completion.choices[0]?.message?.content || 'متأسفانه نتوانستم پاسخی تولید کنم. لطفاً دوباره تلاش کنید.';
      console.log('AI Response:', aiResponse);
    } catch (apiError) {
      console.error('AI API Error:', apiError);
      aiResponse = `متأسفانه در حال حاضر نمی‌توانم پاسخ دهم. لطفاً کمی بعد تلاش کنید. 🙏\n\n(خطا: ${apiError instanceof Error ? apiError.message : 'نامشخص'})`;
    }

    // Save AI response
    const aiMessage = await db.message.create({
      data: {
        content: aiResponse,
        senderId: aiUser.id,
        receiverId: session.userId,
        chatId: chat.id,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    return NextResponse.json({ 
      chat,
      message: aiMessage 
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'خطا در ارتباط با هوش مصنوعی' }, { status: 500 });
  }
}

// GET - Get or create AI chat
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    // Get or create AI user
    const aiUser = await getOrCreateAIUser();
    
    // Get or create chat
    const chat = await getOrCreateAIChat(session.userId, aiUser.id);

    // Get messages
    const messages = await db.message.findMany({
      where: { chatId: chat.id },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ 
      chat: {
        ...chat,
        otherParticipant: aiUser,
        messages
      }
    });
  } catch (error) {
    console.error('Get AI chat error:', error);
    return NextResponse.json({ error: 'خطا در دریافت چت' }, { status: 500 });
  }
}
