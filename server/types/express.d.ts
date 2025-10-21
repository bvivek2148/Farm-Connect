import { Express } from 'express-serve-static-core';
import { User } from '../../shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        userId?: number; // backwards compatibility
        iat?: number;
        exp?: number;
      };
    }
  }
}
