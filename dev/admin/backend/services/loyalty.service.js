const Booking = require("../models/booking.model");
const Service = require("../models/service.model");
const Expert = require("../models/expert.model");
const ServiceDemand = require("../models/serviceDemand.model");

/**
 * Salon loyalty tied to rebooking the same service (not generic points).
 * Rule: after minCompletedCount completed visits of the same service at this salon,
 * the next booking of that service gets sameServiceRebookPercent off.
 */

function getLoyaltyProgram(salon) {
  const lp = salon?.loyaltyProgram || {};
  return {
    enabled: Boolean(lp.enabled),
    sameServiceRebookPercent: Math.min(
      50,
      Math.max(0, Number(lp.sameServiceRebookPercent) || 0)
    ),
    minCompletedCount: Math.max(1, Number(lp.minCompletedCount) || 1),
    maxDiscountAmount: Math.max(0, Number(lp.maxDiscountAmount) || 0),
  };
}

async function countCompletedSameService(userId, salonId, serviceId) {
  if (!userId || !salonId || !serviceId) return 0;
  return Booking.countDocuments({
    userId,
    salonId,
    serviceId,
    status: "completed",
    isDelete: { $ne: true },
  });
}

/**
 * @returns {{ eligible, priorCount, percent, amount, label } | null}
 */
async function computeLoyaltyDiscount({ salon, userId, serviceId, amountHt }) {
  const prog = getLoyaltyProgram(salon);
  if (!prog.enabled || !prog.sameServiceRebookPercent || !userId || !serviceId) {
    return null;
  }

  const priorCount = await countCompletedSameService(userId, salon._id, serviceId);
  if (priorCount < prog.minCompletedCount) {
    return {
      eligible: false,
      priorCount,
      percent: prog.sameServiceRebookPercent,
      amount: 0,
      label: "",
      minCompletedCount: prog.minCompletedCount,
    };
  }

  const base = Math.max(0, Number(amountHt) || 0);
  let amount = parseFloat(((base * prog.sameServiceRebookPercent) / 100).toFixed(2));
  if (prog.maxDiscountAmount > 0) {
    amount = Math.min(amount, prog.maxDiscountAmount);
  }

  return {
    eligible: amount > 0,
    priorCount,
    percent: prog.sameServiceRebookPercent,
    amount,
    label: `Fidélité · ${prog.sameServiceRebookPercent}% (même prestation · ${priorCount} visite${
      priorCount > 1 ? "s" : ""
    })`,
    minCompletedCount: prog.minCompletedCount,
  };
}

/**
 * Client history at a salon — for Beauty Profile lite / rebook UI.
 */
async function getClientSalonHistory({ userId, salonId, limit = 12 }) {
  if (!userId || !salonId) return [];

  const bookings = await Booking.find({
    userId,
    salonId,
    status: "completed",
    isDelete: { $ne: true },
  })
    .sort({ date: -1, createdAt: -1 })
    .limit(Math.min(30, Number(limit) || 12))
    .select(
      "serviceId expertId date startTime clientAnswers demandId rebookToken quotedPrice amount duration"
    )
    .lean();

  if (!bookings.length) return [];

  const serviceIds = [
    ...new Set(
      bookings.flatMap((b) =>
        (Array.isArray(b.serviceId) ? b.serviceId : [b.serviceId]).map(String)
      )
    ),
  ];
  const expertIds = [
    ...new Set(bookings.map((b) => (b.expertId ? String(b.expertId) : null)).filter(Boolean)),
  ];
  const demandIds = [
    ...new Set(bookings.map((b) => (b.demandId ? String(b.demandId) : null)).filter(Boolean)),
  ];

  const [services, experts, demands] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select("name image duration").lean(),
    Expert.find({ _id: { $in: expertIds } }).select("fname lname image").lean(),
    demandIds.length
      ? ServiceDemand.find({ _id: { $in: demandIds } }).select("answers photoUrls").lean()
      : [],
  ]);

  const svcMap = Object.fromEntries(services.map((s) => [String(s._id), s]));
  const expMap = Object.fromEntries(experts.map((e) => [String(e._id), e]));
  const demMap = Object.fromEntries(demands.map((d) => [String(d._id), d]));

  return bookings.map((b) => {
    const sid = String(Array.isArray(b.serviceId) ? b.serviceId[0] : b.serviceId);
    const svc = svcMap[sid];
    const exp = b.expertId ? expMap[String(b.expertId)] : null;
    const dem = b.demandId ? demMap[String(b.demandId)] : null;
    const answers =
      (b.clientAnswers && Object.keys(b.clientAnswers).length
        ? b.clientAnswers
        : dem?.answers) || {};
    return {
      bookingId: String(b._id),
      date: b.date,
      startTime: b.startTime || "",
      serviceId: sid,
      serviceName: svc?.name || "Prestation",
      serviceImage: svc?.image || "",
      expertId: b.expertId ? String(b.expertId) : null,
      expertName: exp ? `${exp.fname || ""} ${exp.lname || ""}`.trim() : "",
      answers,
      photoUrls: dem?.photoUrls || [],
      rebookToken: b.rebookToken || "",
      amount: b.amount,
      duration: b.duration,
    };
  });
}

module.exports = {
  getLoyaltyProgram,
  countCompletedSameService,
  computeLoyaltyDiscount,
  getClientSalonHistory,
};
