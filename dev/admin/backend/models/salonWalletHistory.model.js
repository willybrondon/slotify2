const mongoose = require("mongoose");
const moment = require("moment");

const { PAYMENT_GATEWAY } = require("../types/constant");

const salonWalletHistorySchema = new mongoose.Schema(
  {
    uniqueId: { type: String, default: "" },

    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    itemId: { type: mongoose.Schema.Types.ObjectId, default: null },

    amount: { type: Number, default: 0 },

    paymentGateway: { type: Number, default: 1, enum: PAYMENT_GATEWAY },
    type: { type: Number, enum: [1, 2, 3, 4] },
    //1.amount deposite at the time of add wallet (by salon owner or admin)
    //2.amount deduct at the time of booking (platform commission)
    //3.amount refund at the time of booking cancel
    //4.amount added by admin manually

    description: { type: String, default: "" }, // Description of transaction
    addedBy: { type: String, enum: ["salon", "admin"], default: "salon" }, // Who added the money

    date: { type: String, default: moment().format("YYYY-MM-DD") },
    time: { type: String, default: moment().format("HH:mm a") },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("SalonWalletHistory", salonWalletHistorySchema);

