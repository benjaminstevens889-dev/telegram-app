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
  const existingChats = await db.chat.findMany({
    where: {
      participants: {
        every: { id: { in: [userId, aiUserId] } }
      }
    },
    include: { participants: true }
  });

  const chat = existingChats.find(c => c.participants.length === 2);
  if (chat) return chat;

  return db.chat.create({
    data: {
      participants: { connect: [{ id: userId }, { id: aiUserId }] }
    },
    include: { participants: true }
  });
}

// Smart Persian AI Response System
function generateSmartResponse(message: string): string {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);
  
  // ========== GREETINGS ==========
  if (/\b(سلام|درود|سلام علیکم|hi|hello|hey|سَلام)\b/.test(msg)) {
    const responses = [
      'سلام دوست عزیز! 👋 خوشحالم که اینجایی! چطور می‌تونم کمکت کنم؟ 🌟',
      'درود بر تو! 🌸 امیدوارم روز خوبی داشته باشی. چه کمکی از دستم برمیاد؟',
      'سلام! 🎉 خیلی خوشحالم که می‌بینمت! هر سوالی داری بپرس!',
      'سلام دوست من! 💫 من دستیار هوشمند این برنامه‌ام. آماده‌ام کمکت کنم!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== HOW ARE YOU ==========
  if (/\b(چطوری|حالت|خوبی|چطوری|حالت چطوره|how are you|hes fine)\b/.test(msg) || 
      /\b(چطوری|خوبید|حالتون)\b/.test(msg)) {
    const responses = [
      'من عالی‌ام! 😊 ممنون که پرسیدی. تو چطوری؟ روزت چطور گذشت؟',
      'خیلی خوبم! 💪 سرحالم و آماده کمکت! تو چه خبر؟',
      'سپاس از لطفت! 🌹 همه چیز عالیه! چه کاری می‌تونم برات انجام بدم؟',
      'من خوبم دوست من! ✨ همیشه آماده کمکت هستم!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== NAME ==========
  if (/\b(اسمت|نامت|کی هستی|شما کی|who are you|نام تو)\b/.test(msg) || 
      /\b(معرفی|خودت)\b/.test(msg)) {
    return 'من دستیار هوشمند این برنامه‌ام! 🤖✨\n\nمن اینجا هستم که:\n• به سوالاتت جواب بدم 💬\n• کمکت کنم در هر موضوع 📚\n• باهات گپ بزنم و وقت گذرونی کنم 🎯\n\nهر سوالی داری بپرس!';
  }
  
  // ========== HELP ==========
  if (/\b(کمک|راهنمایی|help|چه کاری|چه کمکی|کاری)\b/.test(msg)) {
    return 'توی این برنامه می‌تونی: 🎯\n\n📱 چت خصوصی:\n• با کاربران دیگه چت کنی\n• پیام صوتی بفرستی\n• فایل ارسال کنی\n\n👥 چت گروهی:\n• گروه بسازی\n• اعضا اضافه کنی\n• با دوستات گپ بزنی\n\n🤖 من:\n• به سوالاتت جواب میدم\n• کمکت می‌کنم\n\nچه سوالی داری؟';
  }
  
  // ========== JOKES ==========
  if (/\b(جوک|خنده|بخند|جک|joke|طنز)\b/.test(msg)) {
    const jokes = [
      'چرا کامپیوتر سرما خورد؟ 🤧\nچون ویندوزش باز بود! 😂',
      'یارو میره پیتزافروشی، فروشنده میگه پیتزا رو ۸ تیکه ببرم یا ۱۲ تیکه؟\nیارو میگه ۸ تیکه، من نمیتونم ۱۲ تیکه بخورم! 🍕😂',
      'معلم:کلمه "خوشحال" رو جمله بذار!\nشاگرد: خوشحال که زنگ خورد! 🔔😄',
      'به یه ماهی گفتن چرا تنهایی؟\nگفت: آخه کی پیشه من میاد! 🐟😂',
      'یارو میره کتابخونه میگه: یه ساندویچ بدید!\nکتابدار میگه: اینجا کتابخونست!\nیارو آروم میگه: پس نگه داریدش! 📚🥪😂',
      'چرا فیل نمیتونه بیسکویت بخوره؟\nچون فیل بیسکویت نمیخره! 🐘😂'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // ========== TIME & DATE ==========
  if (/\b(ساعت|تاریخ|چند\s*ساعت|امروز|الان|time|date)\b/.test(msg)) {
    const now = new Date();
    const time = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `🕐 ساعت: ${time}\n📅 امروز: ${date}`;
  }
  
  // ========== WEATHER ==========
  if (/\b(هوا|آب و هوا|اب و هوا|حرارت|دما|weather)\b/.test(msg)) {
    return 'متأسفانه الان نمی‌تونم وضعیت هوا رو بهت بگم 🌤️\n\nولی می‌تونی از این سایت‌ها استفاده کنی:\n• weather.com\n• accuweather.com\n\nیا فقط از پنجره بیرون رو نگاه کن! 😄';
  }
  
  // ========== PROGRAMMING ==========
  if (/\b(برنامه|کد|کدنویسی|پایتون|جاوا|جاوااسکریپت|javascript|python|programming)\b/.test(msg)) {
    return 'برنامه‌نویسی خیلی جذابه! 💻🔥\n\nزبان‌های معروف:\n• پایتون - ساده و قدررتمند 🐍\n• جاوااسکریپت - برای وب 🌐\n• جاوا - برای اندروید 📱\n\nکدوم رو دوست داری یاد بگیری؟';
  }
  
  // ========== FOOD ==========
  if (/\b(غذا|شام|ناهار|صبحانه|خوراک|food|غذاخوری)\b/.test(msg)) {
    const foods = [
      'امروز چی بخورم؟ 🤔\nپیشنهاد من: کباب کوبیده با برنج! 🍖🍚',
      'یه پیتزا مخصوص چطوره؟ 🍕',
      'قرمه‌سبزی با برنج و نارنج! 😋🥘',
      'چلو کباب برگ! اصیل ایرانی! 🇮🇷🍖'
    ];
    return foods[Math.floor(Math.random() * foods.length)];
  }
  
  // ========== MUSIC ==========
  if (/\b(موسیقی|آهنگ|موسیقی|music|خواننده|خوندن)\b/.test(msg)) {
    return 'موسیقی غذای روحه! 🎵🎶\n\nسبک‌های مختلف:\n• پاپ 🎤\n• سنتی 🪕\n• کلاسیک 🎻\n• راک 🎸\n\nچه سبکی دوست داری؟';
  }
  
  // ========== MOVIES ==========
  if (/\b(فیلم|سریال|سینما|movie|cinema|فیلمخونه)\b/.test(msg)) {
    return 'فیلم دیدن یه تفریح عالیه! 🎬🍿\n\nپیشنهاد من:\n• فیلم‌های اکشن 🎯\n• کمدی و خنده‌دار 😂\n• علمی-تخیلی 🚀\n\nچه ژانری دوست داری؟';
  }
  
  // ========== SPORTS ==========
  if (/\b(ورزش|فوتبال|بازی|football|sport|باشگاه)\b/.test(msg)) {
    return 'ورزش خیلی مفیده! ⚽🏀\n\nورزش‌های محبوب:\n• فوتبال ⚽\n• بسکتبال 🏀\n• والیبال 🏐\n• شنا 🏊\n\nکدوم رو بیشتر دوست داری؟';
  }
  
  // ========== LOVE & EMOTIONS ==========
  if (/\b(دوستت|عاشق|love|دلداری|ناراحت|غمگین)\b/.test(msg)) {
    const responses = [
      'ممنون از احساس خوبت! 💕 منم خیلی دوست دارم باهات گپ بزنم! 🤗',
      'تو خیلی خوبی! 🌹 هر وقت خواستی من اینجام! 💫',
      'قلبم گرم شد از حرفت! 💖 اگه ناراحتی بگو تا دلدارت بدم! 🤗'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== GOODBYE ==========
  if (/\b(خدافظ|خداحافظ|بای|bye|خدانگهدار|فعلا)\b/.test(msg)) {
    const responses = [
      'خداحافظ دوست عزیز! 👋 روزت خوش باشه! 🌟',
      'فضافاً! 👋 امیدوارم بازم بیای! 💫',
      'خدانگهدار! 🌙 به امید دیدار مجدد! 🌹'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== THANKS ==========
  if (/\b(ممنون|مرسی|تشکر|thanks|thank|متشکر)\b/.test(msg)) {
    const responses = [
      'خواهش می‌کنم! 🙏 خوشحالم که تونستم کمکت کنم!',
      'قابلی نداره! 💖 در خدمتم!',
      'عزیزی! 🌟 هر سوالی داری من اینجام!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== CALCULATOR ==========
  if (/[\d+\-*/]/.test(msg) && /\b(چند|محاسبه|حساب|calculate)\b/.test(msg)) {
    try {
      const mathExpr = msg.match(/[\d+\-*/\s.]+/g);
      if (mathExpr) {
        const result = eval(mathExpr[0].replace(/[^\d+\-*/.]/g, ''));
        return `🔢 نتیجه: ${result}\n\nاگه محاسبه سخت‌تری داری بگو! 📐`;
      }
    } catch {
      return 'متوجه نشدم! 🤔 می‌تونی محاسبه‌ت رو واضح‌تر بنویسی؟';
    }
  }
  
  // ========== TRANSLATION ==========
  if (/\b(ترجمه|translate|معنی|یعنی)\b/.test(msg)) {
    return 'می‌تونم کلمات رو ترجمه کنم! 📚\n\nمثلاً بنویس:\n"سلام یعنی چه"\nیا\n"hello ترجمه"\n\nچه کلمه‌ای رو می‌خوای ترجمه کنم؟';
  }
  
  // ========== AGE ==========
  if (/\b(چند ساله|سن|چندتا سال|age)\b/.test(msg)) {
    return 'من یه دستیار هوشمند هستم! 🤖\n\nسن ندارم ولی هر روز یادمی‌گیرم و باهوش‌تر می‌شم! 🧠✨';
  }
  
  // ========== QUESTION PATTERNS ==========
  if (msg.includes('؟') || msg.includes('?') || msg.startsWith('آیا') || msg.startsWith('چه') || msg.startsWith('چرا') || msg.startsWith('چطور') || msg.startsWith('کجا')) {
    const responses = [
      `سوال جالبی پرسیدی! 🤔\n\nدر مورد "${message.slice(0, 30)}..." باید بیشتر فکر کنم. می‌تونی بیشتر توضیح بدی؟`,
      `این یه سوال خوبه! 💭\n\nمتأسفانه الان اطلاعات دقیقی ندارم. ولی می‌تونی تو گوگل سرچ کنی یا بعداً دوباره بپرس!`,
      `جالبه! 🧐\n\nسعی می‌کنم کمکت کنم. می‌خوای بیشتر در موردش صحبت کنیم؟`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // ========== DEFAULT SMART RESPONSES ==========
  const defaultResponses = [
    `متوجه حرفت شدم! 😊\n\nدر مورد "${message.slice(0, 50)}" چه چیز دیگه‌ای می‌خوای بدونی؟`,
    'جالبه! 🌟 بیشتر برام توضیح بده! 👂',
    'اوه، موضوع جالبی رو مطرح کردی! 💡 می‌خوای بیشتر بگم؟',
    'حتماً! 📝 چه چیز دیگه‌ای می‌تونم کمکت کنم؟',
    'فکر می‌کنم منظورت رو گرفتم! 🧠 ادامه بده...',
    'عالی! ✨ این یه موضوع خوبه برای بحث. نظرت چیه؟'
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

    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== 'string' || !message.trim()) {
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

    // Generate AI response
    const aiResponse = generateSmartResponse(message.trim());

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
