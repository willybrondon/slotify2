# How to Get Your Apple Developer Team ID

## Method 1: From Apple Developer Portal (Easiest)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Sign in with your Apple Developer account
3. Look at the top right corner - you'll see your **Team ID**
   - It looks like: `ABC123DEF4` (10 characters, letters and numbers)
4. Copy this Team ID

## Method 2: From Xcode

1. Open your project in Xcode
2. Select your project in the navigator
3. Go to **Signing & Capabilities** tab
4. Look for **Team** - the Team ID is shown next to your team name
   - Format: `Team Name (ABC123DEF4)`
5. Copy the Team ID part (the part in parentheses)

## Method 3: From App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in
3. Go to **Users and Access** → **Keys**
4. Your Team ID is displayed at the top

## Method 4: From Your Existing App

If you already have an app published:
1. Check your App Store Connect account
2. Team ID is shown in the URL or account settings

## Update the File

Once you have your Team ID (e.g., `ABC123DEF4`):

1. Open: `dev/admin/backend/public/.well-known/apple-app-site-association`
2. Replace `TEAM_ID` with your actual Team ID
3. Example: `"appID": "ABC123DEF4.com.skedisy.customer"`

## Important Notes

- Team ID is **case-sensitive**
- It's always 10 characters (letters and numbers)
- No spaces or special characters
- Format: `TEAM_ID.com.skedisy.customer`

## If You Don't Have a Team ID Yet

If you haven't enrolled in Apple Developer Program:
1. You need to enroll first: [Apple Developer Program](https://developer.apple.com/programs/)
2. Cost: $99/year
3. After enrollment, you'll get your Team ID

## Testing Without Team ID

- Custom scheme links (`slotify://salon/{id}`) will still work
- Universal Links (`https://skedisy.com/salon/{id}`) will NOT work without Team ID
- You can test other features (share, QR code, web pages) without Team ID

