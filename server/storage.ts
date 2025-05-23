import { type User, type InsertUser, type Contact, type InsertContact, type Product, type InsertProduct } from "@shared/schema";
import { dbStorage } from "./storage.database";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Contact operations
  createContactSubmission(contact: InsertContact): Promise<Contact>;
  getAllContactSubmissions(): Promise<Contact[]>;
  getContactSubmission(id: number): Promise<Contact | undefined>;
  updateContactStatus(id: number, status: string, assignedTo?: string): Promise<Contact | undefined>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
}

// Using database storage
export const storage = dbStorage;
