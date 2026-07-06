const moment = require("moment");
const mongoose = require("mongoose");
const Expert = require("../models/expert.model");
const User = require("../models/user.model");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");
const Booking = require("../models/booking.model");
const BusyExpert = require("../models/busyExpert.model");
const UString = require("../models/uniqueString.model");
const SalonExpertWalletHistory = require("../models/salonExpertWalletHistory.model");
const { SALON_EXPERT_WALLET_TYPE } = require("../types/constant");
const { generateUniqueIdentifier } = require("../generateUniqueIdentifier");
const {
  getEnglishDayName,
  normalizeTimeString,
  getSalonSlotsForDay,
} = require("./teamSchedule.service");
const {
  resolveSalonCommissionPercent,
  computeRequiredSalonWalletBalance,
  resolveMinWalletBalance,
  shouldDebitSalonWalletForCommission,
  isSalonWalletCommissionEnabled,
} = require("./salonBookingWallet.service");

const SLOT_MINUTES = 15;

async function generateUniqueBookingId() {
  let newBookingId;
  do {
    newBookingId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await Booking.exists({ bookingId: newBookingId }));
  return newBookingId;
}

function buildSlotsFromStart(startTime, durationMinutes, slotSize = SLOT_MINUTES) {
  const normalizedStart = normalizeTimeString(startTime);
  if (!normalizedStart) return [];
  const slots = [];
  let cursor = moment(normalizedStart, "hh:mm A");
  const end = cursor.clone().add(durationMinutes || slotSize, "minutes");
  while (cursor.isBefore(end)) {
    slots.push(cursor.format("hh:mm A"));
    cursor.add(slotSize, "minutes");
  }
  return slots;
}

async function findOrCreateClient({ userId, fname, lname, mobile }) {
  if (userId) {
    const user = await User.findOne({ _id: userId, isDelete: false });
    if (!user) throw new Error("Client introuvable");
    return user;
  }

  const phone = String(mobile || "").trim();
  if (!phone) throw new Error("Téléphone client requis");

  let user = await User.findOne({ mobile: phone, isDelete: false });
  if (user) return user;

  user = await User.create({
    fname: (fname || "Client").trim(),
    lname: (lname || "Salon").trim(),
    mobile: phone,
    email: "",
    loginType: 3,
  });
  return user;
}

