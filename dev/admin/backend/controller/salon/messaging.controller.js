const mongoose = require("mongoose");
const Conversation = require("../../models/salonConversation.model");
const Message = require("../../models/salonMessage.model");
const User = require("../../models/user.model");
const {
  getOrCreateConversation,
  postMessage,
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

/**
 * GET /salon/messaging/conversations
 */
exports.listConversations = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    if (!salonId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    let conversations = [];
    try {
      conversations = await Conversation.find({ salonId })
        .sort({ lastMessageAt: -1 })
        .limit(100)
        .lean();
    } catch (dbErr) {
      // Collection / index missing on older deploys — soft empty list
      console.warn("[listConversations] soft-fail", dbErr.message);
      return res.status(200).json({
        status: true,
        conversations: [],
        unreadTotal: 0,
        message: "Messaging not fully initialized yet",
      });
    }

    const userIds = conversations.map((c) => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select("fname lname email image mobile")
      .lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));

    const list = conversations.map((c) => {
      const u = byId.get(String(c.userId));
      return {
        ...c,
        user: u
          ? {
              _id: u._id,
              name: [u.fname, u.lname].filter(Boolean).join(" ") || u.email || "Cliente",
              email: u.email || "",
              image: u.image || "",
              mobile: u.mobile || "",
            }
          : { _id: c.userId, name: "Cliente", email: "", image: "", mobile: "" },
      };
    });

    const unreadTotal = list.reduce((sum, c) => sum + (c.unreadSalon || 0), 0);

    return res.status(200).json({ status: true, conversations: list, unreadTotal });
  } catch (error) {
    console.error("[listConversations]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /salon/messaging/messages?conversationId=
 */
exports.getMessages = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    const conversationId = (req.query.conversationId || "").trim();
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ status: false, message: "conversationId required" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      salonId,
    });
    if (!conversation) {
      return res.status(404).json({ status: false, message: "Conversation not found" });
    }

    conversation.unreadSalon = 0;
    await conversation.save();

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    const user = await User.findById(conversation.userId)
      .select("fname lname email image mobile")
      .lean();

    return res.status(200).json({
      status: true,
      conversation,
      user: user
        ? {
            _id: user._id,
            name: [user.fname, user.lname].filter(Boolean).join(" ") || user.email || "Cliente",
            email: user.email || "",
            image: user.image || "",
            mobile: user.mobile || "",
          }
        : null,
      messages,
    });
  } catch (error) {
    console.error("[getMessages]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/messaging/send
 * body: conversationId, body ; files: photos[]
 */
exports.sendMessage = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    const conversationId = (req.body?.conversationId || "").trim();
    const body = req.body?.body || "";

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ status: false, message: "conversationId required" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      salonId,
    });
    if (!conversation) {
      return res.status(404).json({ status: false, message: "Conversation not found" });
    }

    const photoUrls = photoUrlsFromFiles(filesFromRequest(req));

    const msg = await postMessage({
      conversation,
      sender: "salon",
      body,
      photoUrls,
    });

    return res.status(200).json({ status: true, message: msg });
  } catch (error) {
    console.error("[salonSendMessage]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/messaging/reply-user
 * Start/continue a thread by userId (optional helper).
 */
exports.sendToUser = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    const userId = (req.body?.userId || "").trim();
    const body = req.body?.body || "";
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "userId required" });
    }

    const conversation = await getOrCreateConversation(salonId, userId);
    const photoUrls = photoUrlsFromFiles(filesFromRequest(req));

    const msg = await postMessage({
      conversation,
      sender: "salon",
      body,
      photoUrls,
    });

    return res.status(200).json({ status: true, conversation, message: msg });
  } catch (error) {
    console.error("[sendToUser]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
