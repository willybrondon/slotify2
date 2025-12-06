const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    addressDetails: {
      addressLine1: { type: String, default: "", required: true },
      landMark: { type: String },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    uniqueId: { type: Number, unique: true },
    locationCoordinates: {
      latitude: { type: String, default: "" },
      longitude: { type: String, default: "" },
    },
    salonTime: [
      {
        day: { type: String, default: "" },
        openTime: { type: String, default: "" },
        closedTime: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        breakStartTime: { type: String, default: "" },
        breakEndTime: { type: String, default: "" },
        time: { type: Number, default: 15 },
        isBreak: { type: Boolean, default: true },
      },
    ],
    mobile: { type: String, default: "" },
    about: { type: String, default: "" },

    platformFee: { type: Number, default: 0 },
    earning: { type: Number, default: 0 },

    review: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    password: {
      type: String,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false }, // For opt-in onboarding strategy
    claimToken: { type: String, default: "" }, // Token for salon to claim their profile
    source: { type: String, default: "" }, // Source of salon data (pagesjaunes, google_places, etc.)
    source_id: { type: String, default: "" }, // Original ID from source

    image: [{ type: String, default: "" }],
    mainImage: { type: String, default: "" },
    isBestSeller: { type: Boolean, default: false },

    serviceIds: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        price: { type: Number, default: null },
        allowCities: [
          {
            country: { type: String, trim: true },
            city: { type: String, trim: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Salon", salonSchema);
