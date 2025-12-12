# Email & SMS Troubleshooting Guide

## 🔍 Issue: "Invitation sent via email" but salon doesn't receive email

### Step 1: Check Backend Logs

When you click "Invite", check your backend console/terminal. You should see logs like:

```
[Claim Invitation] 📧 Attempting to send email:
   To: salon@example.com
   From: your-email@domain.com
   Salon: Salon Name (ID: ...)
   SendGrid API Key: Configured ✓
```

**If you see errors:**
- `SENDGRID_API_KEY not configured` → Add to `.env`
- `EMAIL (from address) not configured` → Add to `.env`
- `Salon email address not found` → Salon doesn't have email in database

---

### Step 2: Check .env Configuration

Open `dev/admin/backend/.env` and verify:

```env
# Required for Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL=noreply@yourdomain.com

# Optional for SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:**
- No spaces around `=`
- No quotes around values
- No semicolons at the end
- `EMAIL` must be a verified sender in SendGrid

---

### Step 3: Verify SendGrid Configuration

1. **Check SendGrid Account:**
   - Go to https://app.sendgrid.com
   - Check if API key is active
   - Check email quota/limits

2. **Verify Sender Email:**
   - Go to SendGrid → Settings → Sender Authentication
   - The `EMAIL` in `.env` must be verified
   - If using a new email, verify it first

3. **Check API Key Permissions:**
   - Go to SendGrid → Settings → API Keys
   - Ensure key has "Mail Send" permission
   - Ensure key is not expired

---

### Step 4: Check Email Address Format

The salon email must be:
- Valid format (e.g., `salon@example.com`)
- Not empty
- Not a temporary email (if using temp emails from import)

**Check in database:**
```javascript
db.salons.findOne({ name: "Salon Name" }, { email: 1 })
```

---

### Step 5: Check SendGrid Activity

1. Go to SendGrid Dashboard
2. Click "Activity" in sidebar
3. Look for recent email sends
4. Check status:
   - ✅ **Delivered** = Email sent successfully
   - ⚠️ **Bounced** = Email address invalid
   - ⚠️ **Blocked** = Email blocked by recipient
   - ⚠️ **Dropped** = SendGrid rejected (spam, etc.)

---

### Step 6: Common Issues & Solutions

#### Issue 1: "Email sent successfully" but not received

**Possible Causes:**
- Email went to spam folder
- Email address is invalid
- SendGrid sender not verified
- Rate limiting

**Solutions:**
1. Check spam/junk folder
2. Verify email address in database
3. Verify sender email in SendGrid
4. Check SendGrid activity dashboard

#### Issue 2: SendGrid API Error

**Error Messages:**
- `Unauthorized` → API key invalid
- `Forbidden` → API key doesn't have permission
- `Bad Request` → Email format invalid
- `Sender not verified` → From address not verified

**Solutions:**
1. Regenerate API key in SendGrid
2. Verify sender email address
3. Check API key permissions

#### Issue 3: SMS Not Sending

**Check:**
1. Twilio credentials in `.env`
2. Phone number format (should include country code, e.g., `+3367548980`)
3. Twilio account balance
4. Phone number is valid

---

### Step 7: Test Email Sending

Create a test script to verify email works:

```javascript
// test_email.js
require('dotenv').config({ path: './.env' });
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'your-test-email@example.com',
  from: process.env.EMAIL,
  subject: 'Test Email',
  html: '<p>This is a test email</p>',
};

sgMail.send(msg)
  .then(() => console.log('✅ Email sent!'))
  .catch(error => {
    console.error('❌ Error:', error.response?.body || error.message);
  });
```

Run: `node test_email.js`

---

### Step 8: Check Backend Console Output

After clicking "Invite", look for these logs in backend console:

**Success:**
```
[Claim Invitation] ✅ Email sent successfully!
   Status Code: 202
```

**Failure:**
```
[Claim Invitation] ❌ Email send FAILED:
   Error Message: [error details]
   SendGrid Response: [response body]
```

---

## 🔧 Quick Fixes

### Fix 1: Verify SendGrid API Key

1. Go to SendGrid → Settings → API Keys
2. Create new API key with "Full Access" or "Mail Send" permission
3. Copy key to `.env`: `SENDGRID_API_KEY=SG.xxxxx`
4. Restart backend server

### Fix 2: Verify Sender Email

1. Go to SendGrid → Settings → Sender Authentication
2. Verify the email address used in `EMAIL` variable
3. Or use a verified domain

### Fix 3: Check Email Format

Make sure salon emails are valid:
- Not empty
- Proper format: `name@domain.com`
- Not temporary emails (if possible)

---

## 📊 Diagnostic Checklist

- [ ] `SENDGRID_API_KEY` set in `.env`
- [ ] `EMAIL` (from address) set in `.env`
- [ ] SendGrid API key is active
- [ ] Sender email is verified in SendGrid
- [ ] Salon has valid email address
- [ ] Backend server restarted after .env changes
- [ ] Check SendGrid Activity dashboard
- [ ] Check spam folder
- [ ] Backend console shows detailed logs

---

## 🚨 If Still Not Working

1. **Check Backend Logs:**
   - Look for `[Claim Invitation]` logs
   - Copy full error message

2. **Check SendGrid Dashboard:**
   - Activity → Recent sends
   - Check delivery status

3. **Test with Simple Email:**
   - Use test script above
   - Verify SendGrid works independently

4. **Contact Support:**
   - SendGrid support if API issues
   - Check SendGrid status page

---

## 📝 Next Steps

Once email is working:
1. Test with a real salon email
2. Check spam folder
3. Verify claim link works
4. Test SMS (if Twilio configured)

