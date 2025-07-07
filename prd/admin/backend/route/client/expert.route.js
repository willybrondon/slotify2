const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const expertController = require("../../controller/user/expert.controller");
const expertForUserController = require("../../controller/user/expertForUser.controller");

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

route.get(
  "/getExpertServiceWise",
  checkAccessWithSecretKey(),
  expertForUserController.getExpertServiceWise
);

route.get(
  "/getTopExperts",
  checkAccessWithSecretKey(),
  expertForUserController.getTopExperts
);

route.get(
  "/expertWithService",
  checkAccessWithSecretKey(),
  expertForUserController.getExpertWithServiceForUser
);

route.post(
  "/busyExpert",
  checkAccessWithSecretKey(),
  expertController.busyExpert
);

route.patch("/login", checkAccessWithSecretKey(), expertController.expertLogin);

route.get(
  "/profile",
  checkAccessWithSecretKey(),
  expertController.getExpertProfile
);

route.put(
  "/payForCashAfterService",
  checkAccessWithSecretKey(),
  expertController.payForCashAfterService
);

route.patch(
  "/updateProfile",
  checkAccessWithSecretKey(),
  upload.single("image"),
  expertController.updateExpert
);

route.put(
  "/selectPaymentMethod",
  checkAccessWithSecretKey(),
  expertController.selectPaymentMethod
);

module.exports = route;
