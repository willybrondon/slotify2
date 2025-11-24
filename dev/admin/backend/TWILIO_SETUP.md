# Twilio SMS Setup Instructions

## Important: Fix Your .env File Format

Your current .env file has formatting issues. Here's what needs to be fixed:

### ❌ WRONG Format (with spaces and semicolon):
```
TWILIO_ACCOUNT_SID =ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER = +1234567890;
```
### ✅ CORRECT Format (no spaces, no semicolons):
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Steps to Fix:

1. **Edit your .env file on the VPS** and remove:
   - Spaces around the `=` sign
   - The semicolon `;` at the end of TWILIO_PHONE_NUMBER

2. **Your corrected .env should look like this (replace with your actual credentials):**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

3. **Restart your Node.js server** after updating the .env file:
   ```bash
   pm2 restart all
   # or
   npm restart
   ```

## Testing the Configuration

After fixing the .env file, run the test script:

```bash
cd dev/admin/backend
node test-twilio.js
```

This will:
- Check if all credentials are loaded correctly
- Send a test SMS to your phone number (+337660394)
- Show you any errors if something is wrong

## Phone Number Format

Your phone number `+337660394` looks incomplete. French mobile numbers typically have 10 digits after the country code (+33).

If the test fails with "unverified number" error:
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers > Verified Caller IDs**
3. Add and verify your phone number `+337660394` (or the complete number)

## Trial Account Limitations

If you're using a Twilio trial account:
- You can only send SMS to **verified phone numbers**
- You need to verify your phone number in the Twilio Console first
- Once verified, SMS reminders will work for all users

## After Testing

Once the test SMS works:
1. ✅ Twilio is configured correctly
2. ✅ SMS reminders will be sent automatically via cron jobs
3. ✅ Users will receive reminders 24 hours and 2 hours before appointments

## Troubleshooting

**If test fails with "SMS service not configured":**
- Check .env file format (no spaces around =)
- Make sure .env file is in the `dev/admin/backend/` directory
- Restart the server after changing .env

**If test fails with "unverified number":**
- Verify your phone number in Twilio Console
- For trial accounts, you can only send to verified numbers

**If test fails with "invalid phone number":**
- Check phone number format (must start with +)
- French numbers: +33XXXXXXXXX (10 digits after +33)

