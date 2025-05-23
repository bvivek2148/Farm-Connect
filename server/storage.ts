import { type User, type InsertUser, type Contact, type InsertContact } from "@shared/schema";
import { dbStorage } from "./storage.database";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(contact: InsertContact): Promise<Contact>;
  getAllContactSubmissions(): Promise<Contact[]>;
}

// We're now using the database storage instead of memory storage
export const storage = dbStorage;
