import { storage } from './storage';
import { hashPassword } from './auth';

// Admin initialization system
export async function initializeAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Generate secure admin credentials
    const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@farmconnect.local';

    // Create admin user with hashed password
    const hashedPassword = await hashPassword(adminPassword);
    
    const adminUser = await storage.createUser({
      username: 'admin',
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Farm Connect',
      lastName: 'Administrator',
      role: 'admin'
    });

    console.log('🔐 Admin user created successfully!');
    console.log(`📧 Admin Email: ${adminEmail}`);
    
    // Only show password in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 Admin Password: ${adminPassword}`);
      console.log('⚠️  Please save these credentials securely!');
    } else {
      console.log('🔑 Admin password was set from ADMIN_PASSWORD environment variable');
    }

    return adminUser;
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
    throw error;
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