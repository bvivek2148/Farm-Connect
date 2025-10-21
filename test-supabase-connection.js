import { createClient } from '@supabase/supabase-js'

// Use the correct Supabase URL and key from your .env file
const supabaseUrl = 'https://hscnhjopbidrszuuqgrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzY25oam9wYmlkcnN6dXVxZ3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODE5MTYsImV4cCI6MjA3NTk1NzkxNn0.Hp7tyUly4dlPOpV4-By-sIwDU5ofQUHMOx8sOx5w8lo'

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key preview:', supabaseAnonKey.slice(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...')
    const { data, error } = await supabase.auth.getSession()
    console.log('✅ getSession result:', { hasData: !!data, error: error?.message })

    // Test 2: Try to get user (should be null for no session)
    console.log('\n2️⃣ Testing auth user...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('✅ getUser result:', { user: user ? 'User found' : 'No user (expected)' })

    // Test 3: Test the database connection
    console.log('\n3️⃣ Testing database connection...')
    const { data: tables, error: dbError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (dbError) {
      console.log('ℹ️ Database test result:', dbError.message)
      // This might fail if the users table doesn't exist, which is okay
    } else {
      console.log('✅ Database connection successful')
    }

    // Test 4: Try invalid login (should fail gracefully)
    console.log('\n4️⃣ Testing invalid login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    })
    
    if (loginError) {
      console.log('✅ Expected login error:', loginError.message)
    } else {
      console.log('⚠️ Unexpected: Login succeeded with invalid credentials')
    }

    console.log('\n🎉 Connection tests completed!')
    console.log('If you see ✅ marks above, Supabase is working correctly.')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    console.log('This indicates a network or configuration issue.')
  }
}

testConnection()