const express = require("express");
const route = express.Router();
const attendanceController = require("../../controller/salon/attendance.controller");
const salon = require("../../middleware/salon");

route.get(
  "/getAll",
  salon,
  attendanceController.getSalonWiseAttendance
);

module.exports = route;
