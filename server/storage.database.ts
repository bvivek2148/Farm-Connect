import { users, type User, type InsertUser, type Contact, type InsertContact, contactSubmissions, products, type Product, type InsertProduct, chatMessages, type ChatMessage, type InsertMessage } from "../shared/schema";
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
    const messageData = {
      sessionId: message.sessionId,
      userId: message.userId || null,
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
}

export const dbStorage = new DatabaseStorage();