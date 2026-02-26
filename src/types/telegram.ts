export type ChatType = 'private' | 'group' | 'channel';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  phone?: string;
  bio?: string;
  username?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  members?: User[];
  messages?: Message[];
  description?: string;
  subscribersCount?: number;
  membersCount?: number;
}

export interface Call {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'audio' | 'video';
  status: 'calling' | 'connected' | 'ended';
  startTime?: Date;
  duration?: number;
}

export type ViewType = 'chats' | 'groups' | 'channels' | 'profile' | 'settings' | 'createGroup' | 'createChannel';

export interface AppState {
  currentUser: User;
  chats: Chat[];
  groups: Chat[];
  channels: Chat[];
  selectedChat: Chat | null;
  activeView: ViewType;
  searchQuery: string;
  isCallActive: boolean;
  activeCall: Call | null;
  isMobileMenuOpen: boolean;
  setSelectedChat: (chat: Chat | null) => void;
  setActiveView: (view: ViewType) => void;
  setSearchQuery: (query: string) => void;
  setIsCallActive: (active: boolean) => void;
  setActiveCall: (call: Call | null) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  sendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  markChatAsRead: (chatId: string) => void;
  togglePinChat: (chatId: string) => void;
  toggleMuteChat: (chatId: string) => void;
}
