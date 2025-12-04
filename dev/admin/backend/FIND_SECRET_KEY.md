# 🔑 How to Find Your Secret Key

## The Problem

You're getting "Unauthorized Access" because the secret key in your curl command doesn't match the one configured on your server.

---

## 🔍 Method 1: Check Your .env File on Digital Ocean

SSH into your server and check:

```bash
# SSH into your Digital Ocean droplet
ssh root@your-droplet-ip

# Navigate to backend directory
cd /path/to/your/project/dev/admin/backend

# Check the secretKey in .env file
grep secretKey .env
# or
cat .env | grep secretKey
```

**You should see:**
```env
secretKey=your_actual_secret_key_here
```

---

## 🔍 Method 2: Check Frontend Configuration

The frontend uses this key (check `dev/admin/salonportal/ai-concierge.js`):
```javascript
const SECRET_KEY = 'r8Cs1WcSI9';
```

**Try using this key:**
```bash
curl -H "key: r8Cs1WcSI9" https://skedisy.com/user/aiConcierge/status
```

---

## 🔍 Method 3: Check install.sh Default

The default secret key in `install.sh` is:
```
5TIvw5cpc0
```

**Try using this key:**
```bash
curl -H "key: 5TIvw5cpc0" https://skedisy.com/user/aiConcierge/status
```

---

## 🔍 Method 4: Check Server Environment Variables

On your Digital Ocean server:

```bash
# If using PM2
pm2 describe your-app-name | grep -A 20 "env:"

# Or check .env file directly
cd /path/to/backend
cat .env | grep secretKey
```

---

## ✅ Quick Test - Try All Common Keys

```bash
# Try the frontend key
curl -H "key: r8Cs1WcSI9" https://skedisy.com/user/aiConcierge/status

# Try the install.sh default
curl -H "key: 5TIvw5cpc0" https://skedisy.com/user/aiConcierge/status

# Try your current key (if different)
curl -H "key: AIFGhytsdosodhsgsbshsys" https://skedisy.com/user/aiConcierge/status
```

---

## 🔧 Fix: Update Secret Key

If you want to use a specific key, update it in both places:

### 1. Update Backend .env File

On Digital Ocean:
```bash
cd /path/to/your/project/dev/admin/backend
nano .env

# Update this line:
secretKey=r8Cs1WcSI9

# Save and restart server
pm2 restart your-app-name
```

### 2. Verify Frontend Matches

Check `dev/admin/salonportal/ai-concierge.js`:
```javascript
const SECRET_KEY = 'r8Cs1WcSI9';  // Should match .env file
```

---

## 🎯 Most Likely Solution

Based on your codebase, try this key first:

```bash
curl -H "key: r8Cs1WcSI9" https://skedisy.com/user/aiConcierge/status
```

This is the key used in your frontend code, so it's likely the one configured on your server.

---

## 📝 Expected Response

When you use the correct key, you should see:

```json
{
  "status": true,
  "data": {
    "gemini": true/false,
    "ollama": true/false,
    "message": "✓ Gemini API configured" or error message
  }
}
```

---

## 🆘 If None Work

1. **Check server logs:**
   ```bash
   pm2 logs your-app-name | grep -i secret
   ```

2. **Check if secretKey is set:**
   ```bash
   cd /path/to/backend
   node -e "require('dotenv').config(); console.log('secretKey:', process.env.secretKey ? 'SET (' + process.env.secretKey.substring(0,5) + '...)' : 'NOT SET');"
   ```

3. **Check the actual value (first few chars only):**
   ```bash
   grep secretKey .env | cut -d'=' -f2 | cut -c1-10
   ```

