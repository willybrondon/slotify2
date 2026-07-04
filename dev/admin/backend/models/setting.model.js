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

    /** Show wallet payment on customer app (booking / products) */
    isWalletPay: { type: Boolean, default: false },
    /** Allow salon owners to recharge wallet via Stripe / MTN MoMo */
    isSalonWalletRecharge: { type: Boolean, default: false },

    isZitopay: { type: Boolean, default: false },
    zitopayApiKey: { type: String, default: "" },
    zitopaySecretKey: { type: String, default: "" },
    zitopayMerchantId: { type: String, default: "" },

    isMtnMomo: { type: Boolean, default: false },
    mtnMomoSubscriptionKey: { type: String, default: "" }, // Subscription Key (Primary or Secondary from subscription) - REQUIRED for Ocp-Apim-Subscription-Key header
    mtnMomoApiUserId: { type: String, default: "" }, // API User ID (UUID created when creating API User) - REQUIRED for Basic Auth (Authorization: Basic base64(API_USER_ID:API_KEY))
    mtnMomoApiKey: { type: String, default: "" }, // API Key (generated for API User) - REQUIRED for Basic Auth (Authorization: Basic base64(API_USER_ID:API_KEY))
    mtnMomoCallbackHost: { type: String, default: "" }, // Callback Host for MTN MoMo (e.g., "skedisy.com" or "api.skedisy.com") - Must match providerCallbackHost in MTN Developer Portal
    mtnMomoEnvironment: { type: String, default: "sandbox" }, // sandbox or production
    // Legacy fields (kept for backward compatibility, but not used for authentication)
    mtnMomoPrimaryKey: { type: String, default: "" }, // Legacy - kept for migration
    mtnMomoSecondaryKey: { type: String, default: "" }, // Legacy - kept for migration

    maintenanceMode: { type: Boolean, default: false },

    currencySymbol: { type: String, default: "" },
    currencyName: { type: String, default: "" },

    flutterWaveKey: { type: String, default: "" },
    isFlutterWave: { type: Boolean, default: false },

    adminCommissionCharges: { type: Number, default: 0 }, // Commission for product orders
    customerCommissionCharges: { type: Number, default: 0 }, // Commission percentage charged from customers on bookings
    salonCommissionCharges: { type: Number, default: 0 }, // Commission percentage charged from salon owners on bookings (replaces platformFee from salon model)
    cancelOrderCharges: { type: Number, default: 0 },

    firebaseKey: { type: Object, default: {} },

    minWithdrawalRequestedAmount: { type: Number, default: 0 }, //min amount required for withdrawal by salon OR expert
    minSalonWalletBalance: { type: Number, default: 0 }, //minimum wallet balance required for salon to accept bookings
    minUserWalletBalance: { type: Number, default: 0 }, //minimum wallet balance required for customer to make bookings

    isAddProductRequest: { type: Boolean, default: false }, //false then directly product add by seller, true then product add through request
    isUpdateProductRequest: { type: Boolean, default: false }, //false then directly product update by seller, true then product update through request

    /** Global default for auto-confirm bookings when salon has no override */
    autoConfirmBookings: { type: Boolean, default: true },

    /** Comma-separated emails: receive new-booking approve/decline links + customer cancellation notices */
    reservationNotificationEmails: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
