const mongoose = require("mongoose");
const moment = require("moment");
const Conversation = require("../models/salonConversation.model");
const Message = require("../models/salonMessage.model");
const Salon = require("../models/salon.model");
const User = require("../models/user.model");
const Service = require("../models/service.model");
const Expert = require("../models/expert.model");
const Booking = require("../models/booking.model");
const Notification = require("../models/notification.model");
const { NOTIFICATION_TYPE } = require("../types/constant");

const TOPIC_VALUES = new Set([
  "price",
  "booking",
  "cancel",
  "technical",
  "prep",
  "payment",
  "complaint",
  "other",
]);

const QUEUE_ACK_COOLDOWN_MS = 30 * 60 * 1000;
const QUEUE_ACK_FR =
  "Votre message a bien été reçu. Le professionnel répondra dès que possible.";
const QUEUE_ACK_EN =
  "Your message has been received. The professional will respond as soon as possible.";

function previewOf(body, photoCount) {
  const text = String(body || "").trim();
  if (text) return text.slice(0, 120);
  if (photoCount > 0) return photoCount > 1 ? `${photoCount} photos` : "1 photo";
  return "";
}

function normalizePhotoUrls(urls) {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((u) => String(u || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function oidOrNull(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return s;
}

function normalizeTopic(topic) {
  const t = String(topic || "").trim().toLowerCase();
  return TOPIC_VALUES.has(t) ? t : "";
}

function applyContextFields(conversation, context = {}) {
  if (!conversation || !context) return false;
  let dirty = false;
  const serviceId = oidOrNull(context.serviceId);
  const demandId = oidOrNull(context.demandId);
  const bookingId = oidOrNull(context.bookingId);
  const topic = normalizeTopic(context.topic);

  if (serviceId && String(conversation.serviceId || "") !== serviceId) {
    conversation.serviceId = serviceId;
    dirty = true;
  }
  if (demandId && String(conversation.demandId || "") !== demandId) {
    conversation.demandId = demandId;
    dirty = true;
  }
  if (bookingId && String(conversation.bookingId || "") !== bookingId) {
    conversation.bookingId = bookingId;
    dirty = true;
  }
  if (topic && conversation.topic !== topic) {
    conversation.topic = topic;
    dirty = true;
  }
  return dirty;
}

async function getOrCreateConversation(salonId, userId, context = {}) {
  let conv = await Conversation.findOne({ salonId, userId });
  if (!conv) {
    const payload = {
      salonId,
      userId,
      lastMessageAt: new Date(),
      lastPreview: "",
      unreadSalon: 0,
      unreadUser: 0,
    };
    const serviceId = oidOrNull(context.serviceId);
    const demandId = oidOrNull(context.demandId);
    const bookingId = oidOrNull(context.bookingId);
    const topic = normalizeTopic(context.topic);
    if (serviceId) payload.serviceId = serviceId;
    if (demandId) payload.demandId = demandId;
    if (bookingId) payload.bookingId = bookingId;
    if (topic) payload.topic = topic;
    conv = await Conversation.create(payload);
    return conv;
  }
  if (applyContextFields(conv, context)) {
    await conv.save();
  }
  return conv;
}

async function resolveConversationContext(conversation, salonDoc) {
  const serviceId = conversation?.serviceId
    ? String(conversation.serviceId)
    : "";
  let serviceName = "";
  let servicePrice = null;
  let serviceDuration = null;

  if (serviceId) {
    let salon = salonDoc;
    if (!salon) {
      salon = await Salon.findById(conversation.salonId)
        .select("serviceIds")
        .lean();
    }
    const entry = (salon?.serviceIds || []).find(
      (s) => String(s.id?._id || s.id) === serviceId
    );
    if (entry) {
      servicePrice = entry.price != null ? Number(entry.price) : null;
      if (entry.id && typeof entry.id === "object" && entry.id.name) {
        serviceName = entry.id.name;
        serviceDuration = entry.id.duration != null ? Number(entry.id.duration) : null;
      }
    }
    if (!serviceName) {
      const svc = await Service.findById(serviceId).select("name duration").lean();
      if (svc) {
        serviceName = svc.name || "";
        if (serviceDuration == null && svc.duration != null) {
          serviceDuration = Number(svc.duration);
        }
      }
    }
  }

  let assignedExpert = null;
  if (conversation?.assignedExpertId) {
    const ex = await Expert.findById(conversation.assignedExpertId)
      .select("fname lname image isAttend isBlock isDelete serviceId")
      .lean();
    if (ex && !ex.isDelete && !ex.isBlock) {
      const messagingStatus = await resolveExpertMessagingStatus(ex);
      assignedExpert = {
        _id: ex._id,
        name: [ex.fname, ex.lname].filter(Boolean).join(" ") || "Expert",
        image: ex.image || "",
        messagingStatus,
      };
    }
  }

  return {
    serviceId: serviceId || null,
    serviceName: serviceName || "",
    servicePrice,
    serviceDuration,
    demandId: conversation?.demandId ? String(conversation.demandId) : null,
    bookingId: conversation?.bookingId ? String(conversation.bookingId) : null,
    topic: conversation?.topic || "",
    topicSource: conversation?.topicSource || null,
    assignedExpertId: conversation?.assignedExpertId
      ? String(conversation.assignedExpertId)
      : null,
    assignedAt: conversation?.assignedAt || null,
    assignedExpert,
  };
}

function parseBookingEdge(dateStr, timeStr) {
  if (!timeStr) return null;
  const m = moment(
    `${dateStr} ${timeStr}`,
    ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm A", "YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm"],
    true
  );
  return m.isValid() ? m : null;
}

/**
 * Messaging presence for inbox: available | with_client | offline
 */
async function resolveExpertMessagingStatus(expert) {
  if (!expert || expert.isBlock || expert.isDelete) return "offline";
  if (expert.isAttend === false) return "offline";

  const now = moment();
  const dateStr = now.format("YYYY-MM-DD");
  const bookings = await Booking.find({
    expertId: expert._id,
    date: dateStr,
    status: "confirm",
    isDelete: { $ne: true },
  })
    .select("startTime endTime time")
    .lean();

  for (const b of bookings) {
    const startRaw = b.startTime || (Array.isArray(b.time) ? b.time[0] : "");
    const endRaw =
      b.endTime ||
      (Array.isArray(b.time) && b.time.length
        ? b.time[b.time.length - 1]
        : "");
    const start = parseBookingEdge(dateStr, startRaw);
    let end = parseBookingEdge(dateStr, endRaw);
    if (start && !end) end = start.clone().add(60, "minutes");
    if (start && end && now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
      return "with_client";
    }
  }
  return "available";
}

async function listAssignableExperts(salonId, serviceId) {
  const filter = {
    salonId,
    isDelete: false,
    isBlock: false,
  };
  const experts = await Expert.find(filter)
    .select("fname lname image isAttend serviceId")
    .lean();

  const sid = serviceId ? String(serviceId) : "";
  const matching = [];
  const others = [];
  for (const ex of experts) {
    const svcIds = (ex.serviceId || []).map(String);
    const matchesService = !sid || svcIds.includes(sid);
    const messagingStatus = await resolveExpertMessagingStatus(ex);
    const row = {
      _id: ex._id,
      name: [ex.fname, ex.lname].filter(Boolean).join(" ") || "Expert",
      image: ex.image || "",
      messagingStatus,
      matchesService,
    };
    if (matchesService) matching.push(row);
    else others.push(row);
  }
  const order = { available: 0, with_client: 1, offline: 2 };
  const sortFn = (a, b) =>
    (order[a.messagingStatus] ?? 9) - (order[b.messagingStatus] ?? 9);
  matching.sort(sortFn);
  others.sort(sortFn);
  return [...matching, ...others];
}

async function assignExpertToConversation(conversation, expertId) {
  if (!conversation) throw new Error("Conversation required");
  const eid = oidOrNull(expertId);
  if (!eid) {
    conversation.assignedExpertId = null;
    conversation.assignedAt = null;
    await conversation.save();
    return { conversation, expert: null };
  }

  const expert = await Expert.findOne({
    _id: eid,
    salonId: conversation.salonId,
    isDelete: false,
    isBlock: false,
  });
  if (!expert) throw new Error("Expert not found for this salon");

  conversation.assignedExpertId = expert._id;
  conversation.assignedAt = new Date();
  await conversation.save();

  try {
    const { notifyExpertPushAndInApp } = require("./pushNotification.service");
    const ctx = await resolveConversationContext(conversation);
    await notifyExpertPushAndInApp({
      expert,
      title: ctx.serviceName
        ? `Conversation assignée — ${ctx.serviceName}`
        : "Conversation assignée",
      body: "Le salon vous a attribué une conversation cliente.",
      data: {
        type: "message_assigned",
        conversationId: String(conversation._id),
        salonId: String(conversation.salonId),
        serviceId: ctx.serviceId || "",
      },
    });
  } catch (err) {
    console.warn("[messaging] assign notify expert", err.message);
  }

  return { conversation, expert };
}

async function maybePostQueueAck(conversation, lang = "fr") {
  if (!conversation?.assignedExpertId) return null;
  const expert = await Expert.findById(conversation.assignedExpertId)
    .select("fname lname isAttend isBlock isDelete")
    .lean();
  if (!expert) return null;

  const status = await resolveExpertMessagingStatus(expert);
  if (status === "available") return null;

  const last = conversation.lastQueueAckAt
    ? new Date(conversation.lastQueueAckAt).getTime()
    : 0;
  if (last && Date.now() - last < QUEUE_ACK_COOLDOWN_MS) return null;

  const text = lang === "en" ? QUEUE_ACK_EN : QUEUE_ACK_FR;
  const msg = await Message.create({
    conversationId: conversation._id,
    salonId: conversation.salonId,
    userId: conversation.userId,
    sender: "system",
    body: text,
    photoUrls: [],
    isQueueAck: true,
  });

  conversation.lastQueueAckAt = new Date();
  conversation.lastMessageAt = new Date();
  conversation.lastPreview = text.slice(0, 120);
  conversation.unreadUser = (conversation.unreadUser || 0) + 1;
  await conversation.save();

  try {
    const { notifyUserPushAndInApp } = require("./pushNotification.service");
    const user = await User.findById(conversation.userId);
    if (user) {
      await notifyUserPushAndInApp({
        user,
        title: "Message reçu",
        body: text,
        data: {
          type: "message_queue_ack",
          conversationId: String(conversation._id),
          salonId: String(conversation.salonId),
        },
      });
    }
  } catch (err) {
    console.warn("[messaging] queue ack notify", err.message);
  }

  return msg;
}

/**
 * P2: classify topic → optional auto-assign expert → optional grounded FAQ reply.
 */
async function qualifyIncomingUserMessage(conversation, text, opts = {}) {
  const {
    classifyMessageTopic,
    buildGroundedAutoReply,
    canSendAutoReply,
    routingForTopic,
  } = require("./messagingQualification.service");

  const classified = classifyMessageTopic(text, opts.hintTopic || conversation.topic);
  const topic = classified.topic || "other";
  let dirty = false;

  if (topic && conversation.topic !== topic) {
    conversation.topic = topic;
    dirty = true;
  }
  if (classified.source && conversation.topicSource !== classified.source) {
    conversation.topicSource = classified.source;
    dirty = true;
  }
  if (dirty) await conversation.save();

  const route = routingForTopic(topic);
  const sideEffects = { topic, route, autoAssigned: false, autoReply: null };

  if (route.autoAssignExpert && !conversation.assignedExpertId && conversation.serviceId) {
    try {
      const experts = await listAssignableExperts(
        conversation.salonId,
        conversation.serviceId
      );
      const pick =
        experts.find((e) => e.matchesService && e.messagingStatus === "available") ||
        experts.find((e) => e.matchesService) ||
        experts[0];
      if (pick?._id) {
        await assignExpertToConversation(conversation, pick._id);
        sideEffects.autoAssigned = true;
      }
    } catch (err) {
      console.warn("[messaging] auto-assign failed", err.message);
    }
  }

  if (
    route.tryAutoReply &&
    canSendAutoReply(conversation, topic) &&
    conversation.serviceId
  ) {
    try {
      const reply = await buildGroundedAutoReply({
        salonId: conversation.salonId,
        serviceId: conversation.serviceId,
        topic,
        lang: opts.lang || "fr",
      });
      if (reply?.body) {
        const autoMsg = await Message.create({
          conversationId: conversation._id,
          salonId: conversation.salonId,
          userId: conversation.userId,
          sender: "system",
          body: reply.body,
          photoUrls: [],
          isAutoReply: true,
          autoReplyTopic: topic,
        });
        conversation.lastAutoReplyAt = new Date();
        conversation.lastMessageAt = new Date();
        conversation.lastPreview = reply.body.slice(0, 120);
        conversation.unreadUser = (conversation.unreadUser || 0) + 1;
        await conversation.save();
        sideEffects.autoReply = autoMsg;

        try {
          const { notifyUserPushAndInApp } = require("./pushNotification.service");
          const user = await User.findById(conversation.userId);
          if (user) {
            await notifyUserPushAndInApp({
              user,
              title: "Réponse automatique Skedisy",
              body: reply.body.slice(0, 140),
              data: {
                type: "message_auto_reply",
                conversationId: String(conversation._id),
                salonId: String(conversation.salonId),
                topic,
              },
            });
          }
        } catch (notifyErr) {
          console.warn("[messaging] auto-reply notify", notifyErr.message);
        }
      }
    } catch (err) {
      console.warn("[messaging] auto-reply failed", err.message);
    }
  }

  return sideEffects;
}

async function postMessage({
  conversation,
  sender,
  body,
  photoUrls = [],
  expertId = null,
  skipNotify = false,
  hintTopic = null,
  lang = "fr",
}) {
  const photos = normalizePhotoUrls(photoUrls);
  const text = String(body || "").trim();
  if (!text && !photos.length) {
    throw new Error("Message vide");
  }

  const msg = await Message.create({
    conversationId: conversation._id,
    salonId: conversation.salonId,
    userId: conversation.userId,
    sender,
    expertId: oidOrNull(expertId),
    body: text,
    photoUrls: photos,
  });

  conversation.lastMessageAt = new Date();
  conversation.lastPreview = previewOf(text, photos.length);
  if (sender === "user") {
    conversation.unreadSalon = (conversation.unreadSalon || 0) + 1;
  } else if (sender !== "system") {
    conversation.unreadUser = (conversation.unreadUser || 0) + 1;
  }
  await conversation.save();

  let qualification = null;
  if (sender === "user" && !skipNotify) {
    try {
      qualification = await qualifyIncomingUserMessage(conversation, text, {
        hintTopic: hintTopic || conversation.topic,
        lang,
      });
    } catch (qErr) {
      console.warn("[messaging] qualify failed", qErr.message);
    }
  }

  if (skipNotify) {
    msg.qualification = qualification;
    return msg;
  }

  try {
    if (sender === "user") {
      const ctxHint = conversation.serviceId
        ? await resolveConversationContext(conversation)
        : null;
      const topicBit = conversation.topic ? ` [${conversation.topic}]` : "";
      const title = ctxHint?.serviceName
        ? `Message — ${ctxHint.serviceName}${topicBit}`
        : `Nouveau message cliente${topicBit}`;
      await Notification.create({
        salonId: conversation.salonId,
        userId: conversation.userId,
        notificationType: NOTIFICATION_TYPE.SALON,
        type: "message",
        title,
        message: conversation.lastPreview || "Nouveau message",
      });

      if (conversation.assignedExpertId) {
        const expert = await Expert.findById(conversation.assignedExpertId);
        if (expert && !expert.isDelete && !expert.isBlock) {
          const { notifyExpertPushAndInApp } = require("./pushNotification.service");
          await notifyExpertPushAndInApp({
            expert,
            title,
            body: conversation.lastPreview || "Nouveau message",
            data: {
              type: "message",
              conversationId: String(conversation._id),
              salonId: String(conversation.salonId),
              serviceId: conversation.serviceId
                ? String(conversation.serviceId)
                : "",
              topic: conversation.topic || "",
            },
          });
        }
        await maybePostQueueAck(conversation, lang);
      }
    } else if (sender === "salon" || sender === "expert") {
      const { notifyUserPushAndInApp } = require("./pushNotification.service");
      const user = await User.findById(conversation.userId);
      const salon = await Salon.findById(conversation.salonId).select("name");
      if (user) {
        await notifyUserPushAndInApp({
          user,
          title: salon?.name ? `Message — ${salon.name}` : "Nouveau message Skedisy",
          body: conversation.lastPreview || "Le salon vous a répondu",
          data: {
            type: "message",
            conversationId: String(conversation._id),
            salonId: String(conversation.salonId),
            serviceId: conversation.serviceId
              ? String(conversation.serviceId)
              : "",
          },
        });
      }
    }
  } catch (err) {
    console.error("[messaging] notify failed:", err.message);
  }

  msg.qualification = qualification;
  return msg;
}

module.exports = {
  getOrCreateConversation,
  applyContextFields,
  resolveConversationContext,
  resolveExpertMessagingStatus,
  listAssignableExperts,
  assignExpertToConversation,
  maybePostQueueAck,
  qualifyIncomingUserMessage,
  postMessage,
  previewOf,
  normalizePhotoUrls,
  normalizeTopic,
  oidOrNull,
  QUEUE_ACK_FR,
  QUEUE_ACK_EN,
};
