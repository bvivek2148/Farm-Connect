// Add type definitions for Express Request object with user property
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
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