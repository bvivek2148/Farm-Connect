import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Creating test user...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  try {
    // Create a test user
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@gmail.com',
      password: 'TestPassword123!',
      options: {
        data: {
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        }
      }
    });

    if (error) {
      console.error('Error creating test user:', error);
    } else {
      console.log('✅ Test user created:', data.user?.email);
      console.log('Session:', data.session ? 'Active' : 'None');
      
      // If user was created and logged in, sign them out
      if (data.session) {
        await supabase.auth.signOut();
        console.log('✅ Test user signed out');
      }
    }
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

createTestUser();