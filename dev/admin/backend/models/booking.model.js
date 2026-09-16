const { PAYMENT_STATUS } = require("../types/constant");
const { BOOKING_TYPE } = require("../types/constant");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    time: [{ type: String, default: "" }],
    startTime: { type: String },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    remainingTime: { type: String },

    atPlace: { type: Number, enum: [1, 2] }, //1.salon 2.home
    address: { type: String, default: "" },

    status: {
      type: String,
      enum: BOOKING_TYPE,
      default: "pending",
    },
    bookingId: { type: String, unique: true },
    date: {
      type: String,
      default: true,
    },
    isReviewed: { type: Boolean, default: false },

    duration: { type: Number, default: 0 },

    tax: { type: Number, default: 0 },
    withoutTax: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, //fee + tax - discount (if any)

    coupon: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      code: { type: String, default: null },
      discountType: { type: Number, default: null }, //1.flat 2.percentage
      maxDiscount: { type: Number, default: null },
      minAmountToApply: { type: Number, default: 0 },
    },

    platformFee: { type: Number, default: 0 }, //admin income from salon (withoutTax * platformFeePercent / 100)
    platformFeePercent: { type: Number, default: 0 }, //salon commission percentage
    customerCommission: { type: Number, default: 0 }, //admin income from customer (withoutTax * customerCommissionPercent / 100)
    customerCommissionPercent: { type: Number, default: 0 }, //customer commission percentage

    salonEarning: { type: Number, default: 0 }, //salon income(withoutTax - platformFee)
    salonCommission: { type: Number, default: 0 },
    salonCommissionPercent: { type: Number, default: 0 },

    expertEarning: { type: Number, default: 0 },

    isDelete: { type: Boolean, default: false },
    isSettle: { type: Boolean, default: false }, //at the end of the month it will be true after settlement

    // SMS Reminder tracking
    smsReminder24hSent: { type: Boolean, default: false }, // J-1 (day before)
    smsReminder2hSent: { type: Boolean, default: false }, // 2 hours before appointment
    /** Soft checklist nudge embedded in J-1 SMS (photo / prep) */
    smsPrepChecklistSent: { type: Boolean, default: false },
    /** Client confirmed prep done (optional) */
    prepConfirmedAt: { type: Date, default: null },
    /** Inspiration photo missing flag for checklist */
    inspirationPhotoRequired: { type: Boolean, default: false },
    inspirationPhotoUrls: [{ type: String }],
    /** After appointment — result proof */
    resultPhotoUrls: [{ type: String }],
    resultPhotoNote: { type: String, default: "" },
    /** Planned vs actual */
    plannedDurationMinutes: { type: Number, default: null },
    actualDurationMinutes: { type: Number, default: null },
    actualPrice: { type: Number, default: null },
    actualVarianceNote: { type: String, default: "" },
    /** Materials snapshot at book time */
    materialsSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Client accepted salon policies at booking */
    policyAcceptedAt: { type: Date, default: null },
    policyAcceptText: { type: String, default: "" },

    /**
     * StyleSeat-style protective rebooking (Afro lifetime).
     * Set on checkout when service afroConfig.styleLifetimeWeeks > 0.
     */
    clientAnswers: { type: mongoose.Schema.Types.Mixed, default: null },
    rebookDueAt: { type: Date, default: null, index: true },
    rebookToken: { type: String, default: "", index: true },
    rebookReminderSent: { type: Boolean, default: false },

    /** Applied loyalty discount (same-service rebook) */
    loyaltyDiscount: {
      percent: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      priorCount: { type: Number, default: 0 },
      label: { type: String, default: "" },
    },

    // Admin email: accept/reject reservation from email (token links)
    adminEmailActionToken: { type: String, default: "" },
    adminEmailActionTokenExpires: { type: Date },
    adminEmailApprovedAt: { type: Date },

    cancel: {
      reason: String,
      person: {
        type: String,
        enum: ["user", "expert", "admin", "salon"],
      },
      time: String,
      date: String,
    },

    /** Outcome of cancel vs salon cancellationPolicy (deposit retention) */
    cancelSettlement: {
      mode: { type: String, default: "" }, // free | late
      retainPercent: { type: Number, default: 0 },
      retainedAmount: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      prepaidBase: { type: Number, default: 0 },
      policyEnabled: { type: Boolean, default: false },
      appliedAt: { type: Date, default: null },
    },

    /** SQUIRE wedge — link from ServiceDemand after deposit */
    demandId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceDemand", default: null },
    configSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    quotedPrice: { type: Number, default: null },
    estimatedDuration: { type: Number, default: null },
    depositAmount: { type: Number, default: 0 },
    depositPaidAt: { type: Date, default: null },
    balanceDue: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.index({ expertId: 1 });
bookingSchema.index({ userId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
