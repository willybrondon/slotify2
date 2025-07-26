//express
const express = require("express");
const route = express.Router();



const checkAccessWithSecretKey = require("../../middleware/checkAccess");
route.use(checkAccessWithSecretKey());

//controller
const WithdrawRequestController = require("../../controller/admin/withdrawRequest.controller");

//get all salon request status wise
route.get("/getAllSalon", upload.single("image"), WithdrawRequestController.getAllSalon);


//get all expert request status wise
route.get("/getAllExpert", upload.single("image"), WithdrawRequestController.getAllExpert);

//Pay to salon
route.patch("/salonPayment", WithdrawRequestController.pay);



//salon withdraw request decline
route.patch("/decline", WithdrawRequestController.decline);

module.exports = route;
