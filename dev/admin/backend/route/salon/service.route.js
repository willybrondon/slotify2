const express = require("express");
const route = express.Router();
const serviceController = require("../../controller/salon/service.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require('../../middleware/salon')

route.get("/getAll", checkAccessWithSecretKey(), serviceController.getAll);
route.get("/salonServices", checkAccessWithSecretKey(), salon,serviceController.getSalonBasedServiceForExpert);
route.get("/getNotAddedServices", checkAccessWithSecretKey(), salon,serviceController.getNotAddedServices);



module.exports = route;
