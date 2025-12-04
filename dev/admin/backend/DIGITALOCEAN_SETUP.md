# 🌊 Checking AI Concierge Configuration on Digital Ocean

## 📋 Step-by-Step Guide

### Step 1: SSH into Your Digital Ocean Droplet

```bash
ssh root@your-droplet-ip
# or
ssh your-username@your-droplet-ip
```

Replace `your-droplet-ip` with your actual Digital Ocean server IP address.

---

### Step 2: Navigate to Your Backend Directory

```bash
cd /path/to/your/project/dev/admin/backend
# Common paths:
# cd /var/www/slotify2/dev/admin/backend
# cd /home/username/slotify2/dev/admin/backend
# cd /root/slotify2/dev/admin/backend
```

**Find your project path:**
```bash
# If using PM2
pm2 list
pm2 info your-app-name

# Or search for your project
find / -name "index.js" -path "*/backend/index.js" 2>/dev/null
```

---

### Step 3: Check if .env File Exists

```bash
ls -la .env
```

If the file doesn't exist, you'll need to create it:
```bash
nano .env
# or
vi .env
```

---

### Step 4: View Your .env File

```bash
cat .env
# or to view with line numbers
cat -n .env
# or to search for GEMINI_API_KEY
grep GEMINI_API_KEY .env
```

**What you should see:**
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Step 5: Check Current GEMINI_API_KEY Value

```bash
# Check if the variable is set
grep GEMINI_API_KEY .env

# Check the value (first 10 characters only for security)
grep GEMINI_API_KEY .env | cut -d'=' -f2 | cut -c1-10
```

**Expected output:** Should start with `AIzaSy`

---

### Step 6: Edit .env File (if needed)

```bash
nano .env
# or
vi .env
```

**Add or update this line:**
```env
GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
```

**Important:**
- No spaces around `=`
- No quotes
- Variable name must be exactly `GEMINI_API_KEY`
- Save the file (Ctrl+O, Enter, Ctrl+X in nano)

---

### Step 7: Verify Environment Variables Are Loaded

Create a test script to check:

```bash
cat > test-env.js << 'EOF'
require('dotenv').config();
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('First 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT SET');
console.log('Length:', process.env.GEMINI_API_KEY?.length || 0);
EOF

node test-env.js
```

**Expected output:**
```
GEMINI_API_KEY exists: true
First 10 chars: AIzaSyXXXX
Length: 39
```

---

### Step 8: Check Server Status

#### If using PM2:
```bash
# Check if server is running
pm2 list

# Check server logs
pm2 logs your-app-name

# Look for these messages:
# [Selfie Analysis] Gemini API initialized successfully
# OR
# [Selfie Analysis] GEMINI_API_KEY not found
```

#### If using systemd:
```bash
# Check service status
systemctl status your-service-name

# View logs
journalctl -u your-service-name -f
```

#### If running directly:
```bash
# Check if process is running
ps aux | grep node

# Check logs (if redirected to a file)
tail -f /path/to/logfile.log
```

---

### Step 9: Restart Your Server

**After making changes to .env, you MUST restart:**

#### If using PM2:
```bash
pm2 restart your-app-name
# or restart all
pm2 restart all
```

#### If using systemd:
```bash
systemctl restart your-service-name
```

#### If running directly:
```bash
# Stop the process (Ctrl+C or kill)
pkill -f "node.*index.js"

# Start again
cd /path/to/backend
node index.js
# or
npm start
```

---

### Step 10: Test the Configuration

#### Option 1: Check Status Endpoint

```bash
# From your local machine or server
curl -H "key: your_secret_key" https://skedisy.com/user/aiConcierge/status
```

**Expected response:**
```json
{
  "status": true,
  "data": {
    "gemini": true,
    "ollama": false,
    "message": "✓ Gemini API configured"
  }
}
```

#### Option 2: Check Server Logs

After restarting, check logs for:
```
[Selfie Analysis] Gemini API initialized successfully
```

If you see:
```
[Selfie Analysis] GEMINI_API_KEY not found in environment variables
```
Then the .env file is not being read correctly.

