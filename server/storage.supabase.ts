import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Contact, type InsertContact, type Product, type InsertProduct, type ChatMessage, type InsertMessage } from "../shared/schema";
import { IStorage } from "./storage";
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage implements Partial<IStorage> {
  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
    
    return data as User;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }
    
    return data as User[];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Convert camelCase to snake_case for database
    const dbUser = {
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      first_name: insertUser.firstName,
      last_name: insertUser.lastName,
      role: insertUser.role || 'customer'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Convert camelCase to snake_case for database
    const dbUpdate: any = {
      updated_at: new Date().toISOString()
    };
    
    if (userData.firstName) dbUpdate.first_name = userData.firstName;
    if (userData.lastName) dbUpdate.last_name = userData.lastName;
    if (userData.username) dbUpdate.username = userData.username;
    if (userData.email) dbUpdate.email = userData.email;
    if (userData.role) dbUpdate.role = userData.role;
    if (userData.isVerified !== undefined) dbUpdate.is_verified = userData.isVerified;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    
    return data as User;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  }

  // Contact-related methods
  async createContactSubmission(contact: InsertContact): Promise<Contact> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        message: contact.message
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contact submission:', error);
      throw new Error(`Failed to create contact submission: ${error.message}`);
    }
    
    return data as Contact;
  }

  async getAllContactSubmissions(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*');
    
    if (error) {
      console.error('Error getting contact submissions:', error);
      return [];
    }
    
    return data as Contact[];
  }
  
  async getContactSubmission(id: number): Promise<Contact | undefined> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting contact submission:', error);
      return undefined;
    }
    
    return data as Contact;
  }
  
  async updateContactStatus(id: number, status: string, assignedTo?: string): Promise<Contact | undefined> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({
        status,
        assigned_to: assignedTo || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact status:', error);
      return undefined;
    }
    
    return data as Contact;
  }
  
  // Product-related methods
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error getting products:', error);
      return [];
    }
    
    return data as Product[];
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
    
    return data as Product[];
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true);
    
    if (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
    
    return data as Product[];
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
    
    return data as Product;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
    
    return data as Product;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
    
    return data as Product;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    return true;
  }

  // Chat-related methods
  async createChatMessage(message: InsertMessage): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: message.sessionId,
        user_id: message.userId,
        sender_type: message.senderType,
        content: message.content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat message:', error);
      throw new Error(`Failed to create chat message: ${error.message}`);
    }
    
    return data as ChatMessage;
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
    
    return data as ChatMessage[];
  }
}

export const supabaseStorage = new SupabaseStorage();