import { users, type User, type InsertUser, type Contact, type InsertContact, contactSubmissions } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

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
}

export const dbStorage = new DatabaseStorage();