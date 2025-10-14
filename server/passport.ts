import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy for username/password authentication
passport.use('local', new LocalStrategy(
  {
    usernameField: 'username', // or 'email'
    passwordField: 'password',
  },
  async (username, password, done) => {
    try {
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return done(null, false, { message: 'Invalid username/email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid username/email or password' });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for token authentication
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      const user = await storage.getUser(jwtPayload.userId);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      }
      
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        }

        // Check if user exists with this email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await storage.getUserByEmail(email);
          
          if (user) {
            // Link Google account to existing user
            await storage.linkGoogleAccount(user.id, profile.id);
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
          }
        }

        // Create new user
        const newUser = await storage.createUserFromGoogle({
          googleId: profile.id,
          username: profile.displayName || `google_${profile.id}`,
          email: email || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          role: 'customer',
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use('facebook', new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Facebook ID
        let user = await storage.getUserByFacebookId(profile.id);
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        }

        // Check if user exists with this email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await storage.getUserByEmail(email);
          
          if (user) {
            // Link Facebook account to existing user
            await storage.linkFacebookAccount(user.id, profile.id);
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
          }
        }

        // Create new user
        const newUser = await storage.createUserFromFacebook({
          facebookId: profile.id,
          username: profile.displayName || `facebook_${profile.id}`,
          email: email || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          role: 'customer',
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use('github', new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this GitHub ID
        let user = await storage.getUserByGithubId(profile.id);
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        }

        // Check if user exists with this email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await storage.getUserByEmail(email);
          
          if (user) {
            // Link GitHub account to existing user
            await storage.linkGithubAccount(user.id, profile.id);
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
          }
        }

        // Create new user
        const newUser = await storage.createUserFromGithub({
          githubId: profile.id,
          username: profile.username || `github_${profile.id}`,
          email: email || '',
          firstName: profile.displayName?.split(' ')[0] || '',
          lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'customer',
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

export default passport;