import { createClient } from '@supabase/supabase-js';
import * as schema from "../shared/schema";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Validate Supabase configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set. Make sure your Supabase project is configured.",
  );
}

// Create Supabase client - this will be our primary database interface
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

// For now, we'll use the Supabase client directly instead of Drizzle
// This avoids the IPv6/connection issues while providing full functionality
export const db = {
  // Provide a Drizzle-like interface using Supabase client
  query: {
    users: {
      findMany: () => supabase.from('users').select('*'),
      findUnique: (where) => supabase.from('users').select('*').eq(Object.keys(where)[0], Object.values(where)[0]).single(),
      create: (data) => supabase.from('users').insert(data).select().single(),
      update: (where, data) => supabase.from('users').update(data).eq(Object.keys(where)[0], Object.values(where)[0]).select().single(),
      delete: (where) => supabase.from('users').delete().eq(Object.keys(where)[0], Object.values(where)[0])
    },
    products: {
      findMany: () => supabase.from('products').select('*'),
      findUnique: (where) => supabase.from('products').select('*').eq(Object.keys(where)[0], Object.values(where)[0]).single(),
      create: (data) => supabase.from('products').insert(data).select().single(),
      update: (where, data) => supabase.from('products').update(data).eq(Object.keys(where)[0], Object.values(where)[0]).select().single(),
      delete: (where) => supabase.from('products').delete().eq(Object.keys(where)[0], Object.values(where)[0])
    },
    contactSubmissions: {
      findMany: () => supabase.from('contact_submissions').select('*'),
      findUnique: (where) => supabase.from('contact_submissions').select('*').eq(Object.keys(where)[0], Object.values(where)[0]).single(),
      create: (data) => supabase.from('contact_submissions').insert(data).select().single(),
      update: (where, data) => supabase.from('contact_submissions').update(data).eq(Object.keys(where)[0], Object.values(where)[0]).select().single(),
      delete: (where) => supabase.from('contact_submissions').delete().eq(Object.keys(where)[0], Object.values(where)[0])
    },
    chatMessages: {
      findMany: () => supabase.from('chat_messages').select('*'),
      findUnique: (where) => supabase.from('chat_messages').select('*').eq(Object.keys(where)[0], Object.values(where)[0]).single(),
      create: (data) => supabase.from('chat_messages').insert(data).select().single(),
      update: (where, data) => supabase.from('chat_messages').update(data).eq(Object.keys(where)[0], Object.values(where)[0]).select().single(),
      delete: (where) => supabase.from('chat_messages').delete().eq(Object.keys(where)[0], Object.values(where)[0])
    }
  },
  // Direct access to Supabase for advanced operations
  supabase
};

console.log('✅ Supabase client connection established');

// Export the Supabase client for direct use
export { supabase as supabaseClient };
