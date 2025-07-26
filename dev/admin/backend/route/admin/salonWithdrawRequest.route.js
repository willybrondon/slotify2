const express = require("express");
const route = express.Router();

const salonWithdrawRequestController = require("../../controller/admin/salonWithdrawRequest.controller");

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/retriveSalonWithdRequest", checkAccessWithSecretKey(), salonWithdrawRequestController.retriveSalonWithdRequest);

route.patch("/withdrawRequestApproved", checkAccessWithSecretKey(), salonWithdrawRequestController.withdrawRequestApproved);

route.patch("/withdrawRequestRejected", checkAccessWithSecretKey(), salonWithdrawRequestController.withdrawRequestRejected);

module.exports = route;
