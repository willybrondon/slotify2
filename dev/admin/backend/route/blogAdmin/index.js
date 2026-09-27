const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const route = express.Router();
const checkAccess = require("../../middleware/checkAccess");
const blogAdmin = require("../../middleware/blogAdmin");
const authController = require("../../controller/blogAdmin/auth.controller");
const postController = require("../../controller/blogAdmin/post.controller");
const uploadController = require("../../controller/blogAdmin/upload.controller");

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "storage");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase().replace(/[^\w.]/g, "");
    const safeExt = ext && ext.length <= 8 ? ext : ".jpg";
    cb(null, `blog_${Date.now()}_${Math.floor(Math.random() * 1e6)}${safeExt}`);
  },
});

const upload = multer({
  storage: blogStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      return cb(new Error("Fichier image requis (JPG, PNG, WebP…)"));
    }
    cb(null, true);
  },
});

function uploadSingle(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image trop lourde (max 8 Mo)."
          : err.message || "Upload échoué";
      return res.status(200).json({ status: false, message: msg });
    }
    next();
  });
}

route.post("/login", checkAccess(), authController.login);
route.get("/me", checkAccess(), blogAdmin, authController.me);

route.post(
  "/upload",
  checkAccess(),
  blogAdmin,
  uploadSingle,
  uploadController.uploadImage
);

route.get("/posts", checkAccess(), blogAdmin, postController.listMine);
route.get("/posts/:id", checkAccess(), blogAdmin, postController.getOne);
route.post("/posts", checkAccess(), blogAdmin, postController.create);
route.put("/posts/:id", checkAccess(), blogAdmin, postController.update);
route.post("/posts/:id/submit", checkAccess(), blogAdmin, postController.submitForReview);
route.delete("/posts/:id", checkAccess(), blogAdmin, postController.remove);

module.exports = route;
