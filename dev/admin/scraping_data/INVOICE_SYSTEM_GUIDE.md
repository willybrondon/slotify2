# PDF Invoice System - Implementation Guide

## ✅ Implementation Complete

The PDF invoice generation system has been fully implemented for salon settlements.

## Features

### 1. PDF Invoice Generation
- Professional invoice template
- French language support
- Includes all settlement details
- Formatted currency (EUR)
- Status indicators with colors

### 2. Invoice Content
- **Header**: Skedisy branding
- **Invoice Details**: Invoice number, date, period
- **Salon Information**: Name, email, phone, address
- **Settlement Breakdown**:
  - Salon earnings
  - Commission (with percentage)
  - Bonus (if applicable)
  - Final amount
- **Payment Status**: Visual status indicator
- **Payment Date**: If payment completed
- **Notes**: Additional information
- **Footer**: Contact information

### 3. API Endpoints

#### Download Invoice
```
GET /api/admin/settlement/salon-invoice?settlementId=SETTLEMENT_ID
```
- Requires admin authentication
- Returns PDF file for download
- Generates invoice on-the-fly

#### Send Invoice via Email
```
POST /api/admin/settlement/send-salon-invoice
Body: { settlementId: "SETTLEMENT_ID" }
```
- Requires admin authentication
- Generates PDF
- Sends email with PDF attachment
- Uses SendGrid for email delivery

## Usage Examples

### Download Invoice (cURL)
```bash
curl -X GET "https://skedisy.com/api/admin/settlement/salon-invoice?settlementId=SETTLEMENT_ID" \
  -H "key: YOUR_SECRET_KEY" \
  -H "Authorization: ADMIN_JWT_TOKEN" \
  --output invoice.pdf
```

### Send Invoice via Email (cURL)
```bash
curl -X POST "https://skedisy.com/api/admin/settlement/send-salon-invoice" \
  -H "Content-Type: application/json" \
  -H "key: YOUR_SECRET_KEY" \
  -H "Authorization: ADMIN_JWT_TOKEN" \
  -d '{"settlementId": "SETTLEMENT_ID"}'
```

### JavaScript/Frontend
```javascript
// Download invoice
fetch('/api/admin/settlement/salon-invoice?settlementId=SETTLEMENT_ID', {
  headers: {
    'key': 'YOUR_SECRET_KEY',
    'Authorization': 'ADMIN_JWT_TOKEN'
  }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invoice.pdf';
  a.click();
});

// Send invoice via email
fetch('/api/admin/settlement/send-salon-invoice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'key': 'YOUR_SECRET_KEY',
    'Authorization': 'ADMIN_JWT_TOKEN'
  },
  body: JSON.stringify({ settlementId: 'SETTLEMENT_ID' })
})
.then(response => response.json())
.then(data => {
  console.log('Invoice sent:', data);
});
```

## File Storage

- **Location**: `backend/storage/invoices/`
- **Filename Format**: `invoice-INV-XXXXXXXX-YYYYMMDD.pdf`
- **Example**: `invoice-INV-A1B2C3D4-20241214.pdf`

## Email Template

The email includes:
- Professional HTML template
- Invoice summary
- PDF attachment
- Contact information

## Configuration Required

### Environment Variables
```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL=your_sender_email@example.com
```

### Dependencies
```json
{
  "pdfkit": "^0.15.0"
}
```

Install with:
```bash
npm install pdfkit
```

## Invoice Details

### Invoice Number Format
- Format: `INV-XXXXXXXX`
- Example: `INV-A1B2C3D4`
- Based on settlement ID

### Currency Formatting
- Uses French locale (EUR)
- Format: `1 234,56 €`

### Status Colors
- **Pending** (0): Orange (#ff9800)
- **Paid** (1): Green (#4caf50)
- **Processing** (2): Blue (#2196f3)
- **Cancelled** (3): Red (#f44336)

## Error Handling

- Validates settlement ID
- Checks SendGrid configuration
- Verifies salon email exists
- Handles PDF generation errors
- Provides detailed error messages

## Testing

### Test Invoice Generation
1. Get a settlement ID from database
2. Call download endpoint
3. Verify PDF is generated correctly
4. Check invoice content

### Test Email Sending
1. Ensure SendGrid is configured
2. Call send invoice endpoint
3. Check salon email inbox
4. Verify PDF attachment

## Next Steps (Optional)

1. **Automated Monthly Invoices**
   - Cron job to generate invoices monthly
   - Auto-send to all salons with settlements

2. **Invoice History**
   - Store invoice metadata in database
   - Track sent invoices
   - Resend functionality

3. **Invoice Customization**
   - Company logo
   - Custom branding
   - Additional fields

4. **Multi-language Support**
   - English invoices
   - Other languages

---

**The invoice system is fully functional and ready to use!** ✅

