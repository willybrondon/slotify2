const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
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
      },
    ],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalShippingCharges: { type: Number, default: 0 },

    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 }, //after addition of shippingCharges
    finalTotal: { type: Number, default: 0 }, //after deduction of discount according to promoCode

    totalItems: { type: Number, default: 0 }, //Holds total number of items in the cart
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

cartSchema.index({ "items.product": 1, "items.salonId": 1 });
cartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", cartSchema);
