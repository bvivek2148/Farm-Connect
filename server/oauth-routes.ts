import type { Express } from 'express';
import passport from './passport';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from './email';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export function registerOAuthRoutes(app: Express) {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Send welcome email for new users
        if (user.isNewUser) {
          sendWelcomeEmail(user.email, user.username, user.role).catch(console.error);
        }

        // Redirect to dashboard based on role
        const redirectUrl = user.role === 'farmer' 
          ? `${CLIENT_URL}/farmer-dashboard` 
          : user.role === 'admin'
          ? `${CLIENT_URL}/admin-dashboard`
          : `${CLIENT_URL}/profile`;

        res.redirect(`${redirectUrl}?auth=success&provider=google`);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/login?error=auth_callback_failed`);
      }
    }
  );

  // Facebook OAuth routes
  app.get('/api/auth/facebook',
    passport.authenticate('facebook', {
      scope: ['email', 'public_profile']
    })
  );

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Send welcome email for new users
        if (user.isNewUser) {
          sendWelcomeEmail(user.email, user.username, user.role).catch(console.error);
        }

        // Redirect to dashboard based on role
        const redirectUrl = user.role === 'farmer' 
          ? `${CLIENT_URL}/farmer-dashboard` 
          : user.role === 'admin'
          ? `${CLIENT_URL}/admin-dashboard`
          : `${CLIENT_URL}/profile`;

        res.redirect(`${redirectUrl}?auth=success&provider=facebook`);
      } catch (error) {
        console.error('Facebook OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/login?error=auth_callback_failed`);
      }
    }
  );

  // GitHub OAuth routes
  app.get('/api/auth/github',
    passport.authenticate('github', {
      scope: ['user:email']
    })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=github_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Send welcome email for new users
        if (user.isNewUser) {
          sendWelcomeEmail(user.email, user.username, user.role).catch(console.error);
        }

        // Redirect to dashboard based on role
        const redirectUrl = user.role === 'farmer' 
          ? `${CLIENT_URL}/farmer-dashboard` 
          : user.role === 'admin'
          ? `${CLIENT_URL}/admin-dashboard`
          : `${CLIENT_URL}/profile`;

        res.redirect(`${redirectUrl}?auth=success&provider=github`);
      } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/login?error=auth_callback_failed`);
      }
    }
  );

  // Local authentication route (using Passport.js)
  app.post('/api/auth/login/local',
    passport.authenticate('local', { session: false }),
    (req, res) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        res.json({
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
      } catch (error) {
        console.error('Local authentication error:', error);
        res.status(500).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
  );

  // Check authentication status
  app.get('/api/auth/status', (req, res) => {
    if (req.user) {
      const user = req.user as any;
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
  });

  // Logout route
  app.post('/api/auth/logout/passport', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to logout'
        });
      }
      
      // Clear token cookie
      res.clearCookie('token');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });

  console.log('🔐 OAuth routes registered (Google, Facebook, GitHub)');
}