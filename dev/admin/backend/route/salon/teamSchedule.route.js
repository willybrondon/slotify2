const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const teamScheduleController = require("../../controller/salon/teamSchedule.controller");

route.get("/get", checkAccessWithSecretKey(), salon, teamScheduleController.getTeamSchedule);

module.exports = route;
