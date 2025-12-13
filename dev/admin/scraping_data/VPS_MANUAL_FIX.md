# Manual Fix on VPS - Update baseURL and Rebuild

## The Problem
The `install.sh` script already ran and set `baseURL = "http://$public_ip:5000/"` in the built frontend. This causes API calls to go to the wrong endpoint.

## Quick Fix (3 Options)

### Option 1: Use the Fix Script (Easiest)

**On your VPS, run:**
```bash
# Download and run the fix script
cd /home/admin
wget https://raw.githubusercontent.com/your-repo/path/to/FIX_BASEURL_ON_VPS.sh
# OR copy the script content and create it manually

chmod +x FIX_BASEURL_ON_VPS.sh
./FIX_BASEURL_ON_VPS.sh
```

### Option 2: Manual Fix (Step by Step)

**On your VPS, run these commands:**

```bash
# 1. Update config.js
cd /home/admin/frontend/src/util
cat > config.js << 'EOF'
export const baseURL = "/api";
export const secretKey = "YOUR_SECRET_KEY_HERE";
export const projectName = "YOUR_APP_NAME_HERE";
EOF

# Replace YOUR_SECRET_KEY_HERE and YOUR_APP_NAME_HERE with actual values
# Or get them from the existing config:
# cat config.js  # to see current values

# 2. Rebuild frontend
cd /home/admin/frontend
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
npm run build

# 3. Copy build to backend public
sudo rm -rf /home/admin/backend/public/*
sudo mv /home/admin/frontend/build/* /home/admin/backend/public/

# 4. Restart backend
pm2 restart backend
```

### Option 3: Quick One-Liner

**If you know your secret key and project name:**

```bash
cd /home/admin/frontend/src/util && \
cat > config.js << EOF
export const baseURL = "/api";
export const secretKey = "5TIvw5cpc0";
export const projectName = "skedisy";
EOF
cd /home/admin/frontend && \
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin" && \
npm run build && \
sudo rm -rf /home/admin/backend/public/* && \
sudo mv /home/admin/frontend/build/* /home/admin/backend/public/ && \
pm2 restart backend
```

## Verify the Fix

### 1. Check config.js
```bash
cat /home/admin/frontend/src/util/config.js
```

Should show:
```javascript
export const baseURL = "/api";
```

### 2. Check built files
```bash
# Search for baseURL in built JavaScript
grep -r 'baseURL' /home/admin/backend/public/static/js/ | head -1
```

Should show `/api` not the full URL.

### 3. Test login
Try logging in and check logs:
```bash
pm2 logs backend --lines 0
```

Should see:
```
POST /api/admin/login 200 ... ✅
```

Instead of:
```
POST /admin/login 404 ... ❌
```

## Why This Happened

1. ✅ We updated `config.js` in the source code to `/api`
2. ✅ We updated `install.sh` to set `/api` for future builds
3. ❌ But the **existing build on VPS** still has the old config from when install.sh ran before

## After the Fix

- Login should work ✅
- All API calls will use `/api` prefix ✅
- Future installs will use the correct baseURL ✅

---

**Run the manual fix commands above on your VPS to resolve the 404 error!**

