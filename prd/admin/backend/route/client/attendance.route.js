const express = require('express');
const route = express.Router()
const attendanceController = require('../../controller/user/expertAttendance')

route.post('/attendExpert', attendanceController.expertAttendance);
route.get('/getAttendanceForExpert', attendanceController.getAttendanceForExpert);

module.exports = route
