const WithdrawRequest = require("../../models/withdrawRequest.model");
const Salon = require("../../models/salon.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

const moment = require("moment");

const admin = require("../../firebase");

//retrive withdraw requests
exports.retriveSalonWithdRequest = async (req, res) => {
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
      WithdrawRequest.countDocuments({
        ...dateFilterQuery,
        ...statusQuery,
        salon: { $ne: null },
        type: 1,
      }),

      WithdrawRequest.find({
        ...dateFilterQuery,
        ...statusQuery,
        salon: { $ne: null },
        type: 1,
      })
        .populate("salon", "name uniqueId mainImage")
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

//accept withdraw request
exports.withdrawRequestApproved = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const request = await WithdrawRequest.findById(req.query.requestId);

    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    const salon = await Salon.findOne({ _id: request.salon, isDelete: false });
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not found." });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "Your account is not active." });
    }

    if (salon.earning <= 0 || salon.earning < request.amount) {
      return res.status(200).json({
        status: false,
        message: "Insufficient balance in salon's wallet for the requested withdrawal amount.",
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
      Salon.updateOne({ _id: salon._id, earning: { $gt: 0 } }, { $inc: { earning: -request.amount } }),
      SalonExpertWalletHistory.findOneAndUpdate(
        { expert: null, salon: salon._id, type: 2, payoutStatus: 1 },
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

    if (salon.fcmToken && salon.fcmToken !== null) {
      const adminInstance = await admin;

      const notificationPayload = {
        token: salon.fcmToken,
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
          console.log("Notification sent to salon successfully:", response);
        })
        .catch((error) => {
          console.error("Error sending notification to salon:", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status({ status: false, message: error.message || "Internal Server Error" });
  }
};

//decline withdraw request
exports.withdrawRequestRejected = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.reason) {
      return res.status(200).json({ status: false, message: "Invalid request. Please provide a valid withdrawal request ID and reason for decline." });
    }

    const reason = req.query.reason.trim();
    const request = await WithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    const salon = await Salon.findOne({ _id: request.salon, isDelete: false });
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not found." });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "Your account is not active." });
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
      SalonExpertWalletHistory.findOneAndDelete({ expert: null, salon: salon._id, type: 2, payoutStatus: 1 }),
      //WithdrawRequest.findOneAndDelete({ expert: null, salon: salon._id, type: 2, status: 1 }),
    ]);

    // await SalonExpertWalletHistory.findOneAndUpdate(
    //   { expert: null, salon: salon._id, type: 2, payoutStatus: 1 },
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

    if (salon.fcmToken && salon.fcmToken !== null) {
      const adminInstance = await admin;

      const notificationPayload = {
        token: salon.fcmToken,
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
          console.log("Notification sent to salon successfully:", response);
        })
        .catch((error) => {
          console.error("Error sending notification to salon:", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status({ status: false, message: error.message || "Internal Server Error" });
  }
};