---

## 🔧 Common Issues on Digital Ocean

### Issue 1: .env File Not Found

**Solution:**
```bash
# Create .env file
cd /path/to/backend
touch .env
nano .env
# Add your variables
```

### Issue 2: Wrong Permissions

**Solution:**
```bash
# Make sure .env is readable
chmod 644 .env
chown your-user:your-user .env
```

### Issue 3: Server Not Reading .env

**Check:**
1. Is dotenv installed?
   ```bash
   cd /path/to/backend
   npm list dotenv
   ```

2. Is dotenv.config() called in index.js?
   ```bash
   head -5 index.js
   # Should show: require("dotenv").config();
   ```

### Issue 4: Multiple .env Files

**Solution:**
```bash
# Find all .env files
find /path/to/project -name ".env" -type f

# Make sure you're editing the right one in backend directory
```

### Issue 5: Environment Variables Set Elsewhere

**Check:**
```bash
# Check if set in system environment
env | grep GEMINI

# Check PM2 ecosystem file
cat ecosystem.config.js 2>/dev/null | grep GEMINI

# Check systemd service file
cat /etc/systemd/system/your-service.service | grep GEMINI
```

---

## 🚀 Quick Setup Script

Create this script to quickly set up your API key:

```bash
cat > setup-gemini-key.sh << 'EOF'
#!/bin/bash

# Get API key from user
read -p "Enter your Gemini API key: " API_KEY

# Navigate to backend directory
cd /path/to/your/project/dev/admin/backend

# Backup existing .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Add or update GEMINI_API_KEY
if grep -q "GEMINI_API_KEY" .env 2>/dev/null; then
    # Update existing
    sed -i "s/^GEMINI_API_KEY=.*/GEMINI_API_KEY=$API_KEY/" .env
else
    # Add new
    echo "GEMINI_API_KEY=$API_KEY" >> .env
fi

echo "✅ GEMINI_API_KEY updated in .env file"
echo "⚠️  Don't forget to restart your server!"
EOF

chmod +x setup-gemini-key.sh
./setup-gemini-key.sh
```

---

## 📝 Complete Checklist

- [ ] SSH into Digital Ocean droplet
- [ ] Navigate to backend directory
- [ ] Check if .env file exists
- [ ] Verify GEMINI_API_KEY is set correctly
- [ ] Check API key format (starts with AIzaSy)
- [ ] Restart server (PM2/systemd/direct)
- [ ] Check server logs for initialization message
- [ ] Test status endpoint
- [ ] Try uploading a selfie

---

## 🔍 Debugging Commands

```bash
# 1. Check .env file location and content
cd /path/to/backend
pwd
ls -la .env
cat .env | grep GEMINI

# 2. Test environment loading
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');"

# 3. Check if server process can see the variable
pm2 describe your-app-name | grep -A 10 "env:"

# 4. Check server logs in real-time
pm2 logs your-app-name --lines 50

# 5. Test API endpoint
curl -X GET "https://skedisy.com/user/aiConcierge/status" \
  -H "key: your_secret_key"
```

---

## 🆘 Still Having Issues?

1. **Check PM2 ecosystem file:**
   ```bash
   cat ecosystem.config.js
   # Make sure env variables are set there if using PM2
   ```

2. **Check systemd service file:**
   ```bash
   cat /etc/systemd/system/your-service.service
   # Check Environment= lines
   ```

3. **Verify dotenv is working:**
   ```bash
   cd /path/to/backend
   node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => k.includes('GEMINI')));"
   ```

4. **Check file permissions:**
   ```bash
   ls -la .env
   # Should be readable by the user running the server
   ```

---

## 📞 Quick Reference

**Get API key from Google:** https://aistudio.google.com/app/apikey

**Common paths:**
- Project root: `/var/www/slotify2/` or `/home/username/slotify2/`
- Backend: `dev/admin/backend/`
- .env file: `dev/admin/backend/.env`

**Restart commands:**
- PM2: `pm2 restart all`
- systemd: `systemctl restart your-service`
- Direct: `pkill -f node && npm start`

