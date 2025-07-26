//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const couponController = require("../../controller/admin/coupon.controller");

//generate new coupon
route.post("/couponGenerate", checkAccessWithSecretKey(), couponController.couponGenerate);

//handle coupon active or not
route.patch("/toggleCouponStatus", checkAccessWithSecretKey(), couponController.toggleCouponStatus);

//get all coupon
route.get("/fetchCoupons", checkAccessWithSecretKey(), couponController.fetchCoupons);

//delete coupon
route.delete("/deleteCoupon", checkAccessWithSecretKey(), couponController.deleteCoupon);

module.exports = route;
