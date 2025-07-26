const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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

    quantity: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 },

    isTrending: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    isNewCollection: { type: Boolean, default: false },

    isAddByAdmin: { type: Boolean, default: false }, //fake product add by the admin at that time it becomes true
    isUpdateByAdmin: { type: Boolean, default: false },

    allowCities: [
      {
        country: { type: String, trim: true },
        city: { type: String, trim: true },
      },
    ],

    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", default: null },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isDelete: { type: Boolean, default: false },

    //create product request status
    createStatus: {
      type: String,
      default: "All",
      enum: ["Pending", "Approved", "Rejected", "All"],
    },

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

productSchema.index({ salon: 1 });
productSchema.index({ category: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ review: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });
productSchema.index({ searchCount: -1 });

module.exports = mongoose.model("Product", productSchema);
