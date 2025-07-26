//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
route.use(checkAccessWithSecretKey());

//controller
const WithdrawMethodController = require("../../controller/admin/withdrawMethod.controller");

//store Withdraw
route.post("/create", upload.single("image"), WithdrawMethodController.store);

//update Withdraw
route.patch("/update", upload.single("image"), WithdrawMethodController.update);

//get Withdraw
route.get("/getMethods", WithdrawMethodController.getMethods);

//delete Withdraw
route.delete("/delete", WithdrawMethodController.delete);

//handle isActive switch
route.patch("/handleSwitch", WithdrawMethodController.handleSwitch);

module.exports = route;
