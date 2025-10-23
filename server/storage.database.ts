import { users, type User, type InsertUser, type Contact, type InsertContact, contactSubmissions, products, type Product, type InsertProduct, chatMessages, type ChatMessage, type InsertMessage, orders, orderItems, type Order, type OrderItem } from "../shared/schema";
import { neonDb as db } from "../src/lib/neon";
import { eq, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      role: insertUser.role || 'customer'
    };
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return true; // In Postgres, if no rows were deleted, it would just affect 0 rows
  }

  // Contact-related methods
  async createContactSubmission(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contactSubmissions)
      .values({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        message: contact.message
      })
      .returning();
    return newContact;
  }

  async getAllContactSubmissions(): Promise<Contact[]> {
    return await db.select().from(contactSubmissions);
  }
  
  async getContactSubmission(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return contact || undefined;
  }
  
  async updateContactStatus(id: number, status: string, assignedTo?: string): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contactSubmissions)
      .set({
        status,
        assignedTo: assignedTo || null
      })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return updatedContact;
  }
  
  // Product-related methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.category, category));
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.featured, true));
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || undefined;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const productData = {
      ...product,
      organic: product.organic ?? true,
      featured: product.featured ?? false,
      description: product.description || null
    };
    
    const [newProduct] = await db
      .insert(products)
      .values(productData)
      .returning();
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    await db
      .delete(products)
      .where(eq(products.id, id));
    return true;
  }

  // Chat-related methods
  async createChatMessage(message: InsertMessage): Promise<ChatMessage> {
    // Convert userId to number if string, or null if not provided
    const numericUserId = message.userId 
      ? (typeof message.userId === 'number' ? message.userId : parseInt(message.userId, 10))
      : null;
    
    const messageData = {
      sessionId: message.sessionId,
      userId: numericUserId || undefined,
      senderType: message.senderType,
      content: message.content
    };
    
    const [newMessage] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return newMessage;
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // Order-related methods
  async createOrder(orderData: any): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: orderData.customerId,
        status: orderData.status || 'confirmed',
        total: orderData.total.toString(),
        subtotal: orderData.subtotal.toString(),
        tax: orderData.tax.toString(),
        shippingAddress: orderData.shippingInfo.address,
        shippingCity: orderData.shippingInfo.city || null,
        shippingState: orderData.shippingInfo.state || null,
        shippingZip: orderData.shippingInfo.zipCode || null,
        shippingPhone: orderData.shippingInfo.phone || null,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes || null,
      })
      .returning();
    
    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItemsData = orderData.items.map((item: any) => ({
        orderId: newOrder.id,
        productId: item.productId || null,
        productName: item.productName || item.name,
        productImage: item.productImage || item.image,
        quantity: item.quantity,
        price: item.price.toString(),
        unit: item.unit || null,
      }));
      
      await db.insert(orderItems).values(orderItemsData);
    }
    
    return newOrder;
  }

  async getUserOrders(userId: number): Promise<any[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, userId))
      .orderBy(desc(orders.createdAt));
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        
        return {
          id: order.id.toString(),
          date: order.createdAt.toISOString(),
          status: order.status,
          total: parseFloat(order.total),
          items: items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price),
            image: item.productImage || 'https://via.placeholder.com/100x100/22c55e/ffffff?text=Product'
          })),
          shippingAddress: `${order.shippingAddress}${order.shippingCity ? ', ' + order.shippingCity : ''}${order.shippingState ? ', ' + order.shippingState : ''}${order.shippingZip ? ' ' + order.shippingZip : ''}`
        };
      })
    );
    
    return ordersWithItems;
  }

  async getAllOrders(): Promise<any[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    // Fetch order items and customer info for each order
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        
        const [customer] = await db
          .select()
          .from(users)
          .where(eq(users.id, order.customerId));
        
        return {
          id: order.id.toString(),
          date: order.createdAt.toISOString(),
          status: order.status,
          total: parseFloat(order.total),
          customer: customer ? {
            id: customer.id,
            username: customer.username,
            email: customer.email
          } : null,
          items: items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price),
            image: item.productImage || 'https://via.placeholder.com/100x100/22c55e/ffffff?text=Product'
          })),
          shippingAddress: `${order.shippingAddress}${order.shippingCity ? ', ' + order.shippingCity : ''}${order.shippingState ? ', ' + order.shippingState : ''}${order.shippingZip ? ' ' + order.shippingZip : ''}`,
          paymentMethod: order.paymentMethod
        };
      })
    );
    
    return ordersWithDetails;
  }

  async getOrder(orderId: number): Promise<any | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    
    return {
      ...order,
      items
    };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  // Notification-related methods (stub implementations)
  async createNotification(notification: any): Promise<any> {
    // TODO: Implement with proper notification table
    console.log('📝 Creating notification:', notification);
    return { id: Math.random(), ...notification, createdAt: new Date() };
  }

  async getUnreadNotifications(userId: number): Promise<any[]> {
    // TODO: Implement with proper notification table
    console.log('📖 Getting unread notifications for user:', userId);
    return [];
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    // TODO: Implement with proper notification table
    console.log('✅ Marking notification as read:', notificationId, 'for user:', userId);
  }

  async deleteOldNotifications(beforeDate: Date): Promise<void> {
    // TODO: Implement with proper notification table
    console.log('🗑️ Deleting old notifications before:', beforeDate);
  }
}

export const dbStorage = new DatabaseStorage();