const express = require("express");
const route = express.Router();
const attendanceController = require("../../controller/admin/attendance.controller");
const admin = require("../../middleware/admin");

route.get("/getAll", admin, attendanceController.getAllAttendance);
route.get("/getAllAttendance", admin, attendanceController.attendance);

module.exports = route;
