const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require("../../middleware/admin");
const teamScheduleController = require("../../controller/admin/teamSchedule.controller");

route.get("/get", checkAccessWithSecretKey(), admin, teamScheduleController.getTeamSchedule);
route.get("/clients", checkAccessWithSecretKey(), admin, teamScheduleController.searchClients);
route.post("/booking", checkAccessWithSecretKey(), admin, teamScheduleController.createPlanningBooking);
route.post("/booking/reschedule", checkAccessWithSecretKey(), admin, teamScheduleController.reschedulePlanningBooking);
route.post("/booking/resize", checkAccessWithSecretKey(), admin, teamScheduleController.resizePlanningBooking);
route.get("/booking/detail", checkAccessWithSecretKey(), admin, teamScheduleController.getPlanningBookingDetail);
route.post("/booking/cancel", checkAccessWithSecretKey(), admin, teamScheduleController.cancelPlanningBooking);
route.post("/booking/services", checkAccessWithSecretKey(), admin, teamScheduleController.updatePlanningBookingServices);

module.exports = route;
