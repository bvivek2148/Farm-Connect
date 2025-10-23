import { pgTable, text, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

// Enhanced User schema with more fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  role: text("role").default("customer").notNull(), // customer, farmer, admin
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for inserting users
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

// Validation schema for user registration
export const registerUserSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Validation schema for user login
export const loginUserSchema = z.object({
  username: z.string().min(3, "Username, email, or phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Contact form submission schema
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(), // new, in-progress, completed
  assignedTo: varchar("assigned_to", { length: 100 }),
});

export const insertContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  message: z.string(),
});

export const insertContactValidationSchema = insertContactSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactSubmissions.$inferSelect;

// Products schema for shop
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: text("price").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  image: text("image").notNull(),
  farmer: varchar("farmer", { length: 255 }).notNull(),
  farmerId: serial("farmer_id").notNull(),
  distance: serial("distance").notNull(),
  organic: boolean("organic").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  description: text("description"),
  stock: serial("stock").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.string(),
  unit: z.string(),
  image: z.string(),
  farmer: z.string(),
  farmerId: z.number(),
  distance: z.number(),
  organic: z.boolean().optional(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
  stock: z.number(),
});

// Schema for API requests (without farmer fields that are auto-populated)
export const createProductSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.string(),
  unit: z.string(),
  image: z.string(),
  distance: z.number(),
  organic: z.boolean().optional(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
  stock: z.number(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Chat messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  userId: serial("user_id"),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // user, ai
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const createMessageSchema = z.object({
  sessionId: z.string(),
  userId: z.number().optional(),
  senderType: z.string(),
  content: z.string(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertMessage = z.infer<typeof createMessageSchema>;
