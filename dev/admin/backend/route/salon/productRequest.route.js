const express = require("express");
const route = express.Router();
const multer = require("multer");
const productRequestController = require("../../controller/salon/productRequest.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

  route.patch(
    "/createUpdateProductRequest",
    checkAccessWithSecretKey(),
    productRequestController.updateProductRequest
  );


module.exports = route;