const express = require('express');
const route = express.Router();
const checkAccessWithSecretKey = require('../../middleware/checkAccess');
const complainController = require('../../controller/user/complain.controller.js')

route.post('/raiseComplain', checkAccessWithSecretKey(), complainController.raiseComplain);
route.post('/expert/raiseComplain', checkAccessWithSecretKey(), complainController.raiseComplain);
route.put('/solveComplain', checkAccessWithSecretKey(), complainController.solveComplain);
route.get('/getComplains', checkAccessWithSecretKey(), complainController.pendingSolvedComplains);
route.get('/get', checkAccessWithSecretKey(), complainController.getComplainForUserOrExpert);
route.get('/expert/get', checkAccessWithSecretKey(), complainController.getComplainForUserOrExpert);


module.exports = route;