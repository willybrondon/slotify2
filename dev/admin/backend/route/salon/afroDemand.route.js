const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const afroDemandController = require("../../controller/salon/afroDemand.controller");

route.get("/getAll", checkAccessWithSecretKey(), salon, afroDemandController.getAll);
route.get("/afro-config", checkAccessWithSecretKey(), salon, afroDemandController.getAfroConfigStatus);
route.put("/adjust/:id", checkAccessWithSecretKey(), salon, afroDemandController.adjust);
route.put("/afro-config", checkAccessWithSecretKey(), salon, afroDemandController.updateAfroConfig);

module.exports = route;
