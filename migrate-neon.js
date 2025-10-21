import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './src/lib/schema.js';

// Update with your actual Neon database URL
const connectionString = process.env.NEON_DATABASE_URL || 'postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function createTables() {
  console.log('🚀 Creating tables in Neon database...');
  
  const sql = neon(connectionString);
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'farmer', 'admin')),
        is_verified BOOLEAN DEFAULT false,
        phone TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Users table created');

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        farmer_id UUID REFERENCES users(id) NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Products table created');

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES users(id) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
        total DECIMAL(10,2) NOT NULL,
        shipping_address TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Orders table created');

    // Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Order items table created');

    // Create cart table
    await sql`
      CREATE TABLE IF NOT EXISTS cart (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Cart table created');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);`;
    console.log('✅ Indexes created');

    console.log('🎉 Database migration completed successfully!');
    
    // Test the connection
    const testResult = await sql`SELECT 1 as test`;
    console.log('✅ Database connection test successful');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

createTables();