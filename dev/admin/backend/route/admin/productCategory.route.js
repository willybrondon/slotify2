const express = require("express");
const route = express.Router();
const categoryController = require("../../controller/admin/productCategory.controller");

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

route.post("/create", upload.single("image"), checkAccessWithSecretKey(), categoryController.store);

route.patch("/update", upload.single("image"), checkAccessWithSecretKey(), categoryController.update);

route.patch("/isActive", checkAccessWithSecretKey(), categoryController.isActive);

route.get("/get", checkAccessWithSecretKey(), categoryController.getCategory);

module.exports = route;