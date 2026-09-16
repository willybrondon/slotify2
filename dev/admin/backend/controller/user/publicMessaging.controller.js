const mongoose = require("mongoose");
const Conversation = require("../../models/salonConversation.model");
const Message = require("../../models/salonMessage.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");
const {
  getOrCreateConversation,
  postMessage,
} = require("../../services/salonMessaging.service");

function photoUrlsFromFiles(files) {
  if (!files || !files.length) return [];
  const base = process.env.baseURL || "";
  return files.slice(0, 4).map((f) => base + f.path.replace(/\\/g, "/"));
}

/**
 * GET /api/public/messaging/thread?salonId=&userId=
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
      .select("name mobile messagingEnabled instagramUrl")
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

    const conversation = await getOrCreateConversation(salonId, userId);
    conversation.unreadUser = 0;
    await conversation.save();

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

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
      },
      messages,
    });
  } catch (error) {
    console.error("[publicGetThread]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/messaging/send
 * body: salonId, userId, body ; files: photos[]
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

    const files = req.files?.photos || req.files || [];
    const fileList = Array.isArray(files) ? files : [files].filter(Boolean);
    const photoUrls = photoUrlsFromFiles(fileList);

    const conversation = await getOrCreateConversation(salonId, userId);
    const msg = await postMessage({
      conversation,
      sender: "user",
      body,
      photoUrls,
    });

    return res.status(200).json({ status: true, message: msg });
  } catch (error) {
    console.error("[publicSendMessage]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
