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
            email: 'admin@farmconnect.com',
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
          email: 'admin@farmconnect.com',
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
      
      // For demo purposes, simulate successful login for any other credentials
      // Check if username contains 'farmer' to assign farmer role
      const role = credentials.username.toLowerCase().includes('farmer') ? 'farmer' : 'customer';

      const mockUser: User = {
        id: Date.now().toString(),
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: role
      };
      
      setUser(mockUser);
      localStorage.setItem('farmConnectUser', JSON.stringify(mockUser));

      // Also store user in a way admin can access (with username as key)
      const userKey = `farmConnectUser_${credentials.username}`;
      const userDataForAdmin = {
        ...mockUser,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(userKey, JSON.stringify(userDataForAdmin));

      toast({
        title: "Welcome back! 🌱",
        description: `Successfully logged in as ${role}. Start exploring fresh, local products!`,
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

      // Check if username contains 'farmer' to assign farmer role
      const role = userData.username.toLowerCase().includes('farmer') ? 'farmer' : 'customer';

      // Simulate signup process
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        role: role
      };

      setUser(newUser);
      localStorage.setItem('farmConnectUser', JSON.stringify(newUser));

      // Also store user in a way admin can access (with username as key)
      const userKey = `farmConnectUser_${userData.username}`;
      const userDataForAdmin = {
        ...newUser,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(userKey, JSON.stringify(userDataForAdmin));

      toast({
        title: "Welcome to Farm Connect! 🎉",
        description: `Your account has been created successfully as a ${role}. Start exploring fresh, local products!`,
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Signup failed. Please try again.",
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
