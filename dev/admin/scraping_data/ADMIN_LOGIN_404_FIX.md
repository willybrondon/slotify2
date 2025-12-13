# Admin Login 404 Error - Fixed!

## Problem
The logs showed:
```
POST /admin/login 404 0.305 ms - 151
```

The frontend was calling `/admin/login` but the backend routes are mounted under `/api`, so the endpoint should be `/api/admin/login`.

## Root Cause
The `baseURL` in `dev/admin/frontend/src/util/config.js` was set to an empty string `""`, so all API calls were relative paths without the `/api` prefix.

## What I Fixed

### 1. Updated baseURL Configuration
**File:** `dev/admin/frontend/src/util/config.js`

**Changed:**
```javascript
export const baseURL = "";  // ❌ Empty - causes 404
```

**To:**
```javascript
export const baseURL = "/api";  // ✅ Correct - adds /api prefix
```

### 2. Fixed Direct Axios Call in App.js
**File:** `dev/admin/frontend/src/App.js`

**Changed:**
```javascript
axios.get("admin/login/login")  // ❌ Missing /api prefix
```

**To:**
```javascript
axios.get("/api/admin/login/login")  // ✅ Correct path
```

## How It Works Now

### Before (Broken):
- Frontend calls: `apiInstance.post("admin/login", payload)`
- With `baseURL = ""`, this becomes: `/admin/login`
- Backend route is: `/api/admin/login`
- Result: **404 Not Found** ❌

### After (Fixed):
- Frontend calls: `apiInstance.post("admin/login", payload)`
- With `baseURL = "/api"`, this becomes: `/api/admin/login`
- Backend route is: `/api/admin/login`
- Result: **200 OK** ✅

## What to Do Now

### Step 1: Rebuild Frontend
```bash
cd dev/admin/frontend
npm run build
```

### Step 2: Restart Backend (if needed)
```bash
pm2 restart backend
```

### Step 3: Try Login Again
1. Go to admin login page
2. Enter credentials
3. Should work now! ✅

### Step 4: Check Logs
```bash
pm2 logs backend --lines 0
```

You should now see:
```
POST /api/admin/login 200 ... ✅
```

Instead of:
```
POST /admin/login 404 ... ❌
```

## Verification

After the fix, when you try to login, the backend logs should show:

```
[Admin Login] ========== LOGIN ATTEMPT ==========
[Admin Login] Request received
[Admin Login] Looking up admin with email: your@email.com
[Admin Login] ✅ Admin found
[Admin Login] ✅ Password correct
[Admin Login] ✅ Purchase code valid
[Admin Login] ✅ Token generated successfully
[Admin Login] ========== LOGIN SUCCESS ==========
```

And the HTTP status should be `200` instead of `404`!

## Note

All other API calls in the frontend will now automatically use the `/api` prefix because they all use `apiInstance` which uses the `baseURL` from config. This is the correct behavior since all backend routes are mounted under `/api`.

---

**The login should work now!** 🎉

