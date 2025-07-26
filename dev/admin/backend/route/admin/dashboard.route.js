const express = require("express");
const route = express.Router();
const dashboardController = require("../../controller/admin/dashboard.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require("../../middleware/admin");

route.get("/allStats", checkAccessWithSecretKey(), admin, dashboardController.allStats);
route.get("/chart", checkAccessWithSecretKey(), admin, dashboardController.chartApiForPenal);
route.get("/topSalons", checkAccessWithSecretKey(), admin, dashboardController.topSalons);

module.exports = route;
