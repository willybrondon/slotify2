const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');

const userController = require('../../controller/admin/user.controller')
const checkAccessWithSecretKey = require("../../middleware/checkAccess");


route.get('/getAll', admin, userController.getAllUsers);
route.get('/profile', checkAccessWithSecretKey(),  userController.getProfile);
route.put('/blockUnblock', checkAccessWithSecretKey(), admin, userController.userBlock);

module.exports = route;