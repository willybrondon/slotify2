const mongoose = require("mongoose");

const { WITHDRAW_REQUEST_STATUS } = require("../types/constant");

const withdrawRequestSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", default: null },
    amount: { type: Number, default: 0 },
    paymentGateway: { type: String, default: "" },
    paymentDetails: { type: Array, default: [] },
    status: { type: Number, default: 1, enum: WITHDRAW_REQUEST_STATUS },
    paymentDate: { type: String, default: "" },
    reason: { type: String, default: "" },
    type: { type: Number, enum: [1, 2] }, // 1:salon 2:expert
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("WithdrawRequest", withdrawRequestSchema);
