const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require("../../middleware/admin");
const teamScheduleController = require("../../controller/admin/teamSchedule.controller");

route.get("/get", checkAccessWithSecretKey(), admin, teamScheduleController.getTeamSchedule);

module.exports = route;
