const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});
const userController = require("../../controller/user/user.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post("/checkUser", checkAccessWithSecretKey(), userController.checkUser);
route.post(
  "/loginSignup",
  checkAccessWithSecretKey(),
  userController.loginSignup
);
route.get(
  "/checkUserForSignup",
  checkAccessWithSecretKey(),
  userController.checkUserForSignup
);
route.get("/profile", checkAccessWithSecretKey(), userController.getProfile);
route.patch(
  "/update",
  upload.single("image"),
  checkAccessWithSecretKey(),
  userController.updateUser
);

route.put("/delete", checkAccessWithSecretKey(), userController.deleteUser);

route.patch(
  "/setPassword",
  checkAccessWithSecretKey(),
  userController.setPassword
);


module.exports = route;
