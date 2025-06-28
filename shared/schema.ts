import { pgTable, text, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User schema with more fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: text("role").default("customer").notNull(), // customer, farmer, admin
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
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
  username: z.string().min(3, "Username must be at least 3 characters long"),
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

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  phone: true,
  message: true,
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

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  price: true,
  unit: true,
  image: true,
  farmer: true,
  farmerId: true,
  distance: true,
  organic: true,
  featured: true,
  description: true,
  stock: true,
});

// Schema for API requests (without farmer fields that are auto-populated)
export const createProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  price: true,
  unit: true,
  image: true,
  distance: true,
  organic: true,
  featured: true,
  description: true,
  stock: true,
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

export const createMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  userId: true,
  senderType: true,
  content: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertMessage = z.infer<typeof createMessageSchema>;
