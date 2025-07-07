const express = require("express");
const route = express.Router();

const admin = require("./admin.route");
const user = require("./user.route");
const category = require("./category.route");
const service = require("./service.route");
const salon = require("./salon.route");
const salonClose = require("./salonClose.route");
const review = require("./review.route");
const booking = require("./booking.route");
const expert = require("./expert.route");
const notification = require("./notification.route");
const setting = require("./setting.route");
const complain = require("./complain.route");
const attendance = require("./attendance.route");
const settlement = require("./settlement.route");
const dashboard = require("./dashboard.route");
const login = require("./login.route");
const salonRequest = require('./salonRequest.route')

route.use("/login", login);
route.use("/dashboard", dashboard);
route.use("/settlement", settlement);
route.use("/attendance", attendance);
route.use("/complain", complain);
route.use("/setting", setting);
route.use("/notification", notification);
route.use("/expert", expert);
route.use("/booking", booking);
route.use("/review", review);
route.use("/salonClose", salonClose);
route.use("/", admin);
route.use("/user", user);
route.use("/category", category);
route.use("/service", service);
route.use("/salon", salon);
route.use("/salonrequest", salonRequest);


module.exports = route;
