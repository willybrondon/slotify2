const mongoose = require("mongoose");

const withdrawMethodSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    details: { type: Array, default: [] },
    isEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

withdrawMethodSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WithdrawMethod", withdrawMethodSchema);
