const mongoose = require("mongoose");

const salonMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalonConversation",
      required: true,
      index: true,
    },
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
    sender: {
      type: String,
      enum: ["user", "salon"],
      required: true,
    },
    body: { type: String, default: "" },
    photoUrls: [{ type: String }],
  },
  { timestamps: true, versionKey: false }
);

salonMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("SalonMessage", salonMessageSchema);
