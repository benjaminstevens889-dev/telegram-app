'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Chat } from '@/types/telegram';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Pin, VolumeX, Check, CheckCheck } from 'lucide-react';

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'دیروز';
  } else if (days < 7) {
    return date.toLocaleDateString('fa-IR', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'busy':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const ChatItem = ({ chat, isSelected, onClick }: ChatItemProps) => {
  const { currentUser } = useAppStore();
  const lastMessageSender = chat.messages?.[chat.messages.length - 1]?.senderId === currentUser.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-all duration-200',
        'border-b border-white/5',
        isSelected
          ? 'bg-gradient-to-l from-[#0088cc]/20 to-transparent border-l-4 border-l-[#0088cc]'
          : 'hover:bg-white/5'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12 ring-2 ring-white/10">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback className="bg-[#0088cc] text-white">
            {chat.name[0]}
          </AvatarFallback>
        </Avatar>
        {chat.type === 'private' && (
          <span
            className={cn(
              'absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-[#0f0f23]',
              getStatusColor('online')
            )}
          />
        )}
        {chat.type === 'group' && (
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#0088cc] flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">{chat.membersCount}</span>
          </div>
        )}
        {chat.type === 'channel' && (
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">K</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            {chat.isPinned && <Pin className="w-3 h-3 text-[#0088cc]" />}
            <h3 className="font-semibold text-white truncate">{chat.name}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {chat.isMuted && <VolumeX className="w-4 h-4 text-gray-500" />}
            <span className="text-xs text-gray-400">
              {formatTime(chat.lastMessageTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {lastMessageSender && chat.messages && chat.messages.length > 0 && (
              <CheckCheck className="w-4 h-4 text-[#0088cc] flex-shrink-0" />
            )}
            <p className="text-sm text-gray-400 truncate">
              {chat.lastMessage}
            </p>
          </div>
          {chat.unreadCount > 0 && (
            <Badge className="bg-[#0088cc] text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ChatList() {
  const {
    chats,
    groups,
    channels,
    activeView,
    selectedChat,
    setSelectedChat,
    searchQuery,
    setIsMobileMenuOpen,
  } = useAppStore();

  const getChatList = (): Chat[] => {
    switch (activeView) {
      case 'groups':
        return groups;
      case 'channels':
        return channels;
      default:
        return chats;
    }
  };

  const chatList = getChatList();

  const filteredChats = React.useMemo(() => {
    if (!searchQuery) return chatList;
    return chatList.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatList, searchQuery]);

  // Sort: pinned first, then by last message time
  const sortedChats = React.useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });
  }, [filteredChats]);

  const pinnedChats = sortedChats.filter((chat) => chat.isPinned);
  const unpinnedChats = sortedChats.filter((chat) => !chat.isPinned);

  return (
    <div className="h-full flex flex-col bg-[#0f0f23]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">
          {activeView === 'chats' && 'همه چت‌ها'}
          {activeView === 'groups' && 'گروه‌ها'}
          {activeView === 'channels' && 'کانال‌ها'}
        </h2>
        <p className="text-sm text-gray-400">
          {sortedChats.length} {activeView === 'chats' ? 'چت' : activeView === 'groups' ? 'گروه' : 'کانال'}
        </p>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {pinnedChats.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 font-medium flex items-center gap-2">
                <Pin className="w-3 h-3" />
                سنجاق شده
              </div>
              {pinnedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
              <div className="h-2" />
            </>
          )}

          {unpinnedChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              onClick={() => {
                setSelectedChat(chat);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}

          {sortedChats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-gray-400"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                {activeView === 'chats' && <span className="text-3xl">💬</span>}
                {activeView === 'groups' && <span className="text-3xl">👥</span>}
                {activeView === 'channels' && <span className="text-3xl">📢</span>}
              </div>
              <p className="text-lg font-medium">هیچ {activeView === 'chats' ? 'چتی' : activeView === 'groups' ? 'گروهی' : 'کانالی'} یافت نشد</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
