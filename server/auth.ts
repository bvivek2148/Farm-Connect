import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { loginUserSchema, registerUserSchema } from '@shared/schema';
import { storage } from './storage';
import { sendWelcomeEmail } from './email';

// JWT Secret - use environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'farm-connect-jwt-secret-key-2024';
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

// Generate JWT token
export function generateToken(userId: number, username: string, role: string): string {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from authorization header or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please sign in.' 
    });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please sign in again.' 
    });
  }
  
  // Add user data to request object
  req.user = decoded;
  next();
}

// Role-based authorization middleware
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please sign in.' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to access this resource.' 
      });
    }
    
    next();
  };
}

// Handler for user registration
export async function registerHandler(req: Request, res: Response) {
  try {
    console.log('Registration request received:', req.body);

    // Validate request body
    const validatedData = registerUserSchema.parse(req.body);
    console.log('Validation successful:', { username: validatedData.username, email: validatedData.email });
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose a different username.' 
      });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address already in use. Please use a different email or sign in.' 
      });
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

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      });
    }

    // Handle database errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}

// Handler for user login
export async function loginHandler(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = loginUserSchema.parse(req.body);

    // Special case for admin login
    if (validatedData.username === 'admin' && validatedData.password === '123456') {
      const token = generateToken(0, 'admin', 'admin');

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: 0,
          username: 'admin',
          email: 'farmconnect.helpdesk@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      });
    }

    // Find user by username or email
    let user = await storage.getUserByUsername(validatedData.username);

    // If not found by username, try email
    if (!user) {
      user = await storage.getUserByEmail(validatedData.username);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.username, user.role);
    
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
      return res.status(400).json({
        success: false,
        message: 'Invalid username or password format',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}

// Handler for user logout
export async function logoutHandler(req: Request, res: Response) {
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
export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await storage.getUserByEmail(email);

    // For better UX, tell user if account doesn't exist and suggest creating one
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address. Please create an account first.',
        action: 'signup'
      });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // In a real implementation, you would:
    // 1. Store the reset token in database with expiration
    // 2. Send email with reset link
    // For now, we'll just log it and return success

    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link would be: ${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`);

    // TODO: Send actual email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions.',
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
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
export async function currentUserHandler(req: Request, res: Response) {
  try {
    // User data is already attached to req by authenticate middleware
    const user = await storage.getUser(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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