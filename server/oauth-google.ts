import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import { generateToken } from './auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

/**
 * Google OAuth 2.0 Strategy Configuration
 * Allows users to sign up and login using their Google account
 */
export function setupGoogleOAuth() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials not configured. Skipping Google login.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth profile:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
          });

          // Determine role based on email or name
          let role = 'customer';
          if (
            profile.displayName?.toLowerCase().includes('farmer') ||
            profile.emails?.[0]?.value?.toLowerCase().includes('farmer')
          ) {
            role = 'farmer';
          }

          // Try to find existing user by email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'));
          }

          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user from Google profile
            const [firstName, ...lastNameParts] = profile.displayName?.split(' ') || [''];
            const lastName = lastNameParts.join(' ');

            user = await storage.createUser({
              username: email.split('@')[0] + '_google_' + profile.id,
              email,
              password: '', // OAuth users don't have password
              firstName,
              lastName,
              role,
              isVerified: true, // Google verified emails
            });

            console.log('✅ Created new user from Google:', user.username);
          } else if (user.role !== role) {
            // Update role if needed
            await storage.updateUser(user.id, { role });
            console.log('✅ Updated user role from Google login');
          }

          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  console.log('✅ Google OAuth configured');
}

/**
 * Handler for Google OAuth callback
 */
export async function handleGoogleCallback(req: any, res: any) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    // Generate JWT token for the authenticated user
    const token = generateToken({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      isVerified: req.user.isVerified,
    });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    }))}`);
  } catch (error) {
    console.error('❌ Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=google_auth_failed`);
  }
}

/**
 * Middleware for Google authentication
 */
export const googleAuthMiddleware = [
  passport.authenticate('google', { scope: ['profile', 'email'] }),
];

/**
 * Middleware for Google callback
 */
export const googleCallbackMiddleware = [
  passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
];
