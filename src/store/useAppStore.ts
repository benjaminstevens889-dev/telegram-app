import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  content: string;
  messageType: 'text' | 'file' | 'voice';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  duration?: number | null;
  senderId: string;
  receiverId: string;
  chatId: string;
  sender: User;
  receiver: User;
  createdAt: string;
  readAt: string | null;
}

export interface Chat {
  id: string;
  createdAt: string;
  otherParticipant: User;
  lastMessage: Message | null;
  unreadCount?: number;
}

export interface ChatRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface GroupMessage {
  id: string;
  content: string;
  messageType: 'text' | 'file' | 'voice';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  duration?: number | null;
  senderId: string;
  groupId: string;
  sender: User;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  createdAt: string;
  ownerId: string;
  owner: User;
  members: User[];
  messages?: GroupMessage[];
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  chats: Chat[];
  groups: Group[];
  selectedChat: Chat | null;
  selectedGroup: Group | null;
  messages: Message[];
  groupMessages: GroupMessage[];
  chatRequests: ChatRequest[];
  searchQuery: string;
  
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
  setSelectedChat: (chat: Chat | null) => void;
  setSelectedGroup: (group: Group | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  markMessageAsRead: (messageId: string, readAt: string) => void;
  setGroupMessages: (messages: GroupMessage[]) => void;
  addGroupMessage: (message: GroupMessage) => void;
  removeGroupMessage: (messageId: string) => void;
  setChatRequests: (requests: ChatRequest[]) => void;
  addChatRequest: (request: ChatRequest) => void;
  updateChatRequest: (requestId: string, status: string) => void;
  removeChatRequest: (requestId: string) => void;
  setSearchQuery: (query: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  chats: [],
  groups: [],
  selectedChat: null,
  selectedGroup: null,
  messages: [],
  groupMessages: [],
  chatRequests: [],
  searchQuery: '',

  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  removeChat: (chatId) => set((state) => ({ 
    chats: state.chats.filter(c => c.id !== chatId),
    selectedChat: state.selectedChat?.id === chatId ? null : state.selectedChat
  })),
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  updateGroup: (group) => set((state) => ({ 
    groups: state.groups.map(g => g.id === group.id ? group : g),
    selectedGroup: state.selectedGroup?.id === group.id ? group : state.selectedGroup
  })),
  removeGroup: (groupId) => set((state) => ({ 
    groups: state.groups.filter(g => g.id !== groupId),
    selectedGroup: state.selectedGroup?.id === groupId ? null : state.selectedGroup
  })),
  setSelectedChat: (chat) => set({ selectedChat: chat, selectedGroup: null, messages: [], groupMessages: [] }),
  setSelectedGroup: (group) => set({ selectedGroup: group, selectedChat: null, messages: [], groupMessages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  removeMessage: (messageId) => set((state) => ({ 
    messages: state.messages.filter(m => m.id !== messageId) 
  })),
  markMessageAsRead: (messageId, readAt) => set((state) => ({
    messages: state.messages.map(m => 
      m.id === messageId ? { ...m, readAt } : m
    )
  })),
  setGroupMessages: (messages) => set({ groupMessages: messages }),
  addGroupMessage: (message) => set((state) => ({ groupMessages: [...state.groupMessages, message] })),
  removeGroupMessage: (messageId) => set((state) => ({ groupMessages: state.groupMessages.filter(m => m.id !== messageId) })),
  setChatRequests: (requests) => set({ chatRequests: requests }),
  addChatRequest: (request) => set((state) => ({ 
    chatRequests: [request, ...state.chatRequests] 
  })),
  updateChatRequest: (requestId, status) => set((state) => ({
    chatRequests: state.chatRequests.map(r => 
      r.id === requestId ? { ...r, status } : r
    )
  })),
  removeChatRequest: (requestId) => set((state) => ({
    chatRequests: state.chatRequests.filter(r => r.id !== requestId)
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  logout: () => set({ 
    currentUser: null, 
    isAuthenticated: false, 
    chats: [],
    groups: [],
    selectedChat: null, 
    selectedGroup: null,
    messages: [],
    groupMessages: [],
    chatRequests: []
  }),
}));
