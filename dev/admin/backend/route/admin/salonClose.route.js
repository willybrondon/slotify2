const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salonCloseController = require("../../controller/admin/salonClose.controller");
const admin = require('../../middleware/admin');
route.post(
  "/create",
  checkAccessWithSecretKey(),admin,
  salonCloseController.addHoliday
);

route.get(
  "/getAll",
  checkAccessWithSecretKey(),admin,
  salonCloseController.getHoliday
);

route.delete(
  "/delete",
  checkAccessWithSecretKey(),admin,
  salonCloseController.delete
);
module.exports = route;
