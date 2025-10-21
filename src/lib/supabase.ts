import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hscnhjopbidrszuuqgrc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzY25oam9wYmlkcnN6dXVxZ3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODE5MTYsImV4cCI6MjA3NTk1NzkxNn0.Hp7tyUly4dlPOpV4-By-sIwDU5ofQUHMOx8sOx5w8lo'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          first_name?: string
          last_name?: string
          role: 'customer' | 'farmer' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          first_name?: string
          last_name?: string
          role?: 'customer' | 'farmer' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'customer' | 'farmer' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']