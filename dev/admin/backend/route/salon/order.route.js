//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salon = require("../../middleware/salon");

//controller
const OrderController = require("../../controller/salon/order.controller");

route.get("/ordersOfSalon", checkAccessWithSecretKey(), salon, OrderController.ordersOfSalon);

route.patch("/updateOrderBySalon", checkAccessWithSecretKey(), salon, OrderController.updateOrderBySalon);

route.get("/fetchOrderInfoBySalon", checkAccessWithSecretKey(), salon, OrderController.fetchOrderInfoBySalon);

module.exports = route;