async function assertSlotsAvailable({ expertId, date, timeArray, excludeBookingId }) {
  const conflictQuery = {
    expertId,
    date,
    status: { $in: ["pending", "confirm"] },
    time: { $elemMatch: { $in: timeArray } },
  };
  if (excludeBookingId) {
    conflictQuery._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.exists(conflictQuery);
  if (conflict) {
    throw new Error("Un ou plusieurs créneaux sont déjà réservés");
  }

  const busy = await BusyExpert.findOne({ expertId, date });
  const normalizedBusy = (busy?.time || []).map((slot) => normalizeTimeString(slot)).filter(Boolean);
  if (normalizedBusy.some((slot) => timeArray.includes(slot))) {
    throw new Error("Le créneau est indisponible");
  }
}

function validateSalonHours(salon, date, timeArray) {
  const dayOfWeek = getEnglishDayName(date);
  const salonTime = salon.salonTime?.find((t) => t.day === dayOfWeek);
  if (!salonTime || salonTime.isActive === false) {
    throw new Error("Salon fermé ce jour-là");
  }

  const allowedSlots = new Set(getSalonSlotsForDay(salonTime));
  if (!timeArray.every((slot) => allowedSlots.has(normalizeTimeString(slot)))) {
    throw new Error("Créneau hors horaires d'ouverture");
  }
}

async function computeServicePricing(salon, expert, serviceIds) {
  const expertServiceIds = (expert.serviceId || []).map((id) => id.toString());
  if (!serviceIds.every((id) => expertServiceIds.includes(String(id)))) {
    throw new Error("Service non proposé par ce professionnel");
  }

  const salonServiceMap = {};
  (salon.serviceIds || []).forEach((entry) => {
    const id = entry?.id?._id?.toString() || entry?.id?.toString();
    if (id) salonServiceMap[id] = entry;
  });

  const serviceObjectIds = serviceIds.map((id) => new mongoose.Types.ObjectId(id));
  const services = await Service.find({ _id: { $in: serviceObjectIds } });
  if (services.length !== serviceIds.length) {
    throw new Error("Service introuvable");
  }

  let withoutTax = 0;
  let totalDuration = 0;
  services.forEach((service) => {
    const salonEntry = salonServiceMap[service._id.toString()];
    if (!salonEntry) throw new Error("Service invalide pour ce salon");
    withoutTax += parseFloat(salonEntry.price) || 0;
    totalDuration += service.duration || SLOT_MINUTES;
  });

  return {
    serviceObjectIds,
    withoutTax: parseFloat(withoutTax.toFixed(2)),
    totalDuration,
  };
}

async function createUniqueStrings(booking, expertId, date, timeArray) {
  await UString.deleteMany({ bookingId: booking._id });
  for (const slot of timeArray) {
    const normalized = normalizeTimeString(slot);
    const uniqueStringValue = `${date}-${expertId}-${normalized}`;
    const existing = await UString.findOne({ string: uniqueStringValue });
    if (existing && existing.bookingId.toString() !== booking._id.toString()) {
      throw new Error(`Créneau ${normalized} déjà occupé`);
    }
    if (!existing) {
      await UString.create({ string: uniqueStringValue, bookingId: booking._id });
    }
  }
}

async function createPlanningBooking(salon, body) {
  const expertId = body.expertId;
  const date = body.date;
  const startTime = body.startTime || body.time;
  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [body.serviceId].filter(Boolean);

  if (!expertId || !date || !startTime || !serviceIds.length) {
    throw new Error("expertId, date, startTime et serviceIds sont requis");
  }

  const expert = await Expert.findOne({
    _id: expertId,
    salonId: salon._id,
    isDelete: false,
    isBlock: false,
  });
  if (!expert) throw new Error("Professionnel introuvable");

  const user = await findOrCreateClient({
    userId: body.userId,
    fname: body.fname,
    lname: body.lname,
    mobile: body.mobile,
  });

  const { serviceObjectIds, withoutTax, totalDuration } = await computeServicePricing(
    salon,
    expert,
    serviceIds
  );

  const timeArray = body.timeArray?.length
    ? body.timeArray.map((t) => normalizeTimeString(t)).filter(Boolean)
    : buildSlotsFromStart(startTime, totalDuration);

  if (!timeArray.length) throw new Error("Créneau horaire invalide");

  validateSalonHours(salon, date, timeArray);
  await assertSlotsAvailable({ expertId: expert._id, date, timeArray });

  const setting = global.settingJSON || {};
  const requiredWallet = computeRequiredSalonWalletBalance({
    salon,
    setting,
    servicePriceWithoutTax: withoutTax,
  });
  if (isSalonWalletCommissionEnabled(setting) && (salon.wallet || 0) < requiredWallet) {
    throw new Error("Solde portefeuille salon insuffisant pour la commission");
  }

  const taxPercent = parseFloat(setting.tax) || 0;
  const taxAmount = parseFloat(((withoutTax * taxPercent) / 100).toFixed(2));
  const amount = parseFloat((withoutTax + taxAmount).toFixed(2));
  const salonCommissionPercent = resolveSalonCommissionPercent(salon, setting);
  const customerCommissionPercent = parseFloat(setting.customerCommissionCharges) || 0;
  const platformFee = parseFloat(((salonCommissionPercent * withoutTax) / 100).toFixed(2));
  const customerCommission =
    customerCommissionPercent > 0
      ? parseFloat(((customerCommissionPercent * withoutTax) / 100).toFixed(2))
      : 0;
  const salonCommission = parseFloat(
    (((withoutTax - platformFee) * expert.commission) / 100).toFixed(2)
  );

  const globalAutoConfirm = setting.autoConfirmBookings !== false;
  const salonAutoConfirm = salon.autoConfirmBookings !== false;

  const booking = await Booking.create({
    userId: user._id,
    expertId: expert._id,
    salonId: salon._id,
    serviceId: serviceObjectIds,
    date,
    startTime: timeArray[0],
    time: timeArray,
    duration: totalDuration,
    atPlace: 1,
    address: "",
    status: globalAutoConfirm && salonAutoConfirm ? "confirm" : "pending",
    withoutTax,
    tax: taxAmount,
    amount,
    platformFee,
    platformFeePercent: salonCommissionPercent,
    customerCommission,
    customerCommissionPercent,
    salonCommission,
    salonCommissionPercent: expert.commission,
    salonEarning: parseFloat((withoutTax - platformFee).toFixed(2)),
    expertEarning: parseFloat((withoutTax - platformFee - salonCommission).toFixed(2)),
    bookingId: await generateUniqueBookingId(),
    coupon: {},
  });

  if (platformFee > 0 && shouldDebitSalonWalletForCommission(setting)) {
    salon.wallet = (salon.wallet || 0) - platformFee;
    await salon.save();
    await SalonExpertWalletHistory.create({
      salon: salon._id,
      booking: booking._id,
      amount: platformFee,
      type: SALON_EXPERT_WALLET_TYPE.DEBIT_PLATFORM_COMMISSION,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm a"),
      uniqueId: await generateUniqueIdentifier(),
    });
  }

  await createUniqueStrings(booking, expert._id, date, timeArray);
  return booking;
}

async function reschedulePlanningBooking(salon, body) {
  const bookingId = body.bookingId;
  const expertId = body.expertId;
  const date = body.date;
  const startTime = body.startTime || body.time;

  if (!bookingId || !expertId || !date || !startTime) {
    throw new Error("bookingId, expertId, date et startTime sont requis");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    salonId: salon._id,
    status: { $in: ["pending", "confirm"] },
  });
  if (!booking) throw new Error("Réservation introuvable");

  const expert = await Expert.findOne({
    _id: expertId,
    salonId: salon._id,
    isDelete: false,
    isBlock: false,
  });
  if (!expert) throw new Error("Professionnel introuvable");

  const timeArray = buildSlotsFromStart(startTime, booking.duration || SLOT_MINUTES);
  if (!timeArray.length) throw new Error("Créneau horaire invalide");

  validateSalonHours(salon, date, timeArray);
  await assertSlotsAvailable({
    expertId: expert._id,
    date,
    timeArray,
    excludeBookingId: booking._id,
  });

  booking.expertId = expert._id;
  booking.date = date;
  booking.time = timeArray;
  booking.startTime = timeArray[0];
  await booking.save();

  await createUniqueStrings(booking, expert._id, date, timeArray);
  return booking;
}

