const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const bookingController = require("../../controller/salon/booking.controller");
const salon = require('../../middleware/salon')

route.get("/getAll", checkAccessWithSecretKey(),salon, bookingController.getAll);
route.get("/getExpertBookings", checkAccessWithSecretKey(), bookingController.getExpertBookings);
route.get("/dailyBookingStats", checkAccessWithSecretKey(),salon, bookingController.dailyBookings);
route.get("/monthlyState", checkAccessWithSecretKey(),salon, bookingController.monthlyState);
route.get("/upcoming", checkAccessWithSecretKey(),salon, bookingController.upcomingBookings);
route.put("/acceptPendingBooking", checkAccessWithSecretKey(), salon, bookingController.acceptPendingBooking);
route.put("/cancelBooking", checkAccessWithSecretKey(), bookingController.cancelBooking);
route.post(
  "/result-photos",
  checkAccessWithSecretKey(),
  salon,
  require("multer")({ storage: require("../../middleware/multer") }).fields([
    { name: "photos", maxCount: 6 },
    { name: "resultPhotos", maxCount: 6 },
  ]),
  require("../../controller/user/publicBeautyProfile.controller").salonAttachResultPhotos
);

module.exports = route;
