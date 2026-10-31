const mongoose = require("mongoose");
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");

/**
 * GET /salon/clients
 * CRM salon = clientes ayant au moins une réservation (non annulée) chez CE salon.
 * Inclut les comptes guest (OTP).
 */
exports.getSalonClients = async (req, res) => {
  try {
    const salon = req.salon;
    if (!salon?._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const start = Math.max(0, parseInt(req.query.start, 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = String(req.query.search || "").trim();
    const skip = start * limit;

    const match = {
      salonId: salon._id,
      isDelete: { $ne: true },
      status: { $nin: ["cancel"] },
      userId: { $ne: null },
    };

    const grouped = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$userId",
          bookingCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          lastBookingAt: { $max: "$createdAt" },
          lastBookingDate: { $max: "$date" },
          lastStatus: { $last: "$status" },
        },
      },
      { $sort: { lastBookingAt: -1 } },
    ]);

    const userIds = grouped.map((g) => g._id).filter(Boolean);
    if (!userIds.length) {
      return res.status(200).json({
        status: true,
        users: [],
        total: 0,
        message: "Aucune cliente n'a encore réservé dans ce salon.",
      });
    }

    const userQuery = {
      _id: { $in: userIds },
      isDelete: { $ne: true },
    };
    if (search && search.toLowerCase() !== "all") {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      userQuery.$or = [
        { fname: rx },
        { lname: rx },
        { email: rx },
        { mobile: rx },
        { uniqueId: rx },
      ];
    }

    const users = await User.find(userQuery)
      .select("fname lname email mobile image uniqueId gender loginType isBlock analyticDate")
      .lean();

    const statsByUser = Object.fromEntries(
      grouped.map((g) => [String(g._id), g])
    );

    let merged = users
      .map((u) => {
        const stats = statsByUser[String(u._id)] || {};
        return {
          _id: u._id,
          fname: u.fname,
          lname: u.lname,
          email: u.email,
          mobile: u.mobile,
          image: u.image,
          uniqueId: u.uniqueId,
          gender: u.gender,
          loginType: u.loginType,
          isBlock: u.isBlock,
          bookingCount: stats.bookingCount || 0,
          completedCount: stats.completedCount || 0,
          lastBookingDate: stats.lastBookingDate || null,
          lastBookingAt: stats.lastBookingAt || null,
          lastStatus: stats.lastStatus || null,
          isGuest: Number(u.loginType) === 5 || String(u.loginType) === "5",
        };
      })
      .sort((a, b) => {
        const ta = a.lastBookingAt ? new Date(a.lastBookingAt).getTime() : 0;
        const tb = b.lastBookingAt ? new Date(b.lastBookingAt).getTime() : 0;
        return tb - ta;
      });

    const total = merged.length;
    merged = merged.slice(skip, skip + limit);

    return res.status(200).json({
      status: true,
      users: merged,
      total,
      message:
        total === 0
          ? "Aucune cliente ne correspond à cette recherche."
          : undefined,
    });
  } catch (error) {
    console.error("[salon.clients.getSalonClients]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /salon/clients/:userId/bookings — historique RDV de la cliente dans CE salon
 */
exports.getSalonClientBookings = async (req, res) => {
  try {
    const salon = req.salon;
    const userId = req.query.userId || req.params.userId;
    if (!salon?._id || !userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "Invalid request" });
    }

    const bookings = await Booking.find({
      salonId: salon._id,
      userId,
      isDelete: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("serviceId", "name")
      .populate("expertId", "fname lname")
      .select("bookingId date startTime time status amount serviceId expertId createdAt")
      .lean();

    return res.status(200).json({ status: true, data: bookings });
  } catch (error) {
    console.error("[salon.clients.getSalonClientBookings]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
