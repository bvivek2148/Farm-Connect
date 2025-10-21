import rateLimit from 'express-rate-limit';
// Temporarily disabled for debugging
// import helmet from 'helmet';
// import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
// import DOMPurify from 'isomorphic-dompurify';
// import validator from 'validator';

// Enhanced rate limiting configurations
export const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // don't count successful auth attempts
    skipFailedRequests: false
  }),

  // Password reset rate limiting
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset attempts per hour
    message: {
      success: false,
      message: 'Too many password reset attempts, please try again later.',
      retryAfter: '1 hour'
    }
  }),

  // Contact form rate limiting
  contact: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 contact form submissions per hour
    message: {
      success: false,
      message: 'Too many contact form submissions, please try again later.',
      retryAfter: '1 hour'
    }
  }),

  // Chat/AI rate limiting
  chat: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 chat messages per minute
    message: {
      success: false,
      message: 'Too many chat messages, please slow down.',
      retryAfter: '1 minute'
    }
  }),

  // Admin operations rate limiting
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit admin operations
    message: {
      success: false,
      message: 'Too many admin operations, please slow down.',
      retryAfter: '1 minute'
    },
    skip: (req) => {
      // Skip rate limiting for verified admin users
      return req.user?.role === 'admin' && req.user?.isVerified;
    }
  })
};

// Enhanced CORS configuration
export const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'https://farm-connect-vivek-bukkas-projects.vercel.app',
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
};

// Enhanced Helmet configuration for security headers
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for development
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://connect.facebook.net",
        "https://platform.twitter.com",
        "https://appleid.cdn-apple.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:"
      ],
      connectSrc: [
        "'self'",
        "https://api.openrouter.ai",
        "https://*.supabase.co",
        "https://*.neon.tech",
        "https://*.auth0.com",
        "https://*.firebase.googleapis.com",
        "wss:",
        "ws:"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.facebook.com",
        "https://appleid.apple.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: {
    action: 'sameorigin'
  },
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
};

// CSRF Protection
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (60 * 60 * 1000); // 1 hour
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  for (const [id, data] of csrfTokens) {
    if (data.expires < Date.now()) {
      csrfTokens.delete(id);
    }
  }
  
  return token;
}

export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const storedData = csrfTokens.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  if (storedData.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return storedData.token === token;
}

// CSRF middleware for state-changing operations
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API authentication endpoints (they use other protection)
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }
  
  const sessionId = req.sessionID || req.ip;
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || !verifyCSRFToken(sessionId, token as string)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token'
    });
  }
  
  next();
}

// Input sanitization and validation utilities
export class InputSanitizer {
  // Sanitize HTML input to prevent XSS (simplified)
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return '';
    // Simple sanitization - remove script tags and basic XSS patterns
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  
  // Validate and sanitize email (simplified)
  static sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') return null;
    
    const sanitized = this.sanitizeHTML(email.toLowerCase().trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : null;
  }
  
  // Validate and sanitize username
  static sanitizeUsername(username: string): string | null {
    if (typeof username !== 'string') return null;
    
    const sanitized = this.sanitizeHTML(username.trim());
    
    // Username must be 3-30 characters, alphanumeric + underscore/dash
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(sanitized)) {
      return null;
    }
    
    return sanitized;
  }
  
  // Sanitize text input
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (typeof text !== 'string') return '';
    
    const sanitized = this.sanitizeHTML(text.trim());
    return sanitized.slice(0, maxLength);
  }
  
  // Validate phone number (simplified)
  static sanitizePhoneNumber(phone: string): string | null {
    if (typeof phone !== 'string') return null;
    
    const sanitized = phone.replace(/[^\d+\-\s()]/g, '');
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(sanitized) ? sanitized : null;
  }
  
  // Validate URL (simplified)
  static sanitizeURL(url: string): string | null {
    if (typeof url !== 'string') return null;
    
    const sanitized = this.sanitizeHTML(url.trim());
    try {
      new URL(sanitized);
      return sanitized.startsWith('http://') || sanitized.startsWith('https://') ? sanitized : null;
    } catch {
      return null;
    }
  }
}

// Request body sanitization middleware
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }
  
  // Recursively sanitize all string values in request body
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return InputSanitizer.sanitizeHTML(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize key as well
        const sanitizedKey = InputSanitizer.sanitizeHTML(key);
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
  
  req.body = sanitizeObject(req.body);
  next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy / permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// IP whitelist/blacklist functionality
const blacklistedIPs = new Set<string>();
const whitelistedIPs = new Set<string>();

export function addToBlacklist(ip: string) {
  blacklistedIPs.add(ip);
  console.log(`IP ${ip} added to blacklist`);
}

export function removeFromBlacklist(ip: string) {
  blacklistedIPs.delete(ip);
  console.log(`IP ${ip} removed from blacklist`);
}

export function addToWhitelist(ip: string) {
  whitelistedIPs.add(ip);
  console.log(`IP ${ip} added to whitelist`);
}

export function ipFilterMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (!clientIP) {
    res.status(400).json({
      success: false,
      message: 'Unable to determine client IP'
    });
    return;
  }
  
  // Check blacklist
  if (blacklistedIPs.has(clientIP)) {
    console.warn(`Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // If whitelist exists and IP is not whitelisted (for admin endpoints)
  if (whitelistedIPs.size > 0 && req.path.startsWith('/api/admin/')) {
    if (!whitelistedIPs.has(clientIP)) {
      console.warn(`Blocked admin request from non-whitelisted IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Admin access not allowed from this IP'
      });
    }
  }
  
  next();
}

// Request logging for security monitoring
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Log security-relevant events
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log failed authentication attempts
    if (req.path.includes('/auth/') && res.statusCode >= 400) {
      console.warn(`Failed auth attempt: ${req.method} ${req.path} from ${req.ip} - ${res.statusCode} (${duration}ms)`);
    }
    
    // Log admin access
    if (req.path.startsWith('/api/admin/')) {
      console.log(`Admin access: ${req.method} ${req.path} from ${req.ip} - ${res.statusCode} (${duration}ms)`);
    }
    
    // Log suspicious activity (multiple failed requests)
    if (res.statusCode === 429) {
      console.warn(`Rate limit exceeded: ${req.ip} on ${req.path}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

export default {
  rateLimiters,
  corsOptions,
  helmetOptions,
  csrfProtection,
  generateCSRFToken,
  verifyCSRFToken,
  InputSanitizer,
  sanitizeRequestBody,
  securityHeaders,
  ipFilterMiddleware,
  securityLogger,
  addToBlacklist,
  removeFromBlacklist,
  addToWhitelist
};