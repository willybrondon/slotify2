const express = require("express");
const route = express.Router();
const reviewController = require('../../controller/admin/review.controller');
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.get('/getAll',checkAccessWithSecretKey(),admin,reviewController.getAll)
route.get('/salonReviews',checkAccessWithSecretKey(),admin,reviewController.salonReviews)
route.delete('/delete',checkAccessWithSecretKey(),admin,reviewController.delete)






module.exports = route