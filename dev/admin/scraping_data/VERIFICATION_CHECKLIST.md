# Claim System Verification Checklist

Use this checklist to verify everything is working correctly.

## ✅ Pre-requisites

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] Salons are imported to database
- [ ] `.env` file has required variables:
  - [ ] `MONGODB_CONNECTION_STRING`
  - [ ] `baseURL`
  - [ ] `secretKey`
  - [ ] `SENDGRID_API_KEY` (for email)
  - [ ] `EMAIL` (for email)
  - [ ] `TWILIO_ACCOUNT_SID` (optional, for SMS)
  - [ ] `TWILIO_AUTH_TOKEN` (optional, for SMS)
  - [ ] `TWILIO_PHONE_NUMBER` (optional, for SMS)

---

## 🧪 Step 1: Run Automated Test

```bash
cd dev/admin/scraping_data
node test_claim_system.js
```

**Expected Output:**
- ✅ Database Connection
- ✅ Claim Endpoint accessible
- ✅ Found test salon
- ✅ Dashboard metrics available

**If tests fail:**
- Check MongoDB connection
- Verify backend server is running
- Check `.env` configuration

---

## 📧 Step 2: Test Sending Invitation

### Option A: Using Script (Recommended)

```bash
# First, get a salon ID from database
# Then send invitation:
node send_claim_invitations.js --single <salonId>
```

**Expected:**
- ✅ Email sent successfully
- ✅ Salon receives email with claim link

### Option B: Using API (Postman/cURL)

```bash
POST https://yourdomain.com/api/admin/salon/send-claim-invitation
Headers:
  key: your_secret_key
  Authorization: your_admin_token
Body:
{
  "salonId": "salon_id_here",
  "method": "email"
}
```

**Check:**
- [ ] Response status: 200
- [ ] `status: true` in response
- [ ] Email received by salon

---

## 🔐 Step 3: Test Claim Flow

### Get Claim Token from Database

```javascript
// In MongoDB shell or via script
db.salons.findOne({ isClaimed: false }, { claimToken: 1, email: 1, name: 1 })
```

### Test Claim Endpoint

```bash
POST https://yourdomain.com/api/salon/claim
Headers:
  key: your_secret_key
Body:
{
  "token": "claim_token_from_database",
  "email": "salon@example.com",
  "password": "newPassword123"
}
```

**Expected:**
- ✅ Response: `{ status: true, message: "Salon profile claimed successfully!" }`
- ✅ Salon `isClaimed` = true in database
- ✅ Salon `isActive` = true in database
- ✅ Salon can login with new password

**Verify in Database:**
```javascript
db.salons.findOne({ _id: ObjectId("salon_id") })
// Check: isClaimed: true, isActive: true, claimToken: ""
```

---

## 📊 Step 4: Check Dashboard Metrics

### Via API

```bash
GET https://yourdomain.com/api/admin/dashboard/allStats
Headers:
  key: your_secret_key
  Authorization: your_admin_token
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "claimMetrics": {
      "totalSalons": 100,
      "claimedSalons": 5,
      "unclaimedSalons": 95,
      "claimRate": 5.00
    }
  }
}
```

**Check:**
- [ ] `claimMetrics` object exists
- [ ] Numbers are correct
- [ ] Claim rate percentage is calculated

### Via Admin Panel

1. Login to admin panel
2. Go to Dashboard
3. Check for claim rate metrics

---

## 🔄 Step 5: Test Bulk Invitations

```bash
node send_claim_invitations.js --bulk --limit 10 --method email
```

**Expected:**
- ✅ Sends to 10 unclaimed salons
- ✅ Shows sent/failed counts
- ✅ Rate limiting works (1 second between emails)

---

## 📱 Step 6: Test SMS Invitations (Optional)

If Twilio is configured:

```bash
node send_claim_invitations.js --single <salonId> --method sms
```

**Check:**
- [ ] SMS received by salon
- [ ] Message contains claim link
- [ ] Link works correctly

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Fix:** Start backend server
```bash
cd dev/admin/backend
npm start
```

### Issue: "Unauthorized Access"
**Fix:** Check `secretKey` in `.env` matches request header

### Issue: "Salon not found"
**Fix:** Verify salon ID is correct, check database

### Issue: "Email send error"
**Fix:** 
- Check `SENDGRID_API_KEY` in `.env`
- Verify SendGrid account is active
- Check email quota

### Issue: "SMS service not configured"
**Fix:** Add Twilio credentials to `.env` (optional)

### Issue: "ADMIN_TOKEN not set"
**Fix:** 
1. Login to admin panel
2. Get token from browser localStorage
3. Add to `.env`: `ADMIN_TOKEN = your_token`

---

## ✅ Success Criteria

All tests pass when:
- [x] Database connection works
- [x] Claim endpoint responds correctly
- [x] Invitation email/SMS sends successfully
- [x] Salon can claim profile with token
- [x] Dashboard shows claim metrics
- [x] Bulk invitations work
- [x] Claimed salon can login

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Database Connection: [ ] Pass [ ] Fail
Claim Endpoint: [ ] Pass [ ] Fail
Invitation Email: [ ] Pass [ ] Fail
Invitation SMS: [ ] Pass [ ] Fail [ ] Skipped
Claim Flow: [ ] Pass [ ] Fail
Dashboard Metrics: [ ] Pass [ ] Fail
Bulk Invitations: [ ] Pass [ ] Fail

Notes:
_______________________________________
_______________________________________
```

---

## 🚀 Next Steps After Verification

Once everything works:
1. Send invitations to all imported salons
2. Monitor claim rate in dashboard
3. Follow up with salons who haven't claimed
4. Track conversion metrics
5. (Optional) Add PDF invoice generation

