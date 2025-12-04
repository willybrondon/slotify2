# 🐛 Debugging Gemini API Key Issues

## The Problem

Status endpoint says Gemini is configured, but analysis fails with "API key not configured".

This happens when:
1. The API key was added to `.env` but the server wasn't restarted
2. The API key is invalid or a placeholder
3. The API key format is incorrect

---

## 🔍 Step 1: Check Server Logs

On Digital Ocean, check your server startup logs:

```bash
# SSH into server
ssh root@your-droplet-ip

# Check PM2 logs
pm2 logs your-app-name --lines 100 | grep -i gemini

# Look for these messages:
# ✅ "[Selfie Analysis] Gemini API initialized successfully"
# ❌ "[Selfie Analysis] GEMINI_API_KEY not found"
# ❌ "[Selfie Analysis] GEMINI_API_KEY appears to be a placeholder"
```

---

## 🔍 Step 2: Verify .env File

```bash
cd /path/to/your/project/dev/admin/backend

# Check if key exists
grep GEMINI_API_KEY .env

# Check the actual value (first 15 chars for security)
grep GEMINI_API_KEY .env | cut -d'=' -f2 | cut -c1-15

# Check if it's a placeholder
grep GEMINI_API_KEY .env | grep -E "your_|placeholder|AIzaSy"
```

**Expected:** Should see a key starting with `AIzaSy` and be about 39 characters long.

---

## 🔍 Step 3: Test Environment Loading

```bash
cd /path/to/your/project/dev/admin/backend

# Test if Node.js can read the key
node -e "
require('dotenv').config();
const key = process.env.GEMINI_API_KEY;
console.log('Key exists:', !!key);
console.log('Key length:', key?.length || 0);
console.log('Starts with AIzaSy:', key?.startsWith('AIzaSy') || false);
console.log('First 15 chars:', key?.substring(0, 15) || 'NOT SET');
"
```

---

## 🔍 Step 4: Check if Server Can See the Key

```bash
# If using PM2, check environment
pm2 describe your-app-name | grep -A 30 "env:"

# Or check if it's in the process environment
ps aux | grep node
# Then check the process environment (if accessible)
```

---

## ✅ Step 5: Fix Common Issues

### Issue 1: Server Not Restarted

**Fix:**
```bash
# Restart your server
pm2 restart your-app-name
# or
systemctl restart your-service-name
```

### Issue 2: Invalid API Key Format

**Check:**
```bash
cd /path/to/backend
KEY=$(grep GEMINI_API_KEY .env | cut -d'=' -f2)

# Check length (should be ~39 chars)
echo "Length: ${#KEY}"

# Check format (should start with AIzaSy)
echo "Starts with AIzaSy: $([[ $KEY == AIzaSy* ]] && echo 'YES' || echo 'NO')"
```

**Fix:** Get a new key from https://aistudio.google.com/app/apikey

### Issue 3: Placeholder Value

**Check:**
```bash
grep GEMINI_API_KEY .env | grep -E "your_|placeholder|example"
```

**Fix:** Replace with a real API key

### Issue 4: .env File Not in Right Location

**Check:**
```bash
# Find where your server is running from
pm2 info your-app-name | grep "script path"

# Make sure .env is in the same directory as index.js
ls -la /path/to/backend/.env
```

---

## 🔧 Step 6: Manual Test

Create a test script to verify the API key works:

```bash
cd /path/to/your/project/dev/admin/backend

cat > test-gemini.js << 'EOF'
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

console.log('=== Gemini API Key Test ===');
console.log('Key exists:', !!apiKey);
console.log('Key length:', apiKey?.length || 0);
console.log('Key starts with AIzaSy:', apiKey?.startsWith('AIzaSy') || false);

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  process.exit(1);
}

if (apiKey.includes('your_') || apiKey.includes('placeholder')) {
  console.error('❌ GEMINI_API_KEY appears to be a placeholder');
  process.exit(1);
}

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('✅ Gemini API initialized successfully');
  console.log('✅ API key appears valid');
} catch (error) {
  console.error('❌ Failed to initialize Gemini:', error.message);
  process.exit(1);
}
EOF

node test-gemini.js
```

---

## 🎯 Quick Fix Checklist

- [ ] SSH into Digital Ocean server
- [ ] Navigate to backend directory: `cd /path/to/backend`
- [ ] Check .env file: `cat .env | grep GEMINI_API_KEY`
- [ ] Verify key format (starts with `AIzaSy`, ~39 chars)
- [ ] Check server logs: `pm2 logs your-app-name | grep gemini`
- [ ] Restart server: `pm2 restart your-app-name`
- [ ] Test again: Upload a selfie on the website

---

## 🆘 Still Not Working?

1. **Check if dotenv is loading:**
   ```bash
   cd /path/to/backend
   node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => k.includes('GEMINI')).join(', '));"
   ```

2. **Check file permissions:**
   ```bash
   ls -la .env
   chmod 644 .env
   ```

3. **Verify no syntax errors in .env:**
   ```bash
   # Check for special characters
   cat -A .env | grep GEMINI
   ```

4. **Get a fresh API key:**
   - Go to: https://aistudio.google.com/app/apikey
   - Create a new key
   - Update .env file
   - Restart server

