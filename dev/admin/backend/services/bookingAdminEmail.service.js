/**
 * Admin email: new booking notification + secure accept/reject links.
 * Reject mirrors expert cancel (refund, UString cleanup). Accept confirms pending bookings when applicable.
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

/** Split comma-separated list from settings; basic email validation */
function parseReservationEmailList(str) {
  if (!str || typeof str !== "string") return [];
  return str
    .split(",")
    .map((e) => e.trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

/**
 * Recipients for reservation emails (new booking + customer cancel).
 * Priority: Settings (comma-separated) → env fallback (single address).
 */
function getAdminRecipientEmails() {
  const fromSettings = parseReservationEmailList(global.settingJSON?.reservationNotificationEmails || "");
  if (fromSettings.length) return fromSettings;
  const single = getAdminRecipientEmail();
  return single ? [single] : [];
}

function getBaseUrl() {
  return (process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com").replace(/\/+$/, "");
}

function escapeHtml(s) {
  if (s == null || s === undefined || s === "") return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSalonAddress(addressDetails) {
  if (!addressDetails || typeof addressDetails !== "object") return "—";
  const parts = [
    addressDetails.addressLine1,
    addressDetails.landMark,
    addressDetails.city,
    addressDetails.state,
    addressDetails.country,
  ]
    .map((p) => (p != null ? String(p).trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function isValidEmailAddress(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function resolveLanguage(language) {
  return String(language || "fr").toLowerCase() === "en" ? "en" : "fr";
}

async function loadBookingForEmail(bookingId) {
  return Booking.findById(bookingId)
    .populate("userId", "fname lname email mobile")
    .populate("expertId", "fname lname email mobile")
    .populate("salonId", "name email mobile addressDetails")
    .populate("serviceId", "name duration");
}

async function countClientBookings(userId) {
  if (!userId) return 0;
  return Booking.countDocuments({
    userId,
    isDelete: { $ne: true },
    status: { $nin: ["cancel"] },
  });
}

function bookingEmailFrom() {
  return process.env.EMAIL || "noreply@skedisy.com";
}

function buildBookingEmailLayout({ title, intro, rows, footer, language }) {
  const isFr = resolveLanguage(language) === "fr";
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:38%;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#222;"><strong>${value}</strong></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#222;background:#f4f4f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:8px;">
    <h2 style="margin-top:0;color:#1a1a1a;">${escapeHtml(title)}</h2>
    <p>${intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${rowsHtml}</table>
    <p style="font-size:12px;color:#888;margin-top:24px;">${escapeHtml(footer)}</p>
    <p style="font-size:12px;color:#888;">Skedisy — ${isFr ? "Votre rendez-vous beauté" : "Your beauty appointment"}</p>
  </div>
</body></html>`;
}

/**
 * Customer confirmation / pending acknowledgement email.
 */
async function sendCustomerBookingConfirmationEmail(bookingId, { language = "fr" } = {}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Booking Email] SENDGRID_API_KEY not set; skipping customer confirmation.");
    return;
  }

  const booking = await loadBookingForEmail(bookingId);
  if (!booking || booking.isDelete) return;

  const user = booking.userId;
  const to = user?.email?.trim();
  if (!isValidEmailAddress(to)) {
    console.warn(`[Booking Email] No valid customer email for booking ${booking.bookingId}`);
    return;
  }

  const lang = resolveLanguage(language);
  const isFr = lang === "fr";
  const salon = booking.salonId;
  const expert = booking.expertId;
  const salonName = escapeHtml(salon?.name);
  const expertName = escapeHtml(expert ? `${expert.fname || ""} ${expert.lname || ""}`.trim() : "—");
  const services =
    booking.serviceId && booking.serviceId.length
      ? escapeHtml(booking.serviceId.map((s) => s.name || "").filter(Boolean).join(", "))
      : "—";
  const bookingTime = booking.startTime || (booking.time && booking.time[0]) || "—";
  const isConfirmed = booking.status === "confirm";

  const title = isFr
    ? isConfirmed
      ? "Confirmation de réservation"
      : "Demande de réservation enregistrée"
    : isConfirmed
      ? "Booking confirmation"
      : "Booking request received";

  const intro = isFr
    ? isConfirmed
      ? `Bonjour ${escapeHtml(user?.fname || "")}, votre réservation est confirmée.`
      : `Bonjour ${escapeHtml(user?.fname || "")}, votre demande de réservation a bien été enregistrée et est en attente de validation par le salon.`
    : isConfirmed
      ? `Hello ${escapeHtml(user?.fname || "")}, your booking is confirmed.`
      : `Hello ${escapeHtml(user?.fname || "")}, your booking request has been received and is awaiting salon approval.`;

  const html = buildBookingEmailLayout({
    title,
    intro,
    language: lang,
    rows: [
      [isFr ? "N° réservation" : "Booking ID", escapeHtml(String(booking.bookingId))],
      [isFr ? "Salon" : "Salon", salonName],
      [isFr ? "Expert(e)" : "Expert", expertName],
      [isFr ? "Date" : "Date", escapeHtml(booking.date)],
      [isFr ? "Heure" : "Time", escapeHtml(bookingTime)],
      [isFr ? "Prestations" : "Services", services],
      [isFr ? "Montant" : "Amount", escapeHtml(String(booking.amount ?? "—"))],
      [
        isFr ? "Statut" : "Status",
        isConfirmed
          ? isFr
            ? "Confirmée"
            : "Confirmed"
          : isFr
            ? "En attente de validation"
            : "Awaiting approval",
      ],
    ],
    footer: isFr
      ? "Conservez cet email comme justificatif. Pour toute question : support@skedisy.com"
      : "Keep this email as your receipt. Questions: support@skedisy.com",
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: bookingEmailFrom(),
    subject: isFr
      ? `[Skedisy] ${isConfirmed ? "Confirmation" : "Demande"} de réservation #${booking.bookingId}`
      : `[Skedisy] Booking ${isConfirmed ? "confirmation" : "request"} #${booking.bookingId}`,
    html,
  });
  console.log(`[Booking Email] Customer confirmation sent to ${to} for booking ${booking.bookingId}`);
}

/**
 * Expert email when a client books — includes total bookings count for that client.
 */
async function sendExpertNewBookingEmail(bookingId, { clientBookingCount } = {}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Booking Email] SENDGRID_API_KEY not set; skipping expert notification.");
    return;
  }

  const booking = await loadBookingForEmail(bookingId);
  if (!booking || booking.isDelete) return;

  const expert = booking.expertId;
  const to = expert?.email?.trim();
  if (!isValidEmailAddress(to)) {
    console.warn(`[Booking Email] No valid expert email for booking ${booking.bookingId}`);
    return;
  }

  const user = booking.userId;
  const salon = booking.salonId;
  const count =
    clientBookingCount != null && !Number.isNaN(Number(clientBookingCount))
      ? Number(clientBookingCount)
      : await countClientBookings(user?._id);

  const customerName = escapeHtml(user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "—");
  const customerEmail = escapeHtml(user?.email);
  const customerPhone = escapeHtml(user?.mobile);
  const salonName = escapeHtml(salon?.name);
  const services =
    booking.serviceId && booking.serviceId.length
      ? escapeHtml(booking.serviceId.map((s) => s.name || "").filter(Boolean).join(", "))
      : "—";
  const bookingTime = booking.startTime || (booking.time && booking.time[0]) || "—";
  const isConfirmed = booking.status === "confirm";

  const html = buildBookingEmailLayout({
    title: "Nouvelle réservation",
    intro: isConfirmed
      ? `Bonjour ${escapeHtml(expert?.fname || "")}, un nouveau rendez-vous confirmé vient d'être réservé avec vous.`
      : `Bonjour ${escapeHtml(expert?.fname || "")}, une nouvelle demande de rendez-vous nécessite une validation salon.`,
    language: "fr",
    rows: [
      ["N° réservation", escapeHtml(String(booking.bookingId))],
      ["Client", customerName],
      ["Email client", customerEmail],
      ["Téléphone client", customerPhone],
      ["Salon", salonName],
      ["Date", escapeHtml(booking.date)],
      ["Heure", escapeHtml(bookingTime)],
      ["Prestations", services],
      ["Montant", escapeHtml(String(booking.amount ?? "—"))],
      ["Statut", isConfirmed ? "Confirmée" : "En attente"],
      [
        "Réservations du client",
        `${count} réservation${count > 1 ? "s" : ""} au total sur Skedisy`,
      ],
    ],
    footer:
      "Vous recevez cet email car un client a réservé un créneau avec vous. Ouvrez l'app expert Skedisy pour gérer vos rendez-vous.",
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: bookingEmailFrom(),
    subject: `[Skedisy] Nouvelle réservation #${booking.bookingId} — ${user?.fname || "Client"}`,
    html,
  });
  console.log(`[Booking Email] Expert notification sent to ${to} for booking ${booking.bookingId}`);
}

/**
 * After a booking is created: generate token, save on booking, email admin.
 */
async function sendAdminNewBookingEmail(bookingId) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Admin Booking Email] SENDGRID_API_KEY not set; skipping admin email.");
    return;
  }
  const to = getAdminRecipientEmails();
  if (!to.length) {
    console.warn(
      "[Admin Booking Email] No recipients: set reservation notification emails in Admin Settings or ADMIN_BOOKING_EMAIL / SUPPORT_EMAIL / EMAIL in .env"
    );
    return;
  }

  const booking = await loadBookingForEmail(bookingId);

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

  const salonNameSubject = salon?.name || "—";
  const salonName = escapeHtml(salonNameSubject);
  const expertName = escapeHtml(expert ? `${expert.fname || ""} ${expert.lname || ""}`.trim() : "—");
  const customerName = escapeHtml(user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "—");
  const customerEmail = escapeHtml(user?.email);
  const customerPhone = escapeHtml(user?.mobile);
  const salonEmail = escapeHtml(salon?.email);
  const salonPhone = escapeHtml(salon?.mobile);
  const salonAddress = escapeHtml(formatSalonAddress(salon?.addressDetails));
  const services =
    booking.serviceId && booking.serviceId.length
      ? escapeHtml(booking.serviceId.map((s) => s.name || "").filter(Boolean).join(", "))
      : "—";

  const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
  <h2>New reservation — action required</h2>
  <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
  <p><strong>Salon:</strong> ${salonName}</p>
  <p><strong>Salon email:</strong> ${salonEmail}</p>
  <p><strong>Salon phone:</strong> ${salonPhone}</p>
  <p><strong>Salon address:</strong> ${salonAddress}</p>
  <p><strong>Expert:</strong> ${expertName}</p>
  <p><strong>Customer:</strong> ${customerName}</p>
  <p><strong>Customer email:</strong> ${customerEmail}</p>
  <p><strong>Customer phone:</strong> ${customerPhone}</p>
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
    subject: `[Skedisy] New booking #${booking.bookingId} — ${salonNameSubject}`,
    html,
  });
  console.log(`[Admin Booking Email] Sent to ${to.join(", ")} for booking ${booking.bookingId}`);
}

