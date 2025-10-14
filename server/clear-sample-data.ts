import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSampleData() {
  try {
    console.log('🧹 Starting to clear all sample data...');
    
    // Get current data counts for confirmation
    console.log('\n📊 Current database state:');
    
    const { data: products } = await supabase.from('products').select('*');
    const { data: users } = await supabase.from('users').select('*');
    const { data: contacts } = await supabase.from('contact_submissions').select('*');
    const { data: messages } = await supabase.from('chat_messages').select('*');
    
    console.log(`  • ${products?.length || 0} products`);
    console.log(`  • ${users?.length || 0} users`);
    console.log(`  • ${contacts?.length || 0} contact submissions`);
    console.log(`  • ${messages?.length || 0} chat messages`);
    
    // Ask for confirmation (in script, we'll just proceed)
    console.log('\n⚠️  This will delete ALL data from the database!');
    console.log('Proceeding to clear all tables...\n');
    
    // Clear chat messages
    console.log('💬 Clearing chat messages...');
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', 0); // This deletes all rows
    
    if (messagesError) {
      console.error('❌ Error clearing chat messages:', messagesError.message);
    } else {
      console.log('✅ Chat messages cleared');
    }
    
    // Clear contact submissions
    console.log('📞 Clearing contact submissions...');
    const { error: contactsError } = await supabase
      .from('contact_submissions')
      .delete()
      .neq('id', 0); // This deletes all rows
    
    if (contactsError) {
      console.error('❌ Error clearing contact submissions:', contactsError.message);
    } else {
      console.log('✅ Contact submissions cleared');
    }
    
    // Clear products
    console.log('📦 Clearing products...');
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', 0); // This deletes all rows
    
    if (productsError) {
      console.error('❌ Error clearing products:', productsError.message);
    } else {
      console.log('✅ Products cleared');
    }
    
    // Clear users (except admin)
    console.log('👥 Clearing sample users (keeping admin)...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('role', 'admin'); // Keep admin users, delete others
    
    if (usersError) {
      console.error('❌ Error clearing sample users:', usersError.message);
    } else {
      console.log('✅ Sample users cleared (admin users preserved)');
    }
    
    // Verify clearing was successful
    console.log('\n📊 Final database state:');
    
    const { data: finalProducts } = await supabase.from('products').select('*');
    const { data: finalUsers } = await supabase.from('users').select('*');
    const { data: finalContacts } = await supabase.from('contact_submissions').select('*');
    const { data: finalMessages } = await supabase.from('chat_messages').select('*');
    
    console.log(`  • ${finalProducts?.length || 0} products`);
    console.log(`  • ${finalUsers?.length || 0} users`);
    console.log(`  • ${finalContacts?.length || 0} contact submissions`);
    console.log(`  • ${finalMessages?.length || 0} chat messages`);
    
    console.log('\n🎉 Sample data cleanup completed!');
    console.log('📝 Note: Admin users were preserved for system functionality');
    
    if (finalUsers && finalUsers.length > 0) {
      console.log('👤 Remaining users:');
      finalUsers.forEach(user => {
        console.log(`  • ${user.username} (${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
    throw error;
  }
}

// Run the clearer
clearSampleData()
  .then(() => {
    console.log('\n✨ Database is now clean and ready for real data!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sample data clearing failed:', error);
    process.exit(1);
  });