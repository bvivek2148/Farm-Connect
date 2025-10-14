import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function setupTables() {
  console.log('🏗️  Setting up tables in Supabase...\n');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // First, let's check what tables already exist
    console.log('1️⃣ Checking existing tables...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (!usersError) {
      console.log('✅ Users table already exists');
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (!productsError) {
      console.log('✅ Products table already exists');
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('contact_submissions')
      .select('count', { count: 'exact', head: true });

    if (!contactsError) {
      console.log('✅ Contact submissions table already exists');
    }

    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('count', { count: 'exact', head: true });

    if (!messagesError) {
      console.log('✅ Chat messages table already exists');
    }

    // Test inserting sample data to verify tables work
    console.log('\n2️⃣ Testing table operations...');

    // Try to insert a test user (this will fail if table doesn't exist)
    const testUser = {
      username: 'test_user_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      password: 'test_password_hash',
      role: 'customer'
    };

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Tables might not exist. Error:', insertError.message);
      console.log('\n📋 Please create tables manually in Supabase:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy and paste the contents of create-tables.sql');
      console.log('3. Click RUN to create the tables');
      
      return false;
    } else {
      console.log('✅ Successfully created test user:', newUser.username);
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('✅ Cleaned up test user');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('✨ Your Farm Connect app is ready to use with Supabase!');
    
    return true;

  } catch (err) {
    console.error('❌ Setup failed:', err);
    return false;
  }
}

setupTables().then(success => {
  if (success) {
    console.log('\n🚀 Ready to start your app with: npm run dev');
  } else {
    console.log('\n⚠️  Manual table creation required - see create-tables.sql');
  }
});