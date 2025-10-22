import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

// Note: Database operations (neonDb, sql) are server-side only
// Frontend uses Supabase for authentication

// Define the user type - matches shared schema
export type User = {
  id: number; // Changed from string to number to match shared schema
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'farmer' | 'admin';
  isVerified: boolean;
  phone?: string;
  avatar?: string;
};

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signupWithEmail: (userData: EmailSignupData) => Promise<{ success: boolean; needsVerification?: boolean; error?: string; message?: string; field?: string }>;
  signupWithPhone: (userData: PhoneSignupData) => Promise<{ success: boolean; needsVerification?: boolean; error?: string; message?: string; field?: string }>;
  verifyOTP: (token: string, type: 'email' | 'sms', email?: string, phone?: string) => Promise<boolean>;
  resendOTP: (email?: string, phone?: string, type?: 'email' | 'sms') => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  loginWithTwitter: () => Promise<boolean>;
  loginWithGithub: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithDiscord: () => Promise<boolean>;
  loginWithLinkedIn: () => Promise<boolean>;
  loginWithMicrosoft: () => Promise<boolean>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface EmailSignupData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  confirmPassword: string;
}

interface PhoneSignupData {
  phone: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  confirmPassword: string;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to sync user profile between Supabase Auth and Neon DB
// Note: Frontend doesn't do direct database queries - this formats Supabase auth user
async function syncUserWithNeon(authUser: AuthUser, additionalData?: Partial<User>) {
  try {
    console.log('🔄 Processing user profile from Supabase Auth...');
    
    // Convert Supabase UUID to consistent numeric ID
    function hashUuidToInt(uuid: string): number {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }
    
    const numericId = hashUuidToInt(authUser.id);
    console.log('🔢 Generated numeric ID:', numericId);
    
    const userData: User = {
      id: numericId,
      email: authUser.email!,
      username: additionalData?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
      firstName: additionalData?.firstName || authUser.user_metadata?.first_name || '',
      lastName: additionalData?.lastName || authUser.user_metadata?.last_name || '',
      role: (additionalData?.role as 'customer' | 'farmer' | 'admin') || 'customer',
      isVerified: authUser.email_confirmed_at != null,
      phone: authUser.phone || additionalData?.phone || undefined,
      avatar: authUser.user_metadata?.avatar_url || additionalData?.avatar || undefined,
    };
    
    console.log('📝 User profile prepared from Supabase:', userData.email, userData.role);
    return userData;
    
  } catch (error) {
    console.error('❌ Error processing user profile:', error);
    // Return minimal fallback user data
    function hashUuidToInt(uuid: string): number {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }
    
    const fallbackId = hashUuidToInt(authUser.id);
    return {
      id: fallbackId,
      email: authUser.email || 'unknown@example.com',
      username: authUser.email?.split('@')[0] || 'user',
      firstName: '',
      lastName: '',
      role: 'customer' as const,
      isVerified: authUser.email_confirmed_at != null,
      phone: undefined,
      avatar: undefined,
    };
  }
}

// Helper function to convert Neon user to our User type
function formatUser(neonUser: any): User {
  return {
    id: typeof neonUser.id === 'number' ? neonUser.id : parseInt(neonUser.id) || 0,
    email: neonUser.email || '',
    username: neonUser.username || neonUser.user_name || '',
    firstName: neonUser.firstName || neonUser.first_name || null,
    lastName: neonUser.lastName || neonUser.last_name || null,
    role: neonUser.role || 'customer',
    isVerified: neonUser.isVerified !== undefined ? neonUser.isVerified : (neonUser.is_verified || false),
    phone: neonUser.phone || null,
    avatar: neonUser.avatar || null,
  };
}

// Create the auth provider component
export const HybridAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    console.log('🔍 Initializing Hybrid Auth (Supabase + Neon)...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('User signed in, syncing with Neon database...');
          // User is signed in - sync with Neon database via API
          try {
            // Call backend API to persist OAuth user
            const response = await fetch('/api/auth/sync-oauth-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                username: session.user.user_metadata?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.given_name || '',
                lastName: session.user.user_metadata?.last_name || session.user.user_metadata?.family_name || '',
                avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                provider: session.user.app_metadata?.provider || 'email'
              })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
              console.log('✅ OAuth user synced to database:', data.user.email);
              setUser(data.user as User);
            } else {
              // Fallback to local sync if API fails
              console.warn('⚠️ API sync failed, using local user data');
              const neonUser = await syncUserWithNeon(session.user);
              if (neonUser) {
                setUser(neonUser as User);
              }
            }
          } catch (error) {
            console.error('Error during OAuth user sync:', error);
            // Fallback to local sync
            const neonUser = await syncUserWithNeon(session.user);
            if (neonUser) {
              setUser(neonUser as User);
            }
          }
        } else {
          console.log('User signed out');
          // User is signed out
          setUser(null);
        }
        
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log('🚀 Starting hybrid login process...');
      console.log('Step 1: Authenticating with Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Supabase auth response:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.error('Supabase login error:', error);
        toast({
          title: "Login Failed",
          description: error.message || "Unable to sign in. Please check your credentials.",
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Supabase login successful');
        console.log('Step 2: User sync will happen automatically via auth state change');
        toast({
          title: "Welcome back! 🌱",
          description: "Successfully signed in. Start exploring fresh, local products!",
        });
        return true;
      }

      console.log('❌ Login failed: No user data received');
      toast({
        title: "Login Failed",
        description: "No user data received. Please try again.",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Login timed out. Please try again.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const signupWithEmail = async (userData: EmailSignupData) => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting hybrid signup process...');
      
      // First, validate username uniqueness by calling backend
      console.log('🔍 Checking username uniqueness with backend...');
      const validationResponse = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userData.username })
      });
      
      const validationData = await validationResponse.json();
      if (!validationData.available) {
        console.warn('❌ Username already taken:', userData.username);
        return { 
          success: false, 
          error: 'This username is already taken. Please choose a different one.',
          field: 'username'
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Account Created Successfully! 🎉",
          description: "We've sent you a verification link. Please check your email and then login to complete your registration.",
        });
        return { 
          success: true, 
          needsVerification: true,
          message: "Account created! Please check your email for verification."
        };
      }

      if (data.user && data.session) {
        // User is immediately logged in - sign them out so they need to login properly
        await supabase.auth.signOut();
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Your account has been created successfully. Please login to continue.",
        });
        return { 
          success: true,
          message: "Account created successfully! Please login to continue."
        };
      }

      return { 
        success: false, 
        error: 'Unknown error occurred' 
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithPhone = async (userData: PhoneSignupData) => {
    try {
      setIsLoading(true);
      
      // First, validate username uniqueness by calling backend
      console.log('🔍 Checking username uniqueness with backend...');
      const validationResponse = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userData.username })
      });
      
      const validationData = await validationResponse.json();
      if (!validationData.available) {
        console.warn('❌ Username already taken:', userData.username);
        return { 
          success: false, 
          error: 'This username is already taken. Please choose a different one.',
          field: 'username'
        };
      }

      const { data, error } = await supabase.auth.signUp({
        phone: userData.phone,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
          }
        }
      });

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      if (data.user && !data.session) {
        toast({
          title: "Account Created Successfully! 🎉",
          description: "We've sent you a verification code via SMS. Please verify and then login to continue.",
        });
        return { 
          success: true, 
          needsVerification: true,
          message: "Account created! Please verify your phone number."
        };
      }

      if (data.user && data.session) {
        await supabase.auth.signOut();
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Your account has been created successfully. Please login to continue.",
        });
        return { 
          success: true,
          message: "Account created successfully! Please login to continue."
        };
      }

      return { 
        success: true,
        message: "Account created successfully! Please login to continue."
      };
    } catch (error: any) {
      console.error('Phone signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (token: string, type: 'email' | 'sms', email?: string, phone?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: type === 'email' ? 'email' : 'sms',
        ...(email && { email }),
        ...(phone && { phone }),
      } as any);

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        // Sign out after verification so they need to login
        await supabase.auth.signOut();
        toast({
          title: "Verification Successful! ✅",
          description: "Your account has been verified. Please login to continue.",
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string = '', phone: string = '', type: 'email' | 'sms' = 'email'): Promise<boolean> => {
    try {
      const authType = type || 'email';
      const { error } = await supabase.auth.resend({
        type: authType === 'email' ? 'signup' : 'sms',
        ...(authType === 'email' && email && { email }),
        ...(authType === 'sms' && phone && { phone }),
      } as any);

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: type === 'email' ? "Email Sent! 📧" : "SMS Sent! 📱",
        description: `Verification ${type === 'email' ? 'email' : 'code'} has been resent.`,
      });
      return true;
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Password Reset Email Sent! 📧",
        description: "Check your email for password reset instructions.",
      });
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚀 Starting logout process...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Error",
          description: "There was an issue logging out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Logout successful');
      toast({
        title: "Successfully Logged Out! 👋",
        description: "Thank you for using Farm Connect. You have been logged out safely.",
        duration: 3000,
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('❌ Logout exception:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // The redirect will happen automatically
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Google Login Failed",
        description: "Failed to initialize Google authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email'
        }
      });

      if (error) {
        toast({
          title: "Facebook Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Facebook login error:', error);
      toast({
        title: "Facebook Login Failed",
        description: "Failed to initialize Facebook authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTwitter = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Twitter Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Twitter login error:', error);
      toast({
        title: "Twitter Login Failed",
        description: "Failed to initialize Twitter authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGithub = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "GitHub Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('GitHub login error:', error);
      toast({
        title: "GitHub Login Failed",
        description: "Failed to initialize GitHub authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Apple Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Apple login error:', error);
      toast({
        title: "Apple Login Failed",
        description: "Failed to initialize Apple authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDiscord = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Discord Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Discord login error:', error);
      toast({
        title: "Discord Login Failed",
        description: "Failed to initialize Discord authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithLinkedIn = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "LinkedIn Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('LinkedIn login error:', error);
      toast({
        title: "LinkedIn Login Failed",
        description: "Failed to initialize LinkedIn authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email'
        }
      });

      if (error) {
        toast({
          title: "Microsoft Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      toast({
        title: "Microsoft Login Failed",
        description: "Failed to initialize Microsoft authentication.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signupWithEmail,
    signupWithPhone,
    verifyOTP,
    resendOTP,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    loginWithGithub,
    loginWithApple,
    loginWithDiscord,
    loginWithLinkedIn,
    loginWithMicrosoft,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a HybridAuthProvider');
  }
  return context;
};