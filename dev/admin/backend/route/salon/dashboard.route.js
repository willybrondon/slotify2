const express = require("express");
const route = express.Router();
const dashboardController = require('../../controller/salon/dashboard.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salon = require("../../middleware/salon");

route.get('/allStats',checkAccessWithSecretKey(),salon,dashboardController.allStats)
route.get('/chart',checkAccessWithSecretKey(),salon,dashboardController.chartApiForPenal)
route.get('/topExperts',checkAccessWithSecretKey(),salon,dashboardController.topExperts)

module.exports = route