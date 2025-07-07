const express = require("express");
const route = express.Router();
const multer = require("multer");
const categoryController = require("../../controller/admin/category.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const storage = require("./../../middleware/multer");
const admin = require('../../middleware/admin');
const upload = multer({
  storage,
});

route.post(
  "/create",
  upload.single("image"),
  checkAccessWithSecretKey(),admin,
  categoryController.store
);
route.get("/getAll", checkAccessWithSecretKey(),admin, categoryController.getAll);
route.patch(
  "/update",
  upload.single("image"),
  checkAccessWithSecretKey(),admin,
  categoryController.update
);
route.patch(
  "/delete",
  upload.single("image"),
  checkAccessWithSecretKey(),admin,
  categoryController.delete
);
route.put("/status", checkAccessWithSecretKey(),admin, categoryController.status);

module.exports = route;
