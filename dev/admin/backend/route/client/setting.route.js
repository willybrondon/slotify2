const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');;
const settingController = require('../../controller/user/setting.controller')
  
route.get('/get', settingController.get);



module.exports = route;