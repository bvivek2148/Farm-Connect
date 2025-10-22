#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('❌ DATABASE_URL is not set');
      process.exit(1);
    }

    const sql = neon(connectionString, { disableWarningInBrowsers: true });
    
    console.log('🔍 Checking if admin user already exists...');
    
    // Check if admin exists
    const existingAdmin = await sql`SELECT id FROM users WHERE username = ${"FC-admin"} LIMIT 1`;
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }
    
    console.log('📝 Creating admin user...');
    
    // Hash password
    const password = 'FC-admin.5';
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Insert admin user
    const result = await sql`INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
       VALUES (${"FC-admin"}, ${"farmconnect.helpdesk@gmail.com"}, ${hashedPassword}, ${'Farm Connect'}, ${'Administrator'}, ${'admin'}, NOW(), NOW())
       RETURNING id, username, email, role`;
    
    if (result && result.length > 0) {
      const admin = result[0];
      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log('\n📋 You can now login with:');
      console.log('   Username: FC-admin');
      console.log('   Password: FC-admin.5');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createAdminUser();
