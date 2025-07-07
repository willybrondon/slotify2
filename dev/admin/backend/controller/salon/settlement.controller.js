const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const SalonSettlement = require("../../models/salonSettlement.model");
const ExpertSettlement = require("../../models/expertSettlement.model");
const moment = require("moment");
const admin = require('../../firebase')

exports.settlementForSalon = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }

    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: {
          salonId: salon._id,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                mainImage: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      { $skip: skipAmount },
      { $limit: limit },
    ]
    const [settlement,total] = await Promise.all([
      SalonSettlement.aggregate(pipeline),
      SalonSettlement.countDocuments({
        salonId: salon._id,
        ...dateFilter,
      })
    ])

    return res.status(200).json({
      status: true,
      message: "Settlement found",
      total: total ? total : 0,
      data: settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertSettlement = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }
    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const settlement = await ExpertSettlement.aggregate([
      {
        $match: {
          salonId: salon._id,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                _id: 1,
                image: 1,
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Settlement found",
      total: settlement.length,
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.expertPayment = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await ExpertSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res
        .status(200)
        .send({ status: false, message: "settlement not found" });
    }

    const expert = await Expert.findById(settlement.expertId);

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "expert not found" });
    }

    settlement.statusOfTransaction = 1;
    settlement.paymentDate = moment().format("YYYY-MM-DD");
    payload = {
      token: expert.fcmToken,
      notification: {
        body: `Your received payment. check it in app`,
        title: "Payment alert 💲",
      },
    };

    await settlement.save();
    const adminPromise = await admin
    if(expert && expert.fcmToken !== null){
      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }

    return res.status(200).json({
      status: true,
      message: "Expert paid Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.bonusPenalty = async (req, res) => {
  try {
    if (!req.query.settlementId || !req.body.bonus) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await ExpertSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res
        .status(200)
        .send({ status: false, message: "settlement not found" });
    }

    const expert = await Expert.findById(settlement.expertId);

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "expert not found" });
    }
    settlement.bonus = parseInt(req.body.bonus);
    settlement.finalAmount =
      settlement.expertEarning + parseInt(req.body.bonus);

    if (settlement.finalAmount < settlement.expertEarning) {
      return res.status(200).json({
        status: false,
        message: "You Can not give penalty more than amount paid",
      });
    }
    await settlement.save();

    return res.status(200).json({
      status: true,
      message: "Bonus/Penalty updated Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getParticularExpertSettlement = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "expert not found" });
    }
    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const settlement = await ExpertSettlement.aggregate([
      {
        $match: {
          expertId: expert._id,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                _id: 1,
                image: 1,
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: settlement.length,
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.salonSettlementInfo = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(
      req.query.settlementId
    ).populate({
      path: "bookingId",
      populate: {
        path: "expertId",
        select: "fname lname image",
      },
    });
    return res.status(200).json({
      status: true,
      message: "data fetch Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.expertSettlementInfo = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await ExpertSettlement.findById(req.query.settlementId)
      .populate({
        path: "bookingId",
        populate: {
          path: "expertId",
          select: "fname lname image",
        },
        populate: {
          path: "userId",
          select: "fname lname image",
        },
      })
      .populate({
        path: "salonId",
        select: "name",
      })
      
    return res.status(200).json({
      status: true,
      message: "data fetch Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
