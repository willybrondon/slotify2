# Salon Claim Fix - Removed /api Prefix

## Problem
After reverting the `/api` prefix from routes, the salon claim page was still calling `/api/salon/claim`, which resulted in a 404 error.

## Solution
Updated the salon claim page to call `/salon/claim` instead of `/api/salon/claim`.

## What Was Fixed

### 1. Salon Claim HTML File
**File:** `dev/admin/backend/public/salon-claim.html`

**Changed:**
```javascript
const apiURL = `${baseURL}/api/salon/claim`;
```

**To:**
```javascript
const apiURL = `${baseURL}/salon/claim`;
```

### 2. Inline HTML Fallback
**File:** `dev/admin/backend/index.js` (inline HTML fallback)

**Changed:**
```javascript
const apiURL = \`\${baseURL}/api/salon/claim\`;
```

**To:**
```javascript
const apiURL = \`\${baseURL}/salon/claim\`;
```

## How It Works Now

1. **Salon receives claim link:** `https://skedisy.com/salon/claim?token=...&email=...`
2. **Page loads:** `/salon/claim` route serves the HTML page
3. **User submits form:** JavaScript calls `/salon/claim` (POST)
4. **Backend route:** `/salon/claim` (mounted via `route.use("/salon", salon)`)
5. **✅ It works!**

## Route Structure

- **Route mounting:** `app.use(indexRoute)` (no `/api` prefix)
- **Salon routes:** `route.use("/salon", salon)` in `route/index.js`
- **Claim endpoint:** `route.post("/claim", claimController.claimSalon)` in `route/salon/salon.route.js`
- **Final endpoint:** `/salon/claim` ✅

## Testing

1. **Send claim invitation** from admin panel
2. **Click the link** in the email
3. **Fill the form** (email, password, confirm password)
4. **Submit** - should work without connection error ✅

## Next Steps

1. **Restart backend** (if needed):
   ```bash
   pm2 restart backend
   ```

2. **Test the claim flow:**
   - Send invitation to a salon
   - Click the claim link
   - Fill the form
   - Should successfully claim the salon

---

**The salon claim feature should now work correctly!** ✅

