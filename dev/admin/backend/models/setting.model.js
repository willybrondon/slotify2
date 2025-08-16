const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    tnc: { type: String, default: "" },
    privacyPolicyLink: { type: String, default: "" },
    tax: { type: Number, default: 0 }, // tax in percentage

    mtnMoneyApiKey: { type: String, default: "" },
    isMTNMoney: { type: Boolean, default: false },
    mtnMoneyApiSecret: { type: String, default: "" },

    orangeMoneyApiKey: { type: String, default: "" },
    isOrangeMoney: { type: Boolean, default: false },
    orangeMoneyApiSecret: { type: String, default: "" },

    isStripePay: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "" },
    stripeSecretKey: { type: String, default: "" },

    maintenanceMode: { type: Boolean, default: false },

    currencySymbol: { type: String, default: "" },
    currencyName: { type: String, default: "" },

    adminCommissionCharges: { type: Number, default: 0 },
    cancelOrderCharges: { type: Number, default: 0 },

    firebaseKey: { type: Object, default: {} },

    minWithdrawalRequestedAmount: { type: Number, default: 0 }, //min amount requried for withdrawal by salon OR expert

    isAddProductRequest: { type: Boolean, default: false }, //false then directly product add by seller, true then product add through request
    isUpdateProductRequest: { type: Boolean, default: false }, //false then directly product update by seller, true then product update through request
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
