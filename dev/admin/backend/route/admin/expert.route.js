const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const expertController = require("../../controller/admin/expert.controller");

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });
const admin = require("../../middleware/admin");

route.post("/create", checkAccessWithSecretKey(), admin, upload.single("image"), expertController.create);
route.get("/getAll", checkAccessWithSecretKey(), admin, expertController.getAll);
route.get("/profile", checkAccessWithSecretKey(), admin, expertController.getExpert);
route.patch("/update", checkAccessWithSecretKey(), admin, upload.single("image"), expertController.updateExpert);
route.put("/delete", checkAccessWithSecretKey(), admin, expertController.delete);
route.put("/isBlock", checkAccessWithSecretKey(), admin, expertController.isBlock);
route.get("/fetchParExpertWalletHistoryByAdm", checkAccessWithSecretKey(), admin, expertController.fetchParExpertWalletHistoryByAdm);
route.get("/retriveExpertWalletHistory", checkAccessWithSecretKey(), admin, expertController.retriveExpertWalletHistory);

module.exports = route;
