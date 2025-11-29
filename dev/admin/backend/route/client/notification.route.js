const express = require("express");
const route = express.Router();

const notificationController = require("../../controller/user/notification.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");



route.get('/getForUser', checkAccessWithSecretKey(), notificationController.getNotificationForUser)
route.delete('/delete', checkAccessWithSecretKey(), notificationController.deleteNotification)

module.exports = route;
