const express = require("express");
const multer = require("multer");
const route = express.Router();
const checkAccess = require("../../middleware/checkAccess");
const blogAdmin = require("../../middleware/blogAdmin");
const storage = require("../../middleware/multer");
const authController = require("../../controller/blogAdmin/auth.controller");
const postController = require("../../controller/blogAdmin/post.controller");
const uploadController = require("../../controller/blogAdmin/upload.controller");

const upload = multer({ storage });

route.post("/login", checkAccess(), authController.login);
route.get("/me", checkAccess(), blogAdmin, authController.me);

route.post(
  "/upload",
  checkAccess(),
  blogAdmin,
  upload.single("image"),
  uploadController.uploadImage
);

route.get("/posts", checkAccess(), blogAdmin, postController.listMine);
route.get("/posts/:id", checkAccess(), blogAdmin, postController.getOne);
route.post("/posts", checkAccess(), blogAdmin, postController.create);
route.put("/posts/:id", checkAccess(), blogAdmin, postController.update);
route.post("/posts/:id/submit", checkAccess(), blogAdmin, postController.submitForReview);
route.delete("/posts/:id", checkAccess(), blogAdmin, postController.remove);

module.exports = route;
