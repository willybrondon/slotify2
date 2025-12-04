# 🚀 Quick Digital Ocean Check - AI Concierge Configuration

## ⚡ Fast Commands to Check Your Setup

### 1. SSH into Your Server
```bash
ssh root@your-droplet-ip
```

### 2. Find Your Project Directory
```bash
# If using PM2, find the path:
pm2 info your-app-name | grep "script path"

# Or search for it:
find /var/www -name "index.js" -path "*/backend/index.js" 2>/dev/null
find /home -name "index.js" -path "*/backend/index.js" 2>/dev/null
```

### 3. Check .env File
```bash
cd /path/to/your/project/dev/admin/backend

# Check if file exists
ls -la .env

# View the GEMINI_API_KEY line
grep GEMINI_API_KEY .env

# Check if it's set (should show the key starting with AIzaSy)
cat .env | grep GEMINI_API_KEY
```

### 4. Test if Environment Variable is Loaded
```bash
cd /path/to/your/project/dev/admin/backend

# Quick test
node -e "require('dotenv').config(); console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ SET (' + process.env.GEMINI_API_KEY.substring(0,10) + '...)' : '❌ NOT SET');"
```

### 5. Check Server Logs
```bash
# If using PM2
pm2 logs your-app-name --lines 20 | grep -i gemini

# Look for:
# ✅ "[Selfie Analysis] Gemini API initialized successfully"
# ❌ "[Selfie Analysis] GEMINI_API_KEY not found"
```

### 6. Test the API Endpoint
```bash
# From your server or local machine
curl -H "key: your_secret_key" https://skedisy.com/user/aiConcierge/status

# Should return:
# {"status":true,"data":{"gemini":true,...}}
```

---

## 🔧 Quick Fix: Add/Update API Key

### Option 1: Edit .env File Directly
```bash
cd /path/to/your/project/dev/admin/backend
nano .env

# Add or update this line (no spaces, no quotes):
GEMINI_API_KEY=AIzaSyYourActualKeyHere

# Save: Ctrl+O, Enter, Ctrl+X
```

### Option 2: Use sed to Update
```bash
cd /path/to/your/project/dev/admin/backend

# Replace with your actual API key
sed -i 's/^GEMINI_API_KEY=.*/GEMINI_API_KEY=AIzaSyYourActualKeyHere/' .env

# Verify it was updated
grep GEMINI_API_KEY .env
```

### Option 3: Append if Not Exists
```bash
cd /path/to/your/project/dev/admin/backend

# Check if exists
if ! grep -q "GEMINI_API_KEY" .env; then
    echo "GEMINI_API_KEY=AIzaSyYourActualKeyHere" >> .env
fi
```

---

## 🔄 Restart Server After Changes

```bash
# PM2
pm2 restart your-app-name

# systemd
systemctl restart your-service-name

# Direct (if running with node)
pkill -f "node.*index.js"
cd /path/to/backend && npm start &
```

---

## ✅ Verification Checklist

Run these commands to verify everything:

```bash
# 1. Check .env exists and has the key
cd /path/to/your/project/dev/admin/backend
[ -f .env ] && echo "✅ .env file exists" || echo "❌ .env file missing"
grep -q "GEMINI_API_KEY" .env && echo "✅ GEMINI_API_KEY found" || echo "❌ GEMINI_API_KEY missing"

# 2. Check key format
KEY=$(grep GEMINI_API_KEY .env | cut -d'=' -f2)
[[ $KEY == AIzaSy* ]] && echo "✅ Key format looks correct" || echo "❌ Key format incorrect"

# 3. Check if server can read it
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? '✅ Server can read key' : '❌ Server cannot read key');"

# 4. Check server status
pm2 list | grep -q "online" && echo "✅ Server is running" || echo "❌ Server not running"
```

---

## 🆘 Common Issues

### Issue: "GEMINI_API_KEY not found" but it's in .env

**Fix:**
```bash
# 1. Check file location
pwd
ls -la .env

# 2. Check file permissions
chmod 644 .env

# 3. Verify no hidden characters
cat -A .env | grep GEMINI

# 4. Restart server
pm2 restart all
```

### Issue: Server not reading .env

**Fix:**
```bash
# Check if dotenv is installed
cd /path/to/backend
npm list dotenv

# Check if index.js loads dotenv
head -5 index.js | grep dotenv

# If missing, install:
npm install dotenv
```

### Issue: Wrong API key format

**Fix:**
```bash
# Get a new key from: https://aistudio.google.com/app/apikey
# Then update:
nano .env
# Make sure format is: GEMINI_API_KEY=AIzaSy... (no quotes, no spaces)
```

---

## 📞 Need Your API Key?

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy`)
5. Add to your `.env` file on Digital Ocean

---

## 🎯 One-Liner to Check Everything

```bash
cd /path/to/your/project/dev/admin/backend && \
echo "=== Checking AI Concierge Setup ===" && \
echo "1. .env file:" && ([ -f .env ] && echo "   ✅ Exists" || echo "   ❌ Missing") && \
echo "2. GEMINI_API_KEY:" && (grep -q "GEMINI_API_KEY" .env && echo "   ✅ Found: $(grep GEMINI_API_KEY .env | cut -d'=' -f2 | cut -c1-15)..." || echo "   ❌ Not found") && \
echo "3. Server can read:" && (node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? '   ✅ Yes' : '   ❌ No');") && \
echo "4. Server status:" && (pm2 list | grep -q "online" && echo "   ✅ Running" || echo "   ❌ Not running")
```

Replace `/path/to/your/project` with your actual project path!

