# Skedisy Salon Onboarding Strategy Analysis

## Proposed Strategy: Commission-Based Without Contracts

### Your Proposed Model
- **Add salons to platform without contracts**
- **Notify salon when customer books**
- **Collect commission: Cash + Monthly Commission Invoice**
- **Focus: Île-de-France only**

### Analysis: Is This a Good Strategy?

#### ✅ **PROS:**
1. **Low Barrier to Entry**: Salons can join immediately without paperwork
2. **Fast Market Penetration**: Quick onboarding = more salons = more customers
3. **Revenue from Day 1**: Commission on every booking
4. **Scalable**: No contract negotiations needed
5. **Market Validation**: Test demand before committing to contracts

#### ⚠️ **CONS & RISKS:**
1. **Legal Issues**: 
   - GDPR compliance (using salon data without explicit consent)
   - Commercial use of public data may violate terms of service
   - Potential lawsuits if salons object to being listed

2. **Operational Challenges**:
   - Salons may not respond to booking notifications
   - No guarantee salons will honor bookings
   - Difficult to collect commission without contract
   - Customer experience issues if salon refuses service

3. **Trust & Reputation**:
   - Customers may book with salons that don't know about platform
   - Negative reviews if bookings are rejected
   - Platform credibility at risk

4. **Commission Collection**:
   - Hard to invoice without contract
   - Legal enforcement difficult
   - Cash collection requires manual follow-up

### 🎯 **RECOMMENDED ALTERNATIVE STRATEGIES**

#### **Strategy 1: Opt-In with Soft Onboarding (RECOMMENDED)**
**How it works:**
1. Scrape salon data and add to platform as "Pending Verification"
2. Send automated email/SMS to salon: "You've been listed on Skedisy! Claim your profile to manage bookings"
3. Salon clicks link → Creates account → Accepts terms → Profile activated
4. Commission only charged after salon claims profile
5. Unclaimed salons remain visible but marked as "Contact salon directly"

**Benefits:**
- ✅ Legal compliance (opt-in model)
- ✅ Higher quality data (salon verifies their info)
- ✅ Better customer experience (salons know about bookings)
- ✅ Easier commission collection (salon agreed to terms)
- ✅ Still fast onboarding (salon just needs to claim)

**Implementation:**
- Add `isClaimed: Boolean` field to salon model
- Add `claimToken: String` for secure claiming
- Send claim invitation via email/SMS
- Commission only applies to claimed salons

---

#### **Strategy 2: Free Listing + Paid Features**
**How it works:**
1. List all salons for free (no commission)
2. Salons can claim profile for free
3. Charge commission only if salon wants "Premium Features":
   - Priority listing
   - Advanced analytics
   - Marketing tools
   - Booking management tools

**Benefits:**
- ✅ No legal issues (free listing)
- ✅ Value proposition clear
- ✅ Salons choose to pay
- ✅ Builds trust first

---

#### **Strategy 3: Hybrid Approach (BEST FOR ÎLE-DE-FRANCE)**
**How it works:**
1. **Phase 1 (Months 1-3)**: Free listings, no commission
   - Scrape and add salons
   - Send claim invitations
   - Build database and user base
   - Focus on customer acquisition

2. **Phase 2 (Months 4-6)**: Opt-in commission model
   - Salons that claimed profiles can opt into commission
   - Commission: 10-15% per booking
   - Monthly invoice with detailed breakdown
   - Cash option for small salons

3. **Phase 3 (Month 7+)**: Premium tiers
   - Free tier: 5% commission
   - Premium tier: 10% commission + features
   - Enterprise: Custom pricing

**Benefits:**
- ✅ Legal compliance from start
- ✅ Builds trust gradually
- ✅ Market validation before monetization
- ✅ Flexible for different salon sizes

---

## 🏆 **FINAL RECOMMENDATION: Strategy 3 (Hybrid)**

### Why This Works Best:
1. **Legal Safety**: No GDPR/commercial data issues
2. **Market Fit**: Test demand before charging
3. **Trust Building**: Salons see value before paying
4. **Scalable**: Can adjust commission rates based on data
5. **Île-de-France Focus**: Perfect for regional testing

### Implementation Steps:
1. **Scrape salon data** (PagesJaunes + Google Places)
2. **Add to platform** with `isClaimed: false`, `status: 'pending'`
3. **Send claim invitations** via email/SMS
4. **Track claim rate** and optimize messaging
5. **After 3 months**, introduce commission for claimed salons
6. **Monitor and iterate** based on salon feedback

### Commission Structure Suggestion:
- **Free Tier**: 0% commission (first 3 months, then 5%)
- **Standard**: 10% commission per booking
- **Premium**: 15% commission + marketing tools
- **Payment**: Monthly invoice OR cash collection for small salons

---

## ⚖️ **Legal Considerations**

### Must Do:
1. ✅ **GDPR Compliance**: 
   - Send opt-in email before listing
   - Allow salons to request removal
   - Store consent records

2. ✅ **Terms of Service**:
   - Clear terms when salon claims profile
   - Commission structure in writing
   - Cancellation policy

3. ✅ **Data Protection**:
   - Secure storage of salon data
   - Right to be forgotten
   - Data breach notification

### Avoid:
- ❌ Listing salons without notification
- ❌ Charging commission without agreement
- ❌ Using scraped data commercially without permission
- ❌ Ignoring salon removal requests

---

## 📊 **Success Metrics**

Track these KPIs:
- **Claim Rate**: % of salons that claim profiles (target: 30-40%)
- **Booking Conversion**: % of claimed salons that accept bookings (target: 80%+)
- **Commission Collection Rate**: % of invoices paid (target: 90%+)
- **Customer Satisfaction**: Reviews for bookings (target: 4.5+ stars)
- **Salon Retention**: % of salons active after 6 months (target: 70%+)

---

## 🚀 **Next Steps**

1. ✅ Implement scraping solution (see `scraping_data/`)
2. ✅ Add `isClaimed` and `claimToken` to salon model
3. ✅ Create claim invitation email/SMS system
4. ✅ Build salon claim flow in frontend
5. ✅ Set up commission tracking system
6. ✅ Create monthly invoice generation
7. ✅ Launch Phase 1 (free listings)

