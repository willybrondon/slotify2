const express = require("express");
const route = express.Router();
const admin = require("../../middleware/admin");
const salonRequestController = require("../../controller/admin/salonRequest.controller");

route.get(
  "/getallsalonRequest",
    admin,
  salonRequestController.getAllSalonRequest
);
route.delete(
  "/deletesalonRequest",
    admin,
  salonRequestController.deleteSalonRequest
);

module.exports = route;
