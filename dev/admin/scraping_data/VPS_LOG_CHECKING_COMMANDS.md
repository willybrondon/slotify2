# VPS Log Checking Commands - Admin Login Debugging

## Quick Commands to Check Logs

### Option 1: If Using PM2 (Most Common)

```bash
# View all logs (real-time)
pm2 logs

# View only backend logs
pm2 logs backend

# View last 100 lines
pm2 logs backend --lines 100

# Follow logs in real-time (like tail -f)
pm2 logs backend --lines 0

# View logs without following
pm2 logs backend --nostream --lines 200

# Search for admin login logs
pm2 logs backend --lines 500 | grep "Admin Login"

# View error logs only
pm2 logs backend --err --lines 200
```

### Option 2: If Using systemd or Direct Node.js

```bash
# If running with systemd
sudo journalctl -u your-service-name -f

# If running directly with node
# Check if there's a log file
tail -f /path/to/your/logfile.log

# Or check stdout if redirected
tail -f /path/to/output.log
```

### Option 3: Check PM2 Process Info

```bash
# List all PM2 processes
pm2 list

# Show detailed info about backend process
pm2 show backend

# View process logs location
pm2 show backend | grep "log path"
```

---

## Real-Time Log Monitoring (Recommended)

### Watch Logs While Trying to Login

**Terminal 1 - Watch logs:**
```bash
# Follow logs in real-time
pm2 logs backend --lines 0

# OR if using direct node:
tail -f /path/to/logfile.log
```

**Then in your browser:**
- Try to login
- Watch the terminal for `[Admin Login]` messages

---

## Search for Specific Log Messages

### Find Admin Login Attempts

```bash
# Search for admin login logs
pm2 logs backend --lines 1000 | grep -i "admin login"

# Search for errors
pm2 logs backend --lines 1000 | grep -i "error"

# Search for purchase code issues
pm2 logs backend --lines 1000 | grep -i "purchase code"

# Search for JWT issues
pm2 logs backend --lines 1000 | grep -i "jwt"
```

### Save Logs to File for Analysis

```bash
# Save last 500 lines to file
pm2 logs backend --lines 500 > admin_login_debug.log

# Then view the file
cat admin_login_debug.log

# Or search in the file
grep "Admin Login" admin_login_debug.log
```

---

## Check Database - Verify Admin Account

### Connect to MongoDB

```bash
# Connect to MongoDB (adjust connection string)
mongosh "your_mongodb_connection_string"

# OR if MongoDB is local
mongosh
```

### MongoDB Queries to Check Admin

```javascript
// Switch to your database
use your_database_name

// Find admin by email
db.admins.find({ email: "your@email.com" })

// Check if admin exists
db.admins.countDocuments({ email: "your@email.com" })

// View all admins
db.admins.find().pretty()

// Check admin details (without password)
db.admins.findOne(
  { email: "your@email.com" },
  { email: 1, name: 1, purchaseCode: 1, createdAt: 1 }
)

// Check if purchase code is set
db.admins.findOne(
  { email: "your@email.com" },
  { purchaseCode: 1 }
)
```

---

## Complete Debugging Workflow

### Step 1: Clear Old Logs and Start Fresh

```bash
# Clear PM2 logs
pm2 flush

# Restart backend to start fresh
pm2 restart backend
```

### Step 2: Watch Logs in Real-Time

```bash
# In one terminal, watch logs
pm2 logs backend --lines 0
```

### Step 3: Try Login

- Go to admin login page
- Enter credentials
- Watch the terminal for logs

### Step 4: Check What You See

Look for these log messages:

```
[Admin Login] ========== LOGIN ATTEMPT ==========
[Admin Login] Request received
[Admin Login] Request body: { email: '...', hasPassword: true }
[Admin Login] Looking up admin with email: ...
[Admin Login] ✅ Admin found: ...
[Admin Login] Checking password...
[Admin Login] ✅ Password correct
[Admin Login] Validating purchase code: ...
[Admin Login] Purchase code validation result: true/false
[Admin Login] ✅ Purchase code valid
[Admin Login] Generating JWT token...
[Admin Login] ✅ Token generated successfully
[Admin Login] ========== LOGIN SUCCESS ==========
```

---

## Common Issues and What to Look For

### Issue 1: "Admin not found"
**Log shows:**
```
[Admin Login] ❌ Admin not found with email: your@email.com
```

**Check:**
```javascript
// In MongoDB
db.admins.find({ email: "your@email.com" })
```

### Issue 2: "Password doesn't match"
**Log shows:**
```
[Admin Login] ✅ Admin found
[Admin Login] ❌ Password mismatch
```

**Check:** Verify password is correct

### Issue 3: "Purchase code invalid"
**Log shows:**
```
[Admin Login] ✅ Password correct
[Admin Login] Validating purchase code: YOUR_CODE
[Admin Login] ⚠️  LiveUser validation error: ...
[Admin Login] ❌ Purchase code validation failed
```

**Check:**
- Internet connection (LiveUser needs network)
- Purchase code in database
- Purchase code service accessibility

### Issue 4: "JWT_SECRET missing"
**Log shows:**
```
[Admin Login] ❌ ERROR: JWT_SECRET not configured in .env
```

**Fix:**
```bash
# Add to .env file
echo "JWT_SECRET=your_secret_key_here" >> /path/to/backend/.env

# Restart backend
pm2 restart backend
```

---

## Quick One-Liner Commands

```bash
# See last 50 admin login attempts
pm2 logs backend --lines 500 | grep "Admin Login" | tail -50

# See all errors
pm2 logs backend --lines 1000 | grep -i "error\|❌\|failed"

# See successful logins
pm2 logs backend --lines 1000 | grep "LOGIN SUCCESS"

# See failed logins
pm2 logs backend --lines 1000 | grep "LOGIN ATTEMPT" -A 20 | grep -B 5 "❌"
```

---

## Check Environment Variables

```bash
# Check if JWT_SECRET is set (if using PM2)
pm2 show backend | grep JWT_SECRET

# Or check .env file
cat /path/to/backend/.env | grep JWT_SECRET

# Check all env variables
pm2 env backend
```

---

## Test API Directly from VPS

```bash
# Test login endpoint directly
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -H "key: YOUR_SECRET_KEY" \
  -d '{"email":"your@email.com","password":"your_password"}'

# This will show the exact response
```

---

## Save Full Debug Session

```bash
# 1. Clear logs
pm2 flush

# 2. Start logging to file
pm2 logs backend --lines 0 > /tmp/admin_login_debug_$(date +%Y%m%d_%H%M%S).log &

# 3. Try login in browser

# 4. Stop logging (Ctrl+C)

# 5. View the log file
cat /tmp/admin_login_debug_*.log
```

---

## Most Useful Command (Copy This!)

```bash
# Watch logs in real-time and filter for admin login
pm2 logs backend --lines 0 | grep --line-buffered "Admin Login"
```

This will show only admin login related messages in real-time!

---

## If You Can't Find Logs

```bash
# Find where PM2 stores logs
pm2 show backend | grep "log path"

# Or check PM2 default log location
ls -la ~/.pm2/logs/

# View all log files
ls -la ~/.pm2/logs/ | grep backend
```

---

## Summary - Quick Start

**1. Watch logs in real-time:**
```bash
pm2 logs backend --lines 0
```

**2. Try to login in browser**

**3. Look for `[Admin Login]` messages in terminal**

**4. Share the logs if you need help!**

The logs will show exactly where the login is failing! 🔍

