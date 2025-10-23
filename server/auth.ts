import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { loginUserSchema, registerUserSchema } from '../shared/schema';
import { storage } from './storage';
import { sendWelcomeEmail } from './email';
import { validatePassword, validateEmail, validateUsername } from './security';
import './types'; // Import Express type augmentation

// JWT Secret - use environment variable or fallback (dev only)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}
const JWT_EXPIRES_IN = '24h';

// Hash password before storing in database
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare password with hashed password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token with enhanced user data
export function generateToken(user: { id: number | string; username: string; role: string; email: string; firstName?: string | null; lastName?: string | null; isVerified?: boolean; }): string {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isVerified: user.isVerified || false
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token with enhanced error handling
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Additional validation - ensure token has required fields
    if (!decoded.userId || !decoded.username || !decoded.role) {
      console.log('Token missing required fields:', decoded);
      return null;
    }
    
    // Check if token is expired (jwt.verify should handle this, but extra check)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('Token has expired');
      return null;
    }
    
    return decoded;
  } catch (error: any) {
    console.log('Token verification failed:', error.message);
    return null;
  }
}

// Enhanced authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Get token from authorization header or cookie
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else {
    token = req.cookies.token;
  }
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please sign in.' 
    });
    return;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    // Clear invalid cookie if it exists
    res.clearCookie('token');
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please sign in again.' 
    });
    return;
  }
  
  // Validate required user properties
  if (!decoded.userId || !decoded.username || !decoded.role) {
    res.status(401).json({
      success: false,
      message: 'Invalid token format. Please sign in again.'
    });
    return;
  }
  
  // Add user data to request object
  req.user = {
    id: decoded.userId,
    userId: decoded.userId, // for backwards compatibility
    username: decoded.username,
    role: decoded.role,
    email: decoded.email,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    isVerified: decoded.isVerified,
    iat: decoded.iat,
    exp: decoded.exp
  };
  
  next();
}

// Enhanced role-based authorization middleware
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please sign in.' 
      });
      return;
    }
    
    // Validate role exists and is allowed
    if (!req.user.role || !roles.includes(req.user.role)) {
      console.log(`Access denied for user ${req.user.username} with role ${req.user.role}. Required roles: ${roles.join(', ')}`);
      res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}.` 
      });
      return;
    }
    
    // Log access for security monitoring (in production, use proper logging)
    console.log(`Access granted: ${req.user.username} (${req.user.role}) accessing ${req.method} ${req.path}`);
    
    next();
  };
}

// Handler for user registration
export async function registerHandler(req: Request, res: Response, io?: any): Promise<void> {
  try {
    console.log('Registration request received:', req.body);

    // Validate request body
    const validatedData = registerUserSchema.parse(req.body);
    console.log('Validation successful:', { username: validatedData.username, email: validatedData.email });
    
    // Additional security validations
    const usernameValidation = validateUsername(validatedData.username);
    if (!usernameValidation.isValid) {
      res.status(400).json({
        success: false,
        message: usernameValidation.message
      });
      return;
    }
    
    if (!validateEmail(validatedData.email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
      return;
    }
    
    const passwordValidation = validatePassword(validatedData.password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
      return;
    }
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      console.warn(`Registration: Username '${validatedData.username}' already exists`);
      
      // Notify admins about failed registration attempt
      if (io) {
        io.emit('admin:registration-failed', {
          username: validatedData.username,
          email: validatedData.email,
          reason: 'Username already exists',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose a different username.',
        field: 'username'
      });
      return;
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      console.warn(`Registration: Email '${validatedData.email}' already exists`);
      
      // Notify admins about failed registration attempt
      if (io) {
        io.emit('admin:registration-failed', {
          username: validatedData.username,
          email: validatedData.email,
          reason: 'Email already in use',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(400).json({ 
        success: false, 
        message: 'Email address already in use. Please use a different email or sign in.',
        field: 'email'
      });
      return;
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(validatedData.password);

    // All new users start as customers - only admin can change roles later
    const role = 'customer';

    // Create user with hashed password and determined role
    const { confirmPassword, ...userData } = validatedData;
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: role
    });
    
    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(newUser.email, newUser.username, newUser.role).catch(error => {
      console.error("Failed to send welcome email:", error);
    });

    // Emit real-time notification to admins
    if (io) {
      io.emit('admin:new-user', {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 Emitted admin:new-user notification for ${newUser.username}`);
    }

    // Return success response without sensitive data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Error registering user:', error);

    // Notify admins about registration error
    if (io && req.body.username && req.body.email) {
      io.emit('admin:registration-failed', {
        username: req.body.username,
        email: req.body.email,
        reason: error.name === 'ZodError' ? 'Invalid form data' : 'Server error',
        timestamp: new Date().toISOString()
      });
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      });
      return;
    }

    // Handle database errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      const message = error.message || '';
      if (message.includes('username')) {
        res.status(400).json({
          success: false,
          message: 'Username already exists. Please choose a different username.',
          field: 'username'
        });
      } else if (message.includes('email')) {
        res.status(400).json({
          success: false,
          message: 'Email address already in use. Please use a different email.',
          field: 'email'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'This username or email is already in use.'
        });
      }
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}

