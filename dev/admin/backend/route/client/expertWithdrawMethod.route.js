const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const expertWithdrawMethodController = require("../../controller/user/expertWithdrawMethod.controller");

//update payment method details by expert
route.post("/updateDetailsOfPaymentMethods", checkAccessWithSecretKey(), expertWithdrawMethodController.updateDetailsOfPaymentMethods);

//get payment method details of the expert
route.get("/getDetailsOfPaymentMethods", checkAccessWithSecretKey(), expertWithdrawMethodController.getDetailsOfPaymentMethods);

module.exports = route;