async function resizePlanningBooking(salon, body) {
  const { bookingId, expertId, date, startTime, durationMinutes } = body;

  if (!bookingId) {
    throw new Error("bookingId est requis");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    salonId: salon._id,
    status: { $in: ["pending", "confirm"] },
  });
  if (!booking) throw new Error("Réservation introuvable");

  const targetExpertId = expertId || booking.expertId;
  const targetDate = date || booking.date;
  const targetStart = startTime || booking.startTime;
  const duration = Math.max(
    15,
    parseInt(durationMinutes, 10) ||
      booking.duration ||
      (booking.time?.length || 1) * SLOT_MINUTES
  );

  const expert = await Expert.findOne({
    _id: targetExpertId,
    salonId: salon._id,
    isDelete: false,
    isBlock: false,
  });
  if (!expert) throw new Error("Professionnel introuvable");

  const timeArray = buildSlotsFromStart(targetStart, duration);
  if (!timeArray.length) throw new Error("Durée invalide");

  validateSalonHours(salon, targetDate, timeArray);
  await assertSlotsAvailable({
    expertId: expert._id,
    date: targetDate,
    timeArray,
    excludeBookingId: booking._id,
  });

  booking.expertId = expert._id;
  booking.date = targetDate;
  booking.time = timeArray;
  booking.startTime = timeArray[0];
  booking.duration = duration;
  await booking.save();

  await createUniqueStrings(booking, expert._id, targetDate, timeArray);
  return booking;
}

async function getPlanningBookingDetail(salon, bookingId) {
  const booking = await Booking.findOne({
    _id: bookingId,
    salonId: salon._id,
  })
    .populate("userId", "fname lname mobile email image")
    .populate("expertId", "fname lname image mobile serviceId")
    .populate("serviceId", "name duration price")
    .lean();

  if (!booking) throw new Error("Réservation introuvable");
  return booking;
}

function applyBookingFinancials(booking, expert, salon, withoutTax, setting) {
  const taxPercent = parseFloat(setting.tax) || 0;
  const taxAmount = parseFloat(((withoutTax * taxPercent) / 100).toFixed(2));
  const amount = parseFloat((withoutTax + taxAmount).toFixed(2));
  const salonCommissionPercent = resolveSalonCommissionPercent(salon, setting);
  const customerCommissionPercent = parseFloat(setting.customerCommissionCharges) || 0;
  const platformFee = parseFloat(((salonCommissionPercent * withoutTax) / 100).toFixed(2));
  const customerCommission =
    customerCommissionPercent > 0
      ? parseFloat(((customerCommissionPercent * withoutTax) / 100).toFixed(2))
      : 0;
  const salonCommission = parseFloat(
    (((withoutTax - platformFee) * expert.commission) / 100).toFixed(2)
  );

  booking.withoutTax = withoutTax;
  booking.tax = taxAmount;
  booking.amount = amount;
  booking.platformFee = platformFee;
  booking.platformFeePercent = salonCommissionPercent;
  booking.customerCommission = customerCommission;
  booking.customerCommissionPercent = customerCommissionPercent;
  booking.salonCommission = salonCommission;
  booking.salonCommissionPercent = expert.commission;
  booking.salonEarning = parseFloat((withoutTax - platformFee).toFixed(2));
  booking.expertEarning = parseFloat((withoutTax - platformFee - salonCommission).toFixed(2));

  return { platformFee };
}

