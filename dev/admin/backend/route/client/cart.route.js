const express = require("express");
const route = express.Router();
const cartController = require("../../controller/user/cart.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post("/addToCart", checkAccessWithSecretKey(), cartController.addToCart);
route.patch("/removeFromCart", checkAccessWithSecretKey(), cartController.removeFromCart);
route.get("/getCart", checkAccessWithSecretKey(), cartController.getCartProduct);
route.delete("/deleteCart", checkAccessWithSecretKey(), cartController.deleteCart);

module.exports = route;