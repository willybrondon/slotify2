const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const teamScheduleController = require("../../controller/salon/teamSchedule.controller");

route.get("/get", checkAccessWithSecretKey(), salon, teamScheduleController.getTeamSchedule);
route.get("/clients", checkAccessWithSecretKey(), salon, teamScheduleController.searchClients);
route.post("/booking", checkAccessWithSecretKey(), salon, teamScheduleController.createPlanningBooking);
route.post("/booking/reschedule", checkAccessWithSecretKey(), salon, teamScheduleController.reschedulePlanningBooking);
route.post("/booking/resize", checkAccessWithSecretKey(), salon, teamScheduleController.resizePlanningBooking);
route.get("/booking/detail", checkAccessWithSecretKey(), salon, teamScheduleController.getPlanningBookingDetail);
route.post("/booking/cancel", checkAccessWithSecretKey(), salon, teamScheduleController.cancelPlanningBooking);
route.post("/booking/services", checkAccessWithSecretKey(), salon, teamScheduleController.updatePlanningBookingServices);
route.post("/busy", checkAccessWithSecretKey(), salon, teamScheduleController.setExpertBusy);
route.post("/busy/remove", checkAccessWithSecretKey(), salon, teamScheduleController.removeExpertBusy);

module.exports = route;
