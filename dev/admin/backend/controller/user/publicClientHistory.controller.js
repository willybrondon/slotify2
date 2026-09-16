const Salon = require("../../models/salon.model");
const Booking = require("../../models/booking.model");
const crypto = require("crypto");
const moment = require("moment");
const {
  getClientSalonHistory,
  computeLoyaltyDiscount,
  getLoyaltyProgram,
} = require("../../services/loyalty.service");
const {
  evaluateBookingActions,
} = require("../../services/bookingLifecycle.service");

function makeManageToken(bookingId) {
  return crypto
    .createHmac("sha256", process.env.secretKey || "skedisy")
    .update(String(bookingId))
    .digest("hex");
}

/**
 * GET /api/public/client/salon-history?salonId=&userId=
 * Historique completed + éventuelle fidélité pour une presta.
 */
exports.publicClientSalonHistory = async (req, res) => {
  try {
    const salonId = req.query.salonId;
    const userId = req.query.userId;
    const serviceId = req.query.serviceId;
    if (!salonId || !userId) {
      return res.status(400).json({ status: false, message: "salonId and userId required" });
    }

    const salon = await Salon.findById(salonId).select("name loyaltyProgram").lean();
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }

    const history = await getClientSalonHistory({
      userId,
      salonId,
      limit: Number(req.query.limit) || 12,
    });

    let loyalty = null;
    if (serviceId) {
      const amountHint = Number(req.query.amountHt) || 0;
      loyalty = await computeLoyaltyDiscount({
        salon,
        userId,
        serviceId,
        amountHt: amountHint,
      });
    }

    return res.status(200).json({
      status: true,
      salonName: salon.name,
      loyaltyProgram: getLoyaltyProgram(salon),
      history,
      loyalty,
    });
  } catch (error) {
    console.error("[publicClientSalonHistory]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /api/public/client/upcoming?salonId=&userId=
 * Prochains RDV + droits cancel / reschedule selon policy salon.
 */
exports.publicClientUpcoming = async (req, res) => {
  try {
    const salonId = req.query.salonId;
    const userId = req.query.userId;
    if (!salonId || !userId) {
      return res.status(400).json({ status: false, message: "salonId and userId required" });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }

    const today = moment().format("YYYY-MM-DD");
    const bookings = await Booking.find({
      salonId,
      userId,
      status: { $in: ["pending", "confirm"] },
      date: { $gte: today },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(20)
      .lean();

    const items = bookings.map((b) => ({
      _id: b._id,
      bookingId: b.bookingId,
      date: b.date,
      startTime: b.startTime,
      status: b.status,
      expertId: b.expertId,
      amount: b.amount,
      depositAmount: b.depositAmount,
      manageToken: makeManageToken(b._id),
      evaluation: evaluateBookingActions(b, salon),
    }));

    return res.status(200).json({ status: true, bookings: items });
  } catch (error) {
    console.error("[publicClientUpcoming]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
