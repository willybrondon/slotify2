# Fix .env File and Test Twilio SMS

## ⚠️ CRITICAL: Fix Your .env File Format on VPS

Your .env file has **formatting errors** that will prevent Twilio from working:

### Current (WRONG) Format:
```
TWILIO_ACCOUNT_SID =ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER = +1234567890;
```

**Problems:**
- ❌ Spaces around `=` sign
- ❌ Semicolon `;` at the end

### Correct Format:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Steps to Fix on VPS:

1. **SSH into your VPS**

2. **Navigate to backend directory:**
   ```bash
   cd /path/to/dev/admin/backend
   ```

3. **Edit the .env file:**
   ```bash
   nano .env
   # or
   vi .env
   ```

4. **Fix the Twilio lines** - Remove spaces and semicolon (replace with your actual credentials):
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Save and exit** (Ctrl+X, then Y, then Enter for nano)

6. **Restart your server:**
   ```bash
   pm2 restart all
   # or if using systemd
   sudo systemctl restart your-app-name
   ```

## Test Twilio Configuration:

1. **Upload the test script** (`test-twilio.js`) to your VPS in the `dev/admin/backend/` directory

2. **Run the test:**
   ```bash
   cd /path/to/dev/admin/backend
   node test-twilio.js
   ```

3. **Expected output if working:**
   ```
   === Testing Twilio SMS Configuration ===
   
   1. Checking Environment Variables:
      TWILIO_ACCOUNT_SID: ✓ Set
      TWILIO_AUTH_TOKEN: ✓ Set
      TWILIO_PHONE_NUMBER: ✓ Set (+1234567890)
   
   2. Testing SMS Send:
      From: +1234567890
      To: +337660394
   
   3. Sending test SMS...
   
   ✅ SUCCESS! Test SMS sent successfully!
      Message SID: SMxxxxxxxxxxxxx
      Status: queued
   
   📱 Check your phone (+337660394) for the test message.
   ```

## If Test Fails:

### Error: "SMS service not configured"
- ✅ Check .env file format (no spaces around =)
- ✅ Make sure .env is in correct directory
- ✅ Restart server after changing .env

### Error: "unverified number" or "The number +337660394 is unverified"
- This means your Twilio account is a **trial account**
- You need to verify your phone number first:
  1. Go to https://console.twilio.com/
  2. Navigate to **Phone Numbers > Verified Caller IDs**
  3. Click **Add a new Caller ID**
  4. Enter `+337660394` and verify it
  5. Run test again

### Error: "Invalid phone number"
- Check if your phone number format is correct
- French numbers: +33XXXXXXXXX (10 digits after +33)
- If `+337660394` doesn't work, try the full number: `+3376603940` (or whatever your complete number is)

## After Successful Test:

✅ Twilio is working correctly
✅ SMS reminders will be sent automatically
✅ Users will receive reminders 24h and 2h before appointments

## Verify Server Logs:

After restarting, check server logs for:
```
[SMS Service] ✓ Twilio SMS service is configured and ready
[SMS Service] Phone Number: +1234567890
```

If you see warnings instead, the .env file still has issues.

