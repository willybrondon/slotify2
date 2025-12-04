require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const key = process.env.GEMINI_API_KEY;

console.log('=== Gemini API Key Test ===');
console.log('Key exists:', !!key);
console.log('Key length:', key?.length || 0);
console.log('Starts with AIzaSy:', key?.startsWith('AIzaSy') || false);
console.log('First 15 chars:', key?.substring(0, 15) || 'NOT SET');

if (!key) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  console.error('Make sure .env file exists and contains GEMINI_API_KEY=your_key');
  process.exit(1);
}

if (key.includes('your_') || key.includes('placeholder') || key.trim() === '') {
  console.error('❌ GEMINI_API_KEY appears to be a placeholder');
  console.error('Please set a real API key from https://aistudio.google.com/app/apikey');
  process.exit(1);
}

if (!key.startsWith('AIzaSy')) {
  console.error('❌ GEMINI_API_KEY format appears invalid (should start with AIzaSy)');
  process.exit(1);
}

try {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('✅ Gemini API initialized successfully');
  console.log('✅ API key appears valid');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your server: pm2 restart your-app-name');
  console.log('2. Test the endpoint: curl -H "key: r8Cs1WcSI9" https://skedisy.com/user/aiConcierge/status');
} catch (error) {
  console.error('❌ Failed to initialize Gemini:', error.message);
  console.error('Please check your API key is correct');
  process.exit(1);
}

