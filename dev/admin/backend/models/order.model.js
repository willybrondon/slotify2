const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, default: null }, //unique orderId
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
        purchasedTimeProductPrice: { type: Number, default: 0 },
        purchasedTimeShippingCharges: { type: Number, default: 0 },
        productCode: { type: String },
        productQuantity: { type: Number, default: 0 },
        attributesArray: [
          {
            name: { type: String },
            value: { type: String },
          },
        ],

        commissionPerProductQuantity: { type: Number, default: 0 },
        cancelOrderChargesPerProductQuantity: { type: Number, default: 0 },

        status: {
          type: String,
          enum: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
        },
        date: { type: String },

        deliveredServiceName: { type: String, default: null },
        trackingId: { type: String, default: null },
        trackingLink: { type: String, default: null },
      },
    ],

    purchasedTimeadminCommissionCharges: { type: Number, default: 0 },
    purchasedTimeCancelOrderCharges: { type: Number, default: 0 },

    totalQuantity: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 }, //Holds total number of items in the cart

    totalShippingCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 }, //after addition of totalShippingCharges
    finalTotal: { type: Number, default: 0 }, //same as total (if no promoCode)

    coupon: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      code: { type: String, default: null },
      discountType: { type: Number, default: null }, //1.flat 2.percentage
      maxDiscount: { type: Number, default: null },
      minAmountToApply: { type: Number, default: 0 },
    },

    shippingAddress: {
      name: { type: String, default: null },
      country: { type: String, default: null },
      state: { type: String, default: null },
      city: { type: String, default: null },
      zipCode: { type: Number, default: null },
      address: { type: String, default: null },
    },

    paymentGateway: { type: String, default: "Master Card" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ "items.product": 1, "items.salon": 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
