const crypto = require("crypto");
const moment = require("moment");
const Booking = require("../models/booking.model");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");
const User = require("../models/user.model");
const Expert = require("../models/expert.model");
const ServiceDemand = require("../models/serviceDemand.model");
const { getAfroConfig } = require("./afroQuote.service");
const { sendSMS } = require("./sms.service");

function salonPublicSlug(salon) {
  const slugBase = (salon.name || "salon")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const shortId = String(salon._id).substring(0, 6);
  return `${slugBase}-${shortId}`;
}

function resolveStyleLifetimeWeeks(afro) {
  if (!afro) return 0;
  const n = Number(afro.styleLifetimeWeeks);
  if (Number.isFinite(n) && n > 0) return Math.min(52, Math.round(n));
  // Default for project-flow protective styles if salon never set it
  if (afro.complexityTier && afro.complexityTier !== "S0") return 7;
  return 0;
}

function rebookRemindersEnabled(afro) {
  if (!afro) return false;
  if (afro.rebookRemindersEnabled === false) return false;
  return resolveStyleLifetimeWeeks(afro) > 0;
}

function findSalonServiceEntry(salon, serviceId) {
  return (salon.serviceIds || []).find((s) => String(s.id) === String(serviceId));
}

/**
 * After checkout: set due date + token for protective-style rebooking.
 */
async function scheduleRebookOnComplete(bookingId) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "completed") return null;
    if (booking.rebookDueAt) return booking;

    const salon = await Salon.findById(booking.salonId);
    if (!salon) return null;

    const primaryServiceId = Array.isArray(booking.serviceId)
      ? booking.serviceId[0]
      : booking.serviceId;
    if (!primaryServiceId) return null;

    const entry = findSalonServiceEntry(salon, primaryServiceId);
    const afro = getAfroConfig(entry);
    if (!rebookRemindersEnabled(afro)) return null;

    const weeks = resolveStyleLifetimeWeeks(afro);
    const baseDate = moment(booking.date, ["YYYY-MM-DD", "DD-MM-YYYY", moment.ISO_8601], true);
    if (!baseDate.isValid()) return null;

    let answers = booking.clientAnswers;
    if ((!answers || !Object.keys(answers).length) && booking.demandId) {
      const demand = await ServiceDemand.findById(booking.demandId).select("answers").lean();
      answers = demand?.answers || {};
    }

    booking.clientAnswers = answers && typeof answers === "object" ? answers : {};
    booking.rebookDueAt = baseDate.clone().add(weeks, "weeks").startOf("day").toDate();
    booking.rebookToken =
      booking.rebookToken || crypto.randomBytes(16).toString("hex");
    booking.rebookReminderSent = false;
    await booking.save();
    return booking;
  } catch (err) {
    console.error("[rebooking.scheduleRebookOnComplete]", err);
    return null;
  }
}

async function buildRebookLink(booking, salon) {
  const base = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const slug = salonPublicSlug(salon);
  return `${base}/salon/${slug}?rebook=${encodeURIComponent(booking.rebookToken)}`;
}

async function sendRebookReminderSms(booking) {
  const [user, salon, service] = await Promise.all([
    User.findById(booking.userId).select("fname mobile"),
    Salon.findById(booking.salonId).select("name"),
    Service.findById(
      Array.isArray(booking.serviceId) ? booking.serviceId[0] : booking.serviceId
    ).select("name"),
  ]);

  if (!user?.mobile || !String(user.mobile).trim()) {
    return { success: false, error: "No mobile" };
  }
  if (!salon) return { success: false, error: "No salon" };

  const weeksAgo = booking.rebookDueAt
    ? Math.max(
        1,
        Math.round(
          moment(booking.rebookDueAt).diff(moment(booking.date, "YYYY-MM-DD"), "weeks", true)
        )
      )
    : 7;
  const serviceName = service?.name || "prestation";
  const link = await buildRebookLink(booking, salon);
  const fname = user.fname || "Cliente";
  const message = `${fname}, votre ${serviceName} arrive a echeance (il y a ~${weeksAgo} sem.). Reprendre la meme config ? ${link} Skedisy`;

  return sendSMS(user.mobile, message);
}

/**
 * Daily job: send due rebook reminders.
 * @param {Date} now
 * @param {{ salonId?: string, weekMode?: boolean, force?: boolean }} opts
 *   weekMode = scan whole ISO week (for salon "launch campaign")
 *   force = also re-send if already marked (careful — default false)
 */
async function processDueRebookReminders(now = new Date(), opts = {}) {
  const start = opts.weekMode
    ? moment(now).startOf("isoWeek").toDate()
    : moment(now).startOf("day").toDate();
  const end = opts.weekMode
    ? moment(now).endOf("isoWeek").toDate()
    : moment(now).endOf("day").toDate();

  const query = {
    status: "completed",
    rebookDueAt: { $gte: start, $lte: end },
    rebookToken: { $nin: [null, ""] },
    isDelete: { $ne: true },
  };
  if (opts.salonId) query.salonId = opts.salonId;
  if (!opts.force) query.rebookReminderSent = false;

  const due = await Booking.find(query).limit(200);

  let sent = 0;
  let skipped = 0;

  for (const booking of due) {
    try {
      // Skip if client already has a future booking at same salon for same service
      const primaryServiceId = Array.isArray(booking.serviceId)
        ? booking.serviceId[0]
        : booking.serviceId;
      const todayStr = moment(now).format("YYYY-MM-DD");
      const future = await Booking.findOne({
        userId: booking.userId,
        salonId: booking.salonId,
        serviceId: primaryServiceId,
        status: { $in: ["pending", "confirm"] },
        date: { $gte: todayStr },
        _id: { $ne: booking._id },
      }).select("_id");

      if (future) {
        booking.rebookReminderSent = true;
        await booking.save();
        skipped += 1;
        continue;
      }

      if (booking.rebookReminderSent && !opts.force) {
        skipped += 1;
        continue;
      }

      const result = await sendRebookReminderSms(booking);
      if (result.success) {
        booking.rebookReminderSent = true;
        await booking.save();
        sent += 1;
      } else {
        console.warn(
          `[rebooking] SMS failed booking=${booking._id}: ${result.error || "unknown"}`
        );
      }
    } catch (err) {
      console.error("[rebooking.processDue]", booking._id, err.message);
    }
  }

  return { scanned: due.length, sent, skipped };
}

