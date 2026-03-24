const mongoose = require("mongoose");

const guestOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    mobile: { type: String, required: true, index: true },
    otp: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

guestOtpSchema.index({ email: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model("GuestOTP", guestOtpSchema);
