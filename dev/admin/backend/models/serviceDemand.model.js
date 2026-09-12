const mongoose = require("mongoose");

/**
 * SQUIRE wedge — demande avant booking.
 * Flow: draft → quoted → (needs_salon_review) → deposit_paid → converted | cancelled
 * Decisions: Demand séparée (D1) · commission au convert booking (D2) · slot après devis (D3 soft).
 */
const serviceDemandSchema = new mongoose.Schema(
  {
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestEmail: { type: String, default: "" },
    guestPhone: { type: String, default: "" },
    guestName: { type: String, default: "" },

    /** Answers keyed by configSchema variable id */
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    photoUrls: [{ type: String }],

    complexityTier: {
      type: String,
      enum: ["S0", "S1", "S2", "S3"],
      default: "S0",
    },

    estimatedPrice: { type: Number, default: 0 },
    estimatedDurationMinutes: { type: Number, default: 0 },
    priceBreakdown: [
      {
        label: { type: String, default: "" },
        amount: { type: Number, default: 0 },
      },
    ],
    durationBreakdown: [
      {
        label: { type: String, default: "" },
        minutes: { type: Number, default: 0 },
      },
    ],

    depositAmount: { type: Number, default: 0 },
    depositStatus: {
      type: String,
      enum: ["unpaid", "paid", "waived", "not_required"],
      default: "unpaid",
    },
    depositPaidAt: { type: Date, default: null },
    balanceDue: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "draft",
        "quoted",
        "awaiting_slot",
        "needs_salon_review",
        "deposit_paid",
        "converted",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    /** Snapshot of salon service afroConfig at quote time */
    configSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },

    source: {
      type: String,
      enum: ["link", "web", "app", "manual"],
      default: "web",
    },
    channelHint: {
      type: String,
      enum: ["whatsapp", "instagram", "google", "other", ""],
      default: "",
    },

    reviewNote: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

serviceDemandSchema.index({ salonId: 1, status: 1, createdAt: -1 });
serviceDemandSchema.index({ salonId: 1, serviceId: 1 });

module.exports = mongoose.model("ServiceDemand", serviceDemandSchema);
