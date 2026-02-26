import { User, Chat, Message } from '@/types/telegram';

export const currentUser: User = {
  id: 'user-1',
  name: 'علی محمدی',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
  status: 'online',
  phone: '+98 912 345 6789',
  bio: 'برنامه‌نویس و علاقه‌مند به تکنولوژی',
  username: '@ali_mohammadi'
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'سارا احمدی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    status: 'online',
    phone: '+98 911 222 3333',
    bio: 'طراح گرافیک',
    username: '@sara_ahmadi'
  },
  {
    id: 'user-3',
    name: 'محمد رضایی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
    status: 'offline',
    phone: '+98 913 444 5555',
    bio: 'مهندس نرم‌افزار',
    username: '@mohammad_rezaei'
  },
  {
    id: 'user-4',
    name: 'فاطمه کریمی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fateme',
    status: 'busy',
    phone: '+98 915 666 7777',
    bio: 'دانشجوی کامپیوتر',
    username: '@fateme_karimi'
  },
  {
    id: 'user-5',
    name: 'امیر حسینی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
    status: 'online',
    phone: '+98 917 888 9999',
    bio: 'عکاس حرفه‌ای',
    username: '@amir_hosseini'
  },
  {
    id: 'user-6',
    name: 'زهرا نوری',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra',
    status: 'offline',
    phone: '+98 918 111 2222',
    bio: 'مدیر محصول',
    username: '@zahra_nouri'
  }
];

const createMessages = (otherUser: User): Message[] => [
  {
    id: 'msg-1',
    senderId: otherUser.id,
    senderName: otherUser.name,
    senderAvatar: otherUser.avatar,
    content: 'سلام! چطوری؟',
    timestamp: new Date(Date.now() - 3600000 * 24),
    isRead: true,
    type: 'text'
  },
  {
    id: 'msg-2',
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar,
    content: 'سلام! خوبم ممنون، تو چطوری؟',
    timestamp: new Date(Date.now() - 3600000 * 23),
    isRead: true,
    type: 'text'
  },
  {
    id: 'msg-3',
    senderId: otherUser.id,
    senderName: otherUser.name,
    senderAvatar: otherUser.avatar,
    content: 'منم خوبم. امروز جلسه داری؟',
    timestamp: new Date(Date.now() - 3600000 * 22),
    isRead: true,
    type: 'text'
  },
  {
    id: 'msg-4',
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar,
    content: 'آره، ساعت ۳ جلسه دارم با تیم.',
    timestamp: new Date(Date.now() - 3600000 * 21),
    isRead: true,
    type: 'text'
  },
  {
    id: 'msg-5',
    senderId: otherUser.id,
    senderName: otherUser.name,
    senderAvatar: otherUser.avatar,
    content: 'عالیه! موفق باشی 🙏',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isRead: false,
    type: 'text'
  }
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    type: 'private',
    name: 'سارا احمدی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    lastMessage: 'عالیه! موفق باشی 🙏',
    lastMessageTime: new Date(Date.now() - 3600000 * 2),
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    messages: createMessages(users[1])
  },
  {
    id: 'chat-2',
    type: 'private',
    name: 'محمد رضایی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
    lastMessage: 'فردا می‌تونیم هماهنگ کنیم؟',
    lastMessageTime: new Date(Date.now() - 3600000 * 5),
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-3',
        senderName: 'محمد رضایی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
        content: 'سلام علی آقا',
        timestamp: new Date(Date.now() - 3600000 * 8),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg-2',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: 'سلام محمد جان، چه خبر؟',
        timestamp: new Date(Date.now() - 3600000 * 7),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg-3',
        senderId: 'user-3',
        senderName: 'محمد رضایی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
        content: 'فردا می‌تونیم هماهنگ کنیم؟',
        timestamp: new Date(Date.now() - 3600000 * 5),
        isRead: true,
        type: 'text'
      }
    ]
  },
  {
    id: 'chat-3',
    type: 'private',
    name: 'فاطمه کریمی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fateme',
    lastMessage: 'فایل رو برات فرستادم',
    lastMessageTime: new Date(Date.now() - 3600000 * 8),
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-4',
        senderName: 'فاطمه کریمی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fateme',
        content: 'سلام، فایل پروژه رو آماده کردم',
        timestamp: new Date(Date.now() - 3600000 * 10),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg-2',
        senderId: 'user-4',
        senderName: 'فاطمه کریمی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fateme',
        content: 'فایل رو برات فرستادم',
        timestamp: new Date(Date.now() - 3600000 * 8),
        isRead: false,
        type: 'file',
        fileUrl: '#',
        fileName: 'project.zip',
        fileSize: '2.5 MB'
      }
    ]
  },
  {
    id: 'chat-4',
    type: 'private',
    name: 'امیر حسینی',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
    lastMessage: 'عکس‌ها رو دیدی؟',
    lastMessageTime: new Date(Date.now() - 3600000 * 12),
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-5',
        senderName: 'امیر حسینی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
        content: 'سلام! امروز عکس‌های جدید گرفتم',
        timestamp: new Date(Date.now() - 3600000 * 14),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg-2',
        senderId: 'user-5',
        senderName: 'امیر حسینی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
        content: 'عکس‌ها رو دیدی؟',
        timestamp: new Date(Date.now() - 3600000 * 12),
        isRead: true,
        type: 'text'
      }
    ]
  },
  {
    id: 'chat-5',
    type: 'private',
    name: 'زهرا نوری',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra',
    lastMessage: 'دیروز خیلی خوش گذشت 😊',
    lastMessageTime: new Date(Date.now() - 3600000 * 24),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-6',
        senderName: 'زهرا نوری',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra',
        content: 'دیروز خیلی خوش گذشت 😊',
        timestamp: new Date(Date.now() - 3600000 * 24),
        isRead: true,
        type: 'text'
      }
    ]
  }
];

