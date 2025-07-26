const mongoose = require("mongoose");

const { EXPERT_PAYMENT_TYPE } = require("../types/constant");

const expertSchema = new mongoose.Schema(
  {
    fname: { type: String, default: "" },
    lname: { type: String, default: "" },
    email: { type: String, default: "" },
    age: Number,
    image: { type: String, default: "" },
    mobile: { type: String, default: "" },
    gender: String,
    fcmToken: { type: String, default: "" },
    isBlock: { type: Boolean, default: false },
    password: { type: String, default: "123456" },
    isDelete: { type: Boolean, default: false },
    isAttend: { type: Boolean, default: false },
    showDialog: { type: Boolean, default: false },
    uniqueId: { type: Number, default: null, unique: true },

    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service", default: [] }],

    commission: { type: Number },
    earning: { type: Number, default: 0 },

    bookingCount: { type: Number, default: 0 },
    totalBookingCount: { type: Number, default: 0 },

    review: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Expert", expertSchema);
