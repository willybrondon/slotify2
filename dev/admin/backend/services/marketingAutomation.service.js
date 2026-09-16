const moment = require("moment");
require("moment/locale/fr");
moment.locale("fr");
const crypto = require("crypto");
const Booking = require("../models/booking.model");
const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const Service = require("../models/service.model");
const { getTeamScheduleForSalon } = require("./teamSchedule.service");
const { COUPON_TYPE, DISCOUNT_TYPE } = require("../types/constant");
const { salonPublicSlug } = require("./rebooking.service");

function nextWeekday(from, weekday /* 0=Sun … 2=Tue */) {
  const m = moment(from).startOf("day");
  const current = m.day();
  let add = (weekday - current + 7) % 7;
  if (add === 0) add = 7; // always "next" occurrence, not today
  return m.add(add, "days");
}

async function occupancyForDate(salon, dateStr) {
  const schedule = await getTeamScheduleForSalon(salon, dateStr);
  const rates = (schedule.resources || [])
    .map((r) => Number(r.occupancyRate))
    .filter((n) => Number.isFinite(n));
  if (!rates.length) {
    return {
      date: dateStr,
      isSalonOpen: schedule.isSalonOpen,
      occupancyPercent: null,
      expertCount: 0,
      bookingHint: schedule.isHoliday ? "Fermé (congés)" : schedule.isSalonOpen ? "Aucune experte" : "Fermé",
    };
  }
  const occupancyPercent = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  return {
    date: dateStr,
    isSalonOpen: schedule.isSalonOpen,
    occupancyPercent,
    expertCount: rates.length,
    bookingHint:
      occupancyPercent < 40
        ? "Planning léger — idéal pour une promo ciblée"
        : occupancyPercent < 70
          ? "Remplissage moyen"
          : "Bien rempli",
  };
}

/**
 * Insight: next Tuesday (or custom) occupancy + suggested promo.
 */
async function getOccupancyInsight(salon, opts = {}) {
  const target = opts.date
    ? moment(opts.date, "YYYY-MM-DD")
    : nextWeekday(moment(), 2); // next Tuesday
  const dateStr = target.format("YYYY-MM-DD");
  const dayLabel = target.locale("fr").format("dddd D MMMM");
  const occ = await occupancyForDate(salon, dateStr);

  const suggestPromo =
    occ.isSalonOpen &&
    occ.occupancyPercent != null &&
    occ.occupancyPercent < 50;

  const suggestedDiscount = suggestPromo
    ? occ.occupancyPercent < 30
      ? 20
      : 15
    : 0;

  const headline =
    occ.occupancyPercent == null
      ? `${dayLabel} : pas encore de créneaux à analyser.`
      : `${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}, ton planning est rempli à ${occ.occupancyPercent} %.`;

  const socialPosts = buildSocialSuggestions({
    salonName: salon.name,
    dateLabel: dayLabel,
    occupancyPercent: occ.occupancyPercent,
    discount: suggestedDiscount,
  });

  return {
    type: "occupancy",
    headline,
    date: dateStr,
    dayLabel,
    ...occ,
    suggestPromo,
    suggestedDiscount,
    suggestedPromoTitle: suggestPromo
      ? `Remplir ${dayLabel} — −${suggestedDiscount}%`
      : "",
    socialPosts,
    cta: suggestPromo
      ? "Créer une promotion ciblée"
      : "Voir le planning",
  };
}

function buildSocialSuggestions({ salonName, dateLabel, occupancyPercent, discount }) {
  const name = salonName || "notre salon";
  const posts = [];
  if (discount > 0) {
    posts.push({
      channel: "instagram",
      body: `✨ Places dispo ${dateLabel} chez ${name}.\n−${discount}% sur ta prestation (code Skedisy).\nRéserve en 2 min 👇`,
    });
    posts.push({
      channel: "whatsapp_status",
      body: `${dateLabel} : encore des créneaux ! −${discount}% via Skedisy. DM pour le lien 💫`,
    });
  } else if (occupancyPercent != null && occupancyPercent >= 70) {
    posts.push({
      channel: "instagram",
      body: `${dateLabel} se remplit vite chez ${name} 🔥\nPrends ton créneau sur Skedisy avant qu'il ne reste plus rien.`,
    });
  } else {
    posts.push({
      channel: "instagram",
      body: `Nouvelle semaine chez ${name} — tresses, locks, soins.\nRéserve ton créneau sur Skedisy 📅`,
    });
  }
  return posts;
}

