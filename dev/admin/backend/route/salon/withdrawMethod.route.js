//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const withdrawMethodController = require("../../controller/salon/withdrawMethod.controller");

//get Withdraw method for expert
route.get("/getWithdrawMethodsBySalon", checkAccessWithSecretKey(), withdrawMethodController.getWithdrawMethodsBySalon);

module.exports = route;
