# Skedisy Salon Onboarding Implementation Guide

## Overview

This guide implements the **Hybrid Onboarding Strategy** (Strategy 3) for Skedisy platform, focusing on Île-de-France region.

## Strategy Summary

**Phase 1 (Months 1-3)**: Free listings, no commission
- Scrape and add salons automatically
- Send claim invitations
- Build database and user base

**Phase 2 (Months 4-6)**: Opt-in commission model
- Salons that claimed profiles can opt into commission
- Commission: 10-15% per booking
- Monthly invoice with detailed breakdown

**Phase 3 (Month 7+)**: Premium tiers
- Free tier: 5% commission
- Premium tier: 10% commission + features
- Enterprise: Custom pricing

## Implementation Steps

### Step 1: Database Schema Update ✅

The salon model has been updated with:
- `isClaimed: Boolean` - Whether salon has claimed their profile
- `claimToken: String` - Secure token for claiming
- `source: String` - Data source (pagesjaunes, google_places)
- `source_id: String` - Original ID from source

### Step 2: Scrape Salon Data

```bash
cd scraping_data
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
python scrape_ile_de_france.py
```

This will:
- Scrape all 8 Île-de-France departments
- Use PagesJaunes API (one call per department + paging)
- Use Google Places API (department centrepoints)
- Remove duplicates
- Format for Skedisy
- Save to JSON and CSV

### Step 3: Import to Database

```bash
node import_to_skedisy.js salons_ile_de_france_TIMESTAMP.json
```

This will:
- Import salons to MongoDB
- Skip duplicates
- Set `isClaimed: false` and `isActive: false`
- Generate claim tokens

### Step 4: Send Claim Invitations

Create an email/SMS template:

**Email Template:**
```
Subject: Votre salon a été ajouté sur Skedisy - Réclamez votre profil

Bonjour,

Votre salon [SALON_NAME] a été ajouté sur Skedisy, la plateforme de réservation de services de beauté.

Réclamez votre profil pour:
- Gérer vos réservations en ligne
- Augmentez votre visibilité
- Recevez de nouveaux clients

Cliquez ici pour réclamer: [CLAIM_LINK]

Cordialement,
L'équipe Skedisy
```

**Claim Link Format:**
```
https://skedisy.com/salon/claim?token=[CLAIM_TOKEN]&email=[SALON_EMAIL]
```

### Step 5: Build Claim Flow (Frontend)

Create a claim page where salons can:
1. Enter claim token
2. Verify email
3. Set password
4. Accept terms & conditions
5. Activate profile

### Step 6: Commission System

When salon claims profile:
- Set `isClaimed: true`
- Set `isActive: true`
- Track bookings for commission
- Generate monthly invoices

## API Endpoints Needed

### 1. Claim Salon Profile
```
POST /api/salon/claim
Body: { token, email, password }
Response: { success, salon }
```

### 2. Send Claim Invitation
```
POST /api/admin/salon/send-claim-invitation
Body: { salonId }
Response: { success, message }
```

### 3. Bulk Send Invitations
```
POST /api/admin/salon/bulk-send-invitations
Body: { department, limit }
Response: { sent, failed }
```

### 4. Commission Tracking
```
GET /api/admin/commission/monthly?month=2024-01
Response: { salons, total, breakdown }
```

## Data Fields Required

From scraping, we need:
- ✅ Name
- ✅ Email (generated if not available)
- ✅ Mobile/Phone
- ✅ Address (line1, city, state, country)
- ✅ Coordinates (latitude, longitude)
- ✅ Images (main + gallery)
- ✅ About/Description
- ✅ Website (if available)
- ✅ Opening hours (if available)

## Legal Compliance Checklist

- [ ] Send opt-in email before listing
- [ ] Allow salons to request removal
- [ ] Store consent records
- [ ] GDPR compliant data storage
- [ ] Terms of service for claiming
- [ ] Privacy policy
- [ ] Data breach notification process

## Monitoring & Metrics

Track these KPIs:
- **Claim Rate**: % of salons that claim (target: 30-40%)
- **Booking Conversion**: % of claimed salons accepting bookings (target: 80%+)
- **Commission Collection**: % of invoices paid (target: 90%+)
- **Customer Satisfaction**: Average review score (target: 4.5+)
- **Salon Retention**: % active after 6 months (target: 70%+)

## Next Steps

1. ✅ Database schema updated
2. ✅ Scraper created
3. ✅ Import script created
4. ✅ Build claim flow (frontend + backend)
5. ✅ Create email templates
6. ✅ Set up commission tracking
7. ⏳ Create monthly invoice system (PDF generation) - **ONLY PENDING ITEM**
8. ✅ Build admin dashboard for monitoring (claim rate metrics added)
9. ✅ Admin panel UI with Send Invitation buttons
10. ✅ Public claim page at `/salon/claim`
11. ✅ SMS sending with proper phone formatting

**See `IMPLEMENTATION_STATUS.md` for detailed status of all features.**

## Support

For questions or issues:
- Check `ONBOARDING_STRATEGY.md` for strategy details
- Check `README.md` for scraping instructions
- Review scraped data in CSV before importing

