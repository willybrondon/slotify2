const express = require("express");
const route = express.Router();
const serviceController = require("../../controller/user/service.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/getAll", checkAccessWithSecretKey(), serviceController.getAll);
route.get("/serviceBasedCategory", checkAccessWithSecretKey(), serviceController.serviceBasedCategory);

module.exports = route;
