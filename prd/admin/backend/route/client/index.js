const express = require("express");
const route = express.Router();

const user = require("./user.route");
route.use("/", user);
module.exports = route;
const salon = require("./salon.route");
const service = require("./service.route");
const category = require("./category.route");
const expert = require("./expert.route");
const booking = require("./booking.route");
const review = require("./review.route");
const notification = require("./notification.route");
const complain = require("./complain.route");
const setting = require("./setting.route");
const attendance = require("./attendance.route");
const forgetPassword = require("./forgetPassword.route");
const expertSettlement = require("./expertSettlement.route");
const otp = require("./otp.route");
const salonRequest = require('./salonRequest.route')

route.use("/expertSettlement", expertSettlement);
route.use("/forgetPassword", forgetPassword);
route.use("/attendance", attendance);
route.use("/setting", setting);
route.use("/complain", complain);
route.use("/notification", notification);
route.use("/booking", booking);
route.use("/expert", expert);
route.use("/service", service);
route.use("/salon", salon);
route.use("/category", category);
route.use("/review", review);
route.use("/otp", otp);
route.use("/salonrequest", salonRequest);


