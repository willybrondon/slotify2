/**
 * Admin email: new booking notification + secure accept/reject links.
 * Reject mirrors expert cancel (refund, UString cleanup). Accept records approval + notifies expert (status stays pending for day-of check-in).
 */
const crypto = require("crypto");
const moment = require("moment");
const sgMail = require("@sendgrid/mail");
const Booking = require("../models/booking.model");
const Expert = require("../models/expert.model");
const Salon = require("../models/salon.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const UString = require("../models/uniqueString.model");
const UserWalletHistory = require("../models/userWalletHistory.model");
const admin = require("../firebase");

const TOKEN_TTL_HOURS = 168; // 7 days

function getAdminRecipientEmail() {
  return (
    process.env.ADMIN_BOOKING_EMAIL ||
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL ||
    ""
  ).trim();
}

function getBaseUrl() {
  return (process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com").replace(/\/+$/, "");
}

/**
 * After a booking is created: generate token, save on booking, email admin.
 */
async function sendAdminNewBookingEmail(bookingId) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Admin Booking Email] SENDGRID_API_KEY not set; skipping admin email.");
    return;
  }
  const to = getAdminRecipientEmail();
  if (!to) {
    console.warn("[Admin Booking Email] No ADMIN_BOOKING_EMAIL, SUPPORT_EMAIL, or EMAIL; skipping.");
    return;
  }

  const booking = await Booking.findById(bookingId)
    .populate("userId", "fname lname email mobile")
    .populate("expertId", "fname lname")
    .populate("salonId", "name email mobile addressDetails")
    .populate("serviceId", "name duration");

  if (!booking || booking.isDelete) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  booking.adminEmailActionToken = token;
  booking.adminEmailActionTokenExpires = expires;
  await booking.save();

  const base = getBaseUrl();
  const acceptUrl = `${base}/user/booking/public/email-action?token=${encodeURIComponent(token)}&action=accept`;
  const rejectUrl = `${base}/user/booking/public/email-action?token=${encodeURIComponent(token)}&action=reject`;

  const salon = booking.salonId;
  const expert = booking.expertId;
  const user = booking.userId;

  const salonName = salon?.name || "—";
  const expertName = expert ? `${expert.fname || ""} ${expert.lname || ""}`.trim() : "—";
  const customerName = user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "—";
  const services =
    booking.serviceId && booking.serviceId.length
      ? booking.serviceId.map((s) => s.name || "").filter(Boolean).join(", ")
      : "—";

  const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
  <h2>New reservation — action required</h2>
  <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
  <p><strong>Salon:</strong> ${salonName}</p>
  <p><strong>Expert:</strong> ${expertName}</p>
  <p><strong>Customer:</strong> ${customerName}</p>
  <p><strong>Date:</strong> ${booking.date} &nbsp; <strong>Time:</strong> ${booking.startTime || (booking.time && booking.time[0]) || "—"}</p>
  <p><strong>Services:</strong> ${services}</p>
  <p><strong>Amount:</strong> ${booking.amount ?? "—"}</p>
  <p style="margin-top: 24px;">
    <a href="${acceptUrl}" style="background: #1a7f37; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept reservation</a>
    &nbsp;&nbsp;
    <a href="${rejectUrl}" style="background: #c62828; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Decline reservation</a>
  </p>
  <p style="font-size: 12px; color: #666; margin-top: 24px;">Links expire in ${TOKEN_TTL_HOURS / 24} days. If you already acted, links will show a message.</p>
</body></html>`;

  const from = process.env.EMAIL || "noreply@skedisy.com";
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from,
    subject: `[Skedisy] New booking #${booking.bookingId} — ${salonName}`,
    html,
  });
  console.log(`[Admin Booking Email] Sent to ${to} for booking ${booking.bookingId}`);
}

/**
 * Handle GET from email link (public, token-based).
 */
