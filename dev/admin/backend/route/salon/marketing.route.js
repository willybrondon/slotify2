const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");

function ctrl() {
  return require("../../controller/salon/marketing.controller");
}

route.get("/insights", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().getInsights(req, res, next)
);
route.post("/promo", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().createPromo(req, res, next)
);
route.post("/rebook-campaign", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().launchRebookCampaign(req, res, next)
);
route.put("/packages", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().updatePackages(req, res, next)
);

module.exports = route;
