const mongoose = require("mongoose");

/**
 * One thread per salon × client.
 * P0 messagerie métier: optional context links the thread to a service / demand / booking.
 */
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
    /** Active prestation context (latest ask-about-this-service). */
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
      index: true,
    },
    demandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceDemand",
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    /**
     * Soft topic for future routing (P1/P2).
     * price | booking | cancel | technical | prep | payment | complaint | other
     */
    topic: {
      type: String,
      default: null,
    },
    /** P1 — expert assigned to handle the thread (salon stays owner). */
    assignedExpertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      default: null,
      index: true,
    },
    assignedAt: { type: Date, default: null },
    /** Throttle auto queue-ack messages to the client. */
    lastQueueAckAt: { type: Date, default: null },
    /** Throttle grounded FAQ auto-replies. */
    lastAutoReplyAt: { type: Date, default: null },
    /** client | auto | salon */
    topicSource: { type: String, default: null },
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
