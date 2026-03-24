const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const guestBookingController = require("../../controller/user/guestBooking.controller");

route.post("/sendOtp", checkAccessWithSecretKey(), guestBookingController.sendOtp);
route.post("/verify", checkAccessWithSecretKey(), guestBookingController.verifyOtp);

module.exports = route;
