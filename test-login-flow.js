import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wkaqwxfuvqpqbwqzprlb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYXF3eGZ1dnFwcWJ3cXpwcmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1Njg5NDIsImV4cCI6MjA0ODE0NDk0Mn0.0-oEgOcn3DtvBN4QVm49-wJXGD7_zEaYY1lMz5vYhYo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoginFlow() {
  console.log('Testing login flow...')

  try {
    // First, try to create a test user
    console.log('Creating test user...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser@farmconnectapp.com',
      password: 'TestPassword123!',
      options: {
        data: {
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        }
      }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
    } else {
      console.log('Signup successful:', signUpData.user?.email)
      console.log('User confirmed:', signUpData.user?.email_confirmed_at)
      
      // If user needs email confirmation, we'll skip the login test
      if (!signUpData.user?.email_confirmed_at) {
        console.log('User needs email confirmation. Skipping login test.')
        return
      }
    }

    // Now test login
    console.log('\\nTesting login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'testuser@farmconnectapp.com',
      password: 'TestPassword123!'
    })

    if (loginError) {
      console.error('Login error:', loginError)
    } else {
      console.log('Login successful for:', loginData.user?.email)
      console.log('Session exists:', !!loginData.session)
      
      // Test profile sync by checking users table
      console.log('\\nChecking users table...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single()

      if (userError) {
        console.error('User profile query error:', userError)
      } else {
        console.log('User profile found:', userData)
      }

      // Sign out
      await supabase.auth.signOut()
      console.log('Signed out successfully')
    }

  } catch (error) {
    console.error('Test error:', error)
  }
}

testLoginFlow()