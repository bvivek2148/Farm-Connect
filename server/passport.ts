import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { storage } from './storage';
import { comparePassword } from './auth';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

console.log('🔐 Passport configured with Local and JWT strategies only');
console.log('ℹ️ OAuth strategies (Google, Facebook, GitHub) have been removed');
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

// OAuth strategies have been removed to simplify the authentication system
// The application now uses:
// 1. Supabase Auth for OAuth (Google, Facebook, GitHub, etc.)
// 2. Local strategy for username/password authentication
// 3. JWT strategy for token-based authentication

export default passport;