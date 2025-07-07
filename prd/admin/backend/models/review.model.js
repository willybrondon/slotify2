const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert" },
    review: { type: String },
    bookingId:{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    salonId:{ type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    rating: { type: Number, default: 0 },
    date:String
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

