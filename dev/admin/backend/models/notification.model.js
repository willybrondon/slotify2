const mongoose = require("mongoose");
const { NOTIFICATION_TYPE } = require("../types/constant");
const moment = require("moment");
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert" },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    notificationType: {
      type: Number,
      enum: NOTIFICATION_TYPE, // 0 for 'User' and 1 for 'Expert' and 2 for 'Salon'
    },
    message: { type: String, default: "" },
    type: { type: String, default: "" },
    title: { type: String, default: "" },
    image: { type: String, default: "" },
    date: { type: String, default: moment().format("YYYY-MM-DD") },
    //expiration_date: { type: Date, required: true, expires: 2592000000 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ expertId: 1 });
notificationSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
