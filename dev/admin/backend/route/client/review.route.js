const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/user/review.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post('/postReview', checkAccessWithSecretKey(), reviewController.store);
route.get(
    "/expertReviews",
    checkAccessWithSecretKey(),
    reviewController.expertReviews
  );
  

module.exports = route;
