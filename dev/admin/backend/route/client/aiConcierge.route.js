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
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
    }
  }
});

const aiConciergeController = require("../../controller/user/aiConcierge.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

// Analyze selfie image - POST endpoint
route.post(
  "/analyzeSelfie",
  checkAccessWithSecretKey(),
  upload.single("image"),
  aiConciergeController.analyzeSelfie
);

// GET handler for analyzeSelfie - returns helpful message
route.get(
  "/analyzeSelfie",
  (req, res) => {
    return res.status(405).json({
      status: false,
      message: "Method not allowed. This endpoint requires POST method.",
      info: {
        method: "POST",
        endpoint: "/user/aiConcierge/analyzeSelfie",
        requiredHeaders: {
          key: "Your secret key"
        },
        body: {
          image: "Image file (multipart/form-data)",
          latitude: "Optional - User latitude",
          longitude: "Optional - User longitude",
          city: "Optional - User city",
          userId: "Optional - User ID"
        }
      }
    });
  }
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

