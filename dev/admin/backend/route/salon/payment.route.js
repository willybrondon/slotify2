const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const Booking = require("../../models/booking.model");

/**
 * Soft stub — older panel charts called salon/payment/yearWisePayment.
 * Prefer settlement endpoints going forward.
 */
route.get("/yearWisePayment", checkAccessWithSecretKey(), salon, async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
    const salonId = req.salon._id;

    const bookings = await Booking.aggregate([
      {
        $match: {
          salonId,
          status: "completed",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: { $ifNull: ["$amount", 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => {
      const row = bookings.find((b) => b._id === i + 1);
      return {
        month: i + 1,
        amount: row?.amount || 0,
        count: row?.count || 0,
      };
    });

    return res.status(200).json({
      status: true,
      year,
      data: months,
      payment: months,
    });
  } catch (error) {
    console.warn("[yearWisePayment] soft-fail", error.message);
    return res.status(200).json({
      status: true,
      year: parseInt(req.query.year, 10) || new Date().getFullYear(),
      data: [],
      payment: [],
      message: "Payment history unavailable",
    });
  }
});

module.exports = route;
