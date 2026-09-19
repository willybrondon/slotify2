const mongoose = require("mongoose");
const Conversation = require("../../models/salonConversation.model");
const Message = require("../../models/salonMessage.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");
const {
  getOrCreateConversation,
  postMessage,
  resolveConversationContext,
  oidOrNull,
  normalizeTopic,
} = require("../../services/salonMessaging.service");

function photoUrlsFromFiles(files) {
  const list = Array.isArray(files)
    ? files
    : files?.photos && Array.isArray(files.photos)
      ? files.photos
      : [];
  if (!list.length) return [];
  const base = (process.env.baseURL || "").replace(/\/+$/, "");
  return list
    .slice(0, 4)
    .map((f) => {
      const rel = f?.path || f?.filename || "";
      if (!rel) return "";
      const normalized = String(rel).replace(/\\/g, "/").replace(/^\/+/, "");
      return base ? `${base}/${normalized}` : `/${normalized}`;
    })
    .filter(Boolean);
}

function filesFromRequest(req) {
  if (!req?.files) return [];
  if (Array.isArray(req.files)) return req.files.filter(Boolean);
  if (Array.isArray(req.files.photos)) return req.files.photos.filter(Boolean);
  return [];
}

function contextFromReq(src = {}) {
  return {
    serviceId: oidOrNull(src.serviceId),
    demandId: oidOrNull(src.demandId),
    bookingId: oidOrNull(src.bookingId),
    topic: normalizeTopic(src.topic),
  };
}

/**
 * GET /api/public/messaging/thread?salonId=&userId=&serviceId=&demandId=&bookingId=&topic=
 * Returns conversation + recent messages (creates empty thread if needed).
 */
exports.publicGetThread = async (req, res) => {
  try {
    const salonId = (req.query.salonId || "").trim();
    const userId = (req.query.userId || "").trim();
    if (
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ status: false, message: "salonId and userId required" });
    }

    const salon = await Salon.findById(salonId)
      .select("name mobile messagingEnabled instagramUrl serviceIds")
      .populate("serviceIds.id", "name duration")
      .lean();
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }
    if (salon.messagingEnabled === false) {
      return res.status(200).json({
        status: false,
        message: "Messaging disabled for this salon",
        messagingEnabled: false,
      });
    }

    const user = await User.findById(userId).select("_id fname lname").lean();
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const context = contextFromReq(req.query);
    const conversation = await getOrCreateConversation(salonId, userId, context);
    conversation.unreadUser = 0;
    await conversation.save();

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    const contextOut = await resolveConversationContext(conversation, salon);

    return res.status(200).json({
      status: true,
      messagingEnabled: true,
      salon: {
        _id: salon._id,
        name: salon.name,
        mobile: salon.mobile || "",
        instagramUrl: salon.instagramUrl || "",
      },
      conversation: {
        _id: conversation._id,
        lastMessageAt: conversation.lastMessageAt,
        lastPreview: conversation.lastPreview,
        ...contextOut,
      },
      context: contextOut,
      messages,
    });
  } catch (error) {
    console.error("[publicGetThread]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/messaging/send
 * body: salonId, userId, body, serviceId?, demandId?, bookingId?, topic? ; files: photos[]
 */
exports.publicSendMessage = async (req, res) => {
  try {
    const salonId = (req.body?.salonId || "").trim();
    const userId = (req.body?.userId || "").trim();
    const body = req.body?.body || "";

    if (
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ status: false, message: "salonId and userId required" });
    }

    const salon = await Salon.findById(salonId).select("messagingEnabled").lean();
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }
    if (salon.messagingEnabled === false) {
      return res.status(200).json({ status: false, message: "Messaging disabled" });
    }

    const user = await User.findById(userId).select("_id").lean();
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const photoUrls = photoUrlsFromFiles(filesFromRequest(req));
    const context = contextFromReq(req.body);
    const lang = String(req.body?.lang || req.query?.lang || "fr")
      .toLowerCase()
      .startsWith("en")
      ? "en"
      : "fr";

    const conversation = await getOrCreateConversation(salonId, userId, context);
    const msg = await postMessage({
      conversation,
      sender: "user",
      body,
      photoUrls,
      hintTopic: context.topic || null,
      lang,
    });

    // Reload after qualify/auto-reply may have mutated the conversation
    const fresh = await Conversation.findById(conversation._id);
    const contextOut = await resolveConversationContext(fresh || conversation);

    return res.status(200).json({
      status: true,
      message: msg,
      qualification: msg.qualification || null,
      conversation: {
        _id: (fresh || conversation)._id,
        ...contextOut,
      },
    });
  } catch (error) {
    console.error("[publicSendMessage]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
