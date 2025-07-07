const express = require("express");
const route = express.Router();
const settlementController = require('../../controller/admin/settlement.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.get('/allSalon',checkAccessWithSecretKey(),admin,settlementController.allSalonSettlement)
route.get('/particularSalon',checkAccessWithSecretKey(),admin,settlementController.ParticularSalonSettlement)
route.get('/particularExpert',checkAccessWithSecretKey(),admin,settlementController.getParticularExpertSettlement)
route.get('/allExpert',checkAccessWithSecretKey(),admin,settlementController.getExpertSettlement)
route.put('/salonPayment',checkAccessWithSecretKey(),admin,settlementController.salonPayment)
route.put('/salonBonusPenalty',checkAccessWithSecretKey(),admin,settlementController.bonusPenalty)
route.get('/salonSettlementInfo',checkAccessWithSecretKey(),admin,settlementController.salonSettlementInfo)
route.get('/expertSettlementInfo',checkAccessWithSecretKey(),admin,settlementController.expertSettlementInfo)

module.exports = route;