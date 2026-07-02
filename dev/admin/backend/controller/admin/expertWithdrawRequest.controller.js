const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const ExpertWithdrawRequest = require("../../models/withdrawRequest.model");

async function getSalonExpertIds(salonId) {
  return Expert.find({ salonId, isDelete: false }).distinct("_id");
}

function resolveSalonId(req) {
  return req.query.salonId || req.body?.salonId;
}

exports.withdrawRequestOfExpertByAdmin = async (req, res) => {
  try {
    const salonId = resolveSalonId(req);
    if (!req.query.status) {
      return res.status(200).json({ status: false, message: "status requis." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    let statusQuery = {};
    if (req.query.status !== "All") {
      statusQuery.status = parseInt(req.query.status);
    }

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const formateStartDate = new Date(startDate);
      const formateEndDate = new Date(endDate);
      formateEndDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        createdAt: { $gte: formateStartDate, $lte: formateEndDate },
      };
    }

    let baseQuery = {
      type: 2,
      ...dateFilterQuery,
      ...statusQuery,
    };

    if (salonId) {
      const salon = await Salon.findById(salonId);
      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon introuvable." });
      }
      const expertIds = await getSalonExpertIds(salonId);
      if (!expertIds.length) {
        return res.status(200).json({
          status: true,
          message: "Withdrawal request fetch successfully!",
          total: 0,
          request: [],
        });
      }
      baseQuery.expert = { $in: expertIds };
    }

    const [total, request] = await Promise.all([
      ExpertWithdrawRequest.countDocuments(baseQuery),
      ExpertWithdrawRequest.find(baseQuery)
        .populate("expert", "fname lname image salonId")
        .populate("salon", "name")
        .skip(start * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Withdrawal request fetch successfully!",
      total,
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.withdrawRequestApproved = async (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Seul le salon peut valider les demandes de retrait des pros.",
  });
};

exports.withdrawRequestDecline = async (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Seul le salon peut refuser les demandes de retrait des pros.",
  });
};
