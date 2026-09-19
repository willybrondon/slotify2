const User = require("../models/user.model");
const moment = require("moment");

/**
 * Sync Beauty Profile from a completed booking (answers + photos).
 */
async function syncBeautyProfileFromBooking(booking) {
  if (!booking?.userId) return null;
  const user = await User.findById(booking.userId);
  if (!user) return null;

  const answers = booking.clientAnswers || {};
  const bp = user.beautyProfile || {};

  if (answers.finesse_nattes || answers.longueur) {
    if (answers.finesse_nattes) bp.hairType = bp.hairType || String(answers.finesse_nattes);
    if (answers.longueur) bp.hairLength = String(answers.longueur);
  }
  if (answers.hairType) bp.hairType = String(answers.hairType);
  if (answers.hairLength) bp.hairLength = String(answers.hairLength);
  if (answers.sensitivity || answers.scalpSensitivity) {
    bp.sensitivity = String(answers.sensitivity || answers.scalpSensitivity);
  }
  if (answers.preferences) bp.preferences = String(answers.preferences);
  const quizBits = [
    answers.hairCondition,
    answers.styleInterest,
    answers.bookingGoal || answers.occasion,
  ]
    .map((x) => (x != null ? String(x).trim() : ""))
    .filter(Boolean);
  if (quizBits.length) {
    bp.preferences = [bp.preferences, ...quizBits].filter(Boolean).join(" · ").slice(0, 200);
  }

  bp.lastConfig = {
    answers,
    addons: answers.addons || [],
    serviceId: Array.isArray(booking.serviceId)
      ? String(booking.serviceId[0])
      : String(booking.serviceId || ""),
    quotedPrice: booking.quotedPrice,
    plannedDurationMinutes: booking.plannedDurationMinutes || booking.estimatedDuration,
    actualDurationMinutes: booking.actualDurationMinutes,
    date: booking.date,
  };
  bp.lastSalonId = booking.salonId;
  bp.lastServiceId = Array.isArray(booking.serviceId)
    ? booking.serviceId[0]
    : booking.serviceId;

  const insp = booking.inspirationPhotoUrls || [];
  if (insp.length) {
    bp.inspirationPhotoUrls = [...insp, ...(bp.inspirationPhotoUrls || [])].slice(0, 12);
  }
  const results = booking.resultPhotoUrls || [];
  if (results.length) {
    bp.resultPhotoUrls = [...results, ...(bp.resultPhotoUrls || [])].slice(0, 12);
  }

  bp.updatedAt = new Date();
  user.beautyProfile = bp;
  await user.save();
  return bp;
}

/**
 * Minutes between check-in and check-out (12h clock strings).
 */
function durationMinutesFromCheckTimes(checkIn, checkOut, dateStr) {
  if (!checkIn || !checkOut) return null;
  const base = dateStr || moment().format("YYYY-MM-DD");
  const a = moment(`${base} ${checkIn}`, ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"], true);
  let b = moment(`${base} ${checkOut}`, ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"], true);
  if (!a.isValid() || !b.isValid()) return null;
  if (b.isBefore(a)) b = b.add(1, "day");
  const mins = b.diff(a, "minutes");
  return mins > 0 && mins < 24 * 60 ? mins : null;
}

module.exports = {
  syncBeautyProfileFromBooking,
  durationMinutesFromCheckTimes,
};
