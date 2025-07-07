const mongoose = require("mongoose");

const salonCloseSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    reason: { type: String, default: "Salon Closed On This Day" },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("SalonClose", salonCloseSchema);
