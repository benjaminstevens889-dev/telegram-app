'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Message from './Message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Image,
  File,
  Mic,
  Send,
  Smile,
  X,
  Pin,
  VolumeX,
  UserPlus,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🙏', '😍', '🤔', '😢', '😡', '👏', '🎁', '✨', '💪'];

export default function ChatWindow() {
  const {
    selectedChat,
    setSelectedChat,
    currentUser,
    sendMessage,
    markChatAsRead,
    togglePinChat,
    toggleMuteChat,
    setIsCallActive,
    setActiveCall,
  } = useAppStore();

  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (selectedChat) {
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat?.id]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    sendMessage(selectedChat.id, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageText.trim(),
      type: 'text',
    });

    setMessageText('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!selectedChat) return;
    
    setIsCallActive(true);
    setActiveCall({
      id: `call-${Date.now()}`,
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      receiverId: selectedChat.id,
      receiverName: selectedChat.name,
      receiverAvatar: selectedChat.avatar,
      type,
      status: 'calling',
    });
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0088cc]/30">
            <span className="text-5xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">تلگرام وب</h2>
          <p className="text-gray-400 mb-6">یک چت را انتخاب کنید تا گفتگو را شروع کنید</p>
          <div className="flex flex-wrap justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <span>🔒</span>
              </div>
              <span className="text-sm">رمزنگاری سرتاسری</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <span>☁️</span>
              </div>
              <span className="text-sm">ذخیره در ابر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <span>⚡</span>
              </div>
              <span className="text-sm">سریع و امن</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0f0f23]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-[#1a1a2e] border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white hover:bg-white/10"
          onClick={() => setSelectedChat(null)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10 ring-2 ring-[#0088cc]/50">
          <AvatarImage src={selectedChat.avatar} />
          <AvatarFallback className="bg-[#0088cc]">{selectedChat.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{selectedChat.name}</h3>
            {selectedChat.isPinned && <Pin className="w-3 h-3 text-[#0088cc]" />}
            {selectedChat.isMuted && <VolumeX className="w-3 h-3 text-gray-500" />}
          </div>
          <p className="text-xs text-gray-400">
            {selectedChat.type === 'private' && 'آنلاین'}
            {selectedChat.type === 'group' && `${selectedChat.membersCount} عضو`}
            {selectedChat.type === 'channel' && `${selectedChat.subscribersCount?.toLocaleString('fa-IR')} عضو`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => handleStartCall('audio')}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => handleStartCall('video')}
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Search className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem
                onClick={() => togglePinChat(selectedChat.id)}
                className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5"
              >
                <Pin className="w-4 h-4 ml-2" />
                {selectedChat.isPinned ? 'برداشتن سنجاق' : 'سنجاق کردن'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggleMuteChat(selectedChat.id)}
                className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5"
              >
                <VolumeX className="w-4 h-4 ml-2" />
                {selectedChat.isMuted ? 'فعال کردن صدا' : 'بی‌صدا کردن'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5">
                <UserPlus className="w-4 h-4 ml-2" />
                افزودن عضو
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                <Trash2 className="w-4 h-4 ml-2" />
                حذف چت
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {selectedChat.messages?.map((message) => (
          <Message
            key={message.id}
            message={message}
            isGroupMessage={selectedChat.type === 'group'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#1a1a2e] border-t border-white/10">
        <div className="flex items-end gap-2">
          {/* Attach Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 right-0 bg-[#1a1a2e] rounded-lg shadow-xl border border-white/10 overflow-hidden"
                >
                  <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Image className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-white">عکس یا ویدیو</span>
                  </button>
                  <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <File className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-white">فایل</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="پیام خود را بنویسید..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0088cc] transition-colors"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 bg-[#1a1a2e] rounded-lg shadow-xl border border-white/10 p-2 grid grid-cols-8 gap-1"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                        inputRef.current?.focus();
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send / Voice Button */}
          {messageText.trim() ? (
            <Button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:shadow-lg hover:shadow-[#0088cc]/30 transition-all"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
