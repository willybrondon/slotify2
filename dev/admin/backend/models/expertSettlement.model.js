const mongoose = require("mongoose");
const { TRANSACTION_STATUS } = require("../types/constant");

const expertSettlementSchema = mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      default: null,
    },
    bookingId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },
    ],
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },

    statusOfTransaction: {
      type: Number,
      enum: TRANSACTION_STATUS,
      default: 0,
    },
    expertEarning: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    date: String,
    paymentDate: String,
    note: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

expertSettlementSchema.index({ expertId: 1 });
expertSettlementSchema.index({ bookingId: 1 });
expertSettlementSchema.index({ salonId: 1 });

module.exports = new mongoose.model("ExpertSettlement", expertSettlementSchema);
