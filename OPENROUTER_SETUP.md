# 🤖 OpenRouter AI Setup Guide for Farm-Connect

This guide will help you set up OpenRouter API for the Farm-Connect AI chatbot instead of OpenAI.

## 🌟 Why OpenRouter?

- **Multiple Models**: Access to 100+ AI models from different providers
- **Cost-Effective**: Often cheaper than direct API access
- **Free Tier**: Some models are completely free
- **Flexibility**: Easy to switch between models
- **No Vendor Lock-in**: Use different models for different purposes

## 🚀 Quick Setup

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy your API key (starts with `sk-or-v1-...`)

### 2. Configure Environment Variables

Create or update your `.env` file in the project root:

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Specify which model to use (defaults to free Llama model)
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Database Configuration
DATABASE_URL=your_database_connection_string
```

### 3. Available Models

#### 🆓 **FREE MODELS** (No cost, rate limited)
```env
# Llama 3.1 8B - Great for general tasks
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Phi-3 Mini - Microsoft's efficient model
OPENROUTER_MODEL=microsoft/phi-3-mini-128k-instruct:free
```

#### 💰 **AFFORDABLE PAID MODELS**
```env
# Claude 3 Haiku - Fast and affordable ($0.25/1M tokens)
OPENROUTER_MODEL=anthropic/claude-3-haiku

# GPT-3.5 Turbo - OpenAI's model via OpenRouter
OPENROUTER_MODEL=openai/gpt-3.5-turbo

# Gemini Flash - Google's fast model
OPENROUTER_MODEL=google/gemini-flash-1.5

# Llama 3.1 70B - More powerful Llama model
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
```

#### 🚀 **PREMIUM MODELS** (Higher cost, best quality)
```env
# Claude 3.5 Sonnet - Excellent reasoning
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# GPT-4 - OpenAI's flagship model
OPENROUTER_MODEL=openai/gpt-4

# GPT-4 Turbo - Faster GPT-4
OPENROUTER_MODEL=openai/gpt-4-turbo
```

## 🔧 Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API connection:**
   - Open `http://localhost:5000/test-chatbot.html`
   - Click "Test Database" to verify database connection
   - Click "Create New Session" to create a chat session
   - Try the quick actions or send a message

3. **Check the console logs:**
   - Open browser developer tools (F12)
   - Look for logs showing:
     - "OpenRouter API Key available: true"
     - "Using AI model: [your-selected-model]"
     - "AI response generated: [response]"

## 💡 Model Recommendations

### For Development/Testing:
- **meta-llama/llama-3.1-8b-instruct:free** - Free, good quality
- **microsoft/phi-3-mini-128k-instruct:free** - Free, very fast

### For Production (Low Cost):
- **anthropic/claude-3-haiku** - Excellent balance of cost/quality
- **google/gemini-flash-1.5** - Fast and affordable

### For Production (High Quality):
- **anthropic/claude-3.5-sonnet** - Best reasoning and farming knowledge
- **openai/gpt-4-turbo** - Reliable and well-tested

## 🛠️ Advanced Configuration

### Custom Model Selection by Context

You can modify the AI service to use different models for different purposes:

```typescript
// In server/ai-service.ts
const selectModel = (context: ChatContext) => {
  if (context.category === 'farming') {
    return 'anthropic/claude-3-haiku'; // Better for complex farming advice
  } else if (context.category === 'orders') {
    return 'meta-llama/llama-3.1-8b-instruct:free'; // Simple queries
  }
  return process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
};
```

### Rate Limiting and Error Handling

OpenRouter provides excellent error handling and rate limiting information in response headers.

## 🔍 Monitoring Usage

1. Visit [OpenRouter Dashboard](https://openrouter.ai/activity)
2. Monitor your API usage and costs
3. Set up usage alerts if needed

## 🆘 Troubleshooting

### Common Issues:

1. **"OpenRouter API key not configured"**
   - Check your `.env` file has `OPENROUTER_API_KEY`
   - Restart your development server after adding the key

2. **"Model not found" error**
   - Verify the model name is correct
   - Check [OpenRouter Models](https://openrouter.ai/models) for available models

3. **Rate limiting errors**
   - Free models have rate limits
   - Consider upgrading to paid models for higher limits

4. **High costs**
   - Monitor usage in OpenRouter dashboard
   - Use free models for development
   - Set usage limits in OpenRouter settings

## 🎯 Benefits for Farm-Connect

- **Farming Expertise**: Claude models excel at agricultural knowledge
- **Cost Control**: Start free, scale as needed
- **Reliability**: Multiple model fallbacks available
- **Performance**: Choose speed vs quality based on use case

## 🔄 Migration from OpenAI

The code has been updated to use OpenRouter, but maintains OpenAI SDK compatibility. No other changes needed!

---

**Ready to test?** Run `npm run dev` and visit the test page to see your OpenRouter-powered AI assistant in action! 🌱🤖
