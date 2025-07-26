const Coupon = require("../../models/coupon.model");

//import model
const User = require("../../models/user.model");

//mongoose
const mongoose = require("mongoose");

//moment
const moment = require("moment");

//retrive all validate coupons 
exports.retriveCoupons = async (req, res) => {
  try {
    const { userId } = req.query;
    const type = parseInt(req.query.type);
    const amount = parseInt(req.query.amount);

    if (!userId || !amount || !type) {
      return res.status(200).json({ status: false, message: "Request is missing required details." });
    }

    const customerObjId = new mongoose.Types.ObjectId(userId);
    const todayDate = moment().format("YYYY-MM-DD");

    const [customer, coupons] = await Promise.all([
      User.findOne({ _id: customerObjId }),
      Coupon.find({
        type: type,
        isActive: true,
        minAmountToApply: { $lte: amount }, //greater than or equal to ($lte)
        expiryDate: { $gte: todayDate },
      }),
    ]);

    if (!customer) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (customer.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const alreadyUsed = coupons.some((coupon) => coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === customerObjId.toString() && entry.usageType === type));

    if (alreadyUsed) {
      return res.status(200).json({
        status: true,
        message: "Coupon has already been used by this customer for the specified type.",
        data: [],
      });
    }

    const updatedCoupons = coupons.map((coupon) => ({
      ...coupon.toObject(),
      expiryDate: moment(coupon.expiryDate).format("DD-MM-YYYY"),
    }));

    return res.status(200).json({ status: true, message: "Success", data: updatedCoupons });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//retrive validate coupon after apply (get discount amount)
exports.retriveValidateCoupon = async (req, res) => {
  try {
    const { userId, couponId } = req.query;
    const type = parseInt(req.query.type);
    const amount = parseInt(req.query.amount);

    if (!userId || !couponId || !amount || !type) {
      return res.status(200).json({ status: false, message: "Request is missing required details." });
    }

    let discountAmount = 0;
    const customerObjId = new mongoose.Types.ObjectId(userId);
    const todayDate = moment().format("YYYY-MM-DD");

    const [customer, coupon] = await Promise.all([
      User.findOne({ _id: customerObjId }),
      Coupon.findOne({
        code: couponId?.trim(),
        type: type,
        isActive: true,
        minAmountToApply: { $lte: amount },
        expiryDate: { $gte: todayDate },
      }),
    ]);

    if (!customer) {
      return res.status(200).json({ status: false, message: "Customer does not found." });
    }

    if (customer.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!coupon) {
      return res.status(200).json({
        status: false,
        message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
      });
    }

    const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === customerObjId.toString() && entry.usageType === type);

    if (alreadyUsed) {
      return res.status(200).json({
        status: false,
        message: "Coupon has already been used by this customer for the specified type.",
      });
    }

    if (coupon.discountType == 1) {
      discountAmount = coupon.maxDiscount;
    } else if (coupon.discountType == 2) {
      const discount = (amount * coupon.discountPercent) / 100;
      console.log("discount", discount);

      const formatedDiscount = parseFloat(discount.toFixed(2));
      console.log("formatedDiscount", formatedDiscount);

      discountAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
    }

    return res.status(200).json({ status: true, message: "Coupon validation successful.", data: discountAmount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
