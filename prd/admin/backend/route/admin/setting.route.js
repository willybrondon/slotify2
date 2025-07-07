const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');;
const settingController = require('../../controller/admin/setting.controller')
  
route.get('/', admin, settingController.get);
route.patch('/update', admin, settingController.update);
route.put('/handleSwitch', admin, settingController.handleSwitch);



module.exports = route;