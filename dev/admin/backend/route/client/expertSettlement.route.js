const express = require("express");
const route = express.Router();
const settlementController = require("../../controller/user/expertSettlement.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/", checkAccessWithSecretKey(), settlementController.getExpertSettlement);

module.exports = route;
