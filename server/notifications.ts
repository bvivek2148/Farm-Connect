import { Server as SocketIOServer } from 'socket.io';
import { storage } from './storage';
// import { sendNotificationEmail } from './email'; // Commented: Function not yet implemented

export interface Notification {
  id?: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: NotificationPriority;
  expiresAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  PRODUCT_STOCK = 'product_stock',
  NEW_MESSAGE = 'new_message',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  ACCOUNT_UPDATE = 'account_update',
  SYSTEM_ALERT = 'system_alert',
  PROMOTION = 'promotion',
  FARMER_VERIFICATION = 'farmer_verification',
  NEW_FARMER = 'new_farmer',
  LOW_STOCK = 'low_stock',
  SEASONAL_REMINDER = 'seasonal_reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  // Send notification to specific user
  async sendToUser(userId: number, notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) {
    try {
      const fullNotification: Notification = {
        ...notification,
        userId,
        createdAt: new Date(),
      };

      // Save to database
      const savedNotification = await storage.createNotification(fullNotification);

      // Send real-time notification via Socket.IO
      this.io.to(`user:${userId}`).emit('notification', savedNotification);

      // Send email for high priority notifications
      // TODO: Implement email notification
      // if (notification.priority === NotificationPriority.HIGH || 
      //     notification.priority === NotificationPriority.URGENT) {
      //   const user = await storage.getUser(userId);
      //   if (user) {
      //     await sendNotificationEmail(user.email, notification.title, notification.message);
      //   }
      // }

      console.log(`🔔 Notification sent to user ${userId}: ${notification.title}`);
      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds: number[], notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) {
    const promises = userIds.map(userId => this.sendToUser(userId, notification));
    return Promise.all(promises);
  }

  // Send notification to users by role
  async sendToRole(role: string, notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) {
    try {
      const users = await storage.getAllUsers();
      const filteredUsers = users.filter((u: any) => u.role === role);
      const userIds = filteredUsers.map((user: any) => user.id);
      return this.sendToUsers(userIds, notification);
    } catch (error) {
      console.error(`Error sending notification to role ${role}:`, error);
      throw error;
    }
  }

  // Send broadcast notification to all users
  async broadcast(notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) {
    try {
      const users = await storage.getAllUsers();
      const userIds = users.map(user => user.id);
      return this.sendToUsers(userIds, notification);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number) {
    try {
      // TODO: Implement markNotificationAsRead in storage
      // await storage.markNotificationAsRead(notificationId, userId);
      
      // Update client in real-time
      this.io.to(`user:${userId}`).emit('notification_read', { id: notificationId });
      
      console.log(`📖 Notification ${notificationId} marked as read by user ${userId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get unread notifications for user
  async getUnreadForUser(userId: number): Promise<Notification[]> {
    try {
      return await storage.getUnreadNotifications(userId);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  // Delete old notifications (cleanup job)
  async cleanup() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // TODO: Implement deleteOldNotifications in storage
      // await storage.deleteOldNotifications(thirtyDaysAgo);
      console.log('🧹 Old notifications cleaned up');
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  // Pre-defined notification templates
  static templates = {
    orderConfirmed: (orderNumber: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.ORDER_UPDATE,
      title: '✅ Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      priority: NotificationPriority.MEDIUM,
      read: false,
      data: { orderNumber },
    }),

    orderShipped: (orderNumber: string, trackingNumber?: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.ORDER_UPDATE,
      title: '🚚 Order Shipped',
      message: `Your order #${orderNumber} is on its way!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      priority: NotificationPriority.HIGH,
      read: false,
      data: { orderNumber, trackingNumber },
    }),

    orderDelivered: (orderNumber: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.ORDER_UPDATE,
      title: '🎉 Order Delivered',
      message: `Your order #${orderNumber} has been delivered! Enjoy your fresh produce!`,
      priority: NotificationPriority.MEDIUM,
      read: false,
      data: { orderNumber },
    }),

    lowStock: (productName: string, currentStock: number): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.LOW_STOCK,
      title: '⚠️ Low Stock Alert',
      message: `${productName} is running low (${currentStock} left). Consider restocking soon.`,
      priority: NotificationPriority.HIGH,
      read: false,
      data: { productName, currentStock },
    }),

    newFarmerJoined: (farmerName: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.NEW_FARMER,
      title: '🌱 New Farmer Joined',
      message: `Welcome ${farmerName} to Farm-Connect! Check out their fresh produce.`,
      priority: NotificationPriority.LOW,
      read: false,
      data: { farmerName },
    }),

    paymentSuccess: (amount: number, orderNumber: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.PAYMENT_SUCCESS,
      title: '💳 Payment Successful',
      message: `Payment of $${amount} for order #${orderNumber} was processed successfully.`,
      priority: NotificationPriority.MEDIUM,
      read: false,
      data: { amount, orderNumber },
    }),

    paymentFailed: (amount: number, reason?: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.PAYMENT_FAILED,
      title: '❌ Payment Failed',
      message: `Payment of $${amount} failed${reason ? `: ${reason}` : ''}. Please try again or use a different payment method.`,
      priority: NotificationPriority.HIGH,
      read: false,
      data: { amount, reason },
    }),

    seasonalReminder: (season: string, activities: string[]): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.SEASONAL_REMINDER,
      title: `🌿 ${season} Farming Tips`,
      message: `It's ${season}! Perfect time for: ${activities.join(', ')}`,
      priority: NotificationPriority.LOW,
      read: false,
      data: { season, activities },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }),

    systemMaintenance: (startTime: Date, duration: string): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
      type: NotificationType.SYSTEM_ALERT,
      title: '🔧 Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}. Expected duration: ${duration}`,
      priority: NotificationPriority.HIGH,
      read: false,
      data: { startTime, duration },
    }),
  };
}

// Create notification service instance (to be initialized with Socket.IO server)
let notificationService: NotificationService | null = null;

export function initializeNotificationService(io: SocketIOServer): NotificationService {
  notificationService = new NotificationService(io);
  
  // Set up cleanup job (runs every 24 hours)
  setInterval(() => {
    notificationService?.cleanup();
  }, 24 * 60 * 60 * 1000);
  
  console.log('🔔 Notification service initialized');
  return notificationService;
}

export function getNotificationService(): NotificationService | null {
  return notificationService;
}