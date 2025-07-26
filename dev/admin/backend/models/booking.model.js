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

    platformFee: { type: Number, default: 0 }, //admin income (withoutTax * platformFeePercent / 100)
    platformFeePercent: { type: Number, default: 0 },

    salonEarning: { type: Number, default: 0 }, //salon income(withoutTax - platformFee)
    salonCommission: { type: Number, default: 0 },
    salonCommissionPercent: { type: Number, default: 0 },

    expertEarning: { type: Number, default: 0 },

    isDelete: { type: Boolean, default: false },
    isSettle: { type: Boolean, default: false }, //at the end of the month it will be true after settlement

    cancel: {
      reason: String,
      person: {
        type: String,
        enum: ["user", "expert", "admin", "salon"],
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
