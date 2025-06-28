import OpenAI from 'openai';

// Using OpenRouter API which provides access to multiple AI models
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'your-openrouter-api-key-here',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://farm-connect.com', // Replace with your actual domain
    'X-Title': 'Farm-Connect AI Assistant',
  },
});

export interface ChatContext {
  userRole?: string;
  previousMessages?: string[];
  category?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  category: string;
}

export async function generateAIResponse(message: string, context: ChatContext = {}): Promise<string> {
  try {
    console.log('Generating AI response for:', message);
    console.log('OpenRouter API Key available:', !!process.env.OPENROUTER_API_KEY);
    console.log('OpenRouter API Key (first 10 chars):', process.env.OPENROUTER_API_KEY?.substring(0, 10));

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      console.log('OpenRouter API key not configured, using fallback response');
      return generateFallbackResponse(message, context);
    }

    const systemPrompt = `You are FarmBot, a friendly AI assistant for Farm-Connect, a platform connecting farmers and customers.

Your personality:
- Warm, helpful, and knowledgeable about agriculture
- Use emojis occasionally to be friendly (🌱🚜🥕🌾)
- Keep responses conversational but informative
- Show enthusiasm for farming and fresh produce

Your expertise:
- Help farmers with crop issues, pest management, weather advice
- Assist customers with orders, product questions, account help
- Provide farming tips and best practices
- Guide users through website features
- Answer questions about fresh, local produce

User context: ${context.userRole || 'customer'}
Category: ${context.category || 'general'}

Response guidelines:
- Keep responses under 150 words
- Use simple, friendly language
- Include practical advice when relevant
- For complex issues, offer to connect with human experts
- Always be encouraging and supportive
- End with a follow-up question when appropriate`;

    // Select model based on environment variable or use default
    const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

    console.log('Using AI model:', model);

    const completion = await openai.chat.completions.create({
      model: model,
      // Available models on OpenRouter:
      // FREE MODELS:
      // "meta-llama/llama-3.1-8b-instruct:free" - Llama 3.1 8B (free)
      // "microsoft/phi-3-mini-128k-instruct:free" - Phi-3 Mini (free)
      //
      // PAID MODELS (affordable):
      // "anthropic/claude-3-haiku" - Fast and affordable Claude
      // "openai/gpt-3.5-turbo" - OpenAI's GPT-3.5
      // "google/gemini-flash-1.5" - Google's Gemini Flash
      // "meta-llama/llama-3.1-70b-instruct" - Larger Llama model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('AI response generated:', response);

    return response || "I'm here to help! Could you tell me a bit more about what you need assistance with? 🌱";
  } catch (error) {
    console.error('AI Service Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Provide intelligent fallback responses based on message content
    return generateFallbackResponse(message, context);
  }
}

function generateFallbackResponse(message: string, context: ChatContext): string {
  const lowerMessage = message.toLowerCase();

  // Farming-related fallbacks
  if (lowerMessage.includes('crop') || lowerMessage.includes('plant') || lowerMessage.includes('grow')) {
    return "I'd love to help with your farming questions! 🌱 While I'm having some technical difficulties connecting to my knowledge base, I can suggest checking our farming resources section or connecting with our agricultural experts. What specific crop or growing issue are you facing?";
  }

  // Order-related fallbacks
  if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('track')) {
    return "I can help you with order-related questions! 📦 You can track your orders in the 'My Orders' section of your account. If you need immediate assistance, please provide your order number and I'll help you get the information you need.";
  }

  // Product-related fallbacks
  if (lowerMessage.includes('product') || lowerMessage.includes('vegetable') || lowerMessage.includes('fruit')) {
    return "Great question about our fresh produce! 🥕 We have a wide variety of locally-grown, organic fruits and vegetables. You can browse our full selection in the Shop section. Is there a specific product you're looking for?";
  }

  // Technical support fallbacks
  if (lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('account')) {
    return "I can help with account issues! 🔐 For login problems, try using the 'Forgot Password' link on the sign-in page. If you're still having trouble, our support team can assist you directly. What specific issue are you experiencing?";
  }

  // General greeting fallbacks
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return "Hello! Welcome to Farm-Connect! 🌾 I'm here to help you with farming questions, order tracking, product information, and account support. What can I assist you with today?";
  }

  // Default fallback
  return "Thanks for reaching out! 😊 I'm here to help with farming advice, order questions, product information, and account support. While I'm experiencing some technical difficulties, I'm still happy to assist you. Could you tell me more about what you need help with?";
}

export function categorizeMessage(message: string): string {
  const farmingKeywords = ['crop', 'plant', 'soil', 'weather', 'pest', 'disease', 'harvest', 'seed', 'fertilizer'];
  const orderKeywords = ['order', 'delivery', 'payment', 'shipping', 'track', 'cancel', 'refund'];
  const technicalKeywords = ['login', 'password', 'account', 'website', 'error', 'bug', 'problem'];
  
  const lowerMessage = message.toLowerCase();
  
  if (farmingKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'farming';
  }
  if (orderKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'orders';
  }
  if (technicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'technical';
  }
  
  return 'general';
}

export function getQuickActions(): QuickAction[] {
  return [
    {
      id: 'crop-help',
      label: '🌱 Crop Issues',
      description: 'Get help with plant diseases, pests, or growing problems',
      category: 'farming'
    },
    {
      id: 'weather-advice',
      label: '🌤️ Weather Advice',
      description: 'Get farming tips based on current weather conditions',
      category: 'farming'
    },
    {
      id: 'order-status',
      label: '📦 Track Order',
      description: 'Check your order status and delivery information',
      category: 'orders'
    },
    {
      id: 'product-info',
      label: '🥕 Fresh Produce',
      description: 'Learn about our seasonal fruits and vegetables',
      category: 'products'
    },
    {
      id: 'farming-tips',
      label: '🚜 Farming Tips',
      description: 'Get best practices for sustainable farming',
      category: 'farming'
    },
    {
      id: 'account-help',
      label: '🔐 Account Help',
      description: 'Get assistance with login, profile, or settings',
      category: 'support'
    },
    {
      id: 'contact-farmer',
      label: '👨‍🌾 Contact Farmer',
      description: 'Connect directly with local farmers',
      category: 'connect'
    },
    {
      id: 'seasonal-guide',
      label: '📅 Seasonal Guide',
      description: 'What to plant and harvest this season',
      category: 'farming'
    }
  ];
}
