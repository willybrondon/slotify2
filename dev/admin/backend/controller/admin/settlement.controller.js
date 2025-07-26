const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const SalonSettlement = require("../../models/salonSettlement.model");
const ExpertSettlement = require("../../models/expertSettlement.model");
const moment = require("moment");

exports.allSalonSettlement = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const type = parseInt(req.query.type) || "ALL";

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
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
          ...typeFilter,
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
    ];

    const [settlement, total] = await Promise.all([
      SalonSettlement.aggregate(pipeline),
      SalonSettlement.countDocuments({
        ...typeFilter,
        ...dateFilter,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      services: settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.ParticularSalonSettlement = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
    const salon = await Salon.findById(req.query.salonId);
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const type = parseInt(req.query.type) || "ALL";

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
    }

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
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
          ...typeFilter,
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
    ];

    const [settlement, total] = await Promise.all([
      SalonSettlement.aggregate(pipeline),
      SalonSettlement.countDocuments({
        salonId: salon._id,
        ...typeFilter,
        ...dateFilter,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Data found",
      total: total ? total : 0,
      services: settlement,
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
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      return res.status(200).send({ status: false, message: "expert not found" });
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

exports.salonExpertSettlement = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }
    let typeFilter;
    if (type !== "ALL") {
      typeFilter = {
        $match: { statusOfTransaction: type },
      };
    }
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
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
          ...typeFilter,
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
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const [settlement, total] = await Promise.all([ExpertSettlement.aggregate(pipeline), ExpertSettlement.countDocuments({ salonId: salon._id, ...typeFilter, ...dateFilter })]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      services: settlement,
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
    let dateFilter;
    const startDate = req.query.startDate || 0;
    const endDate = req.query.endDate || 20;
    const type = req.query.type;
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
    }
    
    const settlement = await ExpertSettlement.aggregate([
      {
        $match: {
          ...dateFilter,
          ...typeFilter,
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
        $sort: { createdAt: -1 },
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

exports.bonusPenalty = async (req, res) => {
  try {
    console.log("req.body", req.body);
    if (!req.query.settlementId || !req.body.bonus) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res.status(200).send({ status: false, message: "settlement not found" });
    }

    const salon = await Salon.findById(settlement.salonId);

    if (!salon) {
      return res.status(200).send({ status: false, message: "salon not found" });
    }

    settlement.bonus = parseInt(req.body.bonus);
    settlement.finalAmount = settlement.salonEarning + parseInt(req.body.bonus);
    settlement.note = req.body.note;
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

exports.salonPayment = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res.status(200).send({ status: false, message: "settlement not found" });
    }

    const salon = await Salon.findById(settlement.salonId);

    if (!salon) {
      return res.status(200).send({ status: false, message: "salon not found" });
    }

    settlement.statusOfTransaction = 1;

    settlement.paymentDate = moment().format("YYYY-MM-DD");
    await settlement.save();

    return res.status(200).json({
      status: true,
      message: "Salon paid Successfully",
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
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId)
      .populate({
        path: "bookingId",
        populate: {
          path: "expertId",
          select: "fname lname image _id",
        },
        populate: {
          path: "userId",
          select: "fname lname image _id",
        },
      })
      .populate({
        path: "salonId",
        select: "name",
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
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await ExpertSettlement.findById(req.query.settlementId)
      .populate({
        path: "bookingId",
        populate: {
          path: "expertId",
          select: "fname lname image _id",
        },
        populate: {
          path: "userId",
          select: "fname lname image",
        },
      })
      .populate({
        path: "salonId",
        select: "name",
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
