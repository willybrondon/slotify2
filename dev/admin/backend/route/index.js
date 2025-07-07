const express = require("express");
const route = express.Router();

const user = require("./client");
const admin = require("./admin");
const salon = require("./salon");

route.use("/user", user);
route.use("/admin", admin);
route.use("/salon", salon);

module.exports = route;
