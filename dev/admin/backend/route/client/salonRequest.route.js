const express = require("express");
const route = express.Router();
const salonController = require("../../controller/user/salon.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salonRequet = require("../../controller/user/salonRequest.controller");
const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({
  storage,
});

route.post(
  "/createsalonrequest",
  upload.single("image"),
  checkAccessWithSecretKey(),
  salonRequet?.createSalonRequest
);

module.exports = route;
