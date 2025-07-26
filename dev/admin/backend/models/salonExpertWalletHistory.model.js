const mongoose = require("mongoose");

const { WITHDRAW_REQUEST_STATUS } = require("../types/constant");

const moment = require("moment");

const salonExpertWalletHistorySchema = new mongoose.Schema(
  {
    uniqueId: { type: String, default: "" },

    expert: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", default: null },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },

    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    itemId: { type: mongoose.Schema.Types.ObjectId, default: null },

    commissionPerProductQuantity: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },

    type: { type: Number, enum: [1, 2, 3, 4] },
    //1.amount deposite to expert at the time of booking complete
    //2.amount deduct from (salon OR Expert) when at the time of withdraw request approve
    //3.amount deposite to salon at the time of order confirmed
    //4.amount deposite to salon at the time of booking complete

    payoutStatus: { type: Number, default: 0, enum: WITHDRAW_REQUEST_STATUS },

    date: { type: String, default: moment().format("YYYY-MM-DD") },
    time: { type: String, default: moment().format("HH:mm a") },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("SalonExpertWalletHistory", salonExpertWalletHistorySchema);