async function adjustSalonCommissionWallet(salon, booking, oldFee, newFee, setting) {
  if (!shouldDebitSalonWalletForCommission(setting || global.settingJSON)) return;

  const previous = parseFloat(oldFee) || 0;
  const next = parseFloat(newFee) || 0;
  const delta = parseFloat((next - previous).toFixed(2));
  if (!delta) return;

  if (delta > 0 && (salon.wallet || 0) < delta) {
    throw new Error("Solde portefeuille salon insuffisant pour la commission supplémentaire");
  }

  salon.wallet = parseFloat(((salon.wallet || 0) - delta).toFixed(2));
  await salon.save();

  await SalonExpertWalletHistory.create({
    salon: salon._id,
    booking: booking._id,
    amount: Math.abs(delta),
    type:
      delta > 0
        ? SALON_EXPERT_WALLET_TYPE.DEBIT_PLATFORM_COMMISSION
        : SALON_EXPERT_WALLET_TYPE.CREDIT_BOOKING_REFUND,
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("HH:mm a"),
    uniqueId: await generateUniqueIdentifier(),
  });
}

async function cancelPlanningBooking(salon, bookingId, reason, cancelledBy = "salon") {
  const cancelReason = String(reason || "Annulé depuis le planning").trim();
  if (!cancelReason) throw new Error("Motif d'annulation requis");

  const booking = await Booking.findOne({
    _id: bookingId,
    salonId: salon._id,
    status: { $in: ["pending", "confirm"] },
  });
  if (!booking) throw new Error("Réservation introuvable ou déjà clôturée");

  booking.status = "cancel";
  booking.cancel = {
    reason: cancelReason,
    time: moment().format("HH:mm a"),
    date: moment().format("YYYY-MM-DD"),
    person: cancelledBy,
  };
  await booking.save();
  await UString.deleteMany({ bookingId: booking._id });

  return booking;
}

async function updatePlanningBookingServices(salon, body) {
  const bookingId = body.bookingId;
  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [];

  if (!bookingId || !serviceIds.length) {
    throw new Error("bookingId et serviceIds sont requis");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    salonId: salon._id,
    status: { $in: ["pending", "confirm"] },
  });
  if (!booking) throw new Error("Réservation introuvable ou non modifiable");

  const expert = await Expert.findOne({
    _id: booking.expertId,
    salonId: salon._id,
    isDelete: false,
    isBlock: false,
  });
  if (!expert) throw new Error("Professionnel introuvable");

  const { serviceObjectIds, withoutTax, totalDuration } = await computeServicePricing(
    salon,
    expert,
    serviceIds
  );

  const timeArray = buildSlotsFromStart(booking.startTime, totalDuration);
  if (!timeArray.length) throw new Error("Durée invalide pour les services sélectionnés");

  validateSalonHours(salon, booking.date, timeArray);
  await assertSlotsAvailable({
    expertId: expert._id,
    date: booking.date,
    timeArray,
    excludeBookingId: booking._id,
  });

  const setting = global.settingJSON || {};
  const oldPlatformFee = booking.platformFee || 0;
  const { platformFee } = applyBookingFinancials(booking, expert, salon, withoutTax, setting);

  const requiredWallet = computeRequiredSalonWalletBalance({
    salon,
    setting,
    servicePriceWithoutTax: withoutTax,
  });
  if (isSalonWalletCommissionEnabled(setting)) {
    const projectedWallet = (salon.wallet || 0) - Math.max(0, platformFee - oldPlatformFee);
    if (projectedWallet < requiredWallet) {
      throw new Error("Solde portefeuille salon insuffisant après modification");
    }
  }

  booking.serviceId = serviceObjectIds;
  booking.duration = totalDuration;
  booking.time = timeArray;
  await booking.save();

  await adjustSalonCommissionWallet(salon, booking, oldPlatformFee, platformFee, setting);
  await createUniqueStrings(booking, expert._id, booking.date, timeArray);

  return booking;
}

async function searchPlanningClients(search) {
  const term = String(search || "").trim();
  if (!term || term.length < 2) return [];

  return User.find({
    isDelete: false,
    $or: [
      { mobile: { $regex: term, $options: "i" } },
      { fname: { $regex: term, $options: "i" } },
      { lname: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ],
  })
    .select("fname lname mobile email")
    .limit(20)
    .lean();
}

module.exports = {
  createPlanningBooking,
  reschedulePlanningBooking,
  resizePlanningBooking,
  getPlanningBookingDetail,
  cancelPlanningBooking,
  updatePlanningBookingServices,
  searchPlanningClients,
  buildSlotsFromStart,
};
