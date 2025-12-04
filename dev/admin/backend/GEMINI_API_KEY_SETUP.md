# 🔑 How to Get Your FREE Gemini API Key

## ⚠️ Important: There is NO default API key!

The text `your_gemini_api_key_here` in documentation is just a **placeholder**. You must create your own API key.

---

## 📝 Step-by-Step Guide

### Step 1: Go to Google AI Studio
Visit: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In
- Sign in with your Google account
- If you don't have a Google account, create one (it's free)

### Step 3: Create API Key
1. Click the **"Create API Key"** button
2. You may be asked to create a Google Cloud project (this is free)
3. Click **"Create API Key in New Project"** or select an existing project
4. Your API key will be displayed - **COPY IT IMMEDIATELY** (you won't see it again!)

### Step 4: Add to Your .env File

1. Navigate to: `dev/admin/backend/`
2. Create or edit the `.env` file
3. Add this line (replace with YOUR actual API key):

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Example of what it looks like:**
```env
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 5: Restart Your Server
After adding the API key, restart your Node.js backend server for the changes to take effect.

---

## ✅ Verify Your Setup

After restarting, you can check if your API key is working:

**Call this endpoint:**
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

## 🆓 Is it Really Free?

**Yes!** Google Gemini API has a generous free tier:
- **60 requests per minute**
- **1,500 requests per day**
- Perfect for testing and small to medium applications

---

## ❓ Troubleshooting

### Error: "API key not configured"
- Make sure you added `GEMINI_API_KEY=your_actual_key` to `.env` file
- Make sure there are no spaces around the `=` sign
- Restart your server after adding the key

### Error: "API key invalid"
- Double-check you copied the entire key (they're long!)
- Make sure there are no extra spaces or quotes
- Try creating a new API key if the current one doesn't work

### Error: "Quota exceeded"
- You've hit the free tier limit
- Wait a bit or upgrade to a paid plan
- Check your usage at: https://aistudio.google.com/app/apikey

---

## 🔒 Security Note

**NEVER commit your `.env` file to Git!**
- The `.env` file should be in `.gitignore`
- Keep your API key secret
- If you accidentally share it, delete it and create a new one

---

## 📞 Need Help?

If you're still having issues:
1. Check the server logs for specific error messages
2. Verify the API key format (should start with `AIzaSy`)
3. Make sure your server has internet access to reach Google's API

