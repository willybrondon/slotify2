const express = require("express");
const route = express.Router();
const salon = require("../../middleware/salon");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const stripeConnectController = require("../../controller/salon/stripeConnect.controller");

route.get("/status", checkAccessWithSecretKey(), salon, stripeConnectController.getStatus);
route.patch("/paymentMethods", checkAccessWithSecretKey(), salon, stripeConnectController.updatePaymentMethods);
route.post("/onboard", checkAccessWithSecretKey(), salon, stripeConnectController.createOnboardingLink);
route.get("/refresh", checkAccessWithSecretKey(), salon, stripeConnectController.refreshAccount);

module.exports = route;
