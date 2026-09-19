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
      enum: ["user", "salon", "system", "expert"],
      required: true,
    },
    /** When sender is expert — who wrote the reply. */
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      default: null,
    },
    body: { type: String, default: "" },
    photoUrls: [{ type: String }],
    isQueueAck: { type: Boolean, default: false },
    isAutoReply: { type: Boolean, default: false },
    autoReplyTopic: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

salonMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("SalonMessage", salonMessageSchema);
