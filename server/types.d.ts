// Add type definitions for Express Request object with user property
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userId: number; // for backwards compatibility
        username: string;
        role: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        isVerified?: boolean;
        iat?: number;
        exp?: number;
      };
    }
  }
}

// Add type definition for jsonwebtoken module
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: number;
    username: string;
    role: string;
  }
}