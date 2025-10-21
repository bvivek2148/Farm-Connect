import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hscnhjopbidrszuuqgrc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzY25oam9wYmlkcnN6dXVxZ3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODE5MTYsImV4cCI6MjA3NTk1NzkxNn0.Hp7tyUly4dlPOpV4-By-sIwDU5ofQUHMOx8sOx5w8lo';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful');
    console.log('Users table exists with', testData?.length || 'unknown', 'records');
    
    console.log('\n2. Testing authentication...');
    
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check failed:', sessionError);
    } else {
      console.log('Current session:', sessionData.session ? 'Active' : 'None');
    }
    
    console.log('\n3. Testing with sample login...');
    
    // Try to sign in with a test account (this will fail if no account exists, which is expected)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    if (loginError) {
      console.log('Expected login error (no test user):', loginError.message);
    } else {
      console.log('Login successful:', loginData.user?.email);
    }
    
    console.log('\n✅ Supabase connection test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();