const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salonCloseController = require("../../controller/salon/salonClose.controller");
const salon = require("../../middleware/salon");

route.post(
    "/create",
    salon,
    checkAccessWithSecretKey(),
    salonCloseController.addHoliday
);

route.get(
    "/getAll",
    salon,
    checkAccessWithSecretKey(),
    salonCloseController.getHoliday
);


  
module.exports = route;
