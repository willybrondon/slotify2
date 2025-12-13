# Install Script Fix - baseURL Configuration

## Problem
The `install.sh` script was overwriting `config.js` with:
```javascript
export const baseURL = "http://$public_ip:5000/";
```

This causes API calls to go to `http://IP:5000/admin/login` instead of `/api/admin/login`, resulting in 404 errors.

## Solution
Updated `install.sh` to set:
```javascript
export const baseURL = "/api";
```

This ensures all API calls use the correct `/api` prefix that matches the backend route structure.

## What Changed

**File:** `dev/install.sh` (line 163)

**Before:**
```bash
export const baseURL = "http://$public_ip:5000/";
```

**After:**
```bash
export const baseURL = "/api";
```

## Why This Works

1. The frontend is served from the same domain as the backend (through nginx proxy)
2. Using a relative path `/api` works correctly regardless of domain/IP
3. All backend routes are mounted under `/api` prefix
4. This matches the backend route structure: `/api/admin/login`

## Next Steps

### If install.sh runs automatically (CI/CD):
The next time the install script runs, it will automatically set the correct baseURL.

### If you need to fix it manually right now:

**On your VPS, run:**
```bash
# Update config.js
cd /home/admin/frontend/src/util
cat > config.js << EOF
export const baseURL = "/api";
export const secretKey = "YOUR_SECRET_KEY";
export const projectName = "YOUR_APP_NAME";
EOF

# Rebuild frontend
cd /home/admin/frontend
npm run build

# Copy to backend public
sudo rm -rf /home/admin/backend/public/*
sudo mv /home/admin/frontend/build/* /home/admin/backend/public/

# Restart backend
pm2 restart backend
```

### Verify the Fix

After rebuilding, check the built config:
```bash
# Check if baseURL is correct in built files
grep -r 'baseURL.*"/api"' /home/admin/backend/public/static/js/ | head -1
```

Then try login - it should work! ✅

---

**The install script is now fixed for future deployments!**

