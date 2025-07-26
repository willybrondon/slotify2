const express = require("express");
const route = express.Router();
const bookingController = require("../../controller/user/booking.cotroller");
const bookingForExpertController = require("../../controller/user/bookingForExpert.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.get("/getBookingBasedDate", checkAccessWithSecretKey(), bookingController.getBookingBasedDate);

route.post("/newBooking", checkAccessWithSecretKey(), bookingController.newBooking);

route.get("/checkSlots", checkAccessWithSecretKey(), bookingController.checkSlots);

route.get("/getBookings", checkAccessWithSecretKey(), bookingController.bookingForUser);

route.put("/cancelBooking", checkAccessWithSecretKey(), bookingController.cancelBookingByUser);

route.get("/expert/bookingWithTypeStatus", checkAccessWithSecretKey(), bookingForExpertController.bookingTypeStatusWiseForExpert);

route.get("/expert/booking", checkAccessWithSecretKey(), bookingForExpertController.bookingForExpert);

route.get("/expert/completeBooking", checkAccessWithSecretKey(), bookingForExpertController.completeBooking);

route.get("/expert/expertEarning", checkAccessWithSecretKey(), bookingForExpertController.expertEarning);

route.put("/expert/cancelConfirmBooking", checkAccessWithSecretKey(), bookingForExpertController.cancelConfirmBooking);

route.get("/bookingInfo", checkAccessWithSecretKey(), bookingController.bookingInfo);

module.exports = route;
