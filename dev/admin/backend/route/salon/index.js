const express = require("express");
const route = express.Router();
const expert = require("./expert.route");
const salonClose = require("./salonClose.route");
const salon = require("./salon.route");
const attendance = require("./attendance.route");
const settlement = require("./settlement.route");
const booking = require("./booking.route");
const service = require("./service.route");
const dashboard = require("./dashboard.route");
const review = require("./review.route");
const complain = require("./complain.route");

route.use("/complain", complain);
route.use("/review", review);
route.use("/dashboard", dashboard);
route.use("/service", service);
route.use("/booking", booking);
route.use("/settlement", settlement);
route.use("/attendance", attendance);
route.use("/", salon);
route.use("/salonClose", salonClose);
route.use("/expert", expert);

module.exports = route;
