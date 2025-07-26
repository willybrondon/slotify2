const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/user/review.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//review for booking
route.post("/postReview", checkAccessWithSecretKey(), reviewController.serviceReviewByUser);

//review for booking for expert
route.get("/expertReviews", checkAccessWithSecretKey(), reviewController.expertReviews);

//add product review
route.post("/postProductReview", checkAccessWithSecretKey(), reviewController.productReviewByUser);

module.exports = route;
