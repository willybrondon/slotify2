const express = require("express");
const route = express.Router();
const multer = require("multer");
const salonController = require("../../controller/admin/salon.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const storage = require("./../../middleware/multer");
const admin = require("../../middleware/admin");
const upload = multer({
  storage,
});

route.post("/create", upload.fields([{ name: "image", maxCount: 10 }]), checkAccessWithSecretKey(), admin, salonController.create);

route.patch("/update", checkAccessWithSecretKey(), upload.fields([{ name: "image", maxCount: 10 }, { name: "mainImage" }]), admin, salonController.update);

route.get("/getAll", checkAccessWithSecretKey(), admin, salonController.getAll);

route.get("/getSalon", checkAccessWithSecretKey(), admin, salonController.getSalon);

route.get("/salonTime", checkAccessWithSecretKey(), admin, salonController.getSalonTime);

route.patch("/updateSalonTime", checkAccessWithSecretKey(), admin, salonController.updateSalonTime);

route.patch("/manageBreak", checkAccessWithSecretKey(), salonController.manageBreak);

route.put("/isActive", checkAccessWithSecretKey(), admin, salonController.isActive);

route.put("/isBestSeller", checkAccessWithSecretKey(), admin, salonController.isBestSeller);

route.get("/getProductsOfParticularSalon", checkAccessWithSecretKey(), admin, salonController.getProductsOfParticularSalon);

route.get("/fetchSalonWalletHistoryByAdmin", checkAccessWithSecretKey(), admin, salonController.fetchSalonWalletHistoryByAdmin);

route.patch("/delete", checkAccessWithSecretKey(), admin, salonController.delete);

module.exports = route;
