const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const aiConciergeController = require("../../controller/user/aiConcierge.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

// Analyze selfie image
route.post(
  "/analyzeSelfie",
  checkAccessWithSecretKey(),
  upload.single("image"),
  aiConciergeController.analyzeSelfie
);

// Chat with AI concierge
route.post(
  "/chat",
  checkAccessWithSecretKey(),
  aiConciergeController.chatWithAI
);

// Check AI service status
route.get(
  "/status",
  checkAccessWithSecretKey(),
  aiConciergeController.checkAIServiceStatus
);

module.exports = route;

