const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const expertController = require("../../controller/salon/expert.controller");

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

const salon = require("../../middleware/salon");

route.post("/create", salon, checkAccessWithSecretKey(), upload.single("image"), expertController.create);

route.get("/getAll", salon, checkAccessWithSecretKey(), expertController.getAll);

route.patch("/updateExpert", checkAccessWithSecretKey(), salon, upload.single("image"), expertController.updateExpert);

route.put("/isBlock", checkAccessWithSecretKey(), salon, expertController.isBlock);

route.get("/profile", checkAccessWithSecretKey(), salon, expertController.getExpert);

route.put("/delete", checkAccessWithSecretKey(), salon, expertController.delete);

route.get("/retriveParExpertWalletHistoryBySalon", checkAccessWithSecretKey(), salon, expertController.retriveParExpertWalletHistoryBySalon);

module.exports = route;