/**
 * Clients whose protective style is due this week (rebook window).
 */
async function getRebookDueInsight(salonId, opts = {}) {
  const start = moment(opts.from || undefined).startOf("isoWeek");
  const end = moment(opts.to || undefined).endOf("isoWeek");
  if (!opts.from) {
    // current week Mon–Sun
  }

  const due = await Booking.find({
    salonId,
    status: "completed",
    rebookDueAt: { $gte: start.toDate(), $lte: end.toDate() },
    rebookToken: { $nin: [null, ""] },
    isDelete: { $ne: true },
  })
    .sort({ rebookDueAt: 1 })
    .limit(100)
    .lean();

  const pending = due.filter((b) => !b.rebookReminderSent);
  const userIds = [...new Set(due.map((b) => String(b.userId)))];
  const serviceIds = [
    ...new Set(
      due.map((b) =>
        String(Array.isArray(b.serviceId) ? b.serviceId[0] : b.serviceId)
      )
    ),
  ];

  const [users, services] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("fname lname mobile email").lean(),
    Service.find({ _id: { $in: serviceIds } }).select("name").lean(),
  ]);
  const uMap = Object.fromEntries(users.map((u) => [String(u._id), u]));
  const sMap = Object.fromEntries(services.map((s) => [String(s._id), s]));

  const clients = due.map((b) => {
    const u = uMap[String(b.userId)];
    const sid = String(Array.isArray(b.serviceId) ? b.serviceId[0] : b.serviceId);
    return {
      bookingId: String(b._id),
      userId: String(b.userId),
      name: u ? [u.fname, u.lname].filter(Boolean).join(" ") : "Cliente",
      mobile: u?.mobile || "",
      serviceName: sMap[sid]?.name || "Prestation",
      lastDate: b.date,
      dueAt: b.rebookDueAt,
      reminderSent: Boolean(b.rebookReminderSent),
      hasToken: Boolean(b.rebookToken),
    };
  });

  const count = pending.length || due.length;
  const headline =
    count === 0
      ? "Aucune cliente à échéance cette semaine."
      : `${count} cliente${count > 1 ? "s" : ""} arrive${count > 1 ? "nt" : ""} à échéance cette semaine.`;

  return {
    type: "rebook",
    headline,
    weekStart: start.format("YYYY-MM-DD"),
    weekEnd: end.format("YYYY-MM-DD"),
    totalDue: due.length,
    pendingReminders: pending.length,
    alreadySent: due.length - pending.length,
    clients,
    suggestCampaign: pending.length > 0,
    cta: pending.length > 0 ? "Lancer la campagne de rebooking" : "Tout est à jour",
  };
}

async function createTargetedPromo(salon, { discountPercent, title, dateHint, daysValid = 14 }) {
  const percent = Math.min(40, Math.max(5, Number(discountPercent) || 15));
  const expiry = moment().add(Math.max(3, Number(daysValid) || 14), "days").format("YYYY-MM-DD");
  const prefix = (salon.name || "SK")
    .toString()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase() || "SK";
  const code = `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const coupon = await Coupon.create({
    code,
    title: title || `Promo salon −${percent}%`,
    description: dateHint
      ? `Promotion ciblée Skedisy — ${dateHint}`
      : `Promotion salon générée depuis Marketing auto`,
    minAmountToApply: 0,
    discountPercent: percent,
    maxDiscount: 80,
    expiryDate: expiry,
    type: COUPON_TYPE.APPOINTMENT,
    discountType: DISCOUNT_TYPE.PERCENTAGE,
    isActive: true,
    salonId: salon._id,
  });

  const base = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const slug = salonPublicSlug(salon);
  const bookingUrl = `${base}/salon/${slug}`;

  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      title: coupon.title,
      discountPercent: coupon.discountPercent,
      expiryDate: coupon.expiryDate,
    },
    shareText: `−${percent}% chez ${salon.name} avec le code ${coupon.code} (valable jusqu'au ${expiry}). Réserve : ${bookingUrl}`,
    bookingUrl,
  };
}

module.exports = {
  nextWeekday,
  occupancyForDate,
  getOccupancyInsight,
  getRebookDueInsight,
  createTargetedPromo,
  buildSocialSuggestions,
};