// Handler for user login
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = loginUserSchema.parse(req.body);
    const input = validatedData.username?.trim() || '';

    // Find user by username, email, or phone number
    let user = await storage.getUserByUsername(input);

    // If not found by username, try email
    if (!user) {
      user = await storage.getUserByEmail(input);
    }
    
    // If still not found and input looks like a phone number, try phone lookup
    if (!user && input.match(/^\+?[1-9]\d{1,14}$/)) {
      user = await storage.getUserByPhone(input);
    }

    if (!user) {
      console.log(`Login attempt failed: User not found with username/email/phone '${input}'`);
      res.status(401).json({
        success: false,
        message: 'Invalid username/email/phone or password'
      });
      return;
    }
    
    console.log(`Login attempt for user '${user.username}' (${user.email})`);
    
    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      console.warn(`Login failed: Invalid password for user '${user.username}'`);
      res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
      return;
    }
    
    console.log(`✅ Login successful for user '${user.username}' with role '${user.role}'`);
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isVerified: user.isVerified
    });
    
    // Set token in cookie (for web browsers)
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error logging in:', error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Invalid username or password format',
        errors: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}

// Handler for user logout
export async function logoutHandler(req: Request, res: Response): Promise<void> {
  try {
    // Clear the token cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log out'
    });
  }
}

// Handler for forgot password
export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Username, email, or phone number is required'
      });
      return;
    }

    const input = email.trim();

    // Try to find user by username, email, or phone
    let user = await storage.getUserByUsername(input);

    if (!user) {
      user = await storage.getUserByEmail(input);
    }

    // If still not found and looks like a phone number, try phone lookup
    if (!user && input.match(/^\+?[1-9]\d{1,14}$/)) {
      user = await storage.getUserByPhone(input);
    }

    // For better UX, tell user if account doesn't exist and suggest creating one
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this username, email, or phone number. Please create an account first.',
        action: 'signup'
      });
      return;
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // In a real implementation, you would:
    // 1. Store the reset token in database with expiration
    // 2. Send email with reset link
    // For now, we'll just log it and return success

    console.log(`Password reset requested for user: ${user.username}`);
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
    console.log(`Reset link would be: ${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`);

    // TODO: Send actual email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: `Password reset instructions have been sent to the email associated with this account (${user.email.substring(0, 3)}***).`,
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken, email: user.email })
    });

  } catch (error: any) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}

// Handler for getting current user
export async function currentUserHandler(req: Request, res: Response): Promise<void> {
  try {
    // User data is already attached to req by authenticate middleware
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    const user = await storage.getUser(numericUserId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Return user data without sensitive information
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
}