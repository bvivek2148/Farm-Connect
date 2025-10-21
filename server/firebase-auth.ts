import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider } from 'firebase/auth';
import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// Initialize Firebase only if configuration is available
let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseAdmin: any = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    // Initialize Firebase client
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    
    // Initialize Firebase Admin (server-side)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (!admin.apps.length) {
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId
        });
      }
    }
    
    console.log('✅ Firebase authentication initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.log('⚠️ Firebase configuration incomplete - Firebase auth disabled');
}

// OAuth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');
githubProvider.addScope('user:email');

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  providerId: string;
}

export class FirebaseAuthService {
  static isConfigured(): boolean {
    return firebaseAuth !== null;
  }

  // Email/Password Authentication
  static async signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return this.formatUser(userCredential.user);
    } catch (error: any) {
      console.error('Firebase email sign-in failed:', error);
      throw new Error(`Firebase sign-in failed: ${error.message}`);
    }
  }

  static async createUserWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return this.formatUser(userCredential.user);
    } catch (error: any) {
      console.error('Firebase user creation failed:', error);
      throw new Error(`Firebase user creation failed: ${error.message}`);
    }
  }

  // OAuth Authentication
  static async signInWithGoogle(): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      return this.formatUser(result.user);
    } catch (error: any) {
      console.error('Firebase Google sign-in failed:', error);
      throw new Error(`Firebase Google sign-in failed: ${error.message}`);
    }
  }

  static async signInWithFacebook(): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await signInWithPopup(firebaseAuth, facebookProvider);
      return this.formatUser(result.user);
    } catch (error: any) {
      console.error('Firebase Facebook sign-in failed:', error);
      throw new Error(`Firebase Facebook sign-in failed: ${error.message}`);
    }
  }

  static async signInWithTwitter(): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await signInWithPopup(firebaseAuth, twitterProvider);
      return this.formatUser(result.user);
    } catch (error: any) {
      console.error('Firebase Twitter sign-in failed:', error);
      throw new Error(`Firebase Twitter sign-in failed: ${error.message}`);
    }
  }

  static async signInWithGithub(): Promise<FirebaseUser | null> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await signInWithPopup(firebaseAuth, githubProvider);
      return this.formatUser(result.user);
    } catch (error: any) {
      console.error('Firebase GitHub sign-in failed:', error);
      throw new Error(`Firebase GitHub sign-in failed: ${error.message}`);
    }
  }

  // Token Verification (server-side)
  static async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not configured');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error: any) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  }

  // Get user by UID (server-side)
  static async getUserByUID(uid: string): Promise<admin.auth.UserRecord | null> {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not configured');
    }

    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error: any) {
      console.error('Firebase get user failed:', error);
      return null;
    }
  }

  // Helper method to format user data
  private static formatUser(user: any): FirebaseUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId || 'firebase'
    };
  }

  // Sign out
  static async signOut(): Promise<void> {
    if (!firebaseAuth) {
      throw new Error('Firebase not configured');
    }

    try {
      await firebaseAuth.signOut();
    } catch (error: any) {
      console.error('Firebase sign-out failed:', error);
      throw new Error(`Firebase sign-out failed: ${error.message}`);
    }
  }

  // Get current user
  static getCurrentUser(): any {
    if (!firebaseAuth) {
      return null;
    }
    return firebaseAuth.currentUser;
  }
}

export { firebaseAuth, firebaseAdmin };