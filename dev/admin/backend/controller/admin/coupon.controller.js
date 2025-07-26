const Coupon = require("../../models/coupon.model");

const voucher_codes = require("voucher-code-generator");

//moment
const moment = require("moment");

//generate new coupon
exports.couponGenerate = async (req, res) => {
  try {
    const { expiryDate, discountPercent, minAmountToApply, type, discountType, maxDiscount, description, title, prefix } = req.body;

    if (!expiryDate || !minAmountToApply || !type || !discountType || !description || !title || !maxDiscount || !prefix) {
      return res.status(200).json({ status: false, message: "Invalid details provided." });
    }

    if (discountType == 2 && !discountPercent) {
      return res.status(200).json({
        status: false,
        message: "Discount percent is required when discount type is percentage.",
      });
    }

    const coupon = new Coupon({
      title,
      description,
      minAmountToApply,
      discountType,
      discountPercent,
      maxDiscount,
      type,
      expiryDate: moment(expiryDate).format("YYYY-MM-DD"),
    });

    const code = voucher_codes.generate({
      length: 8,
      prefix: prefix,
    });

    coupon.code = code[0].toUpperCase();

    await coupon.save();

    return res.status(201).json({
      status: true,
      message: "Coupon generated successfully.",
      data: coupon,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal server error" });
  }
};

//handle coupon active or not
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.query;

    if (!couponId) {
      return res.status(200).json({ status: false, message: "Coupon ID is required" });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(200).json({ status: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      status: true,
      message: "Coupon status updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "An error occurred while updating coupon status" });
  }
};

//get all coupon
exports.fetchCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Coupons retrieved successfully",
      data: coupons,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "An error occurred while retrieving coupons" });
  }
};

//delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.query;

    if (!couponId) {
      return res.status(200).json({ status: false, message: "Coupon ID is required" });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(200).json({ status: false, message: "Coupon not found" });
    }

    await Coupon.deleteOne({ _id: couponId });

    return res.status(200).json({ status: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "An error occurred while deleting coupon" });
  }
};
