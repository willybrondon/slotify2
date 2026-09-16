const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    addressDetails: {
      addressLine1: { type: String, default: "", required: true },
      landMark: { type: String },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    uniqueId: { type: Number, unique: true },
    locationCoordinates: {
      latitude: { type: String, default: "" },
      longitude: { type: String, default: "" },
    },
    salonTime: [
      {
        day: { type: String, default: "" },
        openTime: { type: String, default: "" },
        closedTime: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        breakStartTime: { type: String, default: "" },
        breakEndTime: { type: String, default: "" },
        time: { type: Number, default: 15 },
        isBreak: { type: Boolean, default: true },
      },
    ],
    mobile: { type: String, default: "" },
    about: { type: String, default: "" },
    /** Public Instagram profile URL (https://instagram.com/…) */
    instagramUrl: { type: String, default: "" },
    /** Public Facebook page/profile URL */
    facebookUrl: { type: String, default: "" },
    /** Public TikTok profile URL */
    tiktokUrl: { type: String, default: "" },
    /** Allow clients to Message the salon from the public profile */
    messagingEnabled: { type: Boolean, default: true },

    platformFee: { type: Number, default: 0 },
    /** Override global minSalonWalletBalance; null = use platform default */
    minWalletBalance: { type: Number, default: null },
    earning: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 }, // Salon wallet balance for prepayment

    review: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    password: {
      type: String,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false }, // For opt-in onboarding strategy
    claimToken: { type: String, default: "" }, // Token for salon to claim their profile
    source: { type: String, default: "" }, // Source of salon data (pagesjaunes, google_places, etc.)
    source_id: { type: String, default: "" }, // Original ID from source

    image: [{ type: String, default: "" }],
    mainImage: { type: String, default: "" },
    heroImage: { type: String, default: "" }, // Hero image for public web page
    valueProposition: {
      title: { type: String, default: "" }, // Main value proposition title
      description: { type: String, default: "" }, // Value proposition description
      features: [{ type: String, default: "" }], // Array of feature highlights
    },
    isBestSeller: { type: Boolean, default: false },

    /** Auto-confirm new bookings (Planity/Fresha-style). false = expert must confirm pending */
    autoConfirmBookings: { type: Boolean, default: true },

    /**
     * No-show / late cancellation policy (StyleSeat-inspired).
     * Free for now (commission model); later can gate behind premium.
     */
    cancellationPolicy: {
      enabled: { type: Boolean, default: false },
      lateCancelPercent: { type: Number, default: 50 },
      noShowPercent: { type: Number, default: 100 },
      freeCancelHours: { type: Number, default: 24 },
      /** Minutes of grace before marking client late (display + reminders) */
      lateArrivalMinutes: { type: Number, default: 15 },
    },

    /**
     * Multi-visit packages (lite) — retention without full prepaid wallet.
     * [{ id, name, description, visitCount, serviceIds[], priceHint, active }]
     */
    servicePackages: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /**
     * Fidélité liée au rebooking (même presta chez le même salon).
     * Pas de points génériques — réduction % à partir de la Nᵉ visite completed.
     */
    loyaltyProgram: {
      enabled: { type: Boolean, default: false },
      /** % off HT when rebooking the same service */
      sameServiceRebookPercent: { type: Number, default: 10 },
      /** Need this many completed same-service visits before discount applies (1 = 2nd visit) */
      minCompletedCount: { type: Number, default: 1 },
      /** Cap in currency units; 0 = no cap */
      maxDiscountAmount: { type: Number, default: 0 },
    },

    /** Salon-level payment preferences for customer bookings */
    paymentMethods: {
      acceptCash: { type: Boolean, default: true },
      acceptStripe: { type: Boolean, default: false },
    },

    /** Stripe Connect Express account — payouts go to salon; Skedisy keeps application fee */
    stripeConnect: {
      accountId: { type: String, default: "" },
      onboardingComplete: { type: Boolean, default: false },
      chargesEnabled: { type: Boolean, default: false },
      payoutsEnabled: { type: Boolean, default: false },
      detailsSubmitted: { type: Boolean, default: false },
    },

    /** SQUIRE Afro wedge — enable demand → quote → deposit flow for this salon */
    afroProjectFlowEnabled: { type: Boolean, default: false },

    serviceIds: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        price: { type: Number, default: null },
        allowCities: [
          {
            country: { type: String, trim: true },
            city: { type: String, trim: true },
          },
        ],
        /**
         * Optional Afro service engine config (Complexity / Pricing / Duration / Deposit).
         * Absent or empty → treat as S0 (catalogue booking classique).
         */
        afroConfig: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        /**
         * Public service card (StyleSeat-inspired) — salon-owned copy.
         * shortDescription, includes, prepMust, prepAvoid, addons,
         * recommendedProductIds, deposit, etc.
         */
        detailCard: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Salon", salonSchema);
