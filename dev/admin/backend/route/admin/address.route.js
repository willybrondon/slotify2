const express = require("express");
const route = express.Router();

const addressController = require("../../controller/admin/address.controller");

route.get("/get", addressController.getAllAddress);

module.exports = route;
