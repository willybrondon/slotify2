# Quick Test Guide - Claim System

## 🚀 Quick Start Testing

### 1. Run Automated Test

```bash
cd dev/admin/scraping_data
node test_claim_system.js
```

This will check:
- ✅ Database connection
- ✅ Endpoint accessibility
- ✅ Find test salon
- ✅ Dashboard metrics

---

### 2. Test with Real Salon

**Step 1: Get a salon from database**
```bash
# Option A: Use MongoDB shell
mongosh "mongodb://admin:dbadmin123@46.101.229.176:27017/slotify"
db.salons.findOne({ isClaimed: false }, { _id: 1, name: 1, email: 1, claimToken: 1 })
```

**Step 2: Send invitation**
```bash
node send_claim_invitations.js --single <salonId>
```

**Step 3: Check email/SMS**
- Email should arrive with claim link
- Link format: `https://yourdomain.com/salon/claim?token=XXX&email=XXX`

**Step 4: Test claim**
```bash
POST https://yourdomain.com/salon/claim
Headers: { "key": "your_secret_key" }
Body: {
  "token": "claim_token_from_email",
  "email": "salon@example.com",
  "password": "newPassword123"
}
```

**Step 5: Verify in database**
```javascript
db.salons.findOne({ email: "salon@example.com" })
// Should show: isClaimed: true, isActive: true
```

---

### 3. Check Dashboard

```bash
GET https://yourdomain.com/admin/dashboard/allStats
Headers: {
  "key": "your_secret_key",
  "Authorization": "your_admin_token"
}
```

Look for `claimMetrics` in response.

---

## ✅ Expected Results

### Claim Endpoint Test
- **Input:** Valid token + email + password
- **Output:** `{ status: true, message: "Salon profile claimed successfully!" }`
- **Database:** `isClaimed: true`, `isActive: true`, `claimToken: ""`

### Invitation Test
- **Input:** Salon ID
- **Output:** `{ status: true, message: "Claim invitation sent successfully" }`
- **Email/SMS:** Received by salon with claim link

### Dashboard Test
- **Output:** Includes `claimMetrics` with:
  - `totalSalons`
  - `claimedSalons`
  - `unclaimedSalons`
  - `claimRate` (percentage)

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect" | Start backend: `cd backend && npm start` |
| "Unauthorized" | Check `secretKey` in `.env` |
| "Salon not found" | Verify salon ID is correct |
| "Email send error" | Check SendGrid API key |
| "ADMIN_TOKEN not set" | Get token from admin panel localStorage |

---

## 📊 Success Indicators

✅ **System is working if:**
- Test script shows all green checkmarks
- Invitation email/SMS is received
- Salon can claim profile successfully
- Dashboard shows claim metrics
- Claimed salon can login

❌ **System needs fixing if:**
- Test script shows red X marks
- Endpoints return errors
- Emails/SMS not sending
- Claim fails with valid token

