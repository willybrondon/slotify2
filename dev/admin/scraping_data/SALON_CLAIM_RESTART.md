# Salon Claim - Restart Required

## Problem
The logs show `POST /api/salon/claim 404` even though we fixed the code. This is because the backend needs to be restarted to serve the updated inline HTML.

## Solution
**Restart the backend server** to load the updated code.

## Steps to Fix

### On Your VPS:

```bash
# Restart backend
pm2 restart backend

# Check logs to verify
pm2 logs backend --lines 0
```

### After Restart:

1. **Clear browser cache** (important!):
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - OR use hard refresh: `Ctrl+F5`

2. **Test the claim flow again:**
   - Click the claim link from email
   - Fill the form
   - Submit

3. **Check backend logs:**
   ```bash
   pm2 logs backend --lines 0
   ```

   You should now see:
   ```
   POST /salon/claim 200 ... ✅
   ```

   Instead of:
   ```
   POST /api/salon/claim 404 ... ❌
   ```

## Why This Happened

The inline HTML is generated **dynamically** by the backend code. When you update `index.js`, the backend needs to restart to:
1. Load the new code
2. Serve the updated inline HTML with the correct `/salon/claim` URL

## Verification

After restarting, the inline HTML will have:
```javascript
const apiURL = `${baseURL}/salon/claim`;  // ✅ Correct
```

Instead of:
```javascript
const apiURL = `${baseURL}/api/salon/claim`;  // ❌ Old (cached)
```

## Additional Debugging

I've added console.log statements to the inline HTML. After restarting, you can:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to claim the salon
4. You'll see logs showing the exact API URL being called

This will help verify the fix is working.

---

**Restart the backend and clear browser cache, then test again!** ✅

