import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

// Store connected users
const connectedUsers = new Map<string, { socketId: string; userId: string }>();

// Store call rooms
const callRooms = new Map<string, { callerId: string; receiverId: string }>();

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    path: '/',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', (data: { userId: string }) => {
      const { userId } = data;
      
      // Remove any existing connection for this user
      connectedUsers.forEach((value, key) => {
        if (value.userId === userId) {
          connectedUsers.delete(key);
        }
      });

      // Store the new connection
      connectedUsers.set(socket.id, { socketId: socket.id, userId });
      
      console.log(`User ${userId} joined with socket ${socket.id}`);
      console.log(`Total connected users: ${connectedUsers.size}`);
    });

    // Handle new message
    socket.on('new_message', (data: { 
      message: any; 
      receiverId: string;
    }) => {
      const { message, receiverId } = data;
      
      // Find the receiver's socket
      connectedUsers.forEach((user) => {
        if (user.userId === receiverId) {
          io.to(user.socketId).emit('new_message', message);
        }
      });
    });

    // Handle message read
    socket.on('message_read', (data: { 
      messageId: string; 
      senderId: string;
      readAt: Date;
    }) => {
      const { messageId, senderId, readAt } = data;
      
      // Find the sender's socket
      connectedUsers.forEach((user) => {
        if (user.userId === senderId) {
          io.to(user.socketId).emit('message_read', { messageId, readAt });
        }
      });
    });

    // Handle chat request
    socket.on('chat_request', (data: { 
      request: any; 
      receiverId: string;
    }) => {
      const { request, receiverId } = data;
      
      // Find the receiver's socket
      connectedUsers.forEach((user) => {
        if (user.userId === receiverId) {
          io.to(user.socketId).emit('chat_request', request);
        }
      });
    });

    // Handle chat deleted
    socket.on('chat_deleted', (data: { 
      chatId: string; 
      participantId: string;
    }) => {
      const { chatId, participantId } = data;
      
      // Find the participant's socket
      connectedUsers.forEach((user) => {
        if (user.userId === participantId) {
          io.to(user.socketId).emit('chat_deleted', { chatId });
        }
      });
    });

    // ==================== WebRTC Signaling ====================

    // Handle call offer
    socket.on('call_offer', (data: {
      callerId: string;
      receiverId: string;
      offer: RTCSessionDescriptionInit;
      callType: 'audio' | 'video';
    }) => {
      const { callerId, receiverId, offer, callType } = data;
      
      // Store call room
      const roomId = `${callerId}-${receiverId}`;
      callRooms.set(roomId, { callerId, receiverId });

      // Find the receiver's socket
      connectedUsers.forEach((user) => {
        if (user.userId === receiverId) {
          io.to(user.socketId).emit('incoming_call', {
            callerId,
            offer,
            callType,
          });
        }
      });
    });

    // Handle call answer
    socket.on('call_answer', (data: {
      callerId: string;
      receiverId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const { callerId, answer } = data;
      
      // Find the caller's socket
      connectedUsers.forEach((user) => {
        if (user.userId === callerId) {
          io.to(user.socketId).emit('call_answer', { answer });
        }
      });
    });

    // Handle ICE candidate
    socket.on('ice_candidate', (data: {
      targetUserId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const { targetUserId, candidate } = data;
      
      // Find the target user's socket
      connectedUsers.forEach((user) => {
        if (user.userId === targetUserId) {
          io.to(user.socketId).emit('ice_candidate', { candidate });
        }
      });
    });

    // Handle call end
    socket.on('end_call', (data: {
      targetUserId: string;
    }) => {
      const { targetUserId } = data;
      
      // Find the target user's socket
      connectedUsers.forEach((user) => {
        if (user.userId === targetUserId) {
          io.to(user.socketId).emit('call_ended');
        }
      });
    });

    // Handle call rejection
    socket.on('reject_call', (data: {
      callerId: string;
    }) => {
      const { callerId } = data;
      
      // Find the caller's socket
      connectedUsers.forEach((user) => {
        if (user.userId === callerId) {
          io.to(user.socketId).emit('call_rejected');
        }
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        connectedUsers.delete(socket.id);
        console.log(`User ${user.userId} disconnected`);
      }
      
      console.log(`Total connected users: ${connectedUsers.size}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error (${socket.id}):`, error);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
