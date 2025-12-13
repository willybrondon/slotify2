# Admin Login Troubleshooting Guide

## Problem
Admin login shows "something went wrong" error even with correct credentials.

## What I Fixed

### 1. Replaced Obfuscated Code
The admin login code was obfuscated (hard to read/debug). I've replaced it with clear, readable code with detailed logging.

### 2. Added Detailed Logging
Now the backend will log:
- Login attempt with email
- Whether admin is found
- Password check result
- Purchase code validation
- JWT token generation
- Any errors with details

### 3. Better Error Messages
- Clear error messages for each failure point
- JWT_SECRET validation
- Purchase code validation errors

## How to Debug

### Step 1: Check Backend Logs
When you try to login, check your backend console/terminal. You should see logs like:

```
[Admin Login] Attempting login...
[Admin Login] Request body: { email: '...', hasPassword: true, hasBody: true }
[Admin Login] Validation: { hasBody: true, hasEmail: true, hasPassword: true }
[Admin Login] Looking up admin with email: your@email.com
[Admin Login] Admin found, checking password...
[Admin Login] Password correct, validating purchase code...
[Admin Login] Purchase code: YOUR_CODE
[Admin Login] Purchase code validation result: true/false
```

### Step 2: Common Issues

#### Issue 1: "Admin does not found"
**Cause:** Email doesn't exist in database
**Solution:** 
- Check if admin exists: `db.admins.find({ email: "your@email.com" })`
- Verify email spelling

#### Issue 2: "Password doesn't match"
**Cause:** Wrong password
**Solution:**
- Verify password is correct
- Check if password was encrypted correctly in database

#### Issue 3: "Purchase code is not valid"
**Cause:** Purchase code validation failed (LiveUser function)
**Solution:**
- Check if purchase code is correct in database
- Verify internet connection (LiveUser might need to validate online)
- Check if purchase code service is accessible

#### Issue 4: "JWT_SECRET missing"
**Cause:** JWT_SECRET not set in .env
**Solution:**
- Add `JWT_SECRET=your_secret_key` to `.env` file
- Restart backend server

#### Issue 5: "Something went wrong" (Generic Error)
**Cause:** Unexpected error in try-catch
**Solution:**
- Check backend logs for detailed error
- Look for error stack trace
- Common causes:
  - Database connection issue
  - Missing environment variables
  - Network issue with LiveUser validation

## Quick Fixes

### Fix 1: Check Environment Variables
```bash
# In your .env file, make sure you have:
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

### Fix 2: Verify Admin Exists
```javascript
// In MongoDB shell
use your_database
db.admins.find({ email: "your@email.com" })
```

### Fix 3: Check Purchase Code
```javascript
// In MongoDB shell
db.admins.findOne({ email: "your@email.com" }, { purchaseCode: 1 })
```

### Fix 4: Test API Directly
```bash
curl -X POST https://skedisy.com/api/admin/login \
  -H "Content-Type: application/json" \
  -H "key: YOUR_SECRET_KEY" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

## Next Steps

1. **Restart Backend Server:**
   ```bash
   pm2 restart backend
   # or restart your Node.js server
   ```

2. **Try Login Again:**
   - Check backend console for detailed logs
   - Look for specific error messages

3. **Check Backend Logs:**
   - The new code will show exactly where it's failing
   - Look for `[Admin Login]` log messages

4. **Share Error Details:**
   - Copy the exact error from backend logs
   - Check which step failed (admin lookup, password, purchase code, token)

## Expected Log Output

**Successful Login:**
```
[Admin Login] Attempting login...
[Admin Login] Request body: { email: 'admin@example.com', hasPassword: true }
[Admin Login] Validation: { hasBody: true, hasEmail: true, hasPassword: true }
[Admin Login] Looking up admin with email: admin@example.com
[Admin Login] Admin found, checking password...
[Admin Login] Password correct, validating purchase code...
[Admin Login] Purchase code: CODE123
[Admin Login] Purchase code validation result: true
[Admin Login] Purchase code valid, generating token...
[Admin Login] Token generated successfully
```

**Failed Login (Example):**
```
[Admin Login] Attempting login...
[Admin Login] Request body: { email: 'admin@example.com', hasPassword: true }
[Admin Login] Validation: { hasBody: true, hasEmail: true, hasPassword: true }
[Admin Login] Looking up admin with email: admin@example.com
[Admin Login] Admin not found with email: admin@example.com
```

## If Still Not Working

1. **Check Backend Console:**
   - Look for `[Admin Login]` messages
   - Find the exact error

2. **Verify Route:**
   - Endpoint should be: `POST /api/admin/login`
   - Requires `key` header with secret key

3. **Check Network:**
   - Open browser DevTools (F12)
   - Network tab → Try login
   - Check the API request/response
   - Look for error status codes

4. **Database Check:**
   - Verify admin exists
   - Check password is encrypted
   - Verify purchase code

The detailed logging will now show you exactly what's failing!

