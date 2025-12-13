# Frontend Rebuild Instructions - Fix 404 Login Error

## Problem
The logs show `POST /admin/login 404` even though we fixed the baseURL. This means the frontend build hasn't been updated yet.

## Solution: Rebuild Frontend

### Step 1: Navigate to Frontend Directory
```bash
cd dev/admin/frontend
```

### Step 2: Install Dependencies (if needed)
```bash
npm install
```

### Step 3: Build the Frontend
```bash
npm run build
```

This will create a new `build` folder with the updated code.

### Step 4: Copy Build to Backend Public Folder
The backend serves the frontend from `dev/admin/backend/public`. You need to copy the build files there.

**Option A: If using a build script or deployment process:**
```bash
# From frontend directory
cp -r build/* ../backend/public/
```

**Option B: Manual copy (on VPS):**
```bash
# Remove old build
rm -rf /path/to/backend/public/*

# Copy new build
cp -r /path/to/frontend/build/* /path/to/backend/public/
```

### Step 5: Restart Backend
```bash
pm2 restart backend
```

### Step 6: Clear Browser Cache
- **Chrome/Edge:** Press `Ctrl+Shift+Delete` → Clear cached images and files
- **Firefox:** Press `Ctrl+Shift+Delete` → Clear cache
- **Or:** Hard refresh with `Ctrl+F5` or `Ctrl+Shift+R`

### Step 7: Test Login
Try logging in again. The logs should now show:
```
POST /api/admin/login 200 ... ✅
```

Instead of:
```
POST /admin/login 404 ... ❌
```

## Quick Verification

After rebuilding, check the browser's Network tab (F12):
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the login request
5. It should show: `POST /api/admin/login` ✅

## If Still Not Working

### Check Build Output
```bash
# Verify the build was created
ls -la dev/admin/frontend/build/

# Check if public folder has new files
ls -la dev/admin/backend/public/
```

### Check Browser Console
Open browser DevTools (F12) → Console tab
- Look for any errors
- Check if the API call shows the correct URL

### Verify baseURL in Built Code
```bash
# Search for baseURL in the built JavaScript
grep -r "baseURL" dev/admin/backend/public/static/js/ | head -5
```

It should show `/api` not empty string.

## Alternative: Development Mode

If you're running in development mode (not production build):

```bash
cd dev/admin/frontend
npm start
```

This will run the frontend on a different port (usually 3000) and will use the updated code immediately without needing to rebuild.

---

**The key is: After changing `config.js`, you MUST rebuild the frontend for the changes to take effect!**

