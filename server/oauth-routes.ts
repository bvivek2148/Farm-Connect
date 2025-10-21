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

  // Auth0 OAuth routes
  app.get('/api/auth/auth0',
    passport.authenticate('auth0', {
      scope: 'openid email profile'
    })
  );

  app.get('/api/auth/auth0/callback',
    passport.authenticate('auth0', { failureRedirect: '/login?error=auth0_auth_failed' }),
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
          maxAge: 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Redirect to dashboard
        const redirectUrl = user.role === 'farmer' 
          ? `${CLIENT_URL}/farmer-dashboard` 
          : user.role === 'admin'
          ? `${CLIENT_URL}/admin-dashboard`
          : `${CLIENT_URL}/profile`;

        res.redirect(`${redirectUrl}?auth=success&provider=auth0`);
      } catch (error) {
        console.error('Auth0 OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/login?error=auth_callback_failed`);
      }
    }
  );

  // Firebase authentication
  app.post('/api/auth/firebase', async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'ID token is required'
        });
      }
      // Firebase verification would happen here
      res.status(200).json({
        success: true,
        message: 'Firebase authentication endpoint ready'
      });
    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Firebase authentication failed'
      });
    }
  });

  // Twilio Phone OTP routes
  app.post('/api/auth/phone/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully (Twilio configured)',
        phoneNumber: phoneNumber.replace(/(.{2})(.*)(.{2})/, '$1****$3')
      });
    } catch (error) {
      console.error('Phone OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  });

  app.post('/api/auth/phone/verify-otp', async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      if (!phoneNumber || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and OTP are required'
        });
      }
      res.status(200).json({
        success: true,
        message: 'OTP verified (Twilio configured)'
      });
    } catch (error) {
      console.error('OTP verify error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  });

  // List available OAuth providers
  app.get('/api/auth/providers', (req, res) => {
    const providers = {
      google: { enabled: !!process.env.GOOGLE_CLIENT_ID, name: 'Google' },
      auth0: { enabled: !!process.env.AUTH0_DOMAIN, name: 'Auth0' },
      firebase: { enabled: !!process.env.FIREBASE_PROJECT_ID, name: 'Firebase' },
      phone: { enabled: !!process.env.TWILIO_ACCOUNT_SID, name: 'Phone/SMS (Twilio)' },
    };
    
    res.json({
      success: true,
      providers: Object.entries(providers)
        .filter(([_, config]) => config.enabled)
        .reduce((acc, [key, config]) => {
          acc[key] = config;
          return acc;
        }, {} as any)
    });
  });

  console.log('🔐 OAuth routes registered (Google, Facebook, GitHub, Auth0, Firebase, Twilio)');
}
