// API service for handling authenticated requests
export class ApiService {
  private static getBaseURL(): string {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }

  private static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic API request handler
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.getBaseURL()}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    console.log(`Making ${options.method || 'GET'} request to:`, url);

    const response = await fetch(url, config);
    
    // Handle token expiration
    if (response.status === 401) {
      console.log('Token expired or invalid, clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('farmConnectUser');
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Authentication expired. Please login again.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  static async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  static async signup(userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  static async getCurrentUser() {
    return this.request('/auth/user');
  }

  static async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  // Product endpoints
  static async getProducts(category?: string) {
    const queryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/products${queryParam}`, {}, false); // Products can be viewed without auth
  }

  static async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  static async updateProduct(id: number, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  static async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Contact endpoints
  static async submitContactForm(contactData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }, false); // Contact form doesn't require auth
  }

  // Admin endpoints
  static async getUsers() {
    return this.request('/admin/users');
  }

  static async updateUserRole(userId: number, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  static async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    return this.request('/admin/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Chat endpoints
  static async createChatSession() {
    return this.request('/chat/session', {
      method: 'POST',
    }, false); // Chat can work without auth
  }

  static async sendChatMessage(data: {
    sessionId: string;
    message: string;
    userId?: number;
  }) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // Chat can work without auth
  }

  static async getChatHistory(sessionId: string) {
    return this.request(`/chat/history/${sessionId}`, {}, false);
  }

  static async getQuickActions() {
    return this.request('/chat/quick-actions', {}, false);
  }
}