const express = require("express");
const route = express.Router();

const salonMiddleware = require("../../middleware/salon");

const salon = require("./salon.route");
const expert = require("./expert.route");
const salonClose = require("./salonClose.route");
const attendance = require("./attendance.route");
const settlement = require("./settlement.route");
const booking = require("./booking.route");
const service = require("./service.route");
const dashboard = require("./dashboard.route");
const review = require("./review.route");
const complain = require("./complain.route");
const attributes = require("./attributes.route");
const productCategory = require("./productCategory.route");
const productRequest = require("./productRequest.route");
const product = require("./product.route");
const order = require("./order.route");
const withdrawMethod = require("./withdrawMethod.route");
const withdrawRequest = require("./withdrawRequestcontroller");

route.use("/", salon);
route.use("/product", product);
route.use("/productRequest", salonMiddleware, productRequest);
route.use("/productCategory", salonMiddleware, productCategory);
route.use("/attributes", salonMiddleware, attributes);
route.use("/complain", salonMiddleware, complain);
route.use("/review", salonMiddleware, review);
route.use("/dashboard", salonMiddleware, dashboard);
route.use("/service", service);
route.use("/booking", salonMiddleware, booking);
route.use("/settlement", salonMiddleware, settlement);
route.use("/attendance", salonMiddleware, attendance);
route.use("/salonClose", salonMiddleware, salonClose);
route.use("/expert", salonMiddleware, expert);
route.use("/order", salonMiddleware, order);
route.use("/withdrawMethod", salonMiddleware, withdrawMethod);
route.use("/withdrawRequest", salonMiddleware, withdrawRequest);

module.exports = route;
