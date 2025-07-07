const mongoose = require("mongoose");

const salonRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    address: { type: String, default: "", required: true },
    locationCoordinates: {
      latitude: { type: String, default: "" },
      longitude: { type: String, default: "" },
    },
    mobile: { type: String, default: "" },
    about: { type: String, default: "" },
    expertCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

salonRequestSchema.index({ userId: 1 });

module.exports = mongoose.model("SalonRequest", salonRequestSchema);
