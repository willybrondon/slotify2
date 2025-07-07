//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");


//Controller
const forgetPassword = require("../../controller/user/forgetPassword.controller");

//create OTP and send the email for password security
route.post("/create", checkAccessWithSecretKey(), forgetPassword.store);

//create otp when user login
route.post("/otplogin", checkAccessWithSecretKey(), forgetPassword.otplogin);

//verify the OTP
route.post("/verify", checkAccessWithSecretKey(), forgetPassword.verify);

module.exports = route;
