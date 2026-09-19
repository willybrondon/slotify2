const mongoose = require("mongoose");
const { FEATURE_KEYS } = require("../constants/subscriptionFeatures");

/**
 * Admin-managed SaaS plans (Basic / Premium / Enterprise / custom).
 * StyleSeat ships ~1 Premium seat with feature opt-outs;
 * Skedisy keeps multi-tier catalog controllable from admin.
 */
const subscriptionPlanSchema = new mongoose.Schema(
  {
    /** Stable slug used on salon.subscription.planId */
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    /** free | basic | premium | enterprise | custom */
    tier: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise", "custom"],
      default: "custom",
    },
    priceMonthly: { type: Number, default: 0 },
    priceYearly: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    trialDays: { type: Number, default: 14 },
    sortOrder: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    /** Highlight on salon pricing page */
    isHighlighted: { type: Boolean, default: false },
    /** Feature keys enabled for this plan */
    features: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          if (!Array.isArray(arr)) return false;
          return arr.every((k) => FEATURE_KEYS.includes(k));
        },
        message: "Unknown subscription feature key",
      },
    },
    /** Soft caps (0 = unlimited) */
    limits: {
      maxExperts: { type: Number, default: 0 },
      maxLocations: { type: Number, default: 1 },
    },
    stripePriceIdMonthly: { type: String, default: "" },
    stripePriceIdYearly: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subscriptionPlanSchema.index({ tier: 1, sortOrder: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
