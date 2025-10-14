import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
  role?: string;
}

interface OnlineUser {
  id: number;
  username: string;
  role: string;
  socketId: string;
  lastSeen: Date;
}

// Track online users
const onlineUsers = new Map<string, OnlineUser>();

// JWT secret for socket authentication
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';

export function setupSocketIO(io: SocketIOServer) {
  // Middleware for socket authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        // Allow anonymous connections for public features
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded) {
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        socket.role = decoded.role;
        console.log(`✅ Authenticated socket connection: ${decoded.username} (${decoded.role})`);
      }
      
      next();
    } catch (error) {
      console.log('❌ Socket authentication failed:', error);
      // Still allow connection for public features
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Handle user going online
    socket.on('user:online', () => {
      if (socket.userId && socket.username && socket.role) {
        const user: OnlineUser = {
          id: socket.userId,
          username: socket.username,
          role: socket.role,
          socketId: socket.id,
          lastSeen: new Date(),
        };
        
        onlineUsers.set(socket.id, user);
        
        // Broadcast user online status to relevant users
        socket.broadcast.emit('user:status', {
          userId: socket.userId,
          username: socket.username,
          status: 'online',
          timestamp: new Date(),
        });

        // Send current online users count
        io.emit('users:online_count', onlineUsers.size);
        
        console.log(`👤 User ${socket.username} is now online (${onlineUsers.size} total)`);
      }
    });

    // Handle real-time chat messages
    socket.on('chat:message', async (data) => {
      try {
        const { sessionId, message, userId } = data;
        
        // Broadcast to users in the same chat session
        socket.to(`chat:${sessionId}`).emit('chat:new_message', {
          sessionId,
          message,
          userId,
          timestamp: new Date(),
          senderSocket: socket.id,
        });
        
        console.log(`💬 Chat message in session ${sessionId}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Join chat session room
    socket.on('chat:join', (sessionId: string) => {
      socket.join(`chat:${sessionId}`);
      console.log(`🗣️  Socket ${socket.id} joined chat session ${sessionId}`);
    });

    // Leave chat session room
    socket.on('chat:leave', (sessionId: string) => {
      socket.leave(`chat:${sessionId}`);
      console.log(`👋 Socket ${socket.id} left chat session ${sessionId}`);
    });

    // Handle order status updates (for farmers and customers)
    socket.on('order:subscribe', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`📦 Socket ${socket.id} subscribed to order ${orderId} updates`);
    });

    socket.on('order:unsubscribe', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`📤 Socket ${socket.id} unsubscribed from order ${orderId} updates`);
    });

    // Handle product stock updates
    socket.on('product:subscribe', (productId: string) => {
      socket.join(`product:${productId}`);
      console.log(`🥕 Socket ${socket.id} subscribed to product ${productId} updates`);
    });

    // Handle typing indicators for chat
    socket.on('chat:typing', (data) => {
      const { sessionId, isTyping } = data;
      socket.to(`chat:${sessionId}`).emit('chat:user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping,
        timestamp: new Date(),
      });
    });

    // Handle farmer dashboard real-time updates
    socket.on('farmer:subscribe', () => {
      if (socket.role === 'farmer') {
        socket.join('farmers');
        console.log(`🚜 Farmer ${socket.username} subscribed to farmer updates`);
      }
    });

    // Handle admin dashboard real-time updates
    socket.on('admin:subscribe', () => {
      if (socket.role === 'admin') {
        socket.join('admins');
        console.log(`👨‍💼 Admin ${socket.username} subscribed to admin updates`);
      }
    });

    // Handle notifications
    socket.on('notifications:subscribe', () => {
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
        console.log(`🔔 User ${socket.username} subscribed to notifications`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket ${socket.id} disconnected: ${reason}`);
      
      // Remove from online users
      const user = onlineUsers.get(socket.id);
      if (user) {
        onlineUsers.delete(socket.id);
        
        // Broadcast user offline status
        socket.broadcast.emit('user:status', {
          userId: user.id,
          username: user.username,
          status: 'offline',
          timestamp: new Date(),
        });

        // Update online users count
        io.emit('users:online_count', onlineUsers.size);
        
        console.log(`👤 User ${user.username} is now offline (${onlineUsers.size} total)`);
      }
    });

    // Send initial online users count
    socket.emit('users:online_count', onlineUsers.size);
  });

  console.log('🚀 Socket.IO server setup completed');
}

// Helper functions to emit real-time updates from other parts of the application
export function emitOrderUpdate(io: SocketIOServer, orderId: string, update: any) {
  io.to(`order:${orderId}`).emit('order:update', {
    orderId,
    update,
    timestamp: new Date(),
  });
  console.log(`📦 Order ${orderId} update broadcasted`);
}

export function emitProductStockUpdate(io: SocketIOServer, productId: string, newStock: number) {
  io.to(`product:${productId}`).emit('product:stock_update', {
    productId,
    newStock,
    timestamp: new Date(),
  });
  console.log(`🥕 Product ${productId} stock update broadcasted: ${newStock}`);
}

export function emitNotification(io: SocketIOServer, userId: number, notification: any) {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date(),
  });
  console.log(`🔔 Notification sent to user ${userId}`);
}

export function emitFarmerUpdate(io: SocketIOServer, update: any) {
  io.to('farmers').emit('farmer:update', {
    ...update,
    timestamp: new Date(),
  });
  console.log(`🚜 Farmer update broadcasted`);
}

export function emitAdminUpdate(io: SocketIOServer, update: any) {
  io.to('admins').emit('admin:update', {
    ...update,
    timestamp: new Date(),
  });
  console.log(`👨‍💼 Admin update broadcasted`);
}

export function getOnlineUsersCount(): number {
  return onlineUsers.size;
}

export function getOnlineUsers(): OnlineUser[] {
  return Array.from(onlineUsers.values());
}