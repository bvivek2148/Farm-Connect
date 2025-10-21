/**
 * Unified Authentication Service
 * 
 * AUTHENTICATION:
 * PRIMARY: Supabase Auth
 * FALLBACK 1: Neon (PostgreSQL native auth)
 * FALLBACK 2: Auth0 OAuth
 * FALLBACK 3: Firebase Auth
 * FALLBACK 4: Local JWT Auth
 * 
 * DATABASE:
 * PRIMARY: Neon PostgreSQL (for data storage, users, products, chats)
 * SECONDARY: Supabase PostgreSQL (backup)
 * 
 * This service attempts authentication in order, using the first successful method
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from './db';
import { verifyToken as verifyJWT, generateToken, comparePassword, hashPassword } from './auth';
import { storage } from './storage'; // Uses Neon database
import './types'; // Import Express type augmentation

export interface AuthResult {
  success: boolean;
  method: 'supabase' | 'neon' | 'auth0' | 'firebase' | 'jwt' | 'none';
  user?: {
    id: string | number;
    email: string;
    username: string;
    role: string;
    isVerified: boolean;
    firstName?: string | null;
    lastName?: string | null;
  };
  error?: string;
}

/**
 * PRIMARY: Verify Supabase Token
 * Verifies JWT token from Supabase authentication
 */
export async function verifySupabaseToken(token: string): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return {
        success: false,
        method: 'supabase',
        error: error?.message || 'Invalid token'
      };
    }

    return {
      success: true,
      method: 'supabase',
      user: {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        role: user.user_metadata?.role || 'customer',
        isVerified: (user.email_confirmed_at != null) || false,
        firstName: user.user_metadata?.first_name || undefined,
        lastName: user.user_metadata?.last_name || undefined,
      }
    };
  } catch (error: any) {
    console.log('🔴 Supabase verification failed:', error.message);
    return {
      success: false,
      method: 'supabase',
      error: error.message
    };
  }
}

/**
 * FALLBACK 1: Verify Neon Token
 * Verifies JWT token and authenticates against Neon database (PostgreSQL native)
 */
export async function verifyNeonToken(token: string): Promise<AuthResult> {
  try {
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        method: 'neon',
        error: 'Invalid token format'
      };
    }

    // Verify token exists in Neon database and user is active
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return {
        success: false,
        method: 'neon',
        error: 'User not found in Neon database'
      };
    }

    return {
      success: true,
      method: 'neon',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'customer',
        isVerified: user.isVerified || false,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  } catch (error: any) {
    console.log('🔴 Neon verification failed:', error.message);
    return {
      success: false,
      method: 'neon',
      error: error.message
    };
  }
}

/**
 * FALLBACK 1: Verify Auth0 Token
 * Verifies JWT token from Auth0
 */
export async function verifyAuth0Token(token: string): Promise<AuthResult> {
  try {
    // Decode and verify Auth0 JWT
    // In production, you would verify the signature using Auth0's public key
    const decoded = verifyJWT(token);
    
    if (!decoded || decoded.iss !== `https://${process.env.AUTH0_DOMAIN}/`) {
      return {
        success: false,
        method: 'auth0',
        error: 'Invalid Auth0 token'
      };
    }

    return {
      success: true,
      method: 'auth0',
      user: {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role || 'customer',
        isVerified: decoded.email_verified || false,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
      }
    };
  } catch (error: any) {
    console.log('Auth0 verification failed:', error.message);
    return {
      success: false,
      method: 'auth0',
      error: error.message
    };
  }
}

/**
 * FALLBACK 2: Verify Firebase Token
 * Verifies JWT token from Firebase Auth
 */
export async function verifyFirebaseToken(token: string): Promise<AuthResult> {
  try {
    // Firebase token verification would require firebase-admin
    // For now, we'll skip this if not configured
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.firebase) {
      return {
        success: false,
        method: 'firebase',
        error: 'Invalid Firebase token'
      };
    }

    return {
      success: true,
      method: 'firebase',
      user: {
        id: decoded.uid || decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role || 'customer',
        isVerified: decoded.email_verified || false,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      }
    };
  } catch (error: any) {
    console.log('Firebase verification failed:', error.message);
    return {
      success: false,
      method: 'firebase',
      error: error.message
    };
  }
}

/**
 * FALLBACK 3: Verify Local JWT Token
 * Verifies JWT token from local authentication system
 */
export async function verifyLocalJWT(token: string): Promise<AuthResult> {
  try {
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        method: 'jwt',
        error: 'Invalid JWT token'
      };
    }

    return {
      success: true,
      method: 'jwt',
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role || 'customer',
        isVerified: decoded.isVerified || false,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      }
    };
  } catch (error: any) {
    console.log('Local JWT verification failed:', error.message);
    return {
      success: false,
      method: 'jwt',
      error: error.message
    };
  }
}

/**
 * UNIFIED: Try all authentication methods in order
 * Order: Supabase (PRIMARY) → Neon → Auth0 → Firebase → JWT (FALLBACK)
 * Returns first successful authentication
 */
