// Local Authentication Service - Works without Supabase
export interface LocalUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'farmer' | 'admin';
  isVerified: boolean;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock users for testing
const mockUsers: Record<string, { password: string; user: LocalUser }> = {
  'test@example.com': {
    password: 'test123',
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      isVerified: true,
      phone: '+1234567890'
    }
  },
  'admin@farmconnect.com': {
    password: 'admin123',
    user: {
      id: 'admin-user-1',
      email: 'admin@farmconnect.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true
    }
  },
  'farmer@farmconnect.com': {
    password: 'farmer123',
    user: {
      id: 'farmer-user-1',
      email: 'farmer@farmconnect.com',
      username: 'farmer',
      firstName: 'Farm',
      lastName: 'Owner',
      role: 'farmer',
      isVerified: true
    }
  }
};

class LocalAuthService {
  private currentUser: LocalUser | null = null;
  private listeners: Array<(user: LocalUser | null) => void> = [];

  constructor() {
    // Load user from localStorage on init
    const savedUser = localStorage.getItem('localAuthUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('localAuthUser');
      }
    }
  }

  // Login with email/password
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: LocalUser; error?: string }> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const userRecord = mockUsers[credentials.email.toLowerCase()];
        
        if (!userRecord) {
          resolve({ success: false, error: 'User not found' });
          return;
        }

        if (userRecord.password !== credentials.password) {
          resolve({ success: false, error: 'Invalid password' });
          return;
        }

        this.currentUser = userRecord.user;
        localStorage.setItem('localAuthUser', JSON.stringify(this.currentUser));
        this.notifyListeners(this.currentUser);
        
        resolve({ success: true, user: this.currentUser });
      }, 500); // 500ms simulated delay
    });
  }

  // Logout
  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        localStorage.removeItem('localAuthUser');
        this.notifyListeners(null);
        resolve();
      }, 200);
    });
  }

  // Get current user
  getCurrentUser(): LocalUser | null {
    return this.currentUser;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Add auth state listener
  onAuthStateChange(callback: (user: LocalUser | null) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of auth state change
  private notifyListeners(user: LocalUser | null): void {
    this.listeners.forEach(callback => callback(user));
  }

  // Signup (for testing)
  async signup(userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean; user?: LocalUser; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers[userData.email.toLowerCase()]) {
          resolve({ success: false, error: 'User already exists' });
          return;
        }

        const newUser: LocalUser = {
          id: `local-user-${Date.now()}`,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: 'customer',
          isVerified: true
        };

        // Add to mock users
        mockUsers[userData.email.toLowerCase()] = {
          password: userData.password,
          user: newUser
        };

        resolve({ success: true, user: newUser });
      }, 800);
    });
  }

  // Reset password (mock)
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userRecord = mockUsers[email.toLowerCase()];
        if (!userRecord) {
          resolve({ success: false, error: 'User not found' });
          return;
        }
        
        // In a real app, this would send an email
        console.log(`Password reset email sent to ${email}`);
        resolve({ success: true });
      }, 1000);
    });
  }

  // Get test accounts info
  getTestAccounts(): Array<{ email: string; password: string; role: string }> {
    return Object.entries(mockUsers).map(([email, data]) => ({
      email,
      password: data.password,
      role: data.user.role
    }));
  }
}

// Export singleton instance
export const localAuth = new LocalAuthService();