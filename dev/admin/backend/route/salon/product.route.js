const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

const productController = require("../../controller/salon/product.Controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salonAuth = require("../../middleware/salon");

route.post(
  "/createProduct",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  salonAuth,
  productController.createProduct
);

route.patch(
  "/updateProductBySalon",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  salonAuth,
  productController.updateProductBySalon
);

route.patch("/isOutOfStock", checkAccessWithSecretKey(), salonAuth, productController.isOutOfStock);

route.get("/detailforSalon", checkAccessWithSecretKey(), salonAuth, productController.detailforSalon);

route.get("/getAll", checkAccessWithSecretKey(), salonAuth, productController.getAll);

route.patch("/blockCityForProduct", checkAccessWithSecretKey(), salonAuth, productController.blockCityForProduct);

route.patch("/allowCityForProduct", checkAccessWithSecretKey(), salonAuth, productController.allowCityForProduct);

route.get("/getAllowedCitiesForProduct", checkAccessWithSecretKey(), salonAuth, productController.getAllowedCitiesForProduct);

module.exports = route;
