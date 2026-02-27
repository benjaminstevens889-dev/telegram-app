import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/socket',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store connected users: socketId -> userId
const connectedUsers = new Map<string, string>();

// Store user to socket mapping: userId -> socketId
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with their userId
  socket.on('join', (data: { userId: string }) => {
    const { userId } = data;
    
    // Remove any existing socket for this user
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId) {
      connectedUsers.delete(existingSocketId);
    }

    // Store the new connection
    connectedUsers.set(socket.id, userId);
    userSockets.set(userId, socket.id);
    
    console.log(`User ${userId} joined with socket ${socket.id}`);
    console.log(`Total connected users: ${connectedUsers.size}`);
  });

  // Handle new message
  socket.on('new_message', (data: { 
    message: any; 
    receiverId: string;
  }) => {
    const { message, receiverId } = data;
    const receiverSocketId = userSockets.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', message);
      console.log(`Message sent to user ${receiverId}`);
    }
  });

  // Handle message read
  socket.on('message_read', (data: { 
    messageId: string; 
    senderId: string;
    readAt: string;
  }) => {
    const { messageId, senderId, readAt } = data;
    const senderSocketId = userSockets.get(senderId);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit('message_read', { messageId, readAt });
    }
  });

  // Handle chat request
  socket.on('chat_request', (data: { 
    request: any; 
    receiverId: string;
  }) => {
    const { request, receiverId } = data;
    const receiverSocketId = userSockets.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('chat_request', request);
    }
  });

  // Handle chat request accepted
  socket.on('chat_request_accepted', (data: { 
    chat: any; 
    senderId: string;
  }) => {
    const { chat, senderId } = data;
    const senderSocketId = userSockets.get(senderId);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit('chat_request_accepted', chat);
    }
  });

  // Handle chat deleted
  socket.on('chat_deleted', (data: { 
    chatId: string; 
    participantId: string;
  }) => {
    const { chatId, participantId } = data;
    const participantSocketId = userSockets.get(participantId);
    
    if (participantSocketId) {
      io.to(participantSocketId).emit('chat_deleted', { chatId });
    }
  });

  // ==================== WebRTC Signaling ====================

  // Handle call offer
  socket.on('call_offer', (data: {
    callerId: string;
    callerName: string;
    callerAvatar: string;
    receiverId: string;
    offer: RTCSessionDescriptionInit;
    callType: 'audio' | 'video';
  }) => {
    const { callerId, callerName, callerAvatar, receiverId, offer, callType } = data;
    const receiverSocketId = userSockets.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming_call', {
        callerId,
        callerName,
        callerAvatar,
        offer,
        callType,
      });
      console.log(`Call offer sent to user ${receiverId}`);
    }
  });

  // Handle call answer
  socket.on('call_answer', (data: {
    callerId: string;
    answer: RTCSessionDescriptionInit;
  }) => {
    const { callerId, answer } = data;
    const callerSocketId = userSockets.get(callerId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_answer', { answer });
    }
  });

  // Handle ICE candidate
  socket.on('ice_candidate', (data: {
    targetUserId: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const { targetUserId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice_candidate', { candidate });
    }
  });

  // Handle call end
  socket.on('end_call', (data: {
    targetUserId: string;
  }) => {
    const { targetUserId } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call_ended');
    }
  });

  // Handle call rejection
  socket.on('reject_call', (data: {
    callerId: string;
  }) => {
    const { callerId } = data;
    const callerSocketId = userSockets.get(callerId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_rejected');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      connectedUsers.delete(socket.id);
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
    
    console.log(`Total connected users: ${connectedUsers.size}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
