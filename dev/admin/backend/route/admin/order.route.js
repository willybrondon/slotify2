//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const OrderController = require("../../controller/admin/order.controller");

//get status wise orders
route.get("/getOrders", checkAccessWithSecretKey(), OrderController.getOrders);

//get salon's orders
route.get("/fetchOrdersOfSalon", checkAccessWithSecretKey(), OrderController.fetchOrdersOfSalon);

//get particular order Wise order details
route.get("/fetchOrderInfo", checkAccessWithSecretKey(), OrderController.fetchOrderInfo);

//get particular user's status wise orders
route.get("/fetchOrdersOfUser", checkAccessWithSecretKey(), OrderController.fetchOrdersOfUser);

//update order status
route.patch("/updateOrderStatus", checkAccessWithSecretKey(), OrderController.updateOrderStatus);

module.exports = route;
