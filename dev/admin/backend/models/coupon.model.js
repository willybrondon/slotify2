const mongoose = require("mongoose");

const { COUPON_TYPE, DISCOUNT_TYPE } = require("../types/constant");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    minAmountToApply: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    expiryDate: { type: String, default: "" },
    type: { type: Number, default: 1, enum: COUPON_TYPE }, //1.wallet 2.appoinment 3.order
    discountType: { type: Number, default: 1, enum: DISCOUNT_TYPE }, //1.flat 2.percentage
    isActive: { type: Boolean, default: true },
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usageType: { type: Number, enum: COUPON_TYPE },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
