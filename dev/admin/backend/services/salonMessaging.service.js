const Conversation = require("../models/salonConversation.model");
const Message = require("../models/salonMessage.model");
const Salon = require("../models/salon.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const { NOTIFICATION_TYPE } = require("../types/constant");

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

async function getOrCreateConversation(salonId, userId) {
  let conv = await Conversation.findOne({ salonId, userId });
  if (conv) return conv;
  conv = await Conversation.create({
    salonId,
    userId,
    lastMessageAt: new Date(),
    lastPreview: "",
    unreadSalon: 0,
    unreadUser: 0,
  });
  return conv;
}

async function postMessage({
  conversation,
  sender,
  body,
  photoUrls = [],
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
    body: text,
    photoUrls: photos,
  });

  conversation.lastMessageAt = new Date();
  conversation.lastPreview = previewOf(text, photos.length);
  if (sender === "user") {
    conversation.unreadSalon = (conversation.unreadSalon || 0) + 1;
  } else {
    conversation.unreadUser = (conversation.unreadUser || 0) + 1;
  }
  await conversation.save();

  // Lazy require: pushNotification → firebase → index (circular if loaded at top)
  try {
    if (sender === "user") {
      await Notification.create({
        salonId: conversation.salonId,
        userId: conversation.userId,
        notificationType: NOTIFICATION_TYPE.SALON,
        type: "message",
        title: "Nouveau message cliente",
        message: conversation.lastPreview || "Nouveau message",
      });
    } else {
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
          },
        });
      }
    }
  } catch (err) {
    console.error("[messaging] notify failed:", err.message);
  }

  return msg;
}

module.exports = {
  getOrCreateConversation,
  postMessage,
  previewOf,
  normalizePhotoUrls,
};
