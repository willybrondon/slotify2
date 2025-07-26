const ExpertWithdrawMethod = require("../../models/expertWithdrawMethod.model");

//mongoose
const mongoose = require("mongoose");

//import model
const Expert = require("../../models/expert.model");

//update payment method details by expert
exports.updateDetailsOfPaymentMethods = async (req, res) => {
  try {
    const { expertId, paymentMethods } = req.body;

    if (!expertId || !paymentMethods || !Array.isArray(paymentMethods)) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const expertObjId = new mongoose.Types.ObjectId(expertId);

    let expert, expertWithdrawMethod;
    [expert, expertWithdrawMethod] = await Promise.all([Expert.findOne({ _id: expertObjId, isDelete: false }), ExpertWithdrawMethod.findOne({ expert: expertObjId })]);

    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    if (expertWithdrawMethod) {
      expertWithdrawMethod.paymentMethods = paymentMethods?.map((method) => ({
        paymentGateway: method.paymentGateway,
        paymentDetails: method.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
      }));
    } else {
      expertWithdrawMethod = new ExpertWithdrawMethod({
        expert: expert._id,
        paymentMethods: paymentMethods?.map((method) => ({
          paymentGateway: method.paymentGateway,
          paymentDetails: method.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
        })),
      });
    }

    await expertWithdrawMethod.save();

    return res.status(200).json({ status: true, message: "Success", data: expertWithdrawMethod });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get payment method details of the expert
exports.getDetailsOfPaymentMethods = async (req, res) => {
  try {
    const { expertId } = req.query;

    if (!expertId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const expertObjId = new mongoose.Types.ObjectId(expertId);

    const [expert, expertWithdrawMethod] = await Promise.all([Expert.findOne({ _id: expertObjId, isDelete: false }), ExpertWithdrawMethod.findOne({ expert: expertObjId })]);

    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    return res.status(200).json({ status: true, message: "Success", data: expertWithdrawMethod });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
