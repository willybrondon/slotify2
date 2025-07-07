require("dotenv").config();
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");

exports.allStats = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }
    let dateFilter = {};

    const startDate = req?.query?.startDate || "ALL";
      const endDate = req?.query?.endDate || "ALL";

    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const [bookings, experts] = await Promise.all([
      Booking.find({ status: "completed", ...dateFilter, salonId: salon._id }),
      Expert.find({ isBlock: false, salonId: salon._id }),
    ]);

    let totalAmount = 0;
    bookings.forEach((data) => {
      totalAmount += data?.platformFee;
    });

    const totalBookings = bookings.filter(
      (booking) => booking.bookingId !== null
    ).length;

    let totalRevenue = 0;
    bookings.forEach((booking) => {
      totalRevenue += booking.amount;
    });

    const totalExperts = experts.length;

    const data = {
      commission: totalAmount,
      bookings: totalBookings,
      revenue: totalRevenue,
      experts: totalExperts,
    };

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

exports.chartApiForPenal = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }
    let dateFilter = {};


    const startDate = req?.query?.startDate || "ALL";
    const endDate = req?.query?.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const data = await Booking.aggregate([
      {
        $match: {
          salonId: salon._id,
          status: "completed",
          ...dateFilter,
        },
      },

      {
        $group: {
          _id: "$date",
          amount: { $sum: "$salonEarning" },
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

    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};

exports.topExperts = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }
    let dateFilter = {};

    const startDate = req?.query?.startDate || "ALL";
    const endDate = req?.query?.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const expert = await Booking.aggregate([
      {
        $match: { status: "completed", ...dateFilter, salonId: salon._id },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          as: "expert",
        },
      },
      {
        $group: {
          _id: "$expert",
          salonCommission: { $sum: "$salonCommission" },
          expertEarning: { $sum: "$expertEarning" },
          bookings: { $sum: 1 },
        },
      },
      {
        $project: {
          expertId: { $arrayElemAt: ["$_id._id", 0] },
          expertFname: { $arrayElemAt: ["$_id.fname", 0] },
          expertLname: { $arrayElemAt: ["$_id.lname", 0] },
          expertImage: { $arrayElemAt: ["$_id.image", 0] },
          salonCommission: 1,
          expertEarning: 1,
          bookings: 1,
          _id: 0,
        },
      },
      {
        $sort: { expertEarning: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    return res
      .status(200)
      .json({ status: true, message: "success", topExperts: expert });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
