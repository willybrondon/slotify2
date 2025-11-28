# How to Test Salon Sharing Links

## Prerequisites

1. **Build your app** (APK for Android or IPA for iOS)
2. **Install the app** on a device or emulator
3. **Have a salon ID** from your database

## Testing Methods

### Method 1: Test Custom Scheme Links (Works Immediately)

#### Android (Using ADB):

1. **Connect your device** via USB or use emulator
2. **Enable USB Debugging** on device
3. **Open terminal/command prompt**
4. **Run this command:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "slotify://salon/YOUR_SALON_ID"
   ```
   Replace `YOUR_SALON_ID` with an actual salon ID from your database

5. **Expected result:**
   - App should open
   - Should navigate directly to salon detail page

#### iOS (Using Simulator):

1. **Open iOS Simulator**
2. **Install your app** on simulator
3. **Open Safari** in simulator
4. **Type in address bar:**
   ```
   slotify://salon/YOUR_SALON_ID
   ```
5. **Press Enter**
6. **Expected result:**
   - App should open
   - Should navigate to salon detail page

#### Manual Test (Any Device):

1. **Open any browser** on your phone
2. **Type in address bar:**
   ```
   slotify://salon/YOUR_SALON_ID
   ```
3. **Press Go**
4. **Expected result:**
   - App should open (if installed)
   - Or show "Cannot open" message (if app not installed)

---

### Method 2: Test Share Button in App

1. **Open your app**
2. **Navigate to any salon detail page**
3. **Click the share button** (top right corner, share icon)
4. **You'll see a menu with options:**
   - **Share Link** - Opens native share dialog
   - **Copy Link** - Copies link to clipboard
   - **Show QR Code** - Shows QR code dialog

5. **Test each option:**
   - **Share Link:** Share via WhatsApp, SMS, Email, etc.
   - **Copy Link:** Paste in browser to verify link works
   - **Show QR Code:** Scan with another phone to test

---

### Method 3: Test QR Code

1. **Open salon detail page in app**
2. **Click share button → Show QR Code**
3. **QR code dialog appears**
4. **Scan with another phone:**
   - Use any QR code scanner app
   - Or use phone's built-in camera (if supported)
5. **Expected result:**
   - Should open link in browser
   - If app installed: Should open app
   - If app not installed: Should open website

---

### Method 4: Test Web Pages

1. **Get a salon share URL:**
   - Use share button → Copy Link
   - Or construct manually: `https://skedisy.com/salon/YOUR_SALON_ID`

2. **Open in browser:**
   - Paste link in any browser
   - Or share link and click it

3. **Expected result:**
   - Should show salon web page
   - Should display salon name, image, description
   - Should have "Open in Skedisy App" button

4. **Test on Facebook:**
   - Share link on Facebook
   - Facebook should show preview card with:
     - Salon image
     - Salon name
     - Description
   - Click link → Opens web page

---

### Method 5: Test App Links (After Server Setup)

**Note:** This only works after you:
- Update `assetlinks.json` with SHA256 fingerprint
- Update `apple-app-site-association` with Team ID
- Deploy files to server

#### Android App Links:

1. **Verify App Links are configured:**
   ```bash
   adb shell pm get-app-links com.skedisy.customer
   ```
   Should show your domain: `skedisy.com`

2. **Test link:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://skedisy.com/salon/YOUR_SALON_ID"
   ```
   Or open in browser on device

3. **Expected result:**
   - Should open app directly (not browser)
   - Should navigate to salon detail page

#### iOS Universal Links:

1. **Open link in Safari:**
   ```
   https://skedisy.com/salon/YOUR_SALON_ID
   ```

2. **Expected result:**
   - Should open app directly (not Safari)
   - Should navigate to salon detail page

3. **Or share link:**
   - Share via Messages, WhatsApp, etc.
   - Click link → Should open app

---

## Quick Test Checklist

### ✅ Can Test Now (No Server Setup Needed):

- [ ] Custom scheme: `slotify://salon/{id}` opens app
- [ ] Share button works
- [ ] Copy link works
- [ ] QR code generates
- [ ] Web page shows: `https://skedisy.com/salon/{id}`
- [ ] Facebook preview works (when sharing link)

### ⏳ Need Server Setup:

- [ ] App Links work: `https://skedisy.com/salon/{id}` opens app (Android)
- [ ] Universal Links work: `https://skedisy.com/salon/{id}` opens app (iOS)

---

## Troubleshooting

### Custom Scheme Not Working:

**Android:**
- Check AndroidManifest.xml has intent filter
- Verify package name matches: `com.skedisy.customer`
- Try: `adb shell pm query-activities -a android.intent.action.VIEW -d slotify://salon/test`

**iOS:**
- Check Info.plist has URL scheme: `slotify`
- Verify bundle ID matches: `com.skedisy.customer`

### Share Button Not Working:

- Check if `share_plus` package is installed: `flutter pub get`
- Check app logs for errors
- Verify salon ID is not null

### QR Code Not Showing:

- Check if `qr_flutter` package is installed: `flutter pub get`
- Check app logs for errors
- Verify share URL is generated successfully

### Web Page Not Loading:

- Check backend is running
- Verify route: `GET /salon/:salonId` exists
- Check salon exists in database
- Verify `baseURL` in `.env` is correct

### App Links Not Working:

- Verify `.well-known` files are on server
- Check files are accessible: `https://skedisy.com/.well-known/assetlinks.json`
- Verify SHA256 fingerprint is correct (Android)
- Verify Team ID is correct (iOS)
- Wait 20 minutes after deploying files (Android)

---

## Example Test Commands

### Get Salon ID from Database:

```bash
# Connect to MongoDB and get a salon ID
# Or use your admin panel to find a salon ID
```

### Test Custom Scheme (Android):

```bash
# Replace SALON_ID with actual ID
adb shell am start -a android.intent.action.VIEW -d "slotify://salon/507f1f77bcf86cd799439011"
```

### Test Custom Scheme (iOS Simulator):

```bash
xcrun simctl openurl booted "slotify://salon/507f1f77bcf86cd799439011"
```

### Test Web Page:

Open in browser:
```
https://skedisy.com/salon/507f1f77bcf86cd799439011
```

---

## Step-by-Step Testing Guide

### 1. Basic Functionality Test:

1. **Open app** → Go to salon detail page
2. **Click share button** → Should show menu
3. **Click "Copy Link"** → Should copy link
4. **Paste in browser** → Should show salon web page
5. **Click "Show QR Code"** → Should show QR code
6. **Scan QR code** → Should open link

### 2. Deep Link Test:

1. **Get salon ID** from your database
2. **Test custom scheme:**
   - Android: Use ADB command
   - iOS: Type in Safari
3. **Verify app opens** to correct salon

### 3. Share Test:

1. **Click share button** → "Share Link"
2. **Share via WhatsApp/SMS**
3. **Open link on another device**
4. **Verify it works**

### 4. Facebook Test:

1. **Copy salon link**
2. **Paste on Facebook** (as a post or message)
3. **Verify preview card appears** (image, title, description)
4. **Click link** → Should open web page or app

---

## Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Custom Scheme | App opens directly to salon |
| Share Button | Menu appears with options |
| Copy Link | Link copied to clipboard |
| QR Code | QR code displays, scannable |
| Web Page | Salon page loads in browser |
| Facebook Share | Preview card appears |
| App Links (after setup) | HTTPS link opens app directly |

---

## Need Help?

If something doesn't work:
1. Check app logs for errors
2. Check backend logs for errors
3. Verify all packages are installed: `flutter pub get`
4. Verify backend is running
5. Check network connectivity

