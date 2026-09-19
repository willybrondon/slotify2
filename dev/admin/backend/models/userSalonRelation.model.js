const mongoose = require("mongoose");

/**
 * Per (user, salon) acquisition & monetization state.
 * Supports: Skedisy acquisition commission (once) + 2nd-visit incentive.
 */
const userSalonRelationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    /** skedisy | salon_direct | unknown */
    acquiredBy: {
      type: String,
      enum: ["skedisy", "salon_direct", "unknown"],
      default: "unknown",
    },
    acquisitionChannel: {
      type: String,
      default: "",
    },
    acquiredAt: { type: Date, default: null },
    firstBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    firstCompletedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    /** Booking that paid acquisition commission (at most one). */
    commissionChargedAtBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    /**
     * eligible | granted | redeemed | expired | ineligible
     * granted = credit issued after 1st completed Skedisy-acquired visit
     */
    secondVisitIncentiveStatus: {
      type: String,
      enum: ["eligible", "granted", "redeemed", "expired", "ineligible", ""],
      default: "",
    },
    secondVisitIncentiveBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    secondVisitIncentiveExpiresAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

userSalonRelationSchema.index({ userId: 1, salonId: 1 }, { unique: true });

module.exports = mongoose.model("UserSalonRelation", userSalonRelationSchema);
