// Quick test script to verify OpenRouter API key is working
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://farm-connect.com',
    'X-Title': 'Farm-Connect AI Assistant',
  },
});

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API connection...');
  console.log('API Key available:', !!process.env.OPENROUTER_API_KEY);
  console.log('API Key (first 20 chars):', process.env.OPENROUTER_API_KEY?.substring(0, 20));
  console.log('Model:', process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free');

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        { 
          role: "system", 
          content: "You are FarmBot, a helpful AI assistant for Farm-Connect. Respond briefly and friendly." 
        },
        { 
          role: "user", 
          content: "Hello! Can you help me with farming questions?" 
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('✅ OpenRouter API test successful!');
    console.log('🤖 AI Response:', response);
    console.log('📊 Usage:', completion.usage);
    
    return true;
  } catch (error) {
    console.error('❌ OpenRouter API test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error details:', error.error);
    
    return false;
  }
}

// Run the test
testOpenRouter()
  .then(success => {
    if (success) {
      console.log('\n🎉 OpenRouter setup is working correctly!');
      console.log('You can now start the development server and test the chatbot.');
    } else {
      console.log('\n🔧 Please check your OpenRouter API key and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
