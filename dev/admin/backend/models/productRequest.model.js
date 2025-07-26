const mongoose = require("mongoose");

const productRequestSchema = new mongoose.Schema(
  {
    productName: { type: String, trim: true },
    brand: { type: String, trim: true },
    productCode: { type: String, unique: true, trim: true, default: "" },
    description: { type: String, trim: true },

    price: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },

    mainImage: { type: String },
    images: { type: Array, default: [] },

    attributes: [
      {
        name: { type: String },
        value: [{ type: String }],
      },
    ],

    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },

    //update product request status
    updateStatus: {
      type: String,
      default: "All",
      enum: ["Pending", "Approved", "Rejected", "All"],
    },

    date: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productRequestSchema.index({ salon: 1 });
productRequestSchema.index({ category: 1 });

module.exports = mongoose.model("ProductRequest", productRequestSchema);
