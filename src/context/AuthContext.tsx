import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, type User as SupabaseUser } from '@/lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

// Define the user type based on Supabase + our users table
export type User = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'farmer' | 'admin';
  isVerified: boolean;
  phone?: string;
};

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signupWithEmail: (userData: EmailSignupData) => Promise<{ success: boolean; needsVerification?: boolean; error?: string; message?: string }>;
  signupWithPhone: (userData: PhoneSignupData) => Promise<{ success: boolean; needsVerification?: boolean; error?: string; message?: string }>;
  verifyOTP: (token: string, type: 'email' | 'sms', email?: string, phone?: string) => Promise<boolean>;
  resendOTP: (email?: string, phone?: string, type?: 'email' | 'sms') => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
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

// Helper function to sync user profile with our users table
async function syncUserProfile(authUser: AuthUser, additionalData?: Partial<User>) {
  try {
    console.log('Syncing user profile for:', authUser.email, 'ID:', authUser.id);
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    console.log('Existing user query result:', { data: existingUser, error: fetchError });
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError);
      return null;
    }

    // If user doesn't exist in our users table, create them
    if (!existingUser) {
      console.log('Creating new user profile in database');
      const newUserData = {
        id: authUser.id,
        username: additionalData?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
        email: authUser.email!,
        first_name: additionalData?.firstName || authUser.user_metadata?.first_name || '',
        last_name: additionalData?.lastName || authUser.user_metadata?.last_name || '',
        role: (additionalData?.role as any) || 'customer',
        is_verified: authUser.email_confirmed_at != null,
      };

      console.log('New user data to insert:', newUserData);

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      console.log('User creation result:', { data: createdUser, error: createError });

      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }

      console.log('Successfully created user profile');
      return createdUser;
    }

    console.log('Using existing user profile');
    return existingUser;
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
}

// Helper function to convert auth user to our User type
function formatUser(authUser: AuthUser, profile: SupabaseUser | null = null): User {
  return {
    id: authUser.id,
    email: authUser.email!,
    username: profile?.username || authUser.user_metadata?.username || '',
    firstName: profile?.first_name || authUser.user_metadata?.first_name || '',
    lastName: profile?.last_name || authUser.user_metadata?.last_name || '',
    role: (profile?.role as any) || 'customer',
    isVerified: authUser.email_confirmed_at != null,
    phone: authUser.phone || '',
  };
}

// Create the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    console.log('🔍 Initializing Supabase auth...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('User signed in, syncing profile...');
          // User is signed in
          try {
            const profile = await syncUserProfile(session.user);
            console.log('Profile synced:', profile ? 'Success' : 'Failed');
            const formattedUser = formatUser(session.user, profile);
            console.log('Formatted user:', formattedUser.email, formattedUser.role);
            setUser(formattedUser);
          } catch (error) {
            console.error('Error syncing user profile:', error);
            // Still set user even if profile sync fails
            const formattedUser = formatUser(session.user);
            setUser(formattedUser);
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
      console.log('🚀 Starting Supabase login process...');
      console.log('Using Supabase client');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Login response:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message || "Unable to sign in. Please check your credentials.",
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email);
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
        // User is immediately logged in (email confirmation disabled)
        // Sign them out so they need to login properly
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
        // SMS OTP verification required
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
        // User is immediately logged in - sign them out
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
        toast({
          title: "Account Verified! 🎉",
          description: "Your account has been successfully verified. Welcome to Farm Connect!",
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
