const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");
const clientsController = require("../../controller/salon/clients.controller");

route.get("/", checkAccessWithSecretKey(), salon, clientsController.getSalonClients);
route.get(
  "/bookings",
  checkAccessWithSecretKey(),
  salon,
  clientsController.getSalonClientBookings
);

module.exports = route;
