# Skedisy Payment Aggregation Service Application

## Project Overview

**Skedisy** is a comprehensive marketplace platform that connects customers with salons and beauty service providers. We operate as a two-sided marketplace facilitating bookings for beauty and wellness services including hair styling, beauty treatments, spa services, nail care, and related personal care services.

## Nature of Activity

**Primary Business Activity:** Online Marketplace for Beauty and Wellness Services

Skedisy operates as a digital platform that:
- Connects customers seeking beauty and wellness services with licensed salons and service providers
- Facilitates appointment bookings and scheduling
- Processes payments for service bookings
- Manages commission-based revenue sharing with service providers
- Provides AI-powered beauty recommendations and concierge services
- Offers location-based service discovery and booking

**Business Model:** Commission-based marketplace (B2B2C)
- Revenue generated through platform fees and commission (5-15% per transaction)
- Monthly settlements to service providers
- Multiple payment methods supported (card payments, digital wallet, cash after service)

## Specific Needs for Payment Aggregation

### 1. **Transaction Processing Requirements**

**Customer-to-Platform Payments:**
- Process online payments for service bookings
- Support multiple payment methods:
  - Credit/Debit cards (Visa, Mastercard, etc.)
  - Digital wallet payments
  - Cash-after-service (deferred payment tracking)
- Handle payment amounts ranging from €10 to €500+ per transaction
- Support partial payments and installment options (future feature)
- Process refunds for cancelled bookings

**Platform-to-Salon Settlements:**
- Monthly settlement processing to salon partners
- Commission deduction and fee calculation
- Automated payout distribution
- Settlement reporting and reconciliation

### 2. **Payment Volume & Scale**

**Current Phase:**
- Initial launch in Île-de-France region (France)
- Target: 50-100 salons in first 6 months
- Expected transaction volume: 500-2,000 bookings per month initially
- Average transaction value: €30-€150 per booking

**Growth Projections:**
- Expansion to additional regions (Cameroon, other European markets)
- Target: 500+ salons within 12 months
- Projected transaction volume: 10,000+ bookings per month
- Monthly transaction value: €300,000+ within first year

### 3. **Technical Integration Requirements**

**Platform Architecture:**
- **Backend:** Node.js/Express RESTful API
- **Frontend:** Flutter mobile applications (iOS & Android)
- **Database:** MongoDB
- **Current Payment Integration:** Stripe (needs expansion)

**Required Payment Gateway Features:**
- RESTful API integration
- Webhook support for payment status updates
- Mobile SDK support (iOS & Android)
- PCI DSS compliance
- Multi-currency support (EUR primary, future: XAF, USD)
- Recurring payment capability (for subscription features - future)
- Refund processing API
- Payment method tokenization for secure storage

### 4. **Business-Specific Payment Flows**

**Standard Booking Flow:**
1. Customer selects services and creates booking
2. Payment processed immediately (card/wallet) or marked as pending (cash after service)
3. Platform fee deducted (5-15% commission)
4. Remaining amount allocated to salon earnings
5. Settlement processed monthly to salon account

**Cancellation & Refund Flow:**
- Process full/partial refunds based on cancellation policy
- Automatic refund to original payment method
- Update booking status and settlement records

**Commission Structure:**
- Platform fee: 5-15% of service amount (varies by salon tier)
- Salon commission: 10-15% of remaining amount (expert commission)
- Net salon earnings: Service amount - Platform fee - Salon commission

### 5. **Compliance & Security Requirements**

**Regulatory Compliance:**
- GDPR compliance (EU data protection)
- PCI DSS Level 1 compliance required
- French payment regulations compliance
- Anti-money laundering (AML) compliance
- Know Your Customer (KYC) for salon partners

**Security Requirements:**
- End-to-end encryption for payment data
- Secure tokenization for card storage
- Fraud detection and prevention
- Transaction monitoring and alerts
- Secure webhook endpoints

### 6. **Reporting & Analytics Needs**

**Required Reporting Features:**
- Real-time transaction status
- Daily/weekly/monthly transaction reports
- Commission and fee breakdown reports
- Settlement reports for salon partners
- Refund and chargeback tracking
- Revenue analytics dashboard
- Tax reporting support (VAT handling)

### 7. **Multi-Region Support**

**Current Focus:**
- Primary: France (Île-de-France region)
- Currency: EUR (Euro)

**Future Expansion:**
- Cameroon (Central African Franc - XAF)
- Other European markets
- Multi-currency support required

## Timeline & Implementation Plan

### Phase 1: Integration & Testing (Weeks 1-4)
- Payment gateway integration
- API integration with existing backend
- Mobile SDK integration
- Testing and QA

### Phase 2: Soft Launch (Weeks 5-8)
- Limited rollout with select salons
- Monitor transaction processing
- Performance optimization
- Bug fixes and refinements

### Phase 3: Full Launch (Week 9+)
- Full platform activation
- All salons onboarded
- Marketing and customer acquisition
- Scale monitoring and optimization

## Expected Transaction Characteristics

**Transaction Types:**
- Service booking payments (primary)
- Refunds (estimated 5-10% of bookings)
- Salon settlement payouts (monthly)
- Wallet top-ups (future feature)

**Transaction Frequency:**
- Customer payments: Real-time (immediate processing)
- Refunds: On-demand (within 24-48 hours)
- Settlements: Monthly batch processing

**Average Transaction Values:**
- Minimum: €10
- Average: €50-€80
- Maximum: €500+

## Additional Requirements

**Customer Experience:**
- Seamless checkout process (< 30 seconds)
- Multiple payment method options
- Payment confirmation and receipts
- Booking confirmation integration

**Salon Partner Experience:**
- Transparent commission structure
- Monthly settlement reports
- Payment history access
- Dispute resolution support

**Platform Management:**
- Admin dashboard for payment monitoring
- Automated reconciliation
- Fraud detection alerts
- Financial reporting tools

## Why We Need Payment Aggregation

As a marketplace platform, we require a robust payment aggregation solution that can:
1. **Handle multiple payment methods** to provide flexibility for our diverse customer base
2. **Process commission-based transactions** with automatic fee calculation and distribution
3. **Support marketplace model** with split payments and settlements
4. **Scale with our growth** from regional launch to multi-country expansion
5. **Ensure compliance** with EU and international payment regulations
6. **Provide reliable infrastructure** for mission-critical booking transactions

## Contact Information

For any questions or clarifications regarding this application, please contact our technical team.

---

**Note:** This application is for a legitimate marketplace platform operating in the beauty and wellness services sector. All transactions are for real services provided by licensed salons and service providers. We are committed to full compliance with all applicable regulations and payment industry standards.

