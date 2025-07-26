const express = require("express");
const router = express.Router();

const orderController = require("../../controller/user/order.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

// create order by user
router.post("/createOrder", checkAccessWithSecretKey(), orderController.createOrder);

// cancel order by user
router.patch("/cancelOrder", checkAccessWithSecretKey(), orderController.cancelOrderByUser);

// get order by user status wise
router.get("/get", checkAccessWithSecretKey(), orderController.ordersOfUser);

module.exports = router;
