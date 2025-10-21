import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting
interface RateLimit {
  count: number;
  resetTime: number;
  blockUntil?: number;
}

const loginAttempts = new Map<string, RateLimit>();
const adminAttempts = new Map<string, RateLimit>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(key);
    }
  }
  for (const [key, data] of adminAttempts.entries()) {
    if (now > data.resetTime) {
      adminAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Input validation middleware - more lenient for legitimate user input
export function validateInput(req: Request, res: Response, next: NextFunction): void {
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);

  // Check for potential SQL injection patterns - more targeted and less aggressive
  const sqlInjectionPatterns = [
    // Only flag obvious SQL injection attempts, not normal text
    /(\bUNION\s+SELECT\b|\bINSERT\s+INTO\b|\bDROP\s+TABLE\b|\bDELETE\s+FROM\b)/i,
    // Flag obvious injection patterns but exclude normal apostrophes in names/text
    /['"]+\s*(OR|AND)\s+['"]*\d+['"]*\s*=\s*['"]*\d+['"]*\s*(--|\/\*)/i,
    // Flag comment-based injections
    /(;\s*--\s*|;\s*\/\*|\*\/;)/
  ];

  // Check for XSS patterns - only flag obvious script injections
  const xssPatterns = [
    /<script[^>]*>.*<\/script>/gi,
    /javascript\s*:\s*[^\s]/i,
    /on(load|error|click|mouse)\s*=\s*["'][^"']*["']/i
  ];

  const allInput = body + query + params;

  // Check for SQL injection
  if (sqlInjectionPatterns.some(pattern => pattern.test(allInput))) {
    console.warn(`🚨 Potential SQL injection attempt from ${req.ip}: ${allInput.substring(0, 100)}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  // Check for XSS
  if (xssPatterns.some(pattern => pattern.test(allInput))) {
    console.warn(`🚨 Potential XSS attempt from ${req.ip}: ${allInput.substring(0, 100)}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
}

// Rate limiting for login attempts
export function loginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  let attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    attempts = { count: 0, resetTime: now + windowMs };
    loginAttempts.set(ip, attempts);
  }
  
  // Reset if window has passed
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
    delete attempts.blockUntil;
  }
  
  // Check if currently blocked
  if (attempts.blockUntil && now < attempts.blockUntil) {
    const remainingMinutes = Math.ceil((attempts.blockUntil - now) / 60000);
    console.warn(`🚨 Login rate limit exceeded for IP: ${ip}`);
    
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${remainingMinutes} minutes.`,
      retryAfter: remainingMinutes
    });
  }
  
  attempts.count++;
  
  // Block if exceeded max attempts
  if (attempts.count > maxAttempts) {
    attempts.blockUntil = now + windowMs;
    const remainingMinutes = Math.ceil(windowMs / 60000);
    
    console.warn(`🚨 Login rate limit exceeded for IP: ${ip}`);
    
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${remainingMinutes} minutes.`,
      retryAfter: remainingMinutes
    });
  }
  
  next();
}

// Rate limiting for admin operations
export function adminRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = `${req.ip || 'unknown'}_${req.user?.userId || 'unknown'}`;
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 10;
  
  let attempts = adminAttempts.get(key);
  
  if (!attempts) {
    attempts = { count: 0, resetTime: now + windowMs };
    adminAttempts.set(key, attempts);
  }
  
  // Reset if window has passed
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
    delete attempts.blockUntil;
  }
  
  // Check if currently blocked
  if (attempts.blockUntil && now < attempts.blockUntil) {
    const remainingMinutes = Math.ceil((attempts.blockUntil - now) / 60000);
    console.warn(`🚨 Admin rate limit exceeded for user: ${req.user?.username} (${req.ip})`);
    
    return res.status(429).json({
      success: false,
      message: `Too many admin operations. Please try again in ${remainingMinutes} minutes.`,
      retryAfter: remainingMinutes
    });
  }
  
  attempts.count++;
  
  // Block if exceeded max attempts
  if (attempts.count > maxAttempts) {
    attempts.blockUntil = now + (10 * 60 * 1000); // Block for 10 minutes
    const remainingMinutes = Math.ceil(10);
    
    console.warn(`🚨 Admin rate limit exceeded for user: ${req.user?.username} (${req.ip})`);
    
    return res.status(429).json({
      success: false,
      message: `Too many admin operations. Please try again in ${remainingMinutes} minutes.`,
      retryAfter: remainingMinutes
    });
  }
  
  next();
}

// Password strength validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty', 
    'abc123', 'admin', 'admin123', 'welcome', 'login'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Password is too common. Please choose a more secure password' };
  }

  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Username validation
export function validateUsername(username: string): { isValid: boolean; message?: string } {
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }

  if (username.length > 30) {
    return { isValid: false, message: 'Username must not exceed 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  // Reserved usernames
  const reservedUsernames = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, message: 'This username is reserved. Please choose a different one' };
  }

  return { isValid: true };
}