const express = require("express");
const route = express.Router();
const serviceController = require("../../controller/admin/service.controller");
const admin = require("../../middleware/admin");
const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post(
  "/create",
  checkAccessWithSecretKey(),admin,
  upload.single("image"),
  serviceController.create
);
route.get("/getAll", checkAccessWithSecretKey(),admin, serviceController.getAll);
route.patch(
  "/update",
  checkAccessWithSecretKey(),admin,
  upload.single("image"),
  serviceController.update
);
route.patch("/delete", checkAccessWithSecretKey(),admin, serviceController.delete);
route.put(
  "/handleStatus",
  checkAccessWithSecretKey(),
  serviceController.handleStatus
);


module.exports = route;
