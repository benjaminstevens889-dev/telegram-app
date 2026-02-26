// Disable Turbopack to fix Prisma compatibility issues
process.env.NEXT_PRIVATE_DISABLE_TURBO = '1';

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : (process.env.HOSTNAME || '0.0.0.0');
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Starting server in ${dev ? 'development' : 'production'} mode on port ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket.io setup
let io: Server;

// Store connected users: socketId -> userId
const connectedUsers = new Map<string, string>();
// Store user to socket mapping: userId -> socketId
const userSockets = new Map<string, string>();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io with better configuration
  io = new Server(httpServer, {
    path: '/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true, // For compatibility
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', (data: { userId: string }) => {
      const { userId } = data;
      
      // Remove any existing socket for this user
      const existingSocketId = userSockets.get(userId);
      if (existingSocketId) {
        connectedUsers.delete(existingSocketId);
        console.log(`[Socket] Removed old socket for user ${userId}`);
      }

      // Store the new connection
      connectedUsers.set(socket.id, userId);
      userSockets.set(userId, socket.id);
      
      console.log(`[Socket] User ${userId} joined with socket ${socket.id}`);
      console.log(`[Socket] Total connected users: ${connectedUsers.size}`);
    });

    // Handle new message - send to receiver
    socket.on('new_message', (data: { message: any; receiverId: string }) => {
      const { message, receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      
      console.log(`[Socket] New message from ${message.senderId} to ${receiverId}`);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', message);
        console.log(`[Socket] Message delivered to user ${receiverId}`);
      } else {
        console.log(`[Socket] User ${receiverId} is not connected (offline)`);
      }
    });

    // Handle message read - notify sender
    socket.on('message_read', (data: { messageId: string; senderId: string; readAt: string }) => {
      const { messageId, senderId, readAt } = data;
      const senderSocketId = userSockets.get(senderId);
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_read', { messageId, readAt });
        console.log(`[Socket] Read notification sent to ${senderId}`);
      }
    });

    // Handle message deleted - notify other participant
    socket.on('message_deleted', (data: { 
      messageId: string; 
      chatId: string;
      deletedFor: string; // 'me' | 'both' | 'receiver'
      participantId: string;
    }) => {
      const participantSocketId = userSockets.get(data.participantId);
      
      if (participantSocketId && data.deletedFor !== 'me') {
        io.to(participantSocketId).emit('message_deleted', { 
          messageId: data.messageId,
          chatId: data.chatId 
        });
        console.log(`[Socket] Message deletion notification sent to ${data.participantId}`);
      }
    });

    // Handle chat request
    socket.on('chat_request', (data: { request: any; receiverId: string }) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('chat_request', data.request);
        console.log(`[Socket] Chat request sent to ${data.receiverId}`);
      }
    });

    // Handle chat request accepted
    socket.on('chat_request_accepted', (data: { chat: any; senderId: string }) => {
      const senderSocketId = userSockets.get(data.senderId);
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('chat_request_accepted', data.chat);
        console.log(`[Socket] Chat acceptance sent to ${data.senderId}`);
      }
    });

    // Handle chat deleted
    socket.on('chat_deleted', (data: { chatId: string; participantId: string }) => {
      const participantSocketId = userSockets.get(data.participantId);
      
      if (participantSocketId) {
        io.to(participantSocketId).emit('chat_deleted', { chatId: data.chatId });
        console.log(`[Socket] Chat deletion sent to ${data.participantId}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      const userId = connectedUsers.get(socket.id);
      
      if (userId) {
        connectedUsers.delete(socket.id);
        userSockets.delete(userId);
        console.log(`[Socket] User ${userId} disconnected (${reason})`);
      }
      
      console.log(`[Socket] Total connected users: ${connectedUsers.size}`);
    });

    socket.on('error', (error) => {
      console.error(`[Socket] Error on ${socket.id}:`, error);
    });
  });

  httpServer.listen(port, () => {
    console.log(``);
    console.log(`========================================`);
    console.log(`  Telegram Web App Ready!`);
    console.log(`  URL: http://${hostname}:${port}`);
    console.log(`  WebSocket: ws://${hostname}:${port}/socket`);
    console.log(`========================================`);
    console.log(``);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  process.exit(0);
});
