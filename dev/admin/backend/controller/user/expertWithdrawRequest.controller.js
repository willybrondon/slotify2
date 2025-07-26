const ExpertWithdrawRequest = require("../../models/withdrawRequest.model");
const Expert = require("../../models/expert.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

//mongoose
const mongoose = require("mongoose");

const moment = require("moment");

const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

//withdraw request by expert
exports.withdrawRequestByExpert = async (req, res) => {
  try {
    const { expertId, amount, paymentGateway, paymentDetails } = req.body;

    if (!expertId || !amount || !paymentGateway || !paymentDetails) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const requestedAmount = Number(amount);
    const expertObjId = new mongoose.Types.ObjectId(expertId);

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (requestedAmount < settingJSON.minWithdrawalRequestedAmount) {
      return res.status(200).json({ status: false, message: "Oops ! withdrawal requested amount must be greater than specified by the admin." });
    }

    const [uniqueId, expert, existingRequest] = await Promise.all([
      generateUniqueIdentifier(),
      Expert.findOne({ _id: expertObjId, isDelete: false }),
      ExpertWithdrawRequest.findOne({ expert: expertObjId, type: 2, status: 1 }),
    ]);

    if (!expert) {
      return res.status(200).json({ status: false, message: "expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    if (requestedAmount > expert.earning) {
      return res.status(200).json({ status: false, message: "Insufficient funds for withdrawal." });
    }

    if (existingRequest) {
      return res.status(200).json({
        status: false,
        message: "An existing withdrawal request is still being processed. Please wait until it's completed.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Withdrawal request has been successfully submitted to the administrator.",
    });

    const request = new ExpertWithdrawRequest();

    request.expert = expert._id;
    request.amount = requestedAmount;
    request.type = 2;
    request.status = 1;
    request.paymentGateway = paymentGateway;
    request.paymentDetails = paymentDetails.map((detail) => detail.replace("[", "").replace("]", ""));

    await Promise.all([
      request.save(),
      SalonExpertWalletHistory.create({
        uniqueId: uniqueId,
        amount: request.amount,
        expert: expert._id,
        payoutStatus: 1,
        type: 2,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm a"),
      }),
      //ExpertWithdrawRequest.findOneAndDelete({ expert: expert._id, status: 3 }),
    ]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//retrive withdraw requests by expert
exports.fetchExpertWithdrawalRequests = async (req, res) => {
  try {
    const { expertId } = req.query;

    if (!expertId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const expertObjId = new mongoose.Types.ObjectId(expertId);

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

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

    const [expert, expertRequests] = await Promise.all([
      Expert.findOne({ _id: expertObjId, isDelete: false }),
      ExpertWithdrawRequest.aggregate([
        {
          $match: { ...dateFilterQuery, status: 2, expert: expertObjId },
        },
        {
          $lookup: {
            from: "experts",
            localField: "expert",
            foreignField: "_id",
            as: "expert",
          },
        },
        {
          $unwind: {
            path: "$expert",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            expertfname: "$expert.fname",
            expertlname: "$expert.lname",
            status: 1,
            amount: 1,
            paymentGateway: 1,
            paymentDetails: 1,
            reason: 1,
            date: 1,
            paymentDate: 1,
          },
        },
        { $sort: { paymentDate: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!expert) {
      return res.status(200).json({ status: false, message: "expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    return res.status(200).json({ status: true, message: "Success", data: expertRequests });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
