const express = require("express");
const router = express.Router();

const favouriteController = require("../../controller/user/favourite.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//create or remove favourite product by user
router.post("/",checkAccessWithSecretKey(), favouriteController.productFavourite);


//get facvourite product list
router.get("/favouriteList",checkAccessWithSecretKey(), favouriteController.getFavouriteList);

//create or remove favourite product by user
router.post("/salon",checkAccessWithSecretKey(), favouriteController.salonFavourite);


//get facvourite product list
router.get("/favouriteSalonList",checkAccessWithSecretKey(), favouriteController.getFavouriteSalonList);


module.exports = router;

