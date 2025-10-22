import { storage } from './storage';
import { hashPassword } from './auth';
import { sendAdminCredentialsEmail } from './email';

// Admin initialization system
export async function initializeAdmin() {
  try {
    console.log('🔍 Checking if admin user exists...');
    
    // Try to check if admin user already exists
    let existingAdmin;
    try {
      existingAdmin = await storage.getUserByUsername('FC-admin');
    } catch (dbError: any) {
      console.warn('⚠️  Could not check admin user (database may not be ready):', dbError?.message);
      return null;
    }
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists (ID:', existingAdmin.id, ')');
      console.log(`📧 Email: ${existingAdmin.email}`);
      return existingAdmin;
    }

    console.log('📝 Creating new admin user...');
    // Set fixed admin credentials
    const adminPassword = process.env.ADMIN_PASSWORD || 'FC-admin.5';
    const adminEmail = 'farmconnect.helpdesk@gmail.com';

    // Create admin user with hashed password
    const hashedPassword = await hashPassword(adminPassword);
    
    let adminUser;
    try {
      adminUser = await storage.createUser({
        username: 'FC-admin',
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Farm Connect',
        lastName: 'Administrator',
        role: 'admin'
      });
    } catch (createError: any) {
      console.warn('⚠️  Could not create admin user:', createError?.message);
      return null;
    }

    console.log('🔐 Admin user created successfully!');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Username: FC-admin`);
    console.log('⚠️  Store these credentials securely!');
    
    // Send credentials email
    console.log('📧 Sending admin credentials email...');
    try {
      const emailSent = await sendAdminCredentialsEmail('FC-admin', adminEmail, adminPassword);
      if (emailSent) {
        console.log('✅ Admin credentials email sent successfully');
      } else {
        console.warn('⚠️  Email sending failed - ensure EMAIL_PASSWORD is set in .env');
        console.warn('   You can still use FC-admin/FC-admin.5 to login to the admin portal');
      }
    } catch (emailError: any) {
      console.warn('⚠️  Email notification failed:', emailError?.message);
      // Continue anyway - admin was created successfully
    }

    return adminUser;
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
    console.error('⚠️  Admin user may not have been created - you can login with FC-admin/FC-admin.5 in setup mode');
    // Don't throw - allow server to continue without admin user
  }
}

// Generate a secure random password
function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// Function to create additional admin users (can be called via API)
export async function createAdminUser(username: string, email: string, password: string, createdByUserId: number) {
  try {
    // Verify the creating user is an admin
    const creatingUser = await storage.getUser(createdByUserId);
    if (!creatingUser || creatingUser.role !== 'admin') {
      throw new Error('Only administrators can create admin users');
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Create new admin user
    const hashedPassword = await hashPassword(password);
    
    const newAdmin = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    console.log(`✅ New admin user created: ${username} by ${creatingUser.username}`);
    
    return {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role
    };
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}