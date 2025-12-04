# AI Concierge Setup Guide

## 🎯 Overview

The AI Concierge feature uses **Google Gemini 1.5 Flash** (free tier) for high-quality image analysis and beauty recommendations. It includes a fallback to Ollama for privacy/offline use.

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd dev/admin/backend
npm install
```

This will install:
- `@google/generative-ai` - Google Gemini SDK
- `ollama` - Optional fallback for local AI

---

## 🔑 API Key Setup

### Step 2: Get Google Gemini API Key (FREE)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 3: Add to Environment Variables

Add to your `.env` file:

```env
# Google Gemini API Key (Required for image analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama Configuration (Optional - for fallback)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5-vl:7b
```

---

## 🚀 API Endpoints

### 1. Analyze Selfie Image

**Endpoint:** `POST /user/aiConcierge/analyzeSelfie`

**Headers:**
```
key: your_secret_key
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `image`: Selfie image file (JPEG, PNG, etc.)
- `userId`: (Optional) User ID
- `latitude`: (Optional) User latitude
- `longitude`: (Optional) User longitude
- `city`: (Optional) User city
- `occasion`: (Optional) Special occasion

**Response:**
```json
{
  "status": true,
  "message": "Selfie analyzed successfully",
  "data": {
    "analysis": {
      "skin": {
        "type": "combination",
        "tone": "medium",
        "undertone": "warm",
        "concerns": ["acne", "dark spots"],
        "condition": "good"
      },
      "hair": {
        "type": "wavy",
        "texture": "medium",
        "color": "brown",
        "condition": "healthy"
      },
      "face": {
        "shape": "oval",
        "eyeShape": "almond",
        "lipShape": "full"
      },
      "beautyProfile": {
        "ageEstimate": "25-30",
        "assessment": "Good overall condition"
      }
    },
    "recommendations": {
      "services": [...],
      "salons": [...],
      "experts": [...],
      "beautyTips": [...]
    },
    "provider": "gemini"
  }
}
```

---

### 2. Chat with AI Concierge

**Endpoint:** `POST /user/aiConcierge/chat`

**Headers:**
```
key: your_secret_key
Content-Type: application/json
```

**Body:**
```json
{
  "message": "What's the best facial for oily skin?",
  "userId": "user_id_here",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "status": true,
  "message": "AI response generated successfully",
  "data": {
    "response": "For oily skin, I recommend...",
    "provider": "gemini"
  }
}
```

---

### 3. Check AI Service Status

**Endpoint:** `GET /user/aiConcierge/status`

**Headers:**
```
key: your_secret_key
```

**Response:**
```json
{
  "status": true,
  "data": {
    "gemini": true,
    "ollama": false,
    "message": "Gemini API configured"
  }
}
```

---

## 🧪 Testing

### Test with cURL

```bash
# Test selfie analysis
curl -X POST http://localhost:5000/user/aiConcierge/analyzeSelfie \
  -H "key: your_secret_key" \
  -F "image=@/path/to/selfie.jpg" \
  -F "userId=user123"

# Test chat
curl -X POST http://localhost:5000/user/aiConcierge/chat \
  -H "key: your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What facial treatment do you recommend?",
    "userId": "user123"
  }'

# Check status
curl -X GET http://localhost:5000/user/aiConcierge/status \
  -H "key: your_secret_key"
```

---

## 💰 Pricing

### Google Gemini 1.5 Flash (FREE Tier)

- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**

**After free tier:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**For most apps, the free tier is sufficient!**

---

## 🔄 Fallback to Ollama (Optional)

If you want to use Ollama as a fallback or primary option:

1. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Pull Vision Model:**
   ```bash
   ollama pull qwen2.5-vl:7b
   # or
   ollama pull llava:latest
   ```

3. **Set Environment Variables:**
   ```env
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=qwen2.5-vl:7b
   ```

The service will automatically fallback to Ollama if Gemini fails.

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY not found"

**Solution:** Add `GEMINI_API_KEY` to your `.env` file.

### Error: "Failed to analyze selfie"

**Possible causes:**
1. Invalid API key
2. Image file too large (max 10MB)
3. Unsupported image format
4. Network issues

**Solutions:**
- Check API key is correct
- Ensure image is JPEG/PNG
- Check file size
- Verify internet connection

### Error: "Both Gemini and Ollama failed"

**Solution:**
- Check Gemini API key is valid
- If using Ollama, ensure it's running: `ollama serve`
- Check network connectivity

---

## 📝 Notes

- **Image Size Limit:** 10MB
- **Supported Formats:** JPEG, PNG, GIF, WebP
- **Response Time:** ~2-5 seconds per analysis
- **Privacy:** Images are processed and can be deleted after analysis

---

## ✅ Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. ✅ Add `GEMINI_API_KEY` to `.env`
4. ✅ Test the endpoint with a sample image
5. ✅ Integrate with Flutter app

---

## 🔗 Useful Links

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Ollama Documentation](https://ollama.com/docs)
- [Open Source AI Alternatives Guide](../OPEN_SOURCE_AI_ALTERNATIVES.md)

---

**Ready to use!** 🚀

