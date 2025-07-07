const mongoose = require("mongoose");
const { TRANSACTION_STATUS } = require("../types/constant");
const salonSettlementSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
    bookingId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },
    ],

    salonEarning: { type: Number, default: 0 },
    salonCommission: { type: Number, default: 0 },
    salonCommissionPercent: { type: Number, default: 0 },

    statusOfTransaction: {
      type: Number,
      enum: TRANSACTION_STATUS,
      default: 0,
        },
    
    bonus: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    note:String,
    date: String,
    paymentDate: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

salonSettlementSchema.index({ bookingId: 1 });
salonSettlementSchema.index({ salonId: 1 });

module.exports = mongoose.model("SalonSettlement", salonSettlementSchema);
