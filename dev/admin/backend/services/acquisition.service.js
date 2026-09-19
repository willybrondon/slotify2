const Booking = require("../models/booking.model");
const UserSalonRelation = require("../models/userSalonRelation.model");

const SKEDISY_CHANNELS = new Set(["web", "app", "link", "guest"]);
const SALON_DIRECT_CHANNELS = new Set([
  "salon_panel",
  "salon",
  "manual",
  "walk_in",
]);

function normalizeChannel(channel) {
  const c = String(channel || "")
    .trim()
    .toLowerCase();
  if (!c) return "unknown";
  if (c === "web_booking" || c === "skedisy_web") return "web";
  if (c === "panel" || c === "salonpanel") return "salon_panel";
  return c;
}

function acquiredByFromChannel(channel) {
  const c = normalizeChannel(channel);
  if (SKEDISY_CHANNELS.has(c)) return "skedisy";
  if (SALON_DIRECT_CHANNELS.has(c)) return "salon_direct";
  return "unknown";
}

function isAcquisitionCommissionMode(setting) {
  const s = setting || global.settingJSON || {};
  return s.acquisitionCommissionOnly === true;
}

/**
 * Count non-cancelled bookings for this user at this salon.
 */
async function countSalonVisits(userId, salonId) {
  return Booking.countDocuments({
    userId,
    salonId,
    isDelete: { $ne: true },
    status: { $nin: ["cancel"] },
  });
}

async function getOrCreateRelation(userId, salonId) {
  let rel = await UserSalonRelation.findOne({ userId, salonId });
  if (rel) return rel;
  rel = await UserSalonRelation.create({
    userId,
    salonId,
    acquiredBy: "unknown",
  });
  return rel;
}

/**
 * Resolve monetization for a new booking (before fee calc).
 * @returns {{
 *   channel: string,
 *   acquiredBy: string,
 *   acquisitionAttributed: boolean,
 *   commissionReason: 'acquisition_first'|'none'|'legacy_flat',
 *   chargePlatformFee: boolean,
 *   priorSalonVisits: number,
 *   relation: object|null,
 *   secondVisitIncentiveApplicable: boolean
 * }}
 */
async function resolveBookingMonetization({
  userId,
  salonId,
  channel,
  setting,
  demandSource,
}) {
  const normalizedChannel = normalizeChannel(
    channel || demandSource || "unknown"
  );
  const priorSalonVisits = await countSalonVisits(userId, salonId);
  const relation = await getOrCreateRelation(userId, salonId);

  // First touch wins for acquiredBy
  if (relation.acquiredBy === "unknown" || !relation.acquiredAt) {
    const by = acquiredByFromChannel(normalizedChannel);
    if (by !== "unknown") {
      relation.acquiredBy = by;
      relation.acquisitionChannel = normalizedChannel;
      relation.acquiredAt = new Date();
      await relation.save();
    }
  }

  const acquisitionMode = isAcquisitionCommissionMode(setting);
  const isFirstSalonVisit = priorSalonVisits === 0;
  const skedisyAcquired = relation.acquiredBy === "skedisy";
  const alreadyCharged = Boolean(relation.commissionChargedAtBookingId);

  let commissionReason = "legacy_flat";
  let chargePlatformFee = true;
  let acquisitionAttributed = false;

  if (acquisitionMode) {
    if (isFirstSalonVisit && skedisyAcquired && !alreadyCharged) {
      commissionReason = "acquisition_first";
      chargePlatformFee = true;
      acquisitionAttributed = true;
    } else {
      commissionReason = "none";
      chargePlatformFee = false;
      acquisitionAttributed = false;
    }
  }

  const secondVisitIncentiveApplicable =
    priorSalonVisits === 1 &&
    skedisyAcquired &&
    (relation.secondVisitIncentiveStatus === "granted" ||
      relation.secondVisitIncentiveStatus === "eligible") &&
    (!relation.secondVisitIncentiveExpiresAt ||
      new Date(relation.secondVisitIncentiveExpiresAt) > new Date());

  return {
    channel: normalizedChannel,
    acquiredBy: relation.acquiredBy,
    acquisitionAttributed,
    commissionReason,
    chargePlatformFee,
    priorSalonVisits,
    relation,
    secondVisitIncentiveApplicable,
  };
}

/**
 * After booking saved: mark first booking / commission charged.
 */
async function recordBookingAttribution(relation, booking, monetization) {
  if (!relation || !booking) return;
  let dirty = false;
  if (!relation.firstBookingId) {
    relation.firstBookingId = booking._id;
    dirty = true;
  }
  if (
    monetization?.commissionReason === "acquisition_first" &&
    !relation.commissionChargedAtBookingId
  ) {
    relation.commissionChargedAtBookingId = booking._id;
    dirty = true;
  }
  // Snapshot on booking = consume one-shot 2nd-visit incentive eligibility
  if (
    monetization?.secondVisitIncentiveApplicable &&
    Number(booking?.secondVisitIncentive?.amount) > 0 &&
    relation.secondVisitIncentiveStatus !== "redeemed"
  ) {
    relation.secondVisitIncentiveStatus = "redeemed";
    relation.secondVisitIncentiveBookingId = booking._id;
    dirty = true;
  }
  if (dirty) await relation.save();
}

/**
 * After booking completed: unlock 2nd-visit incentive for Skedisy-acquired clients.
 */
async function onBookingCompletedForAcquisition(booking, setting) {
  if (!booking?.userId || !booking?.salonId) return null;
  const relation = await getOrCreateRelation(booking.userId, booking.salonId);
  if (relation.acquiredBy !== "skedisy") return relation;
  if (!relation.firstCompletedBookingId) {
    relation.firstCompletedBookingId = booking._id;
  }
  const incentive = setting?.secondVisitIncentive || {};
  if (
    incentive.enabled !== false &&
    !relation.secondVisitIncentiveStatus &&
    String(relation.firstCompletedBookingId) === String(booking._id)
  ) {
    const days = Number(incentive.expiresDays) > 0 ? Number(incentive.expiresDays) : 90;
    relation.secondVisitIncentiveStatus = "granted";
    relation.secondVisitIncentiveExpiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    );
  }
  await relation.save();
  return relation;
}

/**
 * Compute one-shot 2nd visit incentive amount (HT base).
 */
function computeSecondVisitIncentiveAmount(withoutTax, setting) {
  const cfg = setting?.secondVisitIncentive || {};
  if (cfg.enabled === false) return 0;
  const base = Math.max(0, Number(withoutTax) || 0);
  const flat = Math.max(0, Number(cfg.flatAmount) || 0);
  const pct = Math.max(0, Number(cfg.percent) || 0);
  let amount = 0;
  if (pct > 0) amount = (base * pct) / 100;
  if (flat > 0) {
    amount = amount > 0 ? Math.min(amount, flat) : flat;
  }
  if (!amount && pct <= 0 && flat <= 0) {
    // defaults: min(€5, 10%)
    amount = Math.min(5, (base * 10) / 100);
  }
  return Math.round(amount * 100) / 100;
}

module.exports = {
  normalizeChannel,
  acquiredByFromChannel,
  isAcquisitionCommissionMode,
  countSalonVisits,
  getOrCreateRelation,
  resolveBookingMonetization,
  recordBookingAttribution,
  onBookingCompletedForAcquisition,
  computeSecondVisitIncentiveAmount,
};
