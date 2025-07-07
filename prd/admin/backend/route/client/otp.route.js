//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//Controller
const OTPController = require("../../controller/user/otp.controller");

//create OTP and send the email for password security
route.post("/create", checkAccessWithSecretKey(), OTPController.store);

//create otp when user login with email-password
route.post("/otplogin", checkAccessWithSecretKey(), OTPController.otplogin);

//verify the OTP
route.post("/verify", checkAccessWithSecretKey(), OTPController.verify);

module.exports = route;
