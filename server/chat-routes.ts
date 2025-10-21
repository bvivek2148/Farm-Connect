import type { Express } from "express";
import { storage } from "./storage";
import { generateAIResponse, categorizeMessage, getQuickActions } from "./ai-service";
import { createMessageSchema } from "../shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Helper function for quick action responses
function getQuickActionResponse(actionId: string): string {
  const responses: Record<string, string> = {
    'crop-help': '🌱 I can help you with crop issues! What specific problem are you facing with your plants? Common issues include:\n• Pests and insects\n• Plant diseases\n• Nutrient deficiencies\n• Watering problems\n• Soil issues\n\nTell me about your crops and I\'ll provide targeted advice!',

    'weather-advice': '🌤️ Weather can greatly impact your farming! I can help with:\n• Frost protection strategies\n• Drought management\n• Planting timing based on weather\n• Seasonal preparation tips\n\nWhat\'s your current weather concern?',

    'order-status': '📦 To check your order status:\n• Visit "My Orders" in your account\n• Use your order confirmation email\n• Provide your order number here\n\nI can help track deliveries and resolve any order issues. What\'s your order number?',

    'product-info': '🥕 Our farm offers fresh, locally-grown produce:\n• Seasonal vegetables (tomatoes, lettuce, carrots)\n• Fresh fruits (apples, berries, melons)\n• Herbs and greens\n• Organic options available\n\nAll sustainably grown! What products interest you?',

    'farming-tips': '🚜 I\'d love to share farming wisdom! I can help with:\n• Soil preparation and testing\n• Crop rotation strategies\n• Organic farming methods\n• Pest management\n• Harvest timing\n\nWhat farming topic would you like to explore?',

    'account-help': '🔐 I can assist with account issues:\n• Login problems\n• Password resets\n• Profile updates\n• Payment methods\n• Account settings\n\nWhat specific account help do you need?',

    'contact-farmer': '👨‍🌾 Great! Connecting with local farmers is wonderful. I can help you:\n• Find farmers in your area\n• Learn about their growing practices\n• Schedule farm visits\n• Ask specific farming questions\n\nWhat would you like to know about our farmers?',

    'seasonal-guide': '📅 Perfect timing! Here\'s what\'s happening this season:\n• Current planting opportunities\n• Harvest-ready crops\n• Seasonal care tips\n• Weather considerations\n\nWhat specific seasonal guidance do you need?'
  };
  
  return responses[actionId] || '😊 How can I help you today? I\'m here to assist with farming questions, orders, and connecting you with fresh, local produce!';
}

export function registerChatRoutes(app: Express) {
  // Test database connection
  app.get("/api/chat/test", async (req, res) => {
    try {
      console.log('Testing database connection...');

      // Test basic database query
      const users = await storage.getAllUsers();
      console.log('Database test successful, users count:', users.length);

      res.json({
        success: true,
        message: "Database connection working",
        usersCount: users.length,
        storageType: typeof storage,
        storageMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(storage))
      });
    } catch (error: unknown) {
      console.error('Database test error:', error);
      res.status(500).json({
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  // Send message and get AI response
  app.post("/api/chat/message", async (req, res) => {
    try {
      console.log('Chat message request:', req.body);
      const { sessionId, message, userId } = req.body;

      if (!message || !sessionId) {
        console.log('Missing required fields:', { message: !!message, sessionId: !!sessionId });
        res.status(400).json({ error: "Message and sessionId are required" });
        return;
      }

      // Save user message
      console.log('Saving user message...');
      console.log('Storage object:', typeof storage, Object.keys(storage));
      console.log('createChatMessage function:', typeof storage.createChatMessage);

      let userMessage: any;
      try {
        userMessage = await storage.createChatMessage({
          sessionId,
          userId: userId || undefined,
          senderType: "user",
          content: message,
        });
        console.log('User message saved:', userMessage);
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Create a fallback message object
        userMessage = {
          id: Date.now(),
          sessionId,
          userId: userId || null,
          senderType: "user",
          content: message,
          createdAt: new Date().toISOString()
        };
        console.log('Using fallback user message:', userMessage);
      }

      // Get AI response
      console.log('Getting AI response...');
      const category = categorizeMessage(message);
      const userRole = req.user?.role || 'customer';

      const aiResponse = await generateAIResponse(message, {
        userRole,
        category,
      });
      console.log('AI response received:', aiResponse);

      // Save AI response
      console.log('Saving AI message...');
      let aiMessage: any;
      try {
        aiMessage = await storage.createChatMessage({
          sessionId,
          userId: undefined,
          senderType: "ai",
          content: aiResponse,
        });
        console.log('AI message saved:', aiMessage);
      } catch (dbError) {
        console.error('Database save error for AI message:', dbError);
        // Create a fallback message object
        aiMessage = {
          id: Date.now() + 1,
          sessionId,
          userId: null,
          senderType: "ai",
          content: aiResponse,
          createdAt: new Date().toISOString()
        };
        console.log('Using fallback AI message:', aiMessage);
      }

      res.json({
        success: true,
        userMessage,
        aiMessage,
        category,
      });
    } catch (error: unknown) {
      console.error('Chat message error:', error);
      res.status(500).json({
        error: "Failed to process message",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get chat history
  app.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      let messages: any[] = [];

      try {
        messages = await storage.getChatHistory(sessionId);
      } catch (dbError) {
        console.error('Database error getting chat history:', dbError);
        // Return empty array as fallback
        messages = [];
      }

      res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  // Create new chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const sessionId = uuidv4();
      
      res.json({
        success: true,
        sessionId,
      });
    } catch (error) {
      console.error('Chat session error:', error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Get quick actions/suggestions
  app.get("/api/chat/quick-actions", async (req, res) => {
    try {
      const quickActions = getQuickActions();

      res.json({
        success: true,
        quickActions,
      });
    } catch (error) {
      console.error('Quick actions error:', error);
      res.status(500).json({ error: "Failed to get quick actions" });
    }
  });

  // Handle quick action selection
  app.post("/api/chat/quick-action", async (req, res) => {
    try {
      const { actionId, sessionId, userId } = req.body;

      if (!actionId || !sessionId) {
        res.status(400).json({ error: "ActionId and sessionId are required" });
        return;
      }

      // Get predefined response for quick action
      const response = getQuickActionResponse(actionId);

      // Save AI response as a message
      let aiMessage: any;
      try {
        aiMessage = await storage.createChatMessage({
          sessionId,
          userId: undefined,
          senderType: "ai",
          content: response,
        });
      } catch (dbError) {
        console.error('Database save error for quick action:', dbError);
        // Create a fallback message object
        aiMessage = {
          id: Date.now(),
          sessionId,
          userId: null,
          senderType: "ai",
          content: response,
          createdAt: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        aiMessage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Quick action error:', error);
      res.status(500).json({ error: 'Failed to process quick action' });
    }
  });
}

