import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { loginUserSchema, registerUserSchema } from '@shared/schema';
import { storage } from './storage';

// JWT Secret - in production, this should be set as an environment variable
const JWT_SECRET = 'farm-connect-secret-key';
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
    // Validate request body
    const validatedData = registerUserSchema.parse(req.body);
    
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
    
    // Create user with hashed password
    const { confirmPassword, ...userData } = validatedData;
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
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
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to register user' 
    });
  }
}

// Handler for user login
export async function loginHandler(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = loginUserSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
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
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to sign in' 
    });
  }
}

// Handler for user logout
export function logoutHandler(req: Request, res: Response) {
  // Clear token cookie
  res.clearCookie('token');
  
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}

// Handler to get current user data
export async function currentUserHandler(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return user data without password
    const { password, ...userData } = user;
    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch user data' 
    });
  }
}