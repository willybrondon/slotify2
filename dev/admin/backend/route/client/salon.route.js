const express = require("express");
const route = express.Router();
const salonController = require("../../controller/user/salon.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/getAll", checkAccessWithSecretKey(), salonController.getAll);
route.get("/serviceBaseSalon", checkAccessWithSecretKey(), salonController.serviceBaseSalon);
route.get("/salonData", checkAccessWithSecretKey(), salonController.salonData);
route.get("/getShareUrl", checkAccessWithSecretKey(), salonController.getSalonShareUrl);

module.exports = route;
