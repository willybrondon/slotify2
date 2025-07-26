//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const attributesController = require("../../controller/admin/attributes.controller");

//create attributes
route.post("/create", checkAccessWithSecretKey(), attributesController.store);

//update attributes
route.patch("/update", checkAccessWithSecretKey(), attributesController.update);

//get attributes
route.get("/", checkAccessWithSecretKey(), attributesController.get);

//delete attributes
route.delete("/delete", checkAccessWithSecretKey(), attributesController.destroy);

module.exports = route;
