const mongoose = require("mongoose");
const { LOGIN_TYPE } = require("../types/constant");

const LOGIN_TYPE_VALUES = Object.values(LOGIN_TYPE).filter((v) => typeof v === "number");

const userSchema = new mongoose.Schema(
  {
    uniqueId: { type: Number, default: null },
    fname: { type: String, default: "" },
    lname: { type: String, default: "" },
    image: { type: String, default: "" },
    email: { type: String, default: "" },
    password: String,
    loginType: { type: Number, enum: LOGIN_TYPE_VALUES }, //1.email-password 2.google 3.mobile 4.apple 5.guest email OTP
    age: { type: Number },
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    analyticDate: { type: String, default: "" },
    isBlock: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    fcmToken: { type: String, default: null },
    identity: { type: String },
    isDelete: { type: Boolean, default: false },
    isUpdate: { type: Boolean, default: false },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    salonRequestSent: { type: Boolean, default: false },
    amount: { type: Number, default: 0 }, //wallet balance

    /**
     * Beauty Profile (server) — StyleSeat-inspired client hair dossier.
     * Synced from booking answers / salon notes; used for rebook.
     */
    beautyProfile: {
      hairType: { type: String, default: "" },
      hairLength: { type: String, default: "" },
      density: { type: String, default: "" },
      sensitivity: { type: String, default: "" },
      preferences: { type: String, default: "" },
      lastConfig: { type: mongoose.Schema.Types.Mixed, default: null },
      lastSalonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        default: null,
      },
      lastServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null,
      },
      inspirationPhotoUrls: [{ type: String }],
      resultPhotoUrls: [{ type: String }],
      updatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("User", userSchema);
