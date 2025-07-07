const { PAYMENT_STATUS } = require("../types/constant");
const { BOOKING_TYPE } = require("../types/constant");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    time: [{ type: String, default: "" }],
    startTime: { type: String },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    remainingTime: String,
    serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
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

    paymentStatus: { type: Number, default: 1, enum: PAYMENT_STATUS }, // 0 for pending 1 for paid
    paymentType: { type: String, default: "" },

    duration: { type: Number, default: 0 },

    amount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    withoutTax: { type: Number, default: 0 },

    platformFee: { type: Number, default: 0 },
    platformFeePercent: { type: Number, default: 0 },

    salonEarning: { type: Number, default: 0 },
    salonCommission: { type: Number, default: 0 },
    salonCommissionPercent: { type: Number, default: 0 },

    expertEarning: { type: Number, default: 0 },

    isDelete: { type: Boolean, default: false },
    isSettle: { type: Boolean, default: false }, // at the end of the month it will be true after settlement

    cancel: {
      reason: String,
      person: {
        type: String,
        enum: ["user", "expert", "admin","salon"],
      },
      time: String,
      date: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.index({ expertId: 1 });
bookingSchema.index({ userId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
