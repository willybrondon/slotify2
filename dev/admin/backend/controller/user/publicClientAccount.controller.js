const mongoose = require("mongoose");
const Booking = require("../../models/booking.model");
const Notification = require("../../models/notification.model");
const User = require("../../models/user.model");
const Complain = require("../../models/complain.model");
const Salon = require("../../models/salon.model");
const {
  getBookingListStatusFilter,
} = require("../../services/bookingStatus.service");
const { renderClientAccountPage } = require("../../lib/publicClientAccountPage");

function requireUserId(req) {
  return String(req.query?.userId || req.body?.userId || "").trim();
}

function mapBooking(b) {
  const services = Array.isArray(b.serviceId)
    ? b.serviceId.map((s) =>
        s && typeof s === "object"
          ? { _id: s._id, name: s.name, image: s.image }
          : { _id: s, name: "", image: "" }
      )
    : [];
  const salon =
    b.salonId && typeof b.salonId === "object"
      ? {
          _id: b.salonId._id,
          name: b.salonId.name,
          mainImage: b.salonId.mainImage || "",
          address: b.salonId.addressDetails?.addressLine1 || "",
          city: b.salonId.addressDetails?.city || "",
        }
      : null;
  const expert =
    b.expertId && typeof b.expertId === "object"
      ? {
          _id: b.expertId._id,
          fname: b.expertId.fname,
          lname: b.expertId.lname,
          image: b.expertId.image || "",
        }
      : null;

  return {
    _id: b._id,
    bookingId: b.bookingId,
    status: b.status,
    date: b.date,
    time: b.time || [],
    startTime: b.startTime || (Array.isArray(b.time) ? b.time[0] : "") || "",
    amount: b.amount,
    duration: b.duration,
    isReviewed: b.isReviewed,
    cancel: b.cancel || null,
    services,
    salon,
    expert,
  };
}

/**
 * GET /api/public/client/bookings?userId=&status=pending|cancel|completed&start=&limit=&search=
 */
exports.publicClientBookings = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const status = String(req.query.status || "pending").trim();
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Connexion requise." });
    }

    const user = await User.findById(userId).select("_id").lean();
    if (!user) {
      return res.status(200).json({ status: false, message: "Utilisateur introuvable." });
    }

    const start = Math.max(0, parseInt(req.query.start, 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = String(req.query.search || "").trim();
    const filter = {
      userId: user._id,
      isDelete: { $ne: true },
      ...getBookingListStatusFilter(status),
    };

    let bookings = await Booking.find(filter)
      .sort({ date: -1, startTime: 1 })
      .skip(start * limit)
      .limit(limit)
      .populate("salonId", "name mainImage addressDetails")
      .populate("expertId", "fname lname image")
      .populate("serviceId", "name image")
      .lean();

    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      bookings = bookings.filter((b) => {
        const svc = (b.serviceId || []).some((s) => re.test(s?.name || ""));
        const salon = re.test(b.salonId?.name || "");
        const id = re.test(String(b.bookingId || ""));
        return svc || salon || id;
      });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      data: bookings.map(mapBooking),
    });
  } catch (error) {
    console.error("[publicClientBookings]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /api/public/client/notifications?userId=
 */
exports.publicClientNotifications = async (req, res) => {
  try {
    const userId = requireUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Connexion requise." });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean();

    return res.status(200).json({
      status: true,
      message: "Success",
      notification: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("[publicClientNotifications]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * DELETE /api/public/client/notifications?userId=&notificationId=
 */
exports.publicDeleteNotification = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const notificationId = String(req.query.notificationId || req.body?.notificationId || "").trim();
    if (
      !userId ||
      !notificationId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return res.status(200).json({ status: false, message: "Paramètres invalides." });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });
    if (!deleted) {
      return res.status(200).json({
        status: false,
        message: "Notification introuvable.",
      });
    }
    return res.status(200).json({ status: true, message: "Notification supprimée." });
  } catch (error) {
    console.error("[publicDeleteNotification]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/client/complain
 * body: { userId, bookingId, details }
 */
exports.publicRaiseComplain = async (req, res) => {
  try {
    const userId = String(req.body?.userId || "").trim();
    const bookingId = String(req.body?.bookingId || "").trim();
    const details = String(req.body?.details || "").trim();

    if (!userId || !bookingId || !details) {
      return res.status(200).json({
        status: false,
        message: "Réservation et détails requis.",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Connexion requise." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "Utilisateur introuvable." });
    }

    const booking = await Booking.findOne({ bookingId, userId: user._id });
    if (!booking) {
      return res.status(200).json({
        status: false,
        message: "Réservation introuvable pour ce compte.",
      });
    }

    const salon = await Salon.findById(booking.salonId).select("_id").lean();
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable." });
    }

    const complain = new Complain();
    complain.userId = user._id;
    complain.person = 1;
    complain.details = details.slice(0, 2000);
    complain.bookingData = booking._id;
    const bidNum = Number(booking.bookingId);
    complain.bookingId = Number.isFinite(bidNum) ? bidNum : booking.bookingId;
    await complain.save();

    return res.status(200).json({
      status: true,
      message: "Votre signalement a bien été envoyé.",
      complain: {
        _id: complain._id,
        bookingId: complain.bookingId,
        details: complain.details,
      },
    });
  } catch (error) {
    console.error("[publicRaiseComplain]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.serveReservationsPage = (req, res) =>
  renderClientAccountPage(req, res, "reservations");
exports.serveNotificationsPage = (req, res) =>
  renderClientAccountPage(req, res, "notifications");
exports.serveProfilePage = (req, res) =>
  renderClientAccountPage(req, res, "profile");
