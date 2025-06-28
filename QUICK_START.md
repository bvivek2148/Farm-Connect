# 🚀 Quick Start Guide - Farm-Connect with OpenRouter AI

Your OpenRouter API key has been configured! Here's how to get everything running.

## ✅ Configuration Complete

Your `.env` file is now set up with:
- ✅ **OpenRouter API Key**: `sk-or-v1-57e1e...` (configured)
- ✅ **Database URL**: Neon PostgreSQL (configured)
- ✅ **AI Model**: Llama 3.1 8B (free tier)

## 🏃‍♂️ Quick Start Steps

### 1. Test OpenRouter Connection (Optional)
```bash
node test-openrouter.js
```
This will verify your API key is working correctly.

### 2. Set Up Database Tables
```bash
npm run db:push
```
This creates the necessary database tables including chat messages.

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`

### 4. Test the AI Chatbot
- **Main App**: [http://localhost:5000](http://localhost:5000)
- **Chatbot Test Page**: [http://localhost:5000/test-chatbot.html](http://localhost:5000/test-chatbot.html)

## 🧪 Testing the Chatbot

### On the Main Website:
1. Look for the floating green chat button in the bottom-right corner
2. Click it to open the chatbot
3. Try the quick action buttons
4. Send custom messages

### On the Test Page:
1. Visit `http://localhost:5000/test-chatbot.html`
2. Click "Test Database" to verify database connection
3. Click "Create New Session" to start a chat session
4. Try the quick actions or send custom messages

## 🎯 Quick Actions Available

The chatbot includes 8 pre-configured quick actions:
- 🌱 **Crop Issues** - Plant diseases, pests, growing problems
- 🌤️ **Weather Advice** - Farming tips based on weather
- 📦 **Track Order** - Order status and delivery info
- 🥕 **Fresh Produce** - Seasonal fruits and vegetables
- 🚜 **Farming Tips** - Best practices for sustainable farming
- 🔐 **Account Help** - Login, profile, settings assistance
- 👨‍🌾 **Contact Farmer** - Connect with local farmers
- 📅 **Seasonal Guide** - Planting and harvest timing

## 🔧 Troubleshooting

### If the chatbot doesn't respond:
1. Check browser console (F12) for errors
2. Verify the OpenRouter API key is working: `node test-openrouter.js`
3. Check if database tables exist (run `npm run db:push`)

### If database errors occur:
- The chatbot has fallback responses and will still work
- Database issues won't break the chat functionality
- Check the test page for detailed error information

### Common Issues:
- **"Failed to process message"**: Usually a database connection issue
- **"OpenRouter API key not configured"**: Check your `.env` file
- **Rate limiting**: Free tier has limits, try again in a few minutes

## 🎨 Customization Options

### Change AI Model:
Edit `.env` file:
```env
# For better responses (paid):
OPENROUTER_MODEL=anthropic/claude-3-haiku

# For free alternative:
OPENROUTER_MODEL=microsoft/phi-3-mini-128k-instruct:free
```

### Model Recommendations:
- **Development**: `meta-llama/llama-3.1-8b-instruct:free` (current)
- **Production Budget**: `anthropic/claude-3-haiku` (~$0.25/1M tokens)
- **Production Quality**: `anthropic/claude-3.5-sonnet` (best for farming)

## 📊 Monitoring Usage

1. Visit [OpenRouter Dashboard](https://openrouter.ai/activity)
2. Monitor your API usage and costs
3. The free tier includes generous limits for testing

## 🎉 What's Working

- ✅ **AI Chatbot**: OpenRouter-powered with farming expertise
- ✅ **Quick Actions**: 8 pre-configured assistance options
- ✅ **Fallback Responses**: Works even if API fails
- ✅ **Database Integration**: Messages are saved and retrievable
- ✅ **Responsive UI**: Works on desktop and mobile
- ✅ **Error Handling**: Graceful degradation if issues occur

## 🚀 Next Steps

1. **Start the server**: `npm run dev`
2. **Test the chatbot**: Visit the test page or use the main app
3. **Customize responses**: Edit `server/ai-service.ts` for custom behavior
4. **Monitor usage**: Check OpenRouter dashboard for API usage

---

**Ready to go!** Your Farm-Connect AI chatbot is configured and ready to help farmers and customers! 🌱🤖
