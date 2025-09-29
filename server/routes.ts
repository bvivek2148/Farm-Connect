import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactValidationSchema,
  insertProductSchema,
  createProductSchema,
  loginUserSchema,
  registerUserSchema
} from "@shared/schema";
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
  forgotPasswordHandler
} from "./auth";
import { registerChatRoutes } from "./chat-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add middleware
  app.use(cookieParser());
  
  // Auth routes
  app.post("/api/auth/signup", registerHandler);
  app.post("/api/auth/signin", loginHandler);
  app.post("/api/auth/logout", logoutHandler);
  app.post("/api/auth/forgot-password", forgotPasswordHandler);
  app.get("/api/auth/user", authenticate, currentUserHandler);

  // Admin routes
  app.get("/api/admin/users", authenticate, authorize(['admin']), async (req, res) => {
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
  app.put("/api/admin/users/:id/role", authenticate, authorize(['admin']), async (req, res) => {
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

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;

      // If category query parameter is provided, filter products by category
      let products;
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getAllProducts();
      }

      console.log('Fetched products from database:', products.length);

      res.json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  });

  app.post("/api/products", authenticate, authorize(['farmer', 'admin']), async (req, res) => {
    try {
      const validatedData = createProductSchema.parse(req.body);

      // Add farmer information from authenticated user
      const productData = {
        ...validatedData,
        farmerId: req.user.userId,
        farmer: req.user.username
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
  
  // API route for contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertContactValidationSchema.parse(req.body);

      // Save the contact form submission
      const contact = await storage.createContactSubmission(validatedData);

      // Send email notification (don't wait for it to complete)
      sendContactFormNotification(contact).catch(error => {
        console.error("Failed to send contact form notification email:", error);
      });

      res.status(201).json({
        success: true,
        message: "Contact form submitted successfully. We'll get back to you soon!",
        data: contact
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.format()
        });
      }

      console.error("Error submitting contact form:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form. Please try again."
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

  // Register chat routes
  registerChatRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
