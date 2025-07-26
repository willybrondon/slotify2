//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
route.use(checkAccessWithSecretKey());

//controller
const WithdrawRequestController = require("../../controller/salon/withdrawRequest.controller");

//create salon withdraw request
route.post("/withdrawRequestBySalon", WithdrawRequestController.withdrawRequestBySalon);

//get particular salon wise withdraw requests
route.get("/fetchSalonWithdrawRequests", WithdrawRequestController.fetchSalonWithdrawRequests);

module.exports = route;
