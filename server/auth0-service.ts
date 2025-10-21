// Auth0 configuration - DISABLED FOR NOW
const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  audience: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  scope: 'read:users update:users create:users delete:users'
};

// Auth0 clients are disabled - using stubs
const managementClient: any = null;
const authenticationClient: any = null;

console.log('⚠️ Auth0 service is currently disabled - using stub implementations');

export interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
  nickname?: string;
  picture?: string;
  email_verified?: boolean;
  identities?: Array<{
    provider: string;
    user_id: string;
    connection: string;
    isSocial: boolean;
  }>;
  app_metadata?: any;
  user_metadata?: any;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  logins_count?: number;
}

export interface Auth0TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  expires_in?: number;
  token_type?: string;
}

export class Auth0Service {
  static isConfigured(): boolean {
    return false; // Always false since we're using stubs
  }

  // Get user profile by Auth0 user ID
  static async getUserProfile(userId: string): Promise<Auth0User | null> {
    console.log('Auth0Service.getUserProfile - stub called for userId:', userId);
    return null;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<Auth0User | null> {
    console.log('Auth0Service.getUserByEmail - stub called for email:', email);
    return null;
  }

  // Create a new user - STUB
  static async createUser(userData: {
    email: string;
    password?: string;
    name?: string;
    connection?: string;
    user_metadata?: any;
    app_metadata?: any;
  }): Promise<Auth0User | null> {
    console.log('Auth0Service.createUser - stub called for email:', userData.email);
    return null;
  }

  // Update user profile - STUB
  static async updateUser(userId: string, updates: {
    email?: string;
    name?: string;
    user_metadata?: any;
    app_metadata?: any;
  }): Promise<Auth0User | null> {
    console.log('Auth0Service.updateUser - stub called for userId:', userId);
    return null;
  }

  // Delete user - STUB
  static async deleteUser(userId: string): Promise<boolean> {
    console.log('Auth0Service.deleteUser - stub called for userId:', userId);
    return false;
  }

  // Authenticate user with password - STUB
  static async authenticateUser(email: string, password: string): Promise<Auth0TokenResponse | null> {
    console.log('Auth0Service.authenticateUser - stub called for email:', email);
    return null;
  }

  // Refresh access token - STUB
  static async refreshToken(refreshToken: string): Promise<Auth0TokenResponse | null> {
    console.log('Auth0Service.refreshToken - stub called');
    return null;
  }

  // Get user info from access token - STUB
  static async getUserInfo(accessToken: string): Promise<Auth0User | null> {
    console.log('Auth0Service.getUserInfo - stub called');
    return null;
  }

  // Send password reset email - STUB
  static async sendPasswordResetEmail(email: string): Promise<boolean> {
    console.log('Auth0Service.sendPasswordResetEmail - stub called for email:', email);
    return false;
  }

  // Get authorization URL for OAuth providers
  static getAuthorizationUrl(connection: string, redirectUri: string, state?: string): string {
    if (!authenticationClient) {
      throw new Error('Auth0 Authentication Client not configured');
    }

    return authenticationClient.buildAuthorizeUrl({
      responseType: 'code',
      redirectUri: redirectUri,
      connection: connection,
      state: state || '',
      scope: 'openid profile email'
    });
  }

  // Exchange authorization code for tokens
  static async exchangeCodeForTokens(code: string, redirectUri: string): Promise<Auth0TokenResponse | null> {
    if (!authenticationClient) {
      throw new Error('Auth0 Authentication Client not configured');
    }

    try {
      const response = await authenticationClient.oauth.authorizationCodeGrant({
        code: code,
        redirect_uri: redirectUri
      });

      return response as Auth0TokenResponse;
    } catch (error: any) {
      console.error('Auth0 code exchange failed:', error);
      return null;
    }
  }

  // Verify and decode JWT token
  static async verifyToken(token: string): Promise<any> {
    if (!authenticationClient) {
      throw new Error('Auth0 Authentication Client not configured');
    }

    try {
      // This requires additional setup with JWT verification
      // For now, we'll use the userInfo endpoint
      const userInfo = await this.getUserInfo(token);
      return userInfo;
    } catch (error: any) {
      console.error('Auth0 token verification failed:', error);
      return null;
    }
  }

  // Get available connections/providers
  static getAvailableConnections(): string[] {
    return [
      'google-oauth2',      // Google
      'facebook',           // Facebook
      'twitter',            // Twitter
      'github',             // GitHub
      'linkedin',           // LinkedIn
      'microsoft-account',  // Microsoft
      'apple',              // Apple
      'Username-Password-Authentication' // Database
    ];
  }

  // Check if specific connection is enabled
  static async isConnectionEnabled(connection: string): Promise<boolean> {
    if (!managementClient) {
      return false;
    }

    try {
      const connections = await managementClient.getConnections({
        name: connection
      });
      return connections && connections.length > 0 && connections[0].enabled !== false;
    } catch (error: any) {
      console.error('Auth0 connection check failed:', error);
      return false;
    }
  }
}

export { auth0Config };