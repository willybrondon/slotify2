const mongoose = require("mongoose");

const { REVIEW_TYPE } = require("../types/constant");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
    review: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewType: { type: Number, enum: REVIEW_TYPE },
    date: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({ expertId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
