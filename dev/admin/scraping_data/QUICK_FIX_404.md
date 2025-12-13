# Quick Fix: 404 Login Error

## The Problem
Your logs show:
```
POST /admin/login 404 0.227 ms - 151
```

The frontend is still calling `/admin/login` instead of `/api/admin/login` because **the frontend hasn't been rebuilt** after we changed `baseURL`.

## The Fix (3 Steps)

### Step 1: Rebuild Frontend
```bash
cd dev/admin/frontend
npm run build
```

### Step 2: Copy Build to Backend Public
```bash
# From the frontend directory
cp -r build/* ../backend/public/
```

**OR if you're on VPS:**
```bash
# Find your paths and copy
rm -rf /path/to/backend/public/*
cp -r /path/to/frontend/build/* /path/to/backend/public/
```

### Step 3: Restart Backend & Clear Browser Cache
```bash
pm2 restart backend
```

Then in your browser:
- Press `Ctrl+Shift+Delete` → Clear cache
- OR Hard refresh: `Ctrl+F5`

## Verify It's Fixed

After rebuilding, try login again. Check logs:
```bash
pm2 logs backend --lines 0
```

You should see:
```
POST /api/admin/login 200 ... ✅
[Admin Login] ========== LOGIN ATTEMPT ==========
```

Instead of:
```
POST /admin/login 404 ... ❌
```

## Why This Happened

1. ✅ We changed `config.js` to set `baseURL = "/api"`
2. ✅ The source code is correct
3. ❌ But the **built JavaScript files** in `public/` still have the old `baseURL = ""`
4. ✅ After rebuilding, the new build will have `baseURL = "/api"`

## Quick Check: Is Build Updated?

Check if the build has the new baseURL:
```bash
# Search in built files
grep -r 'baseURL.*"/api"' dev/admin/backend/public/static/js/ | head -1
```

If you see `/api`, the build is updated! ✅

---

**TL;DR: Run `npm run build` in frontend folder, copy to backend/public, restart backend, clear browser cache!**

