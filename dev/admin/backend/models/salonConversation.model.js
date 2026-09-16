const mongoose = require("mongoose");

const salonConversationSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessageAt: { type: Date, default: Date.now },
    lastPreview: { type: String, default: "" },
    unreadSalon: { type: Number, default: 0 },
    unreadUser: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "archived"],
      default: "open",
    },
  },
  { timestamps: true, versionKey: false }
);

salonConversationSchema.index({ salonId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("SalonConversation", salonConversationSchema);
