//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const withdrawMethodController = require("../../controller/user/withdrawMethod.controller");

//get Withdraw method for expert
route.get("/getWithdrawMethodsByExpert", checkAccessWithSecretKey(), withdrawMethodController.getWithdrawMethodsByExpert);

module.exports = route;
