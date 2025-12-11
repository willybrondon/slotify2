# How to Send Claim Invitations to Salons

There are **3 ways** to send claim invitations to salons:

## Method 1: Using the Script (Easiest) ✅

Use the provided Node.js script:

### Single Salon Invitation
```bash
cd dev/admin/scraping_data
node send_claim_invitations.js --single <salonId> [--method email|sms|both]
```

**Examples:**
```bash
# Send email invitation to one salon
node send_claim_invitations.js --single 507f1f77bcf86cd799439011

# Send SMS invitation
node send_claim_invitations.js --single 507f1f77bcf86cd799439011 --method sms

# Send both email and SMS
node send_claim_invitations.js --single 507f1f77bcf86cd799439011 --method both
```

### Bulk Invitations
```bash
# Send to 50 salons (default)
node send_claim_invitations.js --bulk

# Send to 100 salons via email
node send_claim_invitations.js --bulk --limit 100 --method email

# Send to all salons in department 75 via SMS
node send_claim_invitations.js --bulk --department 75 --method sms

# Send both email and SMS to 200 salons
node send_claim_invitations.js --bulk --limit 200 --method both
```

**Setup:**
1. Make sure you have `axios` installed: `npm install axios`
2. Add `ADMIN_TOKEN` to `backend/.env` (get it from admin panel after login)
3. Run the script

---

## Method 2: Using API Directly (Postman/cURL)

### Single Salon Invitation

**Postman:**
- Method: `POST`
- URL: `https://yourdomain.com/admin/salon/send-claim-invitation`
- Headers:
  - `key`: `your_secret_key`
  - `Authorization`: `your_admin_token`
  - `Content-Type`: `application/json`
- Body (JSON):
```json
{
  "salonId": "507f1f77bcf86cd799439011",
  "method": "email"
}
```

**cURL:**
```bash
curl -X POST https://yourdomain.com/api/admin/salon/send-claim-invitation \
  -H "key: your_secret_key" \
  -H "Authorization: your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{"salonId": "507f1f77bcf86cd799439011", "method": "email"}'
```

### Bulk Invitations

**Postman:**
- Method: `POST`
- URL: `https://yourdomain.com/admin/salon/bulk-send-invitations`
- Headers: Same as above
- Body (JSON):
```json
{
  "limit": 50,
  "department": "75",
  "method": "email"
}
```

**cURL:**
```bash
curl -X POST https://yourdomain.com/api/admin/salon/bulk-send-invitations \
  -H "key: your_secret_key" \
  -H "Authorization: your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "department": "75", "method": "email"}'
```

---

## Method 3: From Admin Panel (Frontend - To Be Added)

You can add a "Send Invitation" button in the admin panel's Salon table. This would require:
1. Adding a button in `Salon.js` component
2. Calling the API endpoint
3. Showing success/error messages

**Would you like me to add this to the admin panel?**

---

## Getting Salon IDs

To get salon IDs, you can:

1. **From MongoDB:**
```javascript
db.salons.find({ isClaimed: false }, { _id: 1, name: 1, email: 1 }).limit(10)
```

2. **From Admin Panel:**
   - Go to `/admin/salonTable`
   - View salon details to get the ID

3. **From API:**
```bash
GET /api/admin/salon/getAll
```

---

## Invitation Methods

- **`email`** (default): Sends HTML email via SendGrid
- **`sms`**: Sends SMS via Twilio
- **`both`**: Sends both email and SMS

---

## Response Format

**Success Response:**
```json
{
  "status": true,
  "message": "Claim invitation sent successfully",
  "data": {
    "salonId": "...",
    "salonName": "Salon Name",
    "email": "salon@example.com",
    "mobile": "+33123456789",
    "method": "email",
    "results": {
      "email": { "success": true },
      "sms": { "success": true }
    }
  }
}
```

---

## Troubleshooting

1. **"SMS service not configured"**
   - Add Twilio credentials to `.env`:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`

2. **"Email send error"**
   - Check SendGrid API key in `.env`: `SENDGRID_API_KEY`
   - Verify `EMAIL` is set in `.env`

3. **"Unauthorized"**
   - Make sure `ADMIN_TOKEN` is valid
   - Login to admin panel and get fresh token

4. **"Salon not found"**
   - Verify the salon ID is correct
   - Check if salon exists in database

