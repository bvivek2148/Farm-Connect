import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactValidationSchema,
  insertProductSchema,
  createProductSchema,
  loginUserSchema,
  registerUserSchema
} from "../shared/schema";
import { ZodError } from "zod";
import { sendContactFormNotification, sendWelcomeEmail } from "./email";
import cookieParser from "cookie-parser";
import {
  authenticate,
  authorize,
  registerHandler,
  loginHandler,
  logoutHandler,
  currentUserHandler,
  forgotPasswordHandler,
  hashPassword,
  generateToken
} from "./auth";
import { registerChatRoutes } from "./chat-routes";
import { createAdminUser } from "./admin-init";
import { validateInput, loginRateLimit, adminRateLimit } from "./security";

export async function registerRoutes(app: Express, io?: any): Promise<Server> {
  // Add middleware
  app.use(cookieParser());
  
  // Auth routes with security middleware
  // Check username availability (public endpoint, rate limited)
  app.post("/api/auth/check-username", validateInput, loginRateLimit, async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters',
          available: false
        });
        return;
      }
      
      // Check if username exists in database
      const existingUser = await storage.getUserByUsername(username.trim());
      
      res.json({
        success: true,
        available: !existingUser,
        message: existingUser ? 'Username is taken' : 'Username is available'
      });
    } catch (error) {
      console.error('Error checking username availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check username availability',
        available: false
      });
    }
  });
  
  app.post("/api/auth/signup", registerHandler); // Removed validateInput as Zod schema provides validation
  
  // Login endpoint with fallback for setup mode
  app.post("/api/auth/login", validateInput, async (req, res) => {
    try {
      await loginHandler(req, res);
    } catch (error: any) {
      console.error('Login handler error:', error?.message);
      // If login fails, return proper error instead of crashing
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Login failed. Please try again.',
          debug: error?.message
        });
      }
    }
  });
  
  app.post("/api/auth/logout", logoutHandler);
  app.post("/api/auth/forgot-password", validateInput, forgotPasswordHandler);
  app.get("/api/auth/user", authenticate, currentUserHandler);
  
  // OAuth user sync endpoint - creates/updates user from OAuth provider
  app.post("/api/auth/sync-oauth-user", validateInput, async (req, res) => {
    try {
      const { email, username, firstName, lastName, avatar, provider } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update existing user with OAuth data
        user = await storage.updateUser(user.id, {
          avatar: avatar || user.avatar,
          isVerified: true // OAuth users are pre-verified
        });
        
        console.log(`✅ OAuth user synced (existing): ${email}`);
        return res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified
          },
          message: 'User synced successfully'
        });
      }
      
      // Create new user from OAuth data
      const newUser = await storage.createUser({
        email,
        username: username || email.split('@')[0],
        password: '', // OAuth users don't have passwords
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'customer',
        isVerified: true,
        avatar: avatar || undefined
      });
      
      console.log(`✅ New OAuth user created: ${email} (${provider})`);
      
      // Emit real-time notification to admins
      if (io) {
        io.emit('admin:new-user', {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          provider,
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          avatar: newUser.avatar,
          isVerified: newUser.isVerified
        },
        message: 'User created successfully'
      });
    } catch (error: any) {
      console.error('Error syncing OAuth user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to sync user'
      });
    }
  });

  // Admin routes with enhanced security
  app.get("/api/admin/users", authenticate, authorize(['admin']), adminRateLimit, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({
        success: true,
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          status: 'active' // Default status
        }))
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  // Update user role (admin only)
  app.put("/api/admin/users/:id/role", authenticate, authorize(['admin']), adminRateLimit, validateInput, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role || !['customer', 'farmer', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be customer, farmer, or admin'
        });
      }

      const updatedUser = await storage.updateUser(userId, { role });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role'
      });
    }
  });

  // System settings routes
  app.get("/api/admin/settings", authenticate, authorize(['admin']), async (req, res) => {
    try {
      // Return settings (in production, fetch from database)
      const settings = {
        siteName: process.env.SITE_NAME || 'Farm Connect',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@farmconnect.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@farmconnect.com',
        emailNotifications: true,
        smsNotifications: true,
        sessionTimeout: 30, // minutes
        maxLoginAttempts: 5,
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: true,
      };
      
      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  });

  app.put("/api/admin/settings", authenticate, authorize(['admin']), adminRateLimit, validateInput, async (req, res) => {
    try {
      const { siteName, adminEmail, supportEmail, emailNotifications, smsNotifications, sessionTimeout, maxLoginAttempts } = req.body;
      
      // In production, save to database
      // For now, acknowledge the update
      console.log('⚙️ Settings updated:', req.body);
      
      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings: req.body
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  });
  
  // Create new admin user (super admin only - requires existing admin)
  app.post("/api/admin/users/create-admin", authenticate, authorize(['admin']), adminRateLimit, validateInput, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      // Additional validation
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      const newAdmin = await createAdminUser(username, email, password, (req.user?.userId as number) || 0);
      
      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: newAdmin
      });
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create admin user'
      });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('🛍 GET /api/products - Fetching products...');
      const { category } = req.query;

      // If category query parameter is provided, filter products by category
      let products: any[] = [];
      try {
        if (category && typeof category === 'string') {
          console.log(`📋 Filtering products by category: ${category}`);
          products = await storage.getProductsByCategory(category);
        } else {
          console.log('📋 Fetching all products');
          products = await storage.getAllProducts();
        }
      } catch (dbError: any) {
        console.error('⚠️ Database query failed:', dbError?.message);
        // Return empty products array as fallback
        products = [];
      }

      console.log(`✅ Fetched ${products.length} products from database`);

      res.json({
        success: true,
        products,
        count: products.length
      });
    } catch (error: unknown) {
      console.error('❌ Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', {
        message: errorMessage,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: errorMessage
      });
    }
  });

  app.post("/api/products", authenticate, authorize(['farmer', 'admin']), async (req, res) => {
    try {
      const validatedData = createProductSchema.parse(req.body);

      // Add farmer information from authenticated user
      const userId = req.user?.userId;
      const username = req.user?.username;
      if (!userId || !username) {
        return res.status(401).json({
          success: false,
          message: 'User information not found'
        });
      }
      const productData = {
        ...validatedData,
        farmerId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        farmer: username
      };

      const product = await storage.createProduct(productData);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  });
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString()
    });
  });
  
  // Admin setup endpoint - creates admin user if it doesn't exist
  app.post("/api/setup/admin", async (req, res) => {
    try {
      console.log('📜 Admin setup request received');
      
      // Check if admin user already exists
      const existingAdmin = await storage.getUserByUsername('FC-admin');
      if (existingAdmin) {
        return res.json({
          success: true,
          message: 'Admin user already exists',
          admin: {
            username: existingAdmin.username,
            email: existingAdmin.email
          }
        });
      }
      
      // Create admin user
      const { hashPassword } = await import('./auth');
      const adminPassword = 'FC-admin.5';
      const hashedPassword = await hashPassword(adminPassword);
      
      const adminUser = await storage.createUser({
        username: 'FC-admin',
        email: 'farmconnect.helpdesk@gmail.com',
        password: hashedPassword,
        firstName: 'Farm Connect',
        lastName: 'Administrator',
        role: 'admin'
      });
      
      console.log('✅ Admin user created:', adminUser.username);
      
      res.json({
        success: true,
        message: 'Admin user created successfully',
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    } catch (error: any) {
      console.error('❌ Admin setup error:', error?.message);
      res.status(500).json({
        success: false,
        message: 'Failed to setup admin user',
        debug: error?.message
      });
    }
  });
  
  // API route for contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      console.log('📧 Contact form submission received:', {
        name: req.body?.name,
        email: req.body?.email,
        timestamp: new Date().toISOString()
      });
      
      // Validate the request body
      const validatedData = insertContactValidationSchema.parse(req.body);
      console.log('✅ Form data validated successfully');

      // Create a contact object for email
      const contact = {
        id: Math.floor(Math.random() * 10000),
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        createdAt: new Date(),
        status: 'new',
        assignedTo: null
      };

      // Try to save to database (non-blocking)
      storage.createContactSubmission(validatedData)
        .then(dbContact => {
          console.log('💾 Contact submission saved to database with ID:', dbContact.id);
        })
        .catch(dbError => {
          console.error('⚠️ Database save failed (non-blocking):', dbError?.message);
        });

      // Send email notification
      console.log('📬 Attempting to send email notifications...');
      sendContactFormNotification(contact)
        .then(success => {
          if (success) {
            console.log('✅ Email notifications sent successfully');
          } else {
            console.warn('⚠️ Email notifications failed to send - check EMAIL_PASSWORD configuration');
          }
        })
        .catch(error => {
          console.error('❌ Error during email notification:', error?.message);
        });

      res.status(201).json({
        success: true,
        message: "Thank you for contacting Farm Connect! We've received your message and will respond to farmconnect.helpdesk@gmail.com within 24 hours.",
        data: {
          name: contact.name,
          email: contact.email
        }
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.format());
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields correctly",
          errors: error.format()
        });
      }

      console.error("❌ Error submitting contact form:", error);
      console.error('Error stack:', error?.stack);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form. Please try again later or contact us at farmconnect.helpdesk@gmail.com",
        debug: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  });

  // Get all contact submissions (for admin purposes)
  app.get("/api/contact", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      console.error("Error retrieving contact submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve contact submissions"
      });
    }
  });
  
  
  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.status(200).json({
        success: true,
        data: featuredProducts
      });
    } catch (error) {
      console.error("Error retrieving featured products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve featured products"
      });
    }
  });
  
  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error("Error retrieving product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve product"
      });
    }
  });

  
  // Update product (farmers/admin only)
  app.put("/api/products/:id", authenticate, authorize(["farmer", "admin"]), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      // For farmers, ensure they can only update their own products
      if (req.user?.role === "farmer" && product.farmerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own products"
        });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product"
      });
    }
  });
  
  // Delete product (farmers/admin only)
  app.delete("/api/products/:id", authenticate, authorize(["farmer", "admin"]), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      // For farmers, ensure they can only delete their own products
      if (req.user?.role === "farmer" && product.farmerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own products"
        });
      }
      
      await storage.deleteProduct(productId);
      
      res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product"
      });
    }
  });

  // Order/Checkout API endpoint
  app.post("/api/orders", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const orderData = req.body;

      // Validate required fields
      if (!orderData.cartItems || !orderData.shippingInfo || !orderData.paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "Missing required order information"
        });
      }

      // Calculate total
      const subtotal = orderData.cartItems.reduce((total: number, item: any) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return total + (price * item.quantity);
      }, 0);

      const tax = subtotal * 0.07;
      const total = subtotal + tax;

      // Create order object
      const order = {
        id: Date.now().toString(),
        userId: req.user.id,
        items: orderData.cartItems,
        shippingInfo: orderData.shippingInfo,
        paymentMethod: orderData.paymentMethod,
        subtotal,
        tax,
        total,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      };

      // In a real app, you would save this to a database
      // For now, we'll just return success

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to place order"
      });
    }
  });

  // Google OAuth route
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required'
        });
      }
      
      // Decode the JWT token from Google (you'll need to verify it properly in production)
      const base64Payload = credential.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      const { email, name, given_name, family_name, picture } = payload;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email not provided by Google'
        });
      }
      
      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        const username = email.split('@')[0] + '_google';
        const hashedPassword = await hashPassword('google_oauth_' + Date.now()); // Random password for OAuth users
        
        user = await storage.createUser({
          username: username,
          email: email,
          password: hashedPassword,
          firstName: given_name || name?.split(' ')[0] || '',
          lastName: family_name || name?.split(' ')[1] || '',
          role: 'customer'
        });
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isVerified: user.isVerified || false
      });
      
      res.json({
        success: true,
        message: 'Google authentication successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to authenticate with Google'
      });
    }
  });

  // Register chat routes
  registerChatRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
