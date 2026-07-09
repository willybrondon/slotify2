const admin = require("../firebase");
const Notification = require("../models/notification.model");

const INVALID_TOKENS = new Set(["", "web", "no_permission", "error", "null", "undefined", "none"]);

function isValidFcmToken(token) {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed || INVALID_TOKENS.has(trimmed.toLowerCase())) return false;
  // Real FCM registration tokens are long strings.
  return trimmed.length >= 20;
}

function buildPushPayload({ token, title, body, data = {}, image, channelId = "0" }) {
  const safeData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [String(key), String(value ?? "")])
  );

  return {
    token: token.trim(),
    notification: {
      title: String(title || ""),
      body: String(body || ""),
      ...(image ? { image: String(image) } : {}),
    },
    data: safeData,
    android: {
      priority: "high",
      notification: {
        channelId,
        priority: "high",
        defaultSound: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  };
}

async function sendPushNotification({ token, title, body, data, image, channelId }) {
  if (!isValidFcmToken(token)) {
    return { success: false, skipped: true, reason: "invalid_token" };
  }

  try {
    const adminPromise = await admin;
    const payload = buildPushPayload({ token, title, body, data, image, channelId });
    const response = await adminPromise.messaging().send(payload);
    return { success: true, response };
  } catch (error) {
    console.error("[Push] send failed:", error.message);
    return { success: false, error: error.message };
  }
}

async function saveInAppNotification({
  userId,
  expertId,
  salonId,
  title,
  message,
  image = "",
  notificationType = 0,
}) {
  return Notification.create({
    userId: userId || undefined,
    expertId: expertId || undefined,
    salonId: salonId || undefined,
    title,
    message,
    image,
    notificationType,
    date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  });
}

async function notifyUserPushAndInApp({
  user,
  title,
  body,
  data = {},
  image = "",
  notificationType = 0,
}) {
  if (!user?._id) return { push: { skipped: true }, inApp: null };

  const inApp = await saveInAppNotification({
    userId: user._id,
    title,
    message: body,
    image,
    notificationType,
  });

  const push = await sendPushNotification({
    token: user.fcmToken,
    title,
    body,
    data,
    image,
  });

  return { push, inApp };
}

async function notifyExpertPushAndInApp({
  expert,
  title,
  body,
  data = {},
  image = "",
  notificationType = 1,
}) {
  if (!expert?._id) return { push: { skipped: true }, inApp: null };

  const inApp = await saveInAppNotification({
    expertId: expert._id,
    title,
    message: body,
    image,
    notificationType,
  });

  const push = await sendPushNotification({
    token: expert.fcmToken,
    title,
    body,
    data,
    image,
  });

  return { push, inApp };
}

module.exports = {
  isValidFcmToken,
  sendPushNotification,
  saveInAppNotification,
  notifyUserPushAndInApp,
  notifyExpertPushAndInApp,
};
