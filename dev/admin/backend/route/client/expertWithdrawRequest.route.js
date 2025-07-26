const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const expertWithdrawRequestController = require("../../controller/user/expertWithdrawRequest.controller");

//withdraw request by provider
route.post("/withdrawRequestByExpert", checkAccessWithSecretKey(), expertWithdrawRequestController.withdrawRequestByExpert);

//retrive withdraw requests by provider
route.get("/fetchExpertWithdrawalRequests", checkAccessWithSecretKey(), expertWithdrawRequestController.fetchExpertWithdrawalRequests);

module.exports = route;
