const express = require("express");
const route = express.Router();

const user = require("./client");
const admin = require("./admin");
const salon = require("./salon");

route.use("/user", user);
route.use("/admin", admin);
route.use("/salon", salon);

// All routes are mounted at /api prefix in index.js
module.exports = route;
