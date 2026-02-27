import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

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

// Call free AI API
async function callAIAPI(message: string): Promise<string> {
  try {
    // Using Hugging Face free Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: [],
            generated_responses: [],
            text: message,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.generated_text) {
        return data.generated_text;
      }
    }

    // Fallback: Use a simple intelligent response
    return generateSmartResponse(message);
    
  } catch (error) {
    console.error('AI API error:', error);
    return generateSmartResponse(message);
  }
}

// Smart response generator (fallback)
function generateSmartResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('سلام') || lowerMessage.includes('درود') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    const responses = [
      'سلام! 👋 خوشحالم که می‌بینمت! چطور می‌تونم کمکت کنم؟',
      'درود بر تو! 🌟 امروز چطور می‌تونم یارت باشم؟',
      'سلام دوست عزیز! 💫 آماده‌ام به سوالاتت جواب بدم!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // How are you
  if (lowerMessage.includes('چطوری') || lowerMessage.includes('حالت') || lowerMessage.includes('how are you')) {
    const responses = [
      'من عالی‌ام! 🎉 ممنون که پرسیدی. تو چطوری؟',
      'خیلی خوبم! 💪 آماده‌ام کمکت کنم!',
      'سپاس از لطفت! 🌸 همه چیز ردیفه. چه کمکی از دستم برمیاد؟'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Name
  if (lowerMessage.includes('اسمت') || lowerMessage.includes('نامت') || lowerMessage.includes('who are you') || lowerMessage.includes('کی هستی')) {
    return 'من دستیار هوشمند این برنامه‌ام! 🤖 اینجا هستم تا به سوالاتت جواب بدم و کمکت کنم. هر سوالی داری بپرس! 💫';
  }
  
  // Help
  if (lowerMessage.includes('کمک') || lowerMessage.includes('help') || lowerMessage.includes('چه کاری')) {
    return 'می‌تونم کمکت کنم! 🙌\n\n• به سوالاتت جواب بدم\n• اطلاعات عمومی بدم\n• باهات گپ بزنم\n\nچه سوالی داری؟ 🤔';
  }
  
  // Thanks
  if (lowerMessage.includes('ممنون') || lowerMessage.includes('مرسی') || lowerMessage.includes('thanks') || lowerMessage.includes('thank')) {
    const responses = [
      'خواهش می‌کنم! 🙏 خوشحالم که تونستم کمکت کنم!',
      'قابلی نداره! 💖 هر سوالی داری، من اینجام!',
      'عزیزم! 🌟 در خدمتم!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Joke
  if (lowerMessage.includes('جوک') || lowerMessage.includes('خنده') || lowerMessage.includes('joke')) {
    const jokes = [
      'چرا کامپیوتر سرما خورد؟ چون ویندوزش باز بود! 😄',
      'به یه ماهی گفتن چرا تنهایی؟ گفت: آخه کی پیشه من میاد! 🐟😂',
      'معلم: کلمه "خوشحال" رو جمله بذارید.\nشاگرد: خوشحال که زنگ خورد! 🔔😄'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Weather
  if (lowerMessage.includes('هوا') || lowerMessage.includes('آب و هوا') || lowerMessage.includes('weather')) {
    return 'متأسفانه الان نمی‌تونم وضعیت هوا رو چک کنم 🌤️ ولی امیدوارم هوای خوبی داشته باشی! می‌تونی از سایت‌های هواشناسی استفاده کنی.';
  }
  
  // Time
  if (lowerMessage.includes('ساعت') || lowerMessage.includes('تاریخ') || lowerMessage.includes('time') || lowerMessage.includes('date')) {
    const now = new Date();
    const time = now.toLocaleTimeString('fa-IR');
    const date = now.toLocaleDateString('fa-IR');
    return `الان ساعت ${time} است 🕐\nتاریخ امروز: ${date} 📅`;
  }
  
  // Programming
  if (lowerMessage.includes('برنامه') || lowerMessage.includes('کد') || lowerMessage.includes('programming') || lowerMessage.includes('code')) {
    return 'برنامه‌نویسی خیلی جذابه! 💻 چه زبانی دوست داری یاد بگیری؟ پایتون، جاوااسکریپت، یا چیز دیگه؟';
  }
  
  // Love
  if (lowerMessage.includes('دوستت') || lowerMessage.includes('عاشق') || lowerMessage.includes('love')) {
    return 'ممنون از احساس خوبت! 💕 منم دوست دارم باهات گپ بزنم! 🤗';
  }
  
  // Bye
  if (lowerMessage.includes('خدافظ') || lowerMessage.includes('بای') || lowerMessage.includes('bye') || lowerMessage.includes('خداحافظ')) {
    const responses = [
      'خدانگهدار! 👋 امیدوارم روز خوبی داشته باشی!',
      'فعضاً! 🌙 به امید دیدار مجدد!',
      'خداحافظ دوست عزیز! 💫 همیشه در خدمتم!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default response
  const defaultResponses = [
    `جالبه! 🤔 بیشتر برام توضیح بده درباره "${message.slice(0, 30)}..."`,
    'اوه، موضوع جالبی رو مطرح کردی! 💭 می‌خوای بیشتر بدونم؟',
    'متوجه شدم! 🧠 چه چیز دیگه‌ای می‌خوای بدونی؟',
    'خب، بگذار فکر کنم... 🤔 می‌تونی سوالت رو یه کم واضح‌تر بپرسی؟',
    'عالی! 🌟 این یه موضوع خوبه. چه جنبه‌ای برات مهم‌تره؟'
  ];
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

    // Get AI response
    const aiResponse = await callAIAPI(message.trim());

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
