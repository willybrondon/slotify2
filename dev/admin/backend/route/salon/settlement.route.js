const express = require("express");
const route = express.Router();
const settlementController = require('../../controller/salon/settlement.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");


route.get('/',checkAccessWithSecretKey(),salon,settlementController.settlementForSalon)
route.get('/getExpertSettlement',checkAccessWithSecretKey(),salon,settlementController.getExpertSettlement)
route.get('/particularExpert',checkAccessWithSecretKey(),salon,settlementController.getParticularExpertSettlement)
route.put('/expertPayment',checkAccessWithSecretKey(),salon,settlementController.expertPayment)
route.put('/expertBonusPenalty',checkAccessWithSecretKey(),salon,settlementController.bonusPenalty)
route.get('/salonSettlementInfo',checkAccessWithSecretKey(),settlementController.salonSettlementInfo)
route.get('/expertSettlementInfo',checkAccessWithSecretKey(),settlementController.expertSettlementInfo)

module.exports = route;