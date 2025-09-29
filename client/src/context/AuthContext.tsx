import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the user type
export type User = {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'farmer' | 'admin';
};

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'facebook' | 'phone', data?: any) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<boolean>;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('farmConnectUser');
        const adminAuth = sessionStorage.getItem('adminAuth');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (adminAuth === 'true') {
          setUser({
            id: 'admin',
            username: 'admin',
            email: 'farmconnect.helpdesk@gmail.com',
            role: 'admin'
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('farmConnectUser');
        sessionStorage.removeItem('adminAuth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if admin credentials
      if (credentials.username === 'admin' && credentials.password === '123456') {
        const adminUser: User = {
          id: 'admin',
          username: 'admin',
          email: 'farmconnect.helpdesk@gmail.com',
          role: 'admin'
        };
        
        setUser(adminUser);
        sessionStorage.setItem('adminAuth', 'true');
        
        toast({
          title: "Success",
          description: "Admin login successful",
        });
        
        return true;
      }
      
      // Make API call to login user
      console.log('Making login API call with:', { username: credentials.username });

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      console.log('Login API response status:', response.status);
      const result = await response.json();
      console.log('Login API response data:', result);

      if (!response.ok) {
        if (result.message.includes('Invalid username or password')) {
          toast({
            title: "Login Failed",
            description: "Invalid username or password. Please check your credentials or sign up if you don't have an account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: result.message || "Failed to sign in. Please try again.",
            variant: "destructive",
          });
        }
        return false;
      }

      // Success - user logged in
      const loggedInUser: User = {
        id: result.user.id.toString(),
        username: result.user.username,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      };

      setUser(loggedInUser);
      localStorage.setItem('farmConnectUser', JSON.stringify(loggedInUser));

      // Store auth token if provided
      if (result.token) {
        localStorage.setItem('farmConnectToken', result.token);
      }

      toast({
        title: `Welcome back, ${loggedInUser.username}! 🌱`,
        description: "Successfully signed in. Start exploring fresh, local products!",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocial = async (provider: 'google' | 'facebook' | 'phone', data?: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate social login
      const mockUser: User = {
        id: Date.now().toString(),
        username: `${provider}_user`,
        email: `user@${provider}.com`,
        role: 'customer'
      };
      
      setUser(mockUser);
      localStorage.setItem('farmConnectUser', JSON.stringify(mockUser));
      
      toast({
        title: `Welcome to Farm Connect! 🌱`,
        description: `Successfully signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}. Start exploring fresh, local products!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `${provider} login failed. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // All new users start as customers only - no role determination from username
      // Only admin can change roles later through admin panel

      // Make API call to register user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          // Don't send role - backend will enforce customer role
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error messages from server
        if (result.message.includes('already exists') || result.message.includes('already in use')) {
          toast({
            title: "Account Already Exists",
            description: result.message + " Please sign in with your existing account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup Failed",
            description: result.message || "Failed to create account. Please try again.",
            variant: "destructive",
          });
        }
        return false;
      }

      // Success - user created
      const newUser: User = {
        id: result.user.id.toString(),
        username: result.user.username,
        email: result.user.email,
        role: result.user.role
      };

      setUser(newUser);
      localStorage.setItem('farmConnectUser', JSON.stringify(newUser));

      toast({
        title: "Welcome to Farm Connect! 🎉",
        description: "Your account has been created successfully as a customer! Start exploring fresh, local products. Contact admin to upgrade to farmer status if needed.",
      });

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farmConnectUser');
    sessionStorage.removeItem('adminAuth');
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithSocial,
    logout,
    signup,
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
