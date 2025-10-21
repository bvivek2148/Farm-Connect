import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { storage } from './storage';
import { generateToken } from './auth';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_BASE_URL = process.env.AUTH0_BASE_URL || 'http://localhost:5000';
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL || `${AUTH0_BASE_URL}/api/auth/auth0/callback`;

/**
 * Auth0 OAuth Strategy Configuration
 * Allows users to sign up and login using their Auth0 account
 */
export function setupAuth0OAuth() {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
    console.warn('⚠️  Auth0 OAuth credentials not configured. Skipping Auth0 login.');
    return;
  }

  passport.use(
    new Auth0Strategy(
      {
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        clientSecret: AUTH0_CLIENT_SECRET,
        callbackURL: AUTH0_CALLBACK_URL,
        state: true,
      },
      async (accessToken, refreshToken, extraParams, profile, done) => {
        try {
          console.log('Auth0 OAuth profile:', {
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
            return done(new Error('No email provided by Auth0'));
          }

          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user from Auth0 profile
            const [firstName, ...lastNameParts] = profile.displayName?.split(' ') || [''];
            const lastName = lastNameParts.join(' ');

            user = await storage.createUser({
              username: email.split('@')[0] + '_auth0_' + profile.id,
              email,
              password: '', // OAuth users don't have password
              firstName,
              lastName,
              role,
              isVerified: true, // Auth0 verified emails
            });

            console.log('✅ Created new user from Auth0:', user.username);
          } else if (user.role !== role) {
            // Update role if needed
            await storage.updateUser(user.id, { role });
            console.log('✅ Updated user role from Auth0 login');
          }

          return done(null, user);
        } catch (error) {
          console.error('❌ Auth0 OAuth error:', error);
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

  console.log('✅ Auth0 OAuth configured');
}

/**
 * Handler for Auth0 OAuth callback
 */
export async function handleAuth0Callback(req: any, res: any) {
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
    console.error('❌ Auth0 callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth0_auth_failed`);
  }
}

/**
 * Middleware for Auth0 authentication
 */
export const auth0AuthMiddleware = [
  passport.authenticate('auth0', { scope: 'openid email profile' }),
];

/**
 * Middleware for Auth0 callback
 */
export const auth0CallbackMiddleware = [
  passport.authenticate('auth0', { failureRedirect: '/login?error=auth0_failed' }),
];
