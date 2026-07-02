const Expert = require("../../models/expert.model");
const ExpertWithdrawRequest = require("../../models/withdrawRequest.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const moment = require("moment");
const admin = require("../../firebase");

async function getSalonExpertIds(salonId) {
  return Expert.find({ salonId, isDelete: false }).distinct("_id");
}

exports.withdrawRequestOfExpertBySalon = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
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
        createdAt: {
          $gte: formateStartDate,
          $lte: formateEndDate,
        },
      };
    }

    const expertIds = await getSalonExpertIds(req.salon._id);
    if (!expertIds.length) {
      return res.status(200).json({
        status: true,
        message: "Withdrawal request fetch successfully!",
        total: 0,
        request: [],
      });
    }

    const baseQuery = {
      expert: { $in: expertIds },
      type: 2,
      ...dateFilterQuery,
      ...statusQuery,
    };

    const [total, request] = await Promise.all([
      ExpertWithdrawRequest.countDocuments(baseQuery),
      ExpertWithdrawRequest.find(baseQuery)
        .populate("expert", "fname lname image salonId")
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
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const request = await ExpertWithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined." });
    }

    const expert = await Expert.findOne({ _id: request.expert, salonId: req.salon._id, isDelete: false });
    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found for this salon." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "Expert account is blocked." });
    }

    if (expert.earning <= 0 || expert.earning < request.amount) {
      return res.status(200).json({
        status: false,
        message: "Insufficient balance in expert's wallet for the requested withdrawal amount.",
      });
    }

    request.status = 2;
    request.paymentDate = moment().format("YYYY-MM-DD");
    request.salon = req.salon._id;

    res.status(200).json({
      status: true,
      message: "Withdrawal request approved. Mark as paid after completing the bank transfer.",
      data: request,
    });

    await Promise.all([
      request.save(),
      Expert.updateOne({ _id: expert._id, earning: { $gte: request.amount } }, { $inc: { earning: -request.amount } }),
      SalonExpertWalletHistory.findOneAndUpdate(
        { expert: expert._id, type: 2, payoutStatus: 1 },
        {
          $set: {
            salon: req.salon._id,
            payoutStatus: 2,
            date: moment().format("YYYY-MM-DD"),
            time: moment().format("HH:mm a"),
          },
        },
        { upsert: false, new: true }
      ),
    ]);

    if (expert.fcmToken && !expert.isBlock) {
      const adminInstance = await admin;
      adminInstance
        .messaging()
        .send({
          token: expert.fcmToken,
          notification: {
            title: "💸 Retrait validé par votre salon",
            body: `Votre demande de retrait de ${request?.amount} a été validée le ${moment(request.paymentDate).format("YYYY-MM-DD")}.`,
          },
          data: { type: "WITHDRAWAL_APPROVED" },
        })
        .catch((error) => console.error("Error sending notification to expert:", error));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.withdrawRequestDecline = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.reason) {
      return res.status(200).json({
        status: false,
        message: "Invalid request. Please provide a valid withdrawal request ID and reason for decline.",
      });
    }

    const reason = req.query.reason.trim();
    const request = await ExpertWithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined." });
    }

    const expert = await Expert.findOne({ _id: request.expert, salonId: req.salon._id, isDelete: false });
    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found for this salon." });
    }

    request.status = 3;
    request.reason = reason;
    request.paymentDate = moment().format("YYYY-MM-DD");
    request.salon = req.salon._id;
    await request.save();

    res.status(200).json({
      status: true,
      message: "Withdrawal request has been declined.",
      data: request,
    });

    await SalonExpertWalletHistory.findOneAndDelete({
      expert: expert._id,
      type: 2,
      payoutStatus: 1,
    });

    if (expert.fcmToken && !expert.isBlock) {
      const adminInstance = await admin;
      adminInstance
        .messaging()
        .send({
          token: expert.fcmToken,
          notification: {
            title: "🚫 Demande de retrait refusée",
            body: `Votre demande de retrait de ${request?.amount} a été refusée par votre salon.`,
          },
          data: { type: "WITHDRAWAL_DECLINED" },
        })
        .catch((error) => console.error("Error sending notification to expert:", error));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
