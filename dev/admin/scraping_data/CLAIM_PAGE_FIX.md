# Claim Page Connection Error Fix

## Issue
Users getting "Erreur de connexion" (Connection error) when trying to claim salon profile.

## Root Cause
The API routes were not mounted with `/api` prefix, causing the frontend to call `/api/salon/claim` but the route was actually at `/salon/claim`.

## Fix Applied

### 1. Updated Route Mounting (`dev/admin/backend/index.js`)
**Before:**
```javascript
app.use(indexRoute);
```

**After:**
```javascript
app.use("/api", indexRoute); // Mount all routes under /api prefix
```

### 2. Enhanced Error Logging (`dev/admin/backend/public/salon-claim.html`)
Added detailed console logging to help debug connection issues:
- Logs API URL being called
- Logs request details (token, email)
- Logs response status and data
- Better error messages

## Testing

1. **Check Browser Console:**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Try to claim salon
   - Check for error messages and API URL

2. **Verify API Endpoint:**
   - The endpoint should be: `https://skedisy.com/api/salon/claim`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body: `{ token, email, password }`

3. **Common Issues:**
   - **CORS Error**: Check if backend CORS is configured correctly
   - **404 Error**: Route not found - verify route mounting
   - **401/403 Error**: Authentication issue - claim endpoint should be public
   - **Network Error**: Backend server not running or unreachable

## Verification Steps

1. ✅ Routes now mounted at `/api` prefix
2. ✅ Claim endpoint accessible at `/api/salon/claim`
3. ✅ Enhanced error logging in place
4. ✅ Better error messages for users

## Next Steps if Still Failing

1. **Check Backend Logs:**
   ```bash
   # Check if request is reaching the server
   # Look for logs in backend console
   ```

2. **Test API Directly:**
   ```bash
   curl -X POST https://skedisy.com/api/salon/claim \
     -H "Content-Type: application/json" \
     -d '{"token":"test","email":"test@example.com","password":"test123"}'
   ```

3. **Check CORS Configuration:**
   - Verify `app.use(cors())` is in `index.js`
   - Check if CORS allows requests from your domain

4. **Verify Route Registration:**
   - Check `dev/admin/backend/route/salon/salon.route.js`
   - Verify `route.post("/claim", claimController.claimSalon);` exists
   - Ensure no `checkAccessWithSecretKey()` middleware on claim route

