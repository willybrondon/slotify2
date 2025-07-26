//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const attributesController = require("../../controller/salon/attributes.controller");

const salon = require('../../middleware/salon')

route.post("/create", checkAccessWithSecretKey(),salon, attributesController.store);

route.patch("/update", checkAccessWithSecretKey(),salon, attributesController.update);

route.get("/", checkAccessWithSecretKey(),salon, attributesController.get);

module.exports = route;
