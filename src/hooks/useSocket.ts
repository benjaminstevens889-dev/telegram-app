'use client';

import { useCallback } from 'react';
import { Message, ChatRequest } from '@/store/useAppStore';

// Simple hook - real-time is handled by polling in ChatWindow
export function useSocket() {
  // These functions are kept for compatibility
  const sendMessage = useCallback((message: Message, receiverId: string) => {
    // Message is sent via API, polling will deliver to receiver
  }, []);

  const emitMessageRead = useCallback((messageId: string, senderId: string, readAt: string) => {
    // Read status is sent via API, polling will update sender
  }, []);

  const emitMessageDeleted = useCallback((data: { 
    messageId: string; 
    chatId: string;
    deletedFor: 'me' | 'both' | 'receiver';
    participantId: string;
  }) => {
    // Delete is sent via API, polling will update participant
  }, []);

  const sendChatRequest = useCallback((request: ChatRequest, receiverId: string) => {
    // Chat request is sent via API
  }, []);

  const notifyChatDeleted = useCallback((chatId: string, participantId: string) => {
    // Chat delete is sent via API
  }, []);

  return {
    sendMessage,
    emitMessageRead,
    emitMessageDeleted,
    sendChatRequest,
    notifyChatDeleted,
    isConnected: true,
  };
}
