# How to Send Invoice to Salon - Admin Guide

## Overview
The admin panel now includes invoice functionality for salon settlements. You can download PDF invoices and send them directly to salons via email.

## Location in Admin Panel

### Navigation Path:
1. Log in to the admin dashboard
2. Navigate to **Salon Payment** section (usually in the sidebar menu)
3. You'll see a table listing all salon settlements

## Invoice Actions Available

### 1. Download Invoice (PDF)
- **Button**: Red download icon (⬇️) in the "Invoice" column
- **Action**: Downloads the PDF invoice to your computer
- **File Name**: `invoice-{settlementId}.pdf`
- **Use Case**: Save invoices locally or print them

### 2. Send Invoice via Email
- **Button**: Blue email icon (✉️) in the "Invoice" column
- **Action**: Sends the PDF invoice directly to the salon's email address
- **Recipient**: The email address associated with the salon in the database
- **Use Case**: Automatically notify salons about their settlement invoices

## Step-by-Step Instructions

### To Download an Invoice:
1. Go to **Salon Payment** page
2. Find the settlement row for the salon
3. Click the **red download button** (⬇️) in the "Invoice" column
4. The PDF will automatically download to your default download folder
5. Open the PDF to view or print

### To Send an Invoice via Email:
1. Go to **Salon Payment** page
2. Find the settlement row for the salon
3. Click the **blue email button** (✉️) in the "Invoice" column
4. Wait for the success notification: "Invoice sent successfully"
5. The salon will receive the invoice PDF as an email attachment

## Table Columns

The Salon Payment table includes:
- **No**: Row number
- **Image**: Salon logo/image
- **Salon**: Salon name
- **Total Bookings**: Number of bookings in this settlement
- **Total (Earnings)**: Total earnings amount
- **Salon Commission**: Commission amount
- **Note**: Settlement notes
- **Bonus/Penalty**: Bonus or penalty amount
- **Final Amount**: Final settlement amount
- **CreatedAt**: Settlement creation date
- **Payment Date**: Date when payment was made (or "Pending")
- **Earnings**: Button to view detailed earnings
- **Info**: Button to view settlement details
- **Invoice**: **Download** and **Send Email** buttons ⬅️ **NEW**
- **Pay**: Payment action buttons

## Requirements

### For Email Sending:
- SendGrid API key must be configured in `.env`:
  ```
  SENDGRID_API_KEY=your_api_key_here
  EMAIL=your_sender_email@example.com
  ```
- Salon must have a valid email address in the database

### For PDF Generation:
- `pdfkit` package must be installed (already included in dependencies)
- Backend must have write access to `backend/invoices/` directory

## Troubleshooting

### Invoice Download Fails:
- Check browser console for errors
- Verify backend is running
- Ensure settlement ID is valid

### Email Sending Fails:
- Check SendGrid configuration in `.env`
- Verify salon has a valid email address
- Check backend logs for SendGrid errors
- Ensure `SENDGRID_API_KEY` and `EMAIL` are set correctly

### PDF Not Generated:
- Check backend logs for errors
- Verify `pdfkit` is installed: `npm install pdfkit`
- Ensure `backend/invoices/` directory exists and is writable

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│ Salon Payment                                               │
├─────────────────────────────────────────────────────────────┤
│ [Date Filter] [Settlement Type Filter]                      │
├─────────────────────────────────────────────────────────────┤
│ No │ Image │ Salon │ ... │ Invoice │ Pay │                 │
├────┼───────┼───────┼─────┼─────────┼─────┤                 │
│ 1  │ [img] │ Salon │ ... │ [⬇️][✉️] │ ... │                 │
│    │       │ Name  │     │         │     │                 │
└────┴───────┴───────┴─────┴─────────┴─────┘                 │
```

**Invoice Column:**
- ⬇️ = Download PDF
- ✉️ = Send via Email

## Notes

- Invoices are generated on-demand (not pre-generated)
- Each invoice includes:
  - Salon information
  - Settlement period
  - Booking breakdown
  - Commission calculations
  - Total amounts
  - Payment details
- Invoices are stored in `backend/invoices/` directory on the server
- Email sends the PDF as an attachment

---

**Last Updated**: Invoice system implementation complete
**Status**: ✅ Ready for use

