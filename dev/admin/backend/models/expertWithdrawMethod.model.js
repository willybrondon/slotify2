const mongoose = require("mongoose");

const expertWithdrawMethodSchema = new mongoose.Schema(
  {
    expert: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", required: true },
    paymentMethods: [
      {
        paymentGateway: { type: String, default: "" },
        paymentDetails: { type: Array, default: [] },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("ExpertWithdrawMethod", expertWithdrawMethodSchema);
