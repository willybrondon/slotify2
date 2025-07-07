const express = require("express");
const route = express.Router();
const complainController = require('../../controller/salon/complain.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");


route.get('/getAll',checkAccessWithSecretKey(),salon,complainController.pendingSolvedComplains)

module.exports = route