async function processEmailAction(token, action) {
  if (!token || !action) {
    return { ok: false, message: "Missing token or action." };
  }
  const act = String(action).toLowerCase();
  if (act !== "accept" && act !== "reject") {
    return { ok: false, message: "Invalid action." };
  }

  const booking = await Booking.findOne({
    adminEmailActionToken: token,
  }).populate("serviceId");

  if (!booking) {
    return { ok: false, message: "Invalid or expired link." };
  }

  if (booking.adminEmailActionTokenExpires && new Date(booking.adminEmailActionTokenExpires) < new Date()) {
    return { ok: false, message: "This link has expired." };
  }

  if (booking.status === "cancel") {
    return { ok: false, message: "This booking was already cancelled." };
  }

  if (booking.adminEmailApprovedAt) {
    return { ok: false, message: "This booking was already acknowledged by admin." };
  }

  if (act === "accept") {
    booking.adminEmailApprovedAt = new Date();
    booking.adminEmailActionToken = "";
    booking.adminEmailActionTokenExpires = undefined;
    await booking.save();

    const expert = await Expert.findById(booking.expertId);
    const user = await User.findById(booking.userId);

    if (expert && expert.fcmToken) {
      const adminFirebase = await admin;
      await adminFirebase.messaging().send({
        token: expert.fcmToken,
        notification: {
          title: "Admin approved booking",
          body: `Booking #${booking.bookingId} was acknowledged by admin. Date ${booking.date} ${booking.startTime || ""}.`,
        },
      });
    }

    const notification = new Notification();
    notification.expertId = booking.expertId;
    notification.title = "Admin approved booking";
    notification.message = `Booking #${booking.bookingId} acknowledged by admin.`;
    notification.notificationType = 1;
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await notification.save();

    if (user && user.fcmToken) {
      try {
        const adminFirebase = await admin;
        await adminFirebase.messaging().send({
          token: user.fcmToken,
          notification: {
            title: "Booking update",
            body: `Your booking #${booking.bookingId} was acknowledged by the salon.`,
          },
        });
      } catch (e) {
        console.log("[Admin Booking Email] User FCM failed:", e.message);
      }
    }

    return { ok: true, message: "Reservation accepted. The expert and customer have been notified." };
  }

  // reject — same financial cleanup as expert cancel
  const cancelReason = "Declined by admin";
  const bookingFull = await Booking.findById(booking._id).populate("serviceId");
  const user = await User.findById(bookingFull.userId);
  const expert = await Expert.findById(bookingFull.expertId);

  if (!user || !expert) {
    return { ok: false, message: "User or expert not found." };
  }

  if (bookingFull.status === "confirm") {
    return { ok: false, message: "Cannot cancel: customer already checked in." };
  }

  bookingFull.status = "cancel";
  bookingFull.cancel = bookingFull.cancel || {};
  bookingFull.cancel.reason = cancelReason;
  bookingFull.cancel.time = moment().format("hh:mm A");
  bookingFull.cancel.date = moment().format("YYYY-MM-DD");
  bookingFull.cancel.person = "admin";
  bookingFull.adminEmailActionToken = "";
  bookingFull.adminEmailActionTokenExpires = undefined;

  const payload = {
    token: user.fcmToken,
    notification: {
      title: "Booking Cancel",
      body: `Your Booking with Id ${bookingFull.bookingId} is cancelled By Salon`,
          image: bookingFull.serviceId?.[0]?.image,
    },
  };

  await Promise.all([
    bookingFull.save(),
    User.updateOne(
      { _id: user._id, amount: { $gte: 0 } },
      { $inc: { amount: bookingFull.amount } }
    ),
    UString.deleteMany({ bookingId: bookingFull._id }),
    UserWalletHistory.deleteMany({ booking: bookingFull._id }),
  ]);

  const notification = new Notification();
  notification.userId = user._id;
  notification.title = payload.notification.title;
  notification.image = bookingFull.serviceId?.[0]?.image || "";
  notification.notificationType = 0;
  notification.message = payload.notification.body + " Reason : " + cancelReason;
  notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  await notification.save();

  if (user.fcmToken) {
    try {
      const adminFirebase = await admin;
      await adminFirebase.messaging().send(payload);
    } catch (e) {
      console.log("[Admin Booking Email] User FCM cancel failed:", e.message);
    }
  }

  if (expert && expert.fcmToken) {
    try {
      const adminFirebase = await admin;
      await adminFirebase.messaging().send({
        token: expert.fcmToken,
        notification: {
          title: "Booking cancelled by admin",
          body: `Booking #${bookingFull.bookingId} was declined by admin.`,
        },
      });
    } catch (e) {
      console.log("[Admin Booking Email] Expert FCM cancel failed:", e.message);
    }
  }

  return { ok: true, message: "Reservation declined. Customer wallet refunded where applicable." };
}

module.exports = {
  sendAdminNewBookingEmail,
  processEmailAction,
  getAdminRecipientEmail,
};
