const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const bookingController = require("../../controller/admin/booking.controller");
const admin = require('../../middleware/admin');

route.get("/getAll", checkAccessWithSecretKey(), admin, bookingController.getAll);
route.get("/getUserBookings", checkAccessWithSecretKey(),admin, bookingController.getUserBookings);
route.get("/getExpertBookings", checkAccessWithSecretKey(),admin, bookingController.getExpertBookings);
route.get("/getSalonBookings", checkAccessWithSecretKey(),admin, bookingController.getSalonBookings);
route.get("/dailyBookingStats", checkAccessWithSecretKey(),admin, bookingController.dailyBookings);
route.get("/upcoming", checkAccessWithSecretKey(),admin, bookingController.upcomingBookings);
route.get("/monthlyState", checkAccessWithSecretKey(),admin, bookingController.monthlyState);
route.put("/cancelBooking", checkAccessWithSecretKey(),admin, bookingController.cancelBooking);

module.exports = route;
