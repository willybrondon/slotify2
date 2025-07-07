const mongoose = require("mongoose");

const uniqueStringSchema = new mongoose.Schema(
  {
    string: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("UniqueString", uniqueStringSchema);
