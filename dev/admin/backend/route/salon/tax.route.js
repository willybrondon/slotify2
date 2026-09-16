const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");

/**
 * Soft stubs for legacy salon-panel tax UI.
 * Taxes are platform-level; older panels still call these paths → HTML 404 without stubs.
 */
route.get("/getAll", checkAccessWithSecretKey(), salon, (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Taxes are managed at platform level",
    tax: [],
    total: 0,
  });
});

route.post("/", checkAccessWithSecretKey(), salon, (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Salon-level tax editing is not available. Contact platform admin.",
  });
});

route.patch("/update/:id", checkAccessWithSecretKey(), salon, (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Salon-level tax editing is not available.",
  });
});

route.put("/status", checkAccessWithSecretKey(), salon, (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Salon-level tax editing is not available.",
  });
});

route.delete("/delete/:id", checkAccessWithSecretKey(), salon, (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Salon-level tax editing is not available.",
  });
});

module.exports = route;
