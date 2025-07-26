const mongoose = require("mongoose");

const moment = require("moment");

const { PAYMENT_GATEWAY } = require("../types/constant");

const userWalletHistorySchema = new mongoose.Schema(
  {
    uniqueId: { type: String, default: "" },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    itemId: { type: mongoose.Schema.Types.ObjectId, default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

    coupon: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      code: { type: String, default: null },
      discountType: { type: Number, default: null }, //0.flat 1.percentage
      maxDiscount: { type: Number, default: null },
      minAmountToApply: { type: Number, default: 0 },
    },

    commissionPerProductQuantity: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    couponAmount: { type: Number, default: 0 }, //discount OR bonus

    paymentGateway: { type: Number, default: 1, enum: PAYMENT_GATEWAY },
    type: { type: Number, enum: [1, 2, 3, 4, 5] },
    //1.amount deposite at the time of add wallet
    //2.amount deduct at the time of booking (salon's fee + tax)
    //3.amount deduct at the time of product purchase
    //4.order cancel charges
    //5.amount refund at the time of order cancel

    date: { type: String, default: moment().format("YYYY-MM-DD") },
    time: { type: String, default: moment().format("HH:mm a") },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("UserWalletHistory", userWalletHistorySchema);
