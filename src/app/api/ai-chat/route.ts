import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// Simple test endpoint
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    // Get or create AI user
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

    // Find or create chat
    let chats = await db.chat.findMany({
      where: {
        participants: {
          every: { id: { in: [session.userId, aiUser.id] } }
        }
      },
      include: { participants: true }
    });

    let chat = chats.find(c => c.participants.length === 2);
    
    if (!chat) {
      chat = await db.chat.create({
        data: {
          participants: { connect: [{ id: session.userId }, { id: aiUser.id }] }
        },
        include: { participants: true }
      });
    }

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

// Smart Persian AI Response System
function generateResponse(message: string): string {
  const msg = message.toLowerCase().trim();
  
  // GREETINGS
  if (/\b(سلام|درود|سلام علیکم|hi|hello|hey)\b/.test(msg)) {
    return 'سلام دوست عزیز! 👋 خوشحالم که اینجایی! چطور می‌تونم کمکت کنم؟ 🌟';
  }
  
  // HOW ARE YOU
  if (/\b(چطوری|حالت|خوبی|how are you)\b/.test(msg)) {
    return 'من عالی‌ام! 😊 ممنون که پرسیدی. تو چطوری؟';
  }
  
  // NAME
  if (/\b(اسمت|نامت|کی هستی|who are you)\b/.test(msg)) {
    return 'من دستیار هوشمند این برنامه‌ام! 🤖✨ به سوالاتت جواب میدم و کمکت می‌کنم!';
  }
  
  // HELP
  if (/\b(کمک|help|چه کاری)\b/.test(msg)) {
    return 'می‌تونم کمکت کنم! 🙌\n• به سوالاتت جواب بدم\n• باهات گپ بزنم\n• هر سوالی داری بپرس!';
  }
  
  // JOKES
  if (/\b(جوک|خنده|joke)\b/.test(msg)) {
    const jokes = [
      'چرا کامپیوتر سرما خورد؟ 🤧 چون ویندوزش باز بود! 😂',
      'به یه ماهی گفتن چرا تنهایی؟ گفت: آخه کی پیشه من میاد! 🐟😂',
      'یارو میره پیتزافروشی، فروشنده میگه: ۸ تیکه ببرم یا ۱۲؟\nیارو میگه: ۸ تیکه، من نمیتونم ۱۲ تیکه بخورم! 🍕😂'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // TIME
  if (/\b(ساعت|تاریخ|time|date)\b/.test(msg)) {
    const now = new Date();
    const time = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `🕐 ساعت: ${time}\n📅 امروز: ${date}`;
  }
  
  // THANKS
  if (/\b(ممنون|مرسی|thanks)\b/.test(msg)) {
    return 'خواهش می‌کنم! 🙏 خوشحالم که تونستم کمکت کنم!';
  }
  
  // BYE
  if (/\b(خدافظ|خداحافظ|bye)\b/.test(msg)) {
    return 'خداحافظ دوست عزیز! 👋 روزت خوش باشه! 🌟';
  }
  
  // FOOD
  if (/\b(غذا|شام|ناهار|food)\b/.test(msg)) {
    return 'پیشنهاد من: کباب کوبیده با برنج! 🍖🍚 یا یه پیتزا مخصوص! 🍕';
  }
  
  // DEFAULT
  const defaults = [
    `متوجه شدم! 😊 بیشتر برام توضیح بده!`,
    `جالبه! 🌟 چه چیز دیگه‌ای می‌خوای بدونی؟`,
    `حتماً! 📝 هر سوالی داری بپرس!`,
    `عالی! ✨ می‌خوای بیشتر بگم؟`
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// POST - Send message
export async function POST(request: NextRequest) {
  try {
    console.log('=== AI Chat POST called ===');
    
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      console.log('ERROR: Not authenticated');
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const body = await request.json();
    const message = body.message;
    console.log('Received message:', message);

    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('ERROR: Empty message');
      return NextResponse.json({ error: 'پیام خالی است' }, { status: 400 });
    }

    // Get or create AI user
    let aiUser = await db.user.findUnique({
      where: { username: 'ai_assistant' }
    });

    if (!aiUser) {
      console.log('Creating AI user...');
      aiUser = await db.user.create({
        data: {
          username: 'ai_assistant',
          password: 'ai_not_loginable_' + Date.now(),
          displayName: '🤖 دستیار هوشمند',
          avatar: null,
        }
      });
    }

    // Find or create chat
    let chats = await db.chat.findMany({
      where: {
        participants: {
          every: { id: { in: [session.userId, aiUser.id] } }
        }
      },
      include: { participants: true }
    });

    let chat = chats.find(c => c.participants.length === 2);
    
    if (!chat) {
      console.log('Creating new chat...');
      chat = await db.chat.create({
        data: {
          participants: { connect: [{ id: session.userId }, { id: aiUser.id }] }
        },
        include: { participants: true }
      });
    }

    // Save user message
    console.log('Saving user message...');
    await db.message.create({
      data: {
        content: message.trim(),
        senderId: session.userId,
        receiverId: aiUser.id,
        chatId: chat.id,
      }
    });

    // Generate AI response
    console.log('Generating AI response...');
    const aiResponse = generateResponse(message.trim());
    console.log('AI Response:', aiResponse);

    // Save AI response
    console.log('Saving AI response...');
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

    console.log('=== AI Chat completed successfully ===');
    
    return NextResponse.json({ 
      chat,
      message: aiMessage 
    });
  } catch (error) {
    console.error('=== AI chat ERROR:', error);
    return NextResponse.json({ error: 'خطا در ارتباط با هوش مصنوعی' }, { status: 500 });
  }
}
