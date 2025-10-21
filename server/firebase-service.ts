import * as admin from 'firebase-admin';
import { storage } from './storage';
import { generateToken } from './auth';
import { Request, Response } from 'express';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

/**
 * Initialize Firebase Admin SDK
 * Used for server-side authentication and database operations
 */
export function initializeFirebase() {
  if (!FIREBASE_PROJECT_ID) {
    console.warn('⚠️  Firebase not configured. Skipping Firebase services.');
    return;
  }

  try {
    // Initialize Firebase Admin SDK
    // In production, use service account credentials from environment
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

/**
 * Verify Firebase ID token
 * @param idToken - Firebase ID token from client
 * @returns Decoded token or null if invalid
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    if (!admin.apps.length) {
      console.warn('⚠️  Firebase Admin SDK not initialized');
      return null;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('❌ Firebase token verification error:', error);
    return null;
  }
}

/**
 * Create or update user from Firebase authentication
 * @param firebaseUser - Firebase user object
 * @returns Updated or created user
 */
export async function syncFirebaseUser(firebaseUser: any) {
  try {
    if (!firebaseUser.email) {
      throw new Error('Firebase user must have an email');
    }

    // Determine role based on email or display name
    let role = 'customer';
    if (
      firebaseUser.displayName?.toLowerCase().includes('farmer') ||
      firebaseUser.email?.toLowerCase().includes('farmer')
    ) {
      role = 'farmer';
    }

    // Try to find existing user by email
    let user = await storage.getUserByEmail(firebaseUser.email);

    if (!user) {
      // Create new user from Firebase profile
      const [firstName, ...lastNameParts] = (firebaseUser.displayName || '').split(' ');
      const lastName = lastNameParts.join(' ');

      user = await storage.createUser({
        username: firebaseUser.email.split('@')[0] + '_firebase_' + firebaseUser.uid,
        email: firebaseUser.email,
        password: 'firebase_oauth_' + Date.now(), // Firebase users don't have password
        firstName: firstName || null,
        lastName: lastName || null,
        role,
      });

      console.log('✅ Created new user from Firebase:', user.username);
    } else if (user.role !== role) {
      // Update role if needed
      await storage.updateUser(user.id, { role });
      console.log('✅ Updated user role from Firebase login');
    }

    return user;
  } catch (error) {
    console.error('❌ Firebase user sync error:', error);
    throw error;
  }
}

/**
 * Handle Firebase authentication callback
 * Receives Firebase ID token and creates/updates user
 */
export async function handleFirebaseAuth(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
    }

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase token',
      });
    }

    // Create Firebase user object
    const firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      emailVerified: decodedToken.email_verified,
    };

    // Sync/create user in our database
    const user = await syncFirebaseUser(firebaseUser);

    // Generate JWT token for our system
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Firebase authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.error('❌ Firebase auth handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase authentication failed',
      error: error.message,
    });
  }
}

/**
 * Send Firebase verification email
 */
export async function sendFirebaseVerificationEmail(userId: string) {
  try {
    if (!admin.apps.length) {
      console.warn('⚠️  Firebase Admin SDK not initialized');
      return;
    }

    const user = await admin.auth().getUser(userId);
    // Note: Firebase Admin SDK doesn't support sending emails directly
    // You need to implement this using Firebase Cloud Functions or a separate email service
    console.log('Firebase verification email would be sent to:', user.email);
  } catch (error) {
    console.error('❌ Firebase email error:', error);
  }
}

/**
 * Create Firebase custom token for development
 * @param userId - Application user ID
 * @returns Firebase custom token
 */
export async function createFirebaseCustomToken(userId: number) {
  try {
    if (!admin.apps.length) {
      console.warn('⚠️  Firebase Admin SDK not initialized');
      return null;
    }

    const customToken = await admin.auth().createCustomToken(userId.toString());
    return customToken;
  } catch (error) {
    console.error('❌ Firebase custom token error:', error);
    return null;
  }
}

console.log('✅ Firebase service loaded');
