const Expert = require("../../models/expert.model");
const ExpertWithdrawRequest = require("../../models/withdrawRequest.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

const moment = require("moment");

const admin = require("../../firebase");

//retrive expert's withdraw request
exports.withdrawRequestOfExpertByAdmin = async (req, res) => {
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

    const [total, request] = await Promise.all([
      ExpertWithdrawRequest.countDocuments({
        expert: { $ne: null },
        type: 2,
        ...dateFilterQuery,
        ...statusQuery,
      }),

      ExpertWithdrawRequest.find({
        expert: { $ne: null },
        type: 2,
        ...dateFilterQuery,
        ...statusQuery,
      })
        .populate("expert", "fname lname image")
        .skip(start * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Withdrawal request fetch successfully!",
      total: total,
      request: request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//expert's withdraw request accept and paid
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
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    const expert = await Expert.findOne({ _id: request.expert });
    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "Your account is currently blocked. Please contact the administrator for further assistance." });
    }

    if (expert.earning <= 0 || expert.earning < request.amount) {
      return res.status(200).json({
        status: false,
        message: "Insufficient balance in expert's wallet for the requested withdrawal amount.",
      });
    }

    request.status = 2;
    request.paymentDate = moment().format("YYYY-MM-DD");

    res.status(200).json({
      status: true,
      message: "Withdrawal request approved and payment successfully processed.",
      data: request,
    });

    await Promise.all([
      request.save(),
      Expert.updateOne({ _id: expert._id, earning: { $gt: 0 } }, { $inc: { earning: -request.amount } }),
      SalonExpertWalletHistory.findOneAndUpdate(
        { expert: expert._id, type: 2, payoutStatus: 1 },
        {
          $set: {
            payoutStatus: 2,
            date: moment().format("YYYY-MM-DD"),
            time: moment().format("HH:mm a"),
          },
        },
        {
          upsert: true,
          new: true,
        }
      ),
    ]);

    if (expert.fcmToken && !expert.isBlock && expert.fcmToken !== null) {
      const adminInstance = await admin;

      const notificationPayload = {
        token: expert.fcmToken,
        notification: {
          title: "💸 Withdrawal Request Approved 💸",
          body: `Your withdrawal request of ${request?.amount} has been approved and processed successfully on ${moment(request.paymentDate).format("YYYY-MM-DD")}.`,
        },
        data: {
          type: "WITHDRAWAL_APPROVED",
        },
      };

      adminInstance
        .messaging()
        .send(notificationPayload)
        .then((response) => {
          console.log("Notification sent to expert successfully:", response);
        })
        .catch((error) => {
          console.error("Error sending notification to expert:", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status({ status: false, message: error.message || "Internal Server Error" });
  }
};

//expert's withdraw request declined
exports.withdrawRequestDecline = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.reason) {
      return res.status(200).json({ status: false, message: "Invalid request. Please provide a valid withdrawal request ID and reason for decline." });
    }

    const reason = req.query.reason.trim();
    const request = await ExpertWithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    const expert = await Expert.findOne({ _id: request.expert });
    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "Your account is currently blocked. Please contact the administrator for further assistance." });
    }

    request.status = 3;
    request.reason = reason;
    request.paymentDate = moment().format("YYYY-MM-DD"); //decline date
    await request.save();

    res.status(200).json({
      status: true,
      message: "Withdrawal request has been declined by the admin.",
      data: request,
    });

    await Promise.all([
      SalonExpertWalletHistory.findOneAndDelete({ salon: null, expert: expert._id, type: 2, payoutStatus: 1 }),
      //ExpertWithdrawRequest.findOneAndDelete({ salon: null, expert: expert._id, type: 2, status: 1 }),
    ]);

    // await SalonExpertWalletHistory.findOneAndUpdate(
    //   { salon: null, expert: expert._id, type: 2, payoutStatus: 1 },
    //   {
    //     $set: {
    //       payoutStatus: 3,
    //       date: moment().format("YYYY-MM-DD"),
    //       time: moment().format("HH:mm a"),
    //     },
    //   },
    //   {
    //     upsert: true,
    //     new: true,
    //   }
    // );

    if (expert.fcmToken && !expert.isBlock && expert.fcmToken !== null) {
      const adminInstance = await admin;

      const notificationPayload = {
        token: expert.fcmToken,
        notification: {
          title: "🚫 Withdrawal Request Declined 🚫",
          body: `Your withdrawal request of ${request?.amount} has been declined. Please contact support for further details.`,
        },
        data: {
          type: "WITHDRAWAL_DECLINED",
        },
      };

      adminInstance
        .messaging()
        .send(notificationPayload)
        .then((response) => {
          console.log("Notification sent to expert successfully:", response);
        })
        .catch((error) => {
          console.error("Error sending notification to expert:", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status({ status: false, message: error.message || "Internal Server Error" });
  }
};
