const moment = require("moment");
const Booking = require("../models/booking.model");
const Salon = require("../models/salon.model");
const Expert = require("../models/expert.model");
const {
  buildSlotsFromStart,
  reschedulePlanningBooking,
} = require("./teamScheduleBooking.service");

/**
 * Client booking lifecycle: new slots (existing book) · reschedule · cancel
 * with salon cancellationPolicy (free window vs late deposit retention).
 */

function getPolicy(salon) {
  const p = salon?.cancellationPolicy || {};
  return {
    enabled: Boolean(p.enabled),
    freeCancelHours: Math.max(0, Number(p.freeCancelHours) || 24),
    lateCancelPercent: Math.min(100, Math.max(0, Number(p.lateCancelPercent) || 50)),
    noShowPercent: Math.min(100, Math.max(0, Number(p.noShowPercent) || 100)),
  };
}

function appointmentMoment(booking) {
  const t = booking.startTime || (Array.isArray(booking.time) && booking.time[0]) || "12:00 AM";
  let m = moment(`${booking.date} ${t}`, "YYYY-MM-DD hh:mm A", true);
  if (!m.isValid()) {
    m = moment(`${booking.date} ${t}`, "YYYY-MM-DD HH:mm", true);
  }
  if (!m.isValid()) {
    m = moment(booking.date, "YYYY-MM-DD").hour(12);
  }
  return m;
}

function hoursUntilAppointment(booking, now = moment()) {
  return appointmentMoment(booking).diff(now, "hours", true);
}

/**
 * @returns policy evaluation for UI + cancel/reschedule APIs
 */
function evaluateBookingActions(booking, salon, now = moment()) {
  const policy = getPolicy(salon);
  const hoursUntil = hoursUntilAppointment(booking, now);
  const status = booking.status;

  if (status === "cancel" || status === "completed") {
    return {
      ...policy,
      hoursUntil,
      canBookNew: true,
      canReschedule: false,
      canCancel: false,
      mode: status,
      message:
        status === "cancel"
          ? "Cette réservation est déjà annulée."
          : "Cette réservation est terminée.",
      retainPercent: 0,
      retainedAmount: 0,
      refundAmount: 0,
    };
  }

  if (status === "confirm" && booking.checkInTime) {
    return {
      ...policy,
      hoursUntil,
      canBookNew: true,
      canReschedule: false,
      canCancel: false,
      mode: "checked_in",
      message: "Annulation / modification impossible après check-in. Contactez le salon.",
      retainPercent: 0,
      retainedAmount: 0,
      refundAmount: 0,
    };
  }

  const prepaidBase =
    Number(booking.depositAmount) > 0
      ? Number(booking.depositAmount)
      : Number(booking.amount) > 0 && booking.paymentStatus === 1
        ? Number(booking.amount)
        : Number(booking.depositAmount) || 0;

  if (hoursUntil >= policy.freeCancelHours) {
    return {
      ...policy,
      hoursUntil,
      canBookNew: true,
      canReschedule: true,
      canCancel: true,
      mode: "free",
      message: `Modification et annulation gratuites jusqu’à ${policy.freeCancelHours} h avant le RDV.`,
      retainPercent: 0,
      retainedAmount: 0,
      refundAmount: prepaidBase,
      prepaidBase,
    };
  }

  // Late window (< freeCancelHours, including < 24h / “au-delà d’un jour” côté échéance)
  if (policy.enabled) {
    const retainPercent = policy.lateCancelPercent;
    const retainedAmount = parseFloat(
      ((prepaidBase * retainPercent) / 100).toFixed(2)
    );
    const refundAmount = parseFloat(
      Math.max(0, prepaidBase - retainedAmount).toFixed(2)
    );
    return {
      ...policy,
      hoursUntil,
      canBookNew: true,
      canReschedule: false,
      canCancel: true,
      mode: "late",
      message: `Annulation tardive : le salon conserve ${retainPercent} % de l’acompte (${retainedAmount} €). La reprogrammation libre n’est plus possible — réservez un nouveau créneau après annulation.`,
      retainPercent,
      retainedAmount,
      refundAmount,
      prepaidBase,
    };
  }

  return {
    ...policy,
    hoursUntil,
    canBookNew: true,
    canReschedule: false,
    canCancel: false,
    mode: "blocked",
    message: `Moins de ${policy.freeCancelHours} h avant le RDV : contactez le salon pour annuler ou déplacer.`,
    retainPercent: 0,
    retainedAmount: 0,
    refundAmount: 0,
    prepaidBase,
  };
}

async function loadBookingSalon(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) return { booking: null, salon: null };
  const salon = await Salon.findById(booking.salonId);
  return { booking, salon };
}

/**
 * Apply cancel with deposit retention when late + policy enabled.
 */
async function applyClientCancel(booking, salon, { reason, person = "user" } = {}) {
  const eval_ = evaluateBookingActions(booking, salon);
  if (!eval_.canCancel) {
    return { ok: false, message: eval_.message, evaluation: eval_ };
  }

  booking.status = "cancel";
  booking.cancel = booking.cancel || {};
  booking.cancel.reason = reason || (eval_.mode === "late" ? "Annulation tardive" : "Annulation cliente");
  booking.cancel.time = moment().format("hh:mm A");
  booking.cancel.date = moment().format("YYYY-MM-DD");
  booking.cancel.person = person;
  booking.cancelSettlement = {
    mode: eval_.mode,
    retainPercent: eval_.retainPercent,
    retainedAmount: eval_.retainedAmount,
    refundAmount: eval_.refundAmount,
    prepaidBase: eval_.prepaidBase || 0,
    policyEnabled: eval_.enabled,
    appliedAt: new Date(),
  };
  await booking.save();

  return { ok: true, booking, evaluation: eval_ };
}

/**
 * Reschedule only in free window.
 */
async function applyClientReschedule(booking, salon, { date, startTime, expertId }) {
  const eval_ = evaluateBookingActions(booking, salon);
  if (!eval_.canReschedule) {
    return { ok: false, message: eval_.message, evaluation: eval_ };
  }

  try {
    const updated = await reschedulePlanningBooking(salon, {
      bookingId: booking._id,
      expertId: expertId || booking.expertId,
      date,
      startTime,
      time: startTime,
    });
    return { ok: true, booking: updated, evaluation: eval_ };
  } catch (err) {
    return { ok: false, message: err.message || "Créneau indisponible", evaluation: eval_ };
  }
}

module.exports = {
  getPolicy,
  hoursUntilAppointment,
  evaluateBookingActions,
  loadBookingSalon,
  applyClientCancel,
  applyClientReschedule,
  buildSlotsFromStart,
};
