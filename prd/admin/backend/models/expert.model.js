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
    
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
    serviceId: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service", default: [] },
    ],

    commission: { type: Number },
    earning: { type: Number, default: 0 },
    currentEarning: { type: Number, default: 0 },
    
    bookingCount: { type: Number, default: 0 },
    totalBookingCount: { type: Number, default: 0 },

    paymentType: { type: Number, default: 0, enum: EXPERT_PAYMENT_TYPE },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      IFSCCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
    },
    upiId: { type: String, default: "" },
    
    review:{ type: Number, default: 0 },
    reviewCount:{ type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Expert", expertSchema);
