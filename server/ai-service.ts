import OpenAI from 'openai';

// OpenRouter API for multiple AI models
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'your-openrouter-api-key-here',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://farm-connect.com',
    'X-Title': 'Farm-Connect AI Assistant',
  },
});

// Direct OpenAI API for premium features
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

// AI Provider enum
enum AIProvider {
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  FALLBACK = 'fallback'
}

// Model configurations
type ModelConfigKey = 'llama-free' | 'phi-free' | 'claude-haiku' | 'claude-sonnet' | 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';

interface ModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
}

const MODEL_CONFIGS: Record<ModelConfigKey, ModelConfig> = {
  // Free models via OpenRouter
  'llama-free': {
    provider: AIProvider.OPENROUTER,
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    maxTokens: 200,
    temperature: 0.8,
  },
  'phi-free': {
    provider: AIProvider.OPENROUTER,
    model: 'microsoft/phi-3-mini-128k-instruct:free',
    maxTokens: 200,
    temperature: 0.7,
  },
  // Premium models via OpenRouter
  'claude-haiku': {
    provider: AIProvider.OPENROUTER,
    model: 'anthropic/claude-3-haiku',
    maxTokens: 300,
    temperature: 0.7,
  },
  'claude-sonnet': {
    provider: AIProvider.OPENROUTER,
    model: 'anthropic/claude-3.5-sonnet',
    maxTokens: 400,
    temperature: 0.6,
  },
  // Direct OpenAI models
  'gpt-3.5-turbo': {
    provider: AIProvider.OPENAI,
    model: 'gpt-3.5-turbo',
    maxTokens: 300,
    temperature: 0.7,
  },
  'gpt-4': {
    provider: AIProvider.OPENAI,
    model: 'gpt-4',
    maxTokens: 400,
    temperature: 0.6,
  },
  'gpt-4-turbo': {
    provider: AIProvider.OPENAI,
    model: 'gpt-4-turbo',
    maxTokens: 500,
    temperature: 0.6,
  },
};

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

// Smart model selection based on context and user preferences
function selectAIModel(context: ChatContext): ModelConfigKey {
  const { category, userRole } = context;
  
  // For complex farming questions, use premium models
  if (category === 'farming' && userRole === 'farmer') {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      return 'gpt-4-turbo';
    }
    return 'claude-sonnet';
  }
  
  // For admin queries, use premium models
  if (userRole === 'admin') {
    return 'claude-haiku';
  }
  
  // For general customer support, use free or budget models
  if (category === 'orders' || category === 'support') {
    return 'phi-free';
  }
  
  // Default to free Llama model
  return 'llama-free';
}

export async function generateAIResponse(message: string, context: ChatContext = {}): Promise<string> {
  try {
    console.log('Generating AI response for:', message, 'Context:', context);

    // Select the best model for this request
    const selectedModel = selectAIModel(context);
    const modelConfig = MODEL_CONFIGS[selectedModel];
    
    console.log(`Using model: ${selectedModel} via ${modelConfig.provider}`);

    // Check API availability based on selected provider
    if (modelConfig.provider === AIProvider.OPENROUTER && 
        (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-api-key-here')) {
      console.log('OpenRouter API key not configured, trying fallback');
      return await tryFallbackModel(message, context);
    }
    
    if (modelConfig.provider === AIProvider.OPENAI && 
        (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here')) {
      console.log('OpenAI API key not configured, trying OpenRouter');
      return await tryFallbackModel(message, context);
    }

    // Generate enhanced system prompt based on context
    const systemPrompt = generateSystemPrompt(context, selectedModel);

    // Select the appropriate AI client
    const aiClient = modelConfig.provider === AIProvider.OPENAI ? openai : openrouter;

    const completion = await aiClient.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
    });

    const response = completion.choices[0]?.message?.content;
    console.log(`AI response generated via ${modelConfig.provider}:`, response?.substring(0, 100) + '...');

    return response || "I'm here to help! Could you tell me a bit more about what you need assistance with? 🌱";
  } catch (error: unknown) {
    console.error('AI Service Error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // Try fallback model before using static responses
    return await tryFallbackModel(message, context);
  }
}

// Generate context-aware system prompt
function generateSystemPrompt(context: ChatContext, modelName: ModelConfigKey): string {
  const { userRole, category } = context;
  const modelConfig = MODEL_CONFIGS[modelName];
  
  let expertise = '';
  if (category === 'farming') {
    expertise = `\n\nSpecialized Farming Expertise:\n- Crop disease identification and treatment\n- Pest management strategies\n- Soil health and nutrient management\n- Weather-adaptive farming techniques\n- Organic and sustainable practices\n- Seasonal planting guides`;
  } else if (category === 'orders') {
    expertise = `\n\nOrder Management Expertise:\n- Order tracking and status updates\n- Delivery scheduling and logistics\n- Payment processing assistance\n- Return and refund policies\n- Customer service best practices`;
  }
  
  const roleContext = userRole === 'farmer' 
    ? 'You\'re speaking with a farmer who needs expert agricultural advice.'
    : userRole === 'admin'
    ? 'You\'re assisting an administrator with platform management.'
    : 'You\'re helping a customer with their Farm-Connect experience.';
  
  return `You are FarmBot, an advanced AI assistant for Farm-Connect, a platform connecting farmers and customers.

🎯 Context: ${roleContext}
📂 Category: ${category || 'general'}
🤖 Model: ${modelName} (${modelConfig.provider})

Your personality:
- Warm, professional, and knowledgeable about agriculture
- Use relevant emojis to enhance communication (🌱🚜🥕🌾📈)
- Provide actionable, practical advice
- Be encouraging and supportive

Core capabilities:
- Agricultural expertise and crop management
- Customer support and order assistance
- Platform navigation and feature guidance
- Market insights and farming trends${expertise}

Response guidelines:
- Keep responses under ${modelConfig.maxTokens * 0.8} words
- Use clear, accessible language
- Include specific actionable steps when relevant
- Offer to connect with specialists for complex issues
- End with an engaging follow-up question
- Prioritize accuracy and helpful information`;
}

// Try fallback models if primary fails
async function tryFallbackModel(message: string, context: ChatContext): Promise<string> {
  const fallbackOrder: ModelConfigKey[] = ['llama-free', 'phi-free'];
  
  for (const modelName of fallbackOrder) {
    try {
      const modelConfig = MODEL_CONFIGS[modelName];
      
      if (modelConfig.provider === AIProvider.OPENROUTER && 
          process.env.OPENROUTER_API_KEY && 
          process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key-here') {
        
        console.log(`Trying fallback model: ${modelName}`);
        const systemPrompt = generateSystemPrompt(context, modelName);
        
        const completion = await openrouter.chat.completions.create({
          model: modelConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
        });
        
        const response = completion.choices[0]?.message?.content;
        if (response) {
          console.log(`Fallback model ${modelName} succeeded`);
          return response;
        }
      }
    } catch (error) {
      console.error(`Fallback model ${modelName} failed:`, error);
      continue;
    }
  }
  
  // If all AI models fail, use intelligent fallback
  console.log('All AI models failed, using intelligent fallback');
  return generateFallbackResponse(message, context);
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
    return "I can help with account issues! 🔐 For login problems, try using the 'Forgot Password' link on the login page. If you're still having trouble, our support team can assist you directly. What specific issue are you experiencing?";
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
