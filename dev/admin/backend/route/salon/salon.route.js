const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salonController = require("../../controller/salon/salon.controller");
const salon = require("../../middleware/salon");

route.post("/login", checkAccessWithSecretKey(), salonController.login);

route.get("/profile", salon, checkAccessWithSecretKey(), salonController.profile);

route.patch("/update", salon, upload.fields([{ name: "image", maxCount: 10 }, { name: "mainImage" }]), checkAccessWithSecretKey(), salonController.update);

route.post("/updateSalonPassword", checkAccessWithSecretKey(), salon, salonController.updateSalonPassword);

route.put("/isActive", checkAccessWithSecretKey(), salon, salonController.isActive);

route.get("/salonTime", checkAccessWithSecretKey(), salon, salonController.getSalonTime);

route.patch("/updatePassword", checkAccessWithSecretKey(), salon, salonController.updatePassword);

route.get("/getCurrency", checkAccessWithSecretKey(), salon, salonController.getCurrency);

route.patch("/addServices", checkAccessWithSecretKey(), salon, salonController.addServices);

route.patch("/removeService", checkAccessWithSecretKey(), salon, salonController.removeService);

route.patch("/updateSalonTime", checkAccessWithSecretKey(), salon, salonController.updateSalonTime);

route.patch("/manageBreak", checkAccessWithSecretKey(), salon, salonController.manageBreak);

route.get("/fetchSalonWalletHistory", checkAccessWithSecretKey(), salon, salonController.fetchSalonWalletHistory);

module.exports = route;
