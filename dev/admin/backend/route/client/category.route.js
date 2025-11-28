const express = require("express");
const route = express.Router();

const categoryController = require("../../controller/user/category.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");


route.get("/getAll", checkAccessWithSecretKey(), categoryController.getAll);
route.get("/getSalonsByCategory", checkAccessWithSecretKey(), categoryController.getSalonsByCategory);


module.exports = route;
