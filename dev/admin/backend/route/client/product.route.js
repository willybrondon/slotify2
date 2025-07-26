const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

const productController = require("../../controller/user/product.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post("/get", checkAccessWithSecretKey(), productController.getProductsForUser);

route.get("/trending", checkAccessWithSecretKey(), productController.getTrendingProducts);

route.get("/new", checkAccessWithSecretKey(), productController.newProducts);

route.get("/salonProducts", checkAccessWithSecretKey(), productController.salonProducts);

route.get("/search", checkAccessWithSecretKey(), productController.search);

route.get("/productDetail", checkAccessWithSecretKey(), productController.productDetail);

module.exports = route;
