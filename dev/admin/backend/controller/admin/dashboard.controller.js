require("dotenv").config();
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");

exports.allStats = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const [bookings, users, salons, experts] = await Promise.all([
      Booking.find({ status: "completed", ...dateFilter }),
      User.find({ isDelete: false }),
      Salon.find({ isActive: true }),
      Expert.find({ isBlock: false }),
    ]);

    let totalAmount = 0;
    bookings.forEach((data) => {
      totalAmount += data?.platformFee;
    });

    const totalBookings = bookings.filter((booking) => booking.bookingId !== null).length;

    let totalRevenue = 0;
    bookings.forEach((booking) => {
      totalRevenue += booking.amount;
    });

    const totalUsers = users.length;
    const totalSalons = salons.length;
    const totalExperts = experts.length;

    const data = {
      commission: totalAmount,
      bookings: totalBookings,
      revenue: totalRevenue,
      users: totalUsers,
      experts: totalExperts,
      salons: totalSalons,
    };

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.chartApiForPenal = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const appointments = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          ...dateFilter,
        },
      },

      {
        $group: {
          _id: "$date",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
          serviceIds: { $addToSet: "$serviceId" },
        },
      },
      {
        $addFields: {
          services: { $size: "$serviceIds" },
          revenue: { $toInt: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          amount: 1,
          count: 1,
          services: 1,
          revenue: { $round: ["$revenue", 2] },
          amount: 1,
          date: "$_id",
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res.status(200).send({ status: true, message: "success", appointments });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.topSalons = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const salon = await Booking.aggregate([
      {
        $match: { status: "completed", ...dateFilter },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salonId",
        },
      },
      {
        $group: {
          _id: "$salonId",
          amount: { $sum: "$amount" },
          salonCommission: { $sum: "$salonCommission" },
          platformFee: { $sum: "$platformFee" },
          bookings: { $sum: 1 },
        },
      },
      {
        $project: {
          salonId: { $arrayElemAt: ["$_id._id", 0] },
          salonName: { $arrayElemAt: ["$_id.name", 0] },
          salonImage: { $arrayElemAt: ["$_id.mainImage", 0] },
          salonCommission: 1,
          platformFee: 1,
          bookings: 1,
          amount: 1,
          _id: 0,
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    return res.status(200).json({ status: true, message: "success", topSalons: salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};