export const groups: Chat[] = [
  {
    id: 'group-1',
    type: 'group',
    name: 'تیم توسعه',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=team-dev',
    lastMessage: 'علی: جلسه فردا ساعت ۱۰',
    lastMessageTime: new Date(Date.now() - 1800000),
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
    membersCount: 12,
    description: 'گروه رسمی تیم توسعه نرم‌افزار',
    messages: [
      {
        id: 'gmsg-1',
        senderId: 'user-3',
        senderName: 'محمد رضایی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
        content: 'سلام به همه',
        timestamp: new Date(Date.now() - 3600000 * 3),
        isRead: true,
        type: 'text'
      },
      {
        id: 'gmsg-2',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: 'سلام! جلسه فردا ساعت ۱۰',
        timestamp: new Date(Date.now() - 1800000),
        isRead: false,
        type: 'text'
      }
    ]
  },
  {
    id: 'group-2',
    type: 'group',
    name: 'خانواده',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=family',
    lastMessage: 'مادر: شام امروز خونه ماست',
    lastMessageTime: new Date(Date.now() - 3600000 * 4),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    membersCount: 8,
    description: 'گروه خانوادگی',
    messages: [
      {
        id: 'gmsg-3',
        senderId: 'user-x',
        senderName: 'مادر',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mother',
        content: 'شام امروز خونه ماست',
        timestamp: new Date(Date.now() - 3600000 * 4),
        isRead: true,
        type: 'text'
      }
    ]
  },
  {
    id: 'group-3',
    type: 'group',
    name: 'دانشجویان کامپیوتر',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=students',
    lastMessage: 'امیر: امتحان فرداست',
    lastMessageTime: new Date(Date.now() - 3600000 * 6),
    unreadCount: 15,
    isPinned: false,
    isMuted: true,
    membersCount: 45,
    description: 'گروه دانشجویان رشته کامپیوتر',
    messages: [
      {
        id: 'gmsg-4',
        senderId: 'user-5',
        senderName: 'امیر حسینی',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
        content: 'امتحان فرداست',
        timestamp: new Date(Date.now() - 3600000 * 6),
        isRead: false,
        type: 'text'
      }
    ]
  },
  {
    id: 'group-4',
    type: 'group',
    name: 'برنامه‌نویسان ایران',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=programmers',
    lastMessage: 'رضا: کسی با Next.js کار کرده؟',
    lastMessageTime: new Date(Date.now() - 3600000 * 18),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    membersCount: 156,
    description: 'انجمن برنامه‌نویسان ایرانی',
    messages: []
  }
];

export const channels: Chat[] = [
  {
    id: 'channel-1',
    type: 'channel',
    name: 'اخبار تکنولوژی',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech-news',
    lastMessage: 'اپل از آیفون جدید رونمایی کرد',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    subscribersCount: 25000,
    description: 'آخرین اخبار دنیای تکنولوژی',
    messages: [
      {
        id: 'cmsg-1',
        senderId: 'channel-1',
        senderName: 'اخبار تکنولوژی',
        senderAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech-news',
        content: 'اپل از آیفون جدید رونمایی کرد 📱',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false,
        type: 'text'
      }
    ]
  },
  {
    id: 'channel-2',
    type: 'channel',
    name: 'آموزش برنامه‌نویسی',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=coding-learn',
    lastMessage: 'آموزش جدید React 19 منتشر شد',
    lastMessageTime: new Date(Date.now() - 3600000 * 5),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    subscribersCount: 18000,
    description: 'آموزش‌های رایگان برنامه‌نویسی',
    messages: [
      {
        id: 'cmsg-2',
        senderId: 'channel-2',
        senderName: 'آموزش برنامه‌نویسی',
        senderAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=coding-learn',
        content: 'آموزش جدید React 19 منتشر شد 🚀',
        timestamp: new Date(Date.now() - 3600000 * 5),
        isRead: true,
        type: 'text'
      }
    ]
  },
  {
    id: 'channel-3',
    type: 'channel',
    name: 'ورزش ۳۶۰',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=sports',
    lastMessage: 'نتایج لیگ برتر',
    lastMessageTime: new Date(Date.now() - 3600000 * 8),
    unreadCount: 7,
    isPinned: false,
    isMuted: true,
    subscribersCount: 50000,
    description: 'اخبار و نتایج ورزشی',
    messages: []
  },
  {
    id: 'channel-4',
    type: 'channel',
    name: 'فیلم و سریال',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=movies',
    lastMessage: 'معرفی فیلم‌های جدید هفته',
    lastMessageTime: new Date(Date.now() - 3600000 * 24),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    subscribersCount: 35000,
    description: 'معرفی و نقد فیلم و سریال',
    messages: []
  },
  {
    id: 'channel-5',
    type: 'channel',
    name: 'سلامت و تندرستی',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=health',
    lastMessage: 'نکات سلامتی روزانه',
    lastMessageTime: new Date(Date.now() - 3600000 * 36),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    subscribersCount: 12000,
    description: 'نکات و راهنمایی‌های سلامتی',
    messages: []
  }
];
