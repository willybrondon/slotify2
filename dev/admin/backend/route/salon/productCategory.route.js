const express = require("express");
const route = express.Router();
const multer = require("multer");
const categoryController = require("../../controller/salon/productCategory.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

  route.get(
    "/get",
    checkAccessWithSecretKey(),
    categoryController.getCategory
  );


module.exports = route;