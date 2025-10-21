import { Express } from 'express';

/**
 * Custom user object attached to Express Request
 */
export interface AuthUser {
  id: number;
  userId?: number;
  username: string;
  email: string;
  role: 'customer' | 'farmer' | 'admin';
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
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
