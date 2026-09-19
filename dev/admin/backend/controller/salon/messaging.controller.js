const mongoose = require("mongoose");
const Conversation = require("../../models/salonConversation.model");
const Message = require("../../models/salonMessage.model");
const User = require("../../models/user.model");
const Service = require("../../models/service.model");
const Expert = require("../../models/expert.model");
const {
  getOrCreateConversation,
  postMessage,
  resolveConversationContext,
  listAssignableExperts,
  assignExpertToConversation,
  oidOrNull,
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
 * GET /salon/messaging/conversations?assignedExpertId= | unassigned=1
 */
exports.listConversations = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    if (!salonId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const filter = { salonId };
    const assignedExpertId = oidOrNull(req.query.assignedExpertId);
    if (assignedExpertId) {
      filter.assignedExpertId = assignedExpertId;
    } else if (String(req.query.unassigned || "") === "1") {
      filter.$or = [
        { assignedExpertId: null },
        { assignedExpertId: { $exists: false } },
      ];
    }

    let conversations = [];
    try {
      conversations = await Conversation.find(filter)
        .sort({ lastMessageAt: -1 })
        .limit(100)
        .lean();
    } catch (dbErr) {
      console.warn("[listConversations] soft-fail", dbErr.message);
      return res.status(200).json({
        status: true,
        conversations: [],
        unreadTotal: 0,
        message: "Messaging not fully initialized yet",
      });
    }

    const userIds = conversations.map((c) => c.userId);
    const serviceIds = conversations.map((c) => c.serviceId).filter(Boolean);
    const expertIds = conversations
      .map((c) => c.assignedExpertId)
      .filter(Boolean);

    const [users, services, experts] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select("fname lname email image mobile")
        .lean(),
      serviceIds.length
        ? Service.find({ _id: { $in: serviceIds } }).select("name").lean()
        : Promise.resolve([]),
      expertIds.length
        ? Expert.find({ _id: { $in: expertIds } })
            .select("fname lname image isAttend")
            .lean()
        : Promise.resolve([]),
    ]);
    const byId = new Map(users.map((u) => [String(u._id), u]));
    const svcById = new Map(services.map((s) => [String(s._id), s]));
    const exById = new Map(experts.map((e) => [String(e._id), e]));

    const list = conversations.map((c) => {
      const u = byId.get(String(c.userId));
      const svc = c.serviceId ? svcById.get(String(c.serviceId)) : null;
      const ex = c.assignedExpertId
        ? exById.get(String(c.assignedExpertId))
        : null;
      return {
        ...c,
        serviceName: svc?.name || "",
        assignedExpertName: ex
          ? [ex.fname, ex.lname].filter(Boolean).join(" ") || "Expert"
          : "",
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
 * GET /salon/messaging/experts?serviceId=
 */
exports.listExperts = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    if (!salonId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const serviceId = oidOrNull(req.query.serviceId);
    const experts = await listAssignableExperts(salonId, serviceId);
    return res.status(200).json({ status: true, experts });
  } catch (error) {
    console.error("[listMessagingExperts]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/messaging/assign
 * body: { conversationId, expertId | null }
 */
exports.assignExpert = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    const conversationId = (req.body?.conversationId || "").trim();
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

    const expertId = req.body?.expertId;
    const result = await assignExpertToConversation(
      conversation,
      expertId === null || expertId === "" || expertId === "null"
        ? null
        : expertId
    );
    const context = await resolveConversationContext(result.conversation);

    return res.status(200).json({
      status: true,
      conversation: {
        ...(result.conversation.toObject
          ? result.conversation.toObject()
          : result.conversation),
        ...context,
      },
      context,
    });
  } catch (error) {
    console.error("[assignExpert]", error);
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

    const context = await resolveConversationContext(conversation);
    const experts = await listAssignableExperts(
      salonId,
      conversation.serviceId
    );

    return res.status(200).json({
      status: true,
      conversation: {
        ...(conversation.toObject ? conversation.toObject() : conversation),
        ...context,
      },
      context,
      experts,
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
 */
exports.sendToUser = async (req, res) => {
  try {
    const salonId = req.salon?._id || req.salon;
    const userId = (req.body?.userId || "").trim();
    const body = req.body?.body || "";
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "userId required" });
    }

    const conversation = await getOrCreateConversation(salonId, userId, {
      serviceId: req.body?.serviceId,
      demandId: req.body?.demandId,
      bookingId: req.body?.bookingId,
      topic: req.body?.topic,
    });
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