/**
 * Customer cancelled / declined their own reservation — notify same admin list as new-booking emails.
 */
async function sendAdminCustomerCancelledBookingEmail(bookingId) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Admin Booking Email] SENDGRID_API_KEY not set; skipping customer-cancel email.");
    return;
  }
  const to = getAdminRecipientEmails();
  if (!to.length) {
    console.warn("[Admin Booking Email] No recipients for customer-cancel email; skipping.");
    return;
  }

  const booking = await Booking.findById(bookingId)
    .populate("userId", "fname lname email mobile")
    .populate("expertId", "fname lname email mobile")
    .populate("salonId", "name email mobile addressDetails")
    .populate("serviceId", "name duration");

  if (!booking || booking.isDelete) return;

  const salon = booking.salonId;
  const expert = booking.expertId;
  const user = booking.userId;
  const salonNameSubject = salon?.name || "—";
  const salonName = escapeHtml(salonNameSubject);
  const expertName = escapeHtml(expert ? `${expert.fname || ""} ${expert.lname || ""}`.trim() : "—");
  const customerName = escapeHtml(user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "—");
  const customerEmail = escapeHtml(user?.email);
  const customerPhone = escapeHtml(user?.mobile);
  const salonEmail = escapeHtml(salon?.email);
  const salonPhone = escapeHtml(salon?.mobile);
  const salonAddress = escapeHtml(formatSalonAddress(salon?.addressDetails));
  const services =
    booking.serviceId && booking.serviceId.length
      ? escapeHtml(booking.serviceId.map((s) => s.name || "").filter(Boolean).join(", "))
      : "—";
  const reasonRaw = (booking.cancel && booking.cancel.reason) || "—";
  const reason = String(reasonRaw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
  <h2>Customer cancelled a reservation</h2>
  <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
  <p><strong>Salon:</strong> ${salonName}</p>
  <p><strong>Salon email:</strong> ${salonEmail}</p>
  <p><strong>Salon phone:</strong> ${salonPhone}</p>
  <p><strong>Salon address:</strong> ${salonAddress}</p>
  <p><strong>Expert:</strong> ${expertName}</p>
  <p><strong>Customer:</strong> ${customerName}</p>
  <p><strong>Customer email:</strong> ${customerEmail}</p>
  <p><strong>Customer phone:</strong> ${customerPhone}</p>
  <p><strong>Date:</strong> ${booking.date} &nbsp; <strong>Time:</strong> ${booking.startTime || (booking.time && booking.time[0]) || "—"}</p>
  <p><strong>Services:</strong> ${services}</p>
  <p><strong>Amount:</strong> ${booking.amount ?? "—"}</p>
  <p><strong>Reason (customer):</strong> ${reason}</p>
  <p style="font-size: 12px; color: #666; margin-top: 24px;">This mirrors what the expert receives via app notification (booking cancelled by customer).</p>
</body></html>`;

  const from = process.env.EMAIL || "noreply@skedisy.com";
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from,
    subject: `[Skedisy] Customer cancelled booking #${booking.bookingId} — ${salonNameSubject}`,
    html,
  });
  console.log(`[Admin Booking Email] Customer-cancel sent to ${to.join(", ")} for booking ${booking.bookingId}`);
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
    if (booking.status === "pending") {
      booking.status = "confirm";
    }
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
  sendAdminCustomerCancelledBookingEmail,
  sendCustomerBookingConfirmationEmail,
  sendExpertNewBookingEmail,
  countClientBookings,
  processEmailAction,
  getAdminRecipientEmail,
  getAdminRecipientEmails,
};