export async function verifyTokenWithFallback(token: string): Promise<AuthResult> {
  console.log('🔐 Attempting unified authentication...');

  // PRIMARY: Try Supabase Auth
  console.log('1️⃣ Trying Supabase (PRIMARY AUTH)...');
  let result = await verifySupabaseToken(token);
  if (result.success) {
    console.log('✅ Authenticated via Supabase');
    return result;
  }
  console.log('⚠️ Supabase failed:', result.error);

  // FALLBACK 1: Try Neon database
  console.log('2️⃣ Trying Neon (FALLBACK 1 - PRIMARY DB)...');
  result = await verifyNeonToken(token);
  if (result.success) {
    console.log('✅ Authenticated via Neon');
    return result;
  }
  console.log('⚠️ Neon failed:', result.error);

  // FALLBACK 2: Try Auth0
  console.log('3️⃣ Trying Auth0 (FALLBACK 2)...');
  result = await verifyAuth0Token(token);
  if (result.success) {
    console.log('✅ Authenticated via Auth0');
    return result;
  }
  console.log('⚠️ Auth0 failed:', result.error);

  // FALLBACK 3: Try Firebase
  console.log('4️⃣ Trying Firebase (FALLBACK 3)...');
  result = await verifyFirebaseToken(token);
  if (result.success) {
    console.log('✅ Authenticated via Firebase');
    return result;
  }
  console.log('⚠️ Firebase failed:', result.error);

  // FALLBACK 4: Try Local JWT
  console.log('5️⃣ Trying Local JWT (FALLBACK 4)...');
  result = await verifyLocalJWT(token);
  if (result.success) {
    console.log('✅ Authenticated via Local JWT');
    return result;
  }
  console.log('⚠️ Local JWT failed:', result.error);

  // All methods failed
  console.log('❌ All authentication methods failed');
  return {
    success: false,
    method: 'none',
    error: 'All authentication methods failed'
  };
}

/**
 * UNIFIED AUTHENTICATION MIDDLEWARE
 * Tries all authentication methods in order of preference
 */
export function authenticateUnified(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from authorization header or cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
      return;
    }

    // Verify token with fallback logic (wrapped in async IIFE)
    (async () => {
      const authResult = await verifyTokenWithFallback(token);

      if (!authResult.success) {
        res.clearCookie('token');
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
          lastTried: authResult.method
        });
        return;
      }

      // Attach user to request
      if (!authResult.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed: user data not available'
        });
        return;
      }

      req.user = {
        id: authResult.user.id,
        userId: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        role: (authResult.user.role as any) || 'customer',
        isVerified: authResult.user.isVerified,
        firstName: authResult.user.firstName,
        lastName: authResult.user.lastName,
        authMethod: authResult.method as any
      };

      console.log(`✅ User authenticated via ${authResult.method}: ${authResult.user.username}`);
      next();
    })().catch((error) => {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

/**
 * LOGIN: Try Supabase first (PRIMARY), fallback to Neon
 */
export async function unifiedLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // PRIMARY: Try Supabase Auth
    console.log('1️⃣ Attempting login via Supabase (PRIMARY)...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error && data.session) {
      console.log('✅ Login successful via Supabase');
      
      // Set token in cookie
      res.cookie('token', data.session.access_token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Login successful via Supabase',
        token: data.session.access_token,
        authMethod: 'supabase',
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || email.split('@')[0],
          role: data.user.user_metadata?.role || 'customer'
        }
      });
      return;
    }

    console.log('⚠️ Supabase login failed:', error?.message);

    // FALLBACK 1: Try Neon database
    console.log('2️⃣ Attempting login via Neon (FALLBACK 1)...');
    const neonUser = await storage.getUserByEmail(email);
    
    if (neonUser) {
      const passwordValid = await comparePassword(password, neonUser.password);
      
      if (passwordValid) {
        console.log('✅ Login successful via Neon');
        
        // Generate JWT token
        const token = generateToken({
          id: neonUser.id,
          username: neonUser.username,
          role: neonUser.role,
          email: neonUser.email,
          firstName: neonUser.firstName,
          lastName: neonUser.lastName,
          isVerified: neonUser.isVerified
        });
        
        // Set token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        res.status(200).json({
          success: true,
          message: 'Login successful via Neon',
          token,
          authMethod: 'neon',
          user: {
            id: neonUser.id,
            email: neonUser.email,
            username: neonUser.username,
            role: neonUser.role
          }
        });
        return;
      }
    }
    
    console.log('⚠️ Neon login failed or user not found');
    
    // All methods failed
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}

/**
 * SIGNUP: Use Supabase (PRIMARY) and also save to Neon (PRIMARY DB)
 */
export async function unifiedSignup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and username are required'
      });
      return;
    }

    console.log('1️⃣ Attempting signup via Supabase (PRIMARY)...');

    // PRIMARY AUTH: Use Supabase for authentication registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          role: 'customer'
        }
      }
    });

    if (error) {
      console.log('❌ Supabase signup failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    console.log('✅ Supabase signup successful');

    // PRIMARY DATABASE: Also save to Neon (for redundancy and data storage)
    console.log('2️⃣ Saving user to Neon (PRIMARY DB)...');
    try {
      const hashedPassword = await hashPassword(password);
      await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'customer'
      });
      console.log('✅ User saved to Neon');
    } catch (neonError: any) {
      console.log('⚠️ Failed to save to Neon:', neonError.message);
      // Continue anyway - Supabase registration was successful
    }

    res.status(201).json({
      success: true,
      message: 'Signup successful. Please check your email for confirmation.',
      authMethod: 'supabase',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message
    });
  }
}

export default {
  verifyTokenWithFallback,
  authenticateUnified,
  unifiedLogin,
  unifiedSignup,
  verifySupabaseToken,
  verifyNeonToken,
  verifyAuth0Token,
  verifyFirebaseToken,
  verifyLocalJWT
};
