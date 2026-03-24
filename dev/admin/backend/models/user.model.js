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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("User", userSchema);
