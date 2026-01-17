# Twilio SMS Setup for Cameroon (+237)

## Problem
Twilio requires explicit geo-permissions to send SMS to certain countries. By default, SMS to Cameroon (+237) is **not enabled** and will result in this error:

```
Permission to send an SMS has not been enabled for the region indicated by the 'To' number: +23769034XXXX
```

## Solution: Enable Cameroon SMS Permissions in Twilio

### Step 1: Access Twilio Console
1. Log in to your Twilio account: https://console.twilio.com
2. Make sure you're logged into the correct account (the one with your `TWILIO_ACCOUNT_SID`)

### Step 2: Navigate to Geo Permissions
1. Click on **Settings** in the left sidebar
2. Click on **Geo Permissions** (or go directly to: https://console.twilio.com/us1/develop/settings/geo-permissions)
3. This page shows all countries and their SMS/Voice permissions

### Step 3: Enable SMS for Cameroon
1. Find **Cameroon** in the list (search for "Cameroon" or filter by country code +237)
2. Check the **SMS** checkbox for Cameroon
3. Click **Save** or **Update Permissions**

### Step 4: Account Verification (If Required)
⚠️ **Important**: Twilio may require account verification before enabling SMS to Cameroon:

1. Twilio might ask you to verify your account
2. You may need to provide business information
3. Some countries require additional verification documents
4. Follow Twilio's prompts to complete verification

### Step 5: Wait for Activation
- Geo permissions are usually activated **immediately**
- Some countries may take up to 24-48 hours
- You'll receive a confirmation email from Twilio

### Step 6: Test SMS to Cameroon
After enabling permissions, test sending an SMS:

```bash
# Check logs to see if SMS is now working
pm2 logs | grep "Cameroon\|+237"
```

## Alternative: Use Alphanumeric Sender ID (Recommended for Cameroon)
Some African countries work better with Alphanumeric Sender IDs instead of phone numbers:

1. In Twilio Console, go to **Phone Numbers > Manage > Alphanumeric Sender IDs**
2. Request an Alphanumeric Sender ID (e.g., "SKEDISY")
3. This may require approval from the carrier
4. Update `TWILIO_PHONE_NUMBER` in `.env` to use the Alphanumeric Sender ID

**Note**: Alphanumeric Sender IDs work only for one-way SMS (you can't receive replies).

## Current Status in Code

The code now detects permission errors and provides helpful log messages:

```
[SMS Service] ❌ SMS permission error for +237690343431:
[SMS Service] ⚠️  Twilio does not have permission to send SMS to Cameroon (+237).
[SMS Service] 📋 To enable SMS to Cameroon (+237):
[SMS Service]    1. Log in to Twilio Console: https://console.twilio.com
[SMS Service]    2. Go to Settings > Geo Permissions
[SMS Service]    3. Enable SMS permissions for the required country
[SMS Service]    4. Note: Some countries require account verification
```

## Troubleshooting

### Error Still Appears After Enabling
1. **Wait 24 hours**: Some permissions take time to propagate
2. **Check account status**: Ensure your Twilio account is fully verified
3. **Clear cache**: Restart your Node.js application after enabling permissions
4. **Verify credentials**: Ensure you're using the correct Twilio account credentials

### Account Verification Issues
- Twilio may require business verification for certain countries
- Contact Twilio support if verification is taking too long
- Some countries have restrictions that can't be enabled easily

### Check Current Permissions
You can check which countries are enabled via Twilio API:
```bash
curl -X GET 'https://accounts.twilio.com/v1/RegulatoryCompliance/GeoPermissions' \
  -u 'YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'
```

## Cost Considerations
- Enabling SMS to Cameroon may have different pricing
- Check Twilio pricing page: https://www.twilio.com/sms/pricing/cameroon
- Make sure your account has sufficient balance

## Support
- Twilio Support: https://support.twilio.com
- Twilio Console: https://console.twilio.com
- This app will continue to work for other countries (e.g., France +33) even if Cameroon is not enabled

---

**Last Updated**: 2024
**Affected Countries**: Cameroon (+237), and potentially other African countries

