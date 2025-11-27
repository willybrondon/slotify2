# App Links / Universal Links Setup Guide

## Overview
This guide explains how to set up App Links (Android) and Universal Links (iOS) for salon sharing functionality.

## What's Already Implemented

✅ **Backend:**
- Web route for salon pages: `GET /salon/:salonId`
- API endpoint for share URLs: `GET /user/salon/getShareUrl?salonId={id}`
- Open Graph meta tags for Facebook preview
- App Links meta tags in HTML

✅ **Flutter App:**
- Share button on salon detail page
- Copy link functionality
- QR code generation
- Deep link handling in app

✅ **Android Configuration:**
- App Links intent filters in AndroidManifest.xml
- Custom scheme intent filter

✅ **iOS Configuration:**
- URL scheme in Info.plist
- Associated domains configured

## What You Need to Do

### Step 1: Get Your App Signing Certificate Fingerprint (Android)

**For Debug Build:**
```bash
# On Windows (PowerShell)
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# Look for "SHA256:" in the output
```

**For Release Build:**
```bash
# Use your release keystore
keytool -list -v -keystore path/to/your/release.keystore -alias your-key-alias
```

**Copy the SHA256 fingerprint** (it looks like: `AA:BB:CC:DD:...`)

### Step 2: Update assetlinks.json

1. Open: `dev/admin/backend/public/.well-known/assetlinks.json`
2. Replace `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA256 fingerprint
3. Remove the colons (`:`) from the fingerprint
   - Example: `AA:BB:CC:DD` becomes `AABBCCDD`

### Step 3: Get Your iOS Team ID (iOS)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Find your Team ID (looks like: `ABC123DEF4`)
3. Open: `dev/admin/backend/public/.well-known/apple-app-site-association`
4. Replace `TEAM_ID` with your actual Team ID
   - Example: `ABC123DEF4.com.skedisy.customer`

### Step 4: Deploy Files to Server

**Important:** These files MUST be accessible at:
- `https://skedisy.com/.well-known/assetlinks.json`
- `https://skedisy.com/.well-known/apple-app-site-association`

**Option A: If backend serves static files from `public` folder:**
- The files are already in `dev/admin/backend/public/.well-known/`
- Make sure your server serves the `public` folder at the root
- Files should be accessible at the URLs above

**Option B: If you use a separate web server (nginx, Apache):**
- Copy the `.well-known` folder to your web server's public directory
- Ensure the files are served with correct content types:
  - `assetlinks.json`: `application/json`
  - `apple-app-site-association`: `application/json` (NOT `text/plain`)

### Step 5: Verify Files Are Accessible

Test these URLs in your browser:
- `https://skedisy.com/.well-known/assetlinks.json` - Should show JSON
- `https://skedisy.com/.well-known/apple-app-site-association` - Should show JSON

**Important for iOS:**
- The `apple-app-site-association` file MUST be served over HTTPS
- Content-Type MUST be `application/json` (not `text/plain`)
- File must be accessible without redirects

### Step 6: Build and Test

**Android:**
1. Build your APK/AAB
2. Install on device
3. Test link: `https://skedisy.com/salon/{salonId}`
4. Should open directly in app

**iOS:**
1. Build your app
2. Install on device
3. Test link: `https://skedisy.com/salon/{salonId}`
4. Should open directly in app

## Testing Without Full Setup

### What Works Now (Without Server Files):

✅ **Custom Scheme Links:**
- `slotify://salon/{salonId}` - Works immediately
- Can be tested by typing in browser or using ADB

✅ **Share Functionality:**
- Share button works
- Copy link works
- QR code generation works
- Links can be shared on Facebook

✅ **Web Pages:**
- Salon web pages work
- Facebook preview works
- Links open website if app not installed

### What Needs Server Files:

❌ **App Links (Android):**
- `https://skedisy.com/salon/{salonId}` won't open app automatically
- Will open website instead
- Need `assetlinks.json` on server

❌ **Universal Links (iOS):**
- `https://skedisy.com/salon/{salonId}` won't open app automatically
- Will open website instead
- Need `apple-app-site-association` on server

## Quick Test (Before Full Setup)

You can test these right now:

1. **Custom Scheme (Works Now):**
   ```bash
   # Android
   adb shell am start -a android.intent.action.VIEW -d "slotify://salon/YOUR_SALON_ID"
   
   # iOS Simulator
   xcrun simctl openurl booted "slotify://salon/YOUR_SALON_ID"
   ```

2. **Share Button:**
   - Open salon detail page
   - Click share button
   - Copy link
   - Paste in browser - should show salon page

3. **QR Code:**
   - Click share button → Show QR Code
   - Scan with phone - should open link

## After Server Files Are Deployed

Once the `.well-known` files are on your server:

1. **Android App Links:**
   - Wait 20 minutes for Google to verify
   - Test: `https://skedisy.com/salon/{salonId}`
   - Should open app directly

2. **iOS Universal Links:**
   - Test immediately
   - Test: `https://skedisy.com/salon/{salonId}`
   - Should open app directly

## Troubleshooting

### Android App Links Not Working:
- Check `assetlinks.json` is accessible
- Verify SHA256 fingerprint is correct
- Wait 20 minutes after deployment
- Use: `adb shell pm get-app-links com.skedisy.customer` to check

### iOS Universal Links Not Working:
- Check `apple-app-site-association` is accessible
- Verify Content-Type is `application/json`
- Check Team ID is correct
- File must be served over HTTPS

## Summary

**You can build and test now:**
- ✅ Custom scheme links work
- ✅ Share functionality works
- ✅ QR codes work
- ✅ Web pages work

**After deploying server files:**
- ✅ App Links will work (Android)
- ✅ Universal Links will work (iOS)
- ✅ HTTPS links will open app directly

**Next Steps:**
1. Get SHA256 fingerprint (Android)
2. Get Team ID (iOS)
3. Update the `.well-known` files
4. Deploy to server
5. Build APK and test

