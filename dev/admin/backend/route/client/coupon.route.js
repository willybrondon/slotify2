//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const CouponController = require("../../controller/user/coupon.controller");

//retrive all validate coupons by the customer
route.get("/retriveCoupons", checkAccessWithSecretKey(), CouponController.retriveCoupons);

//retrive validate coupon after apply by the customer
route.get("/retriveValidateCoupon", checkAccessWithSecretKey(), CouponController.retriveValidateCoupon);

module.exports = route;
