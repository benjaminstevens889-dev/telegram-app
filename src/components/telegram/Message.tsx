'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Message as MessageType } from '@/types/telegram';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Check,
  CheckCheck,
  File,
  Image,
  Mic,
  Play,
  Pause,
  Video,
} from 'lucide-react';

interface MessageProps {
  message: MessageType;
  isGroupMessage?: boolean;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

export default function Message({ message, isGroupMessage = false }: MessageProps) {
  const { currentUser } = useAppStore();
  const isOwn = message.senderId === currentUser.id;
  const [isPlaying, setIsPlaying] = React.useState(false);

  const getMessageIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      case 'voice':
        return <Mic className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 max-w-[75%]',
        isOwn ? 'mr-auto flex-row-reverse' : 'ml-auto'
      )}
    >
      {/* Avatar for group messages */}
      {isGroupMessage && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback>{message.senderName[0]}</AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          'relative rounded-2xl px-4 py-2 shadow-lg',
          isOwn
            ? 'bg-gradient-to-br from-[#0088cc] to-[#229ED9] text-white rounded-tr-sm'
            : 'bg-white/10 text-white backdrop-blur-sm rounded-tl-sm'
        )}
      >
        {/* Sender name for group messages */}
        {isGroupMessage && !isOwn && (
          <p className="text-xs font-semibold text-[#0088cc] mb-1">
            {message.senderName}
          </p>
        )}

        {/* File/Video/Audio Message */}
        {message.type !== 'text' && (
          <div className="mb-2">
            {message.type === 'image' && message.fileUrl && (
              <div className="relative rounded-lg overflow-hidden bg-black/20">
                <div className="w-48 h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            )}

            {message.type === 'video' && (
              <div className="relative rounded-lg overflow-hidden bg-black/20">
                <div className="w-48 h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white mr-[-2px]" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {message.type === 'voice' && (
              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 mr-[-2px]" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex gap-0.5 h-6 items-end">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1 rounded-full',
                          isPlaying ? 'bg-white animate-pulse' : 'bg-white/40',
                          i % 3 === 0 ? 'h-6' : i % 2 === 0 ? 'h-4' : 'h-2'
                        )}
                        style={{
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs opacity-70">0:32</span>
              </div>
            )}

            {message.type === 'file' && (
              <div className="flex items-center gap-3 py-2 px-3 bg-black/20 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <File className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{message.fileName}</p>
                  <p className="text-xs opacity-70">{message.fileSize}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Time & Status */}
        <div
          className={cn(
            'flex items-center gap-1 justify-end mt-1',
            isOwn ? 'text-white/70' : 'text-gray-400'
          )}
        >
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="w-4 h-4 text-[#4fc3f7]" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
