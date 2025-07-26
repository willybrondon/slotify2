//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const productRequestController = require("../../controller/admin/productRequest.controller");

//product request accept or decline (update product)
route.patch("/acceptUpdateRequest", checkAccessWithSecretKey(), productRequestController.acceptUpdateRequest);

//get status wise update product requests
route.get("/updateProductRequestStatusWise", checkAccessWithSecretKey(), productRequestController.updateProductRequestStatusWise);

module.exports = route;
