const express = require("express");
const route = express.Router();

const expertWithdrawRequestController = require("../../controller/admin/expertWithdrawRequest.controller");

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/withdrawRequestOfExpertByAdmin", checkAccessWithSecretKey(), expertWithdrawRequestController.withdrawRequestOfExpertByAdmin);

route.patch("/withdrawRequestApproved", checkAccessWithSecretKey(), expertWithdrawRequestController.withdrawRequestApproved);

route.patch("/withdrawRequestDecline", checkAccessWithSecretKey(), expertWithdrawRequestController.withdrawRequestDecline);

module.exports = route;
