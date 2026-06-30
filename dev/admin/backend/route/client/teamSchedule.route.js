const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const teamScheduleController = require("../../controller/user/teamSchedule.controller");

route.get("/expertDay", checkAccessWithSecretKey(), teamScheduleController.getExpertDaySchedule);
route.get("/salonTeam", checkAccessWithSecretKey(), teamScheduleController.getSalonTeamSchedule);

module.exports = route;
