const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const bookingController = require("../../controller/salon/booking.controller");
const salon = require("../../middleware/salon");


route.get("/getAll", checkAccessWithSecretKey(),salon, bookingController.getAll);
route.get("/getExpertBookings", checkAccessWithSecretKey(),salon, bookingController.getExpertBookings);
route.get("/dailyBookingStats", checkAccessWithSecretKey(),salon, bookingController.dailyBookings);
route.get("/monthlyState", checkAccessWithSecretKey(), salon, bookingController.monthlyState);
route.get("/upcoming", checkAccessWithSecretKey(),salon, bookingController.upcomingBookings);
route.put("/cancelBooking", checkAccessWithSecretKey(),  bookingController.cancelBooking);


module.exports = route;
