const express = require("express");
const route = express.Router();
const multer = require("multer");
const categoryController = require("../../controller/user/productCateogry.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

  route.get(
    "/get",
    checkAccessWithSecretKey(),
    categoryController.getCategory
  );

  route.get(
    "/product",
    checkAccessWithSecretKey(),
    categoryController.getCategoryProducts
  );



module.exports = route;