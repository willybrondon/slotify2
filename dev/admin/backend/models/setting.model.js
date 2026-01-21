const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    tnc: { type: String, default: "" },
    privacyPolicyLink: { type: String, default: "" },
    tax: { type: Number, default: 0 }, // tax in percentage

    razorPayId: { type: String, default: "" },
    isRazorPay: { type: Boolean, default: false },
    razorSecretKey: { type: String, default: "" },

    isStripePay: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "" },
    stripeSecretKey: { type: String, default: "" },

    isZitopay: { type: Boolean, default: false },
    zitopayApiKey: { type: String, default: "" },
    zitopaySecretKey: { type: String, default: "" },
    zitopayMerchantId: { type: String, default: "" },

    maintenanceMode: { type: Boolean, default: false },

    currencySymbol: { type: String, default: "" },
    currencyName: { type: String, default: "" },

    flutterWaveKey: { type: String, default: "" },
    isFlutterWave: { type: Boolean, default: false },

    adminCommissionCharges: { type: Number, default: 0 },
    cancelOrderCharges: { type: Number, default: 0 },

    firebaseKey: { type: Object, default: {} },

    minWithdrawalRequestedAmount: { type: Number, default: 0 }, //min amount required for withdrawal by salon OR expert
    minSalonWalletBalance: { type: Number, default: 0 }, //minimum wallet balance required for salon to accept bookings

    isAddProductRequest: { type: Boolean, default: false }, //false then directly product add by seller, true then product add through request
    isUpdateProductRequest: { type: Boolean, default: false }, //false then directly product update by seller, true then product update through request
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