/**
 * Salon-triggered campaign: all pending rebook due this week.
 */
async function launchSalonRebookCampaign(salonId) {
  return processDueRebookReminders(new Date(), {
    salonId,
    weekMode: true,
    force: false,
  });
}

/**
 * Public context for deep-link prefill.
 */
async function getRebookContextByToken(token) {
  if (!token || String(token).length < 8) {
    return { status: false, message: "Invalid token" };
  }

  const booking = await Booking.findOne({
    rebookToken: String(token),
    status: "completed",
  }).lean();

  if (!booking) {
    return { status: false, message: "Rebook link expired or invalid" };
  }

  const [salon, service, expert, demand] = await Promise.all([
    Salon.findById(booking.salonId).select("name mainImage loyaltyProgram").lean(),
    Service.findById(
      Array.isArray(booking.serviceId) ? booking.serviceId[0] : booking.serviceId
    )
      .select("name duration")
      .lean(),
    booking.expertId
      ? Expert.findById(booking.expertId).select("fname lname image").lean()
      : null,
    booking.demandId
      ? ServiceDemand.findById(booking.demandId).select("answers photoUrls").lean()
      : null,
  ]);

  const answers =
    (booking.clientAnswers && Object.keys(booking.clientAnswers).length
      ? booking.clientAnswers
      : demand?.answers) || {};

  const weeksSince = booking.date
    ? Math.max(0, Math.round(moment().diff(moment(booking.date, "YYYY-MM-DD"), "weeks", true)))
    : null;

  const serviceIdStr = String(
    Array.isArray(booking.serviceId) ? booking.serviceId[0] : booking.serviceId
  );

  let loyalty = null;
  let history = [];
  try {
    const {
      computeLoyaltyDiscount,
      getClientSalonHistory,
    } = require("./loyalty.service");
    loyalty = await computeLoyaltyDiscount({
      salon,
      userId: booking.userId,
      serviceId: serviceIdStr,
      amountHt: booking.quotedPrice || booking.withoutTax || booking.amount || 0,
    });
    history = await getClientSalonHistory({
      userId: booking.userId,
      salonId: booking.salonId,
      limit: 8,
    });
  } catch (e) {
    console.warn("[rebook] loyalty/history", e.message);
  }

  // Suggested slots: next 7 open days, first free slot per day (lite)
  let suggestedSlots = [];
  try {
    const salonFull = await Salon.findById(booking.salonId);
    if (salonFull) {
      const { getTeamScheduleForSalon } = require("./teamSchedule.service");
      for (let d = 1; d <= 10 && suggestedSlots.length < 3; d++) {
        const dateStr = moment().add(d, "days").format("YYYY-MM-DD");
        const schedule = await getTeamScheduleForSalon(salonFull, dateStr);
        if (!schedule.isSalonOpen) continue;
        for (const ex of schedule.experts || []) {
          const free = (ex.freeSlots || []).slice(0, 1);
          if (free.length) {
            suggestedSlots.push({
              date: dateStr,
              startTime: free[0],
              expertId: String(ex.expert._id),
              expertName: `${ex.expert.fname || ""} ${ex.expert.lname || ""}`.trim(),
            });
            break;
          }
        }
      }
    }
  } catch (e) {
    console.warn("[rebook] suggested slots", e.message);
  }

  return {
    status: true,
    rebook: {
      token: booking.rebookToken,
      bookingId: String(booking._id),
      salonId: String(booking.salonId),
      serviceId: serviceIdStr,
      serviceName: service?.name || "Prestation",
      expertId: booking.expertId ? String(booking.expertId) : null,
      expertName: expert
        ? `${expert.fname || ""} ${expert.lname || ""}`.trim()
        : "",
      answers,
      photoUrls: demand?.photoUrls || [],
      lastDate: booking.date,
      weeksSince,
      salonName: salon?.name || "",
      headline: service?.name
        ? `Votre ${service.name} arrive à échéance`
        : "Votre coiffure arrive à échéance",
      subline:
        weeksSince != null
          ? `Votre dernière séance date d'il y a ${weeksSince} semaine${
              weeksSince > 1 ? "s" : ""
            }.`
          : "Souhaitez-vous reprendre la même prestation ?",
      cta: "Réserver ma dernière coiffure",
      suggestedSlots,
      loyalty: loyalty
        ? {
            eligible: Boolean(loyalty.eligible),
            percent: loyalty.percent,
            amount: loyalty.amount,
            priorCount: loyalty.priorCount,
            label: loyalty.label,
            minCompletedCount: loyalty.minCompletedCount,
          }
        : null,
      history,
    },
  };
}

module.exports = {
  scheduleRebookOnComplete,
  processDueRebookReminders,
  launchSalonRebookCampaign,
  getRebookContextByToken,
  resolveStyleLifetimeWeeks,
  rebookRemindersEnabled,
  salonPublicSlug,
};
