const WithdrawRequest = require("../../models/withdrawRequest.model");
const Salon = require("../../models/salon.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

//mongoose
const mongoose = require("mongoose");

const moment = require("moment");

const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

//create salon withdraw request
exports.withdrawRequestBySalon = async (req, res) => {
  try {
    const { salonId, amount, paymentGateway, paymentDetails } = req.body;

    console.log("paymentDetails", paymentDetails);

    if (!salonId || !amount || !paymentGateway || !paymentDetails) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!" });
    }

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (amount < settingJSON.minWithdrawalRequestedAmount) {
      return res.status(200).json({ status: false, message: "Oops ! withdrawal requested amount must be greater than specified by the admin." });
    }

    const [uniqueId, salon, existingRequest] = await Promise.all([
      generateUniqueIdentifier(),
      Salon.findOne({ _id: salonId, isDelete: false }),
      WithdrawRequest.findOne({ salon: salonId, status: 1 }),
    ]);

    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    if (amount > salon.earning) {
      return res.status(200).json({ status: false, message: "Insufficient funds for withdrawal." });
    }

    if (existingRequest) {
      return res.status(200).json({
        status: false,
        message: "An existing withdrawal request is still being processed. Please wait until it's completed.",
      });
    }

    const request = new WithdrawRequest();
    request.salon = salon._id;
    request.amount = parseInt(amount);
    request.type = 1;
    request.status = 1;
    request.paymentGateway = paymentGateway;
    request.paymentDetails = paymentDetails.map((detail) => detail.replace("[", "").replace("]", ""));
    await request.save();

    const newRequest = await WithdrawRequest.findById(request._id).populate("salon", "name mainImage _id");

    res.status(200).json({
      status: true,
      message: "Withdrawal request has been successfully submitted to the administrator.",
      data: newRequest,
    });

    await Promise.all([
      SalonExpertWalletHistory.create({
        uniqueId: uniqueId,
        amount: request.amount,
        salon: salon._id,
        payoutStatus: 1,
        type: 2,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm a"),
      }),
      //WithdrawRequest.findOneAndDelete({ salon: salon._id, status: 3 }),
    ]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error!!" });
  }
};

//get particular salon wise withdraw requests
exports.fetchSalonWithdrawRequests = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 20;

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    const status = req.query.status;

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        payDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    let statusQuery = {};
    if (status !== "All") {
      statusQuery.status = parseInt(status);
    }

    const salonObjId = new mongoose.Types.ObjectId(req.salon._id);

    const [salon, total, request] = await Promise.all([
      Salon.findOne({ _id: salonObjId, isDelete: false }),
      WithdrawRequest.countDocuments({
        type: 1,
        salon: salon._id,
        ...statusQuery,
        ...dateFilter,
      }),
      WithdrawRequest.aggregate([
        {
          $match: {
            type: 1,
            salon: salon._id,
            ...statusQuery,
            ...dateFilter,
          },
        },
        { $sort: { payDate: -1 } },
        { $skip: start * limit },
        { $limit: limit },
      ]),
    ]);

    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not exist" });
    }

    if (!salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon is not active." });
    }

    return res.status(200).send({ status: true, message: "Success", total: total, data: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error!!" });
  }
};
