const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");

function ctrl() {
  return require("../../controller/salon/messaging.controller");
}

route.get("/conversations", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().listConversations(req, res, next)
);
route.get("/messages", checkAccessWithSecretKey(), salon, (req, res, next) =>
  ctrl().getMessages(req, res, next)
);
route.post(
  "/send",
  checkAccessWithSecretKey(),
  salon,
  upload.fields([{ name: "photos", maxCount: 4 }]),
  (req, res, next) => ctrl().sendMessage(req, res, next)
);

module.exports = route;
