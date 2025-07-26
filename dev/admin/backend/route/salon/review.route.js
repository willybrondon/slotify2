const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/salon/review.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const salon = require("../../middleware/salon");

route.get("/getAll", salon, checkAccessWithSecretKey(), reviewController.salonReviews);
route.get("/fetchProductReview", salon, checkAccessWithSecretKey(), reviewController.fetchProductReview);

module.exports = route;
