const express = require("express");
const route = express.Router();
const attendanceController = require("../../controller/salon/attendance.controller");

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/getAll", checkAccessWithSecretKey(), attendanceController.getSalonWiseAttendance);

module.exports = route;
