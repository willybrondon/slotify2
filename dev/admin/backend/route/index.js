const express = require("express");
const route = express.Router();

const user = require("./client");
const admin = require("./admin");
const salon = require("./salon");
const blogAdmin = require("./blogAdmin");

route.use("/user", user);
route.use("/admin", admin);
route.use("/salon", salon);
route.use("/blogAdmin", blogAdmin);

module.exports = route;
