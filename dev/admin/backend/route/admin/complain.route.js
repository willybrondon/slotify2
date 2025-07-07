const express = require("express");
const route = express.Router();
const complainController = require('../../controller/admin/complain.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.get('/getAll',checkAccessWithSecretKey(),admin,complainController.pendingSolvedComplains)
route.delete('/solveComplain',checkAccessWithSecretKey(),admin,complainController.solveComplain)






module.exports = route