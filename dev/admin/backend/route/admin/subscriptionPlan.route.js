const express = require("express");
const route = express.Router();
const admin = require("../../middleware/admin");
const ctrl = require("../../controller/admin/subscriptionPlan.controller");

route.get("/features", admin, ctrl.listFeatures);
route.get("/plans", admin, ctrl.listPlans);
route.post("/plans", admin, ctrl.createPlan);
route.patch("/plans", admin, ctrl.updatePlan);
route.patch("/plans/toggle", admin, ctrl.togglePlanActive);
route.delete("/plans", admin, ctrl.deletePlan);
route.get("/salon", admin, ctrl.getSalonSubscription);
route.patch("/salon", admin, ctrl.assignSalonPlan);

module.exports = route;
