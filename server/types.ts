import { Express } from 'express';

/**
 * Custom user object attached to Express Request
 */
export interface AuthUser {
  id: number | string;
  userId?: number | string;
  username: string;
  email: string;
  role: 'customer' | 'farmer' | 'admin';
  firstName?: string | null;
  lastName?: string | null;
  isVerified?: boolean;
  authMethod?: 'supabase' | 'neon' | 'auth0' | 'firebase' | 'jwt';
  iat?: number;
  exp?: number;
}

/**
 * Augment Express Request type to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
