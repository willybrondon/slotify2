const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const expertWithdrawRequestController = require("../../controller/salon/expertWithdrawRequest.controller");

route.use(checkAccessWithSecretKey());
route.use(salon);

route.get(
  "/withdrawRequestOfExpertBySalon",
  expertWithdrawRequestController.withdrawRequestOfExpertBySalon
);
route.patch("/withdrawRequestApproved", expertWithdrawRequestController.withdrawRequestApproved);
route.patch("/withdrawRequestDecline", expertWithdrawRequestController.withdrawRequestDecline);

module.exports = route;
