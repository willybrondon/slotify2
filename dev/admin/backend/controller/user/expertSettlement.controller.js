const Expert = require("../../models/expert.model");
const Booking = require("../../models/booking.model");
const Service = require("../../models/service.model");
const ExpertSettlement = require("../../models/expertSettlement.model");



exports.getExpertSettlement = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(200).send({ status: false, message: "Oops! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    let dateFilter = {};
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate !== "ALL" && endDate !== "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const settlements = await ExpertSettlement.find({
      expertId: expert._id,
      ...dateFilter,
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "bookingId",
        populate: [
          {
            path: "userId",
            model: "User",
            select: "fname lname",
          },
          {
            path: "serviceId",
            model: "Service",
            select: "name",
          },
        ],
        select: "userId serviceId date status expertEarning startTime",
      });

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: settlements.length,
      settlements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
