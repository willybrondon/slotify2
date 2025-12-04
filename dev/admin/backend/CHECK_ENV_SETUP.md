# 🔍 How to Check Your .env File Setup

## ⚠️ Common Issues

If you're getting "API key not configured" error even though you added it to .env, check these:

---

## ✅ Step 1: Verify .env File Location

Your `.env` file **MUST** be located at:
```
dev/admin/backend/.env
```

**NOT** in:
- ❌ Root directory
- ❌ dev/admin/.env
- ❌ Any other location

---

## ✅ Step 2: Check .env File Format

Your `.env` file should look **exactly** like this:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ❌ Common Mistakes:

1. **Wrong format:**
   ```env
   # WRONG - Don't use quotes
   GEMINI_API_KEY="AIzaSy..."
   
   # WRONG - Don't use spaces around =
   GEMINI_API_KEY = AIzaSy...
   
   # WRONG - Don't use different variable name
   GEMINI_KEY=AIzaSy...
   ```

2. **Correct format:**
   ```env
   # CORRECT - No quotes, no spaces
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
   ```

---

## ✅ Step 3: Verify Your API Key

Your Gemini API key should:
- ✅ Start with `AIzaSy`
- ✅ Be about 39 characters long
- ✅ Have no spaces or special characters (except letters and numbers)
- ✅ NOT be a placeholder like "your_gemini_api_key_here"

**Example of a real API key:**
```
AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

---

## ✅ Step 4: Restart Your Server

**IMPORTANT:** After adding/changing the `.env` file, you **MUST** restart your Node.js server:

1. Stop your server (Ctrl+C)
2. Start it again:
   ```bash
   cd dev/admin/backend
   npm start
   # or
   node index.js
   ```

---

## ✅ Step 5: Test Your Configuration

After restarting, check if your API key is loaded:

### Option 1: Check Server Logs
When your server starts, you should see:
```
[Selfie Analysis] Gemini API initialized successfully
```

If you see:
```
[Selfie Analysis] GEMINI_API_KEY not found in environment variables
```
Then your .env file is not being read correctly.

### Option 2: Use Status Endpoint
Call this endpoint:
```
GET https://skedisy.com/user/aiConcierge/status
```

You should see:
```json
{
  "status": true,
  "data": {
    "gemini": true,
    "message": "✓ Gemini API configured"
  }
}
```

---

## 🔧 Troubleshooting

### Problem: "GEMINI_API_KEY not found"

**Solutions:**
1. ✅ Make sure `.env` file is in `dev/admin/backend/` directory
2. ✅ Check the file is named exactly `.env` (not `.env.txt` or `env`)
3. ✅ Verify the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
4. ✅ Make sure there are no spaces: `GEMINI_API_KEY=your_key` (not `GEMINI_API_KEY = your_key`)
5. ✅ Restart your server after making changes

### Problem: "API key invalid"

**Solutions:**
1. ✅ Verify you copied the entire key (they're long!)
2. ✅ Make sure there are no extra spaces or line breaks
3. ✅ Check the key starts with `AIzaSy`
4. ✅ Try creating a new API key from Google AI Studio

### Problem: Server still shows old error

**Solutions:**
1. ✅ Make sure you restarted the server
2. ✅ Check if you're running multiple server instances
3. ✅ Clear any cached environment variables
4. ✅ Verify the .env file was saved correctly

---

## 📝 Example .env File

Here's a complete example `.env` file:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Server
PORT=5000
baseURL=https://skedisy.com
secretKey=your_secret_key_here

# Google Gemini API (for AI Concierge)
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz

# Optional: Ollama (for local AI)
# OLLAMA_HOST=http://localhost:11434
# OLLAMA_MODEL=qwen2.5-vl:7b
```

---

## 🆘 Still Not Working?

If you've checked everything above and it's still not working:

1. **Check server console output** - Look for error messages when server starts
2. **Verify dotenv is installed**: `npm list dotenv` in `dev/admin/backend/`
3. **Test manually**: Add this to your code temporarily to debug:
   ```javascript
   console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
   console.log('First 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));
   ```

---

## 📞 Quick Checklist

Before asking for help, verify:
- [ ] `.env` file exists in `dev/admin/backend/`
- [ ] Variable name is exactly `GEMINI_API_KEY`
- [ ] No spaces around `=` sign
- [ ] No quotes around the API key value
- [ ] API key starts with `AIzaSy`
- [ ] Server was restarted after adding the key
- [ ] Checked server logs for initialization message

