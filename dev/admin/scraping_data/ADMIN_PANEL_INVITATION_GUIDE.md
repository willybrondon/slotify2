# Admin Panel - Send Claim Invitations Guide

## ✅ What Was Added

The admin panel now has a **Send Invitation** button to easily send claim invitations to salons directly from the UI!

---

## 🎯 How to Use

### Option 1: Send Invitation to Single Salon

1. **Go to Salon List**
   - Navigate to: `/admin/allSalon`
   - You'll see a table with all salons

2. **Find Unclaimed Salon**
   - Look at the **"Claim Status"** column
   - Salons marked as **"Unclaimed"** (yellow badge) can receive invitations

3. **Click Send Invitation Button**
   - In the **"Action"** column, find the orange email icon button
   - This button only appears for unclaimed salons
   - Click it to send the invitation

4. **Confirmation**
   - You'll see a success toast message
   - The salon will receive:
     - **Email** with the claim link (if email address is available)
     - **SMS** with the claim link (if phone number is available and Twilio is configured)

---

### Option 2: Bulk Send Invitations

1. **Go to Salon List**
   - Navigate to: `/admin/allSalon`

2. **Click "Send Invitations (Bulk)" Button**
   - Located at the top, next to "Add salon" button
   - This will send invitations to ALL unclaimed salons on the current page

3. **Confirm**
   - A confirmation dialog will show how many salons will receive invitations
   - Click "OK" to proceed

4. **Wait for Completion**
   - Invitations are sent in batches of 10
   - You'll see a progress message
   - Final summary shows: "Sent: X, Failed: Y"

---

## 📊 New Features in Table

### Claim Status Column
- **Green Badge "Claimed"**: Salon has already claimed their profile
- **Yellow Badge "Unclaimed"**: Salon can receive invitation

### Action Column
- **Edit Button** (blue): Edit salon details
- **Send Invitation Button** (orange): Only visible for unclaimed salons
  - Click to send email invitation
  - Button disappears after salon is claimed

---

## 🔄 What Happens When You Send Invitation

1. **Email & SMS Sent**
   - Salon receives **email** with claim link (if email address exists)
   - Salon receives **SMS** with claim link (if phone number exists and Twilio is configured)
   - Link format: `https://yourdomain.com/salon/claim?token=XXX&email=XXX`
   - Success message shows which method succeeded:
     - "Invitation sent via email and SMS!" (both succeeded)
     - "Invitation sent via email. SMS failed..." (email succeeded, SMS failed)
     - "Invitation sent via SMS. Email failed." (SMS succeeded, email failed)

2. **Salon Claims Profile**
   - Salon clicks link and sets password
   - Status changes from "Unclaimed" to "Claimed"
   - Invitation button disappears

3. **Table Updates**
   - Claim status badge updates automatically
   - No need to refresh page

---

## 💡 Tips

- **Check Email First**: Make sure salon has a valid email address before sending
- **Bulk Send**: Use bulk send for initial onboarding of many salons
- **Individual Send**: Use individual send for follow-ups or specific salons
- **Monitor Dashboard**: Check dashboard metrics to see claim rate

---

## 🐛 Troubleshooting

### Button Not Showing
- **Check**: Is salon already claimed? (Button only shows for unclaimed salons)
- **Check**: Does salon have an email address?

### Invitation Not Sent
- **Check**: SendGrid API key configured in `.env` (for email)
- **Check**: Twilio credentials configured in `.env` (for SMS)
- **Check**: Email address is valid (for email)
- **Check**: Phone number is valid (for SMS)
- **Check**: Backend server is running
- **Note**: If one method fails, the other will still be sent

### Bulk Send Fails
- **Check**: Network connection
- **Check**: SendGrid quota/limits
- **Check**: Some salons may not have email addresses (will be skipped)

---

## 📝 API Details

The frontend uses:
- **Endpoint**: `POST /admin/salon/send-claim-invitation`
- **Body**: `{ salonId: "...", method: "both" }` (sends via email AND SMS)
- **Response**: `{ status: true, message: "...", data: { results: { email: {...}, sms: {...} } } }`

---

## ✅ Success Indicators

- ✅ Toast message shows which method succeeded:
  - "Invitation sent via email and SMS!" (both succeeded)
  - "Invitation sent via email. SMS failed..." (email only)
  - "Invitation sent via SMS. Email failed." (SMS only)
- ✅ Claim status badge updates
- ✅ Invitation button disappears (for that salon)
- ✅ Salon receives email and/or SMS

---

## 🚀 Next Steps

After sending invitations:
1. Monitor claim rate in dashboard
2. Follow up with salons who haven't claimed
3. Track conversion metrics
4. Send reminders if needed

