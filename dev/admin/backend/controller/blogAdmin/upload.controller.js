const path = require("path");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(200).json({ status: false, message: "Image requise" });
    }
    // Always expose a web path under /storage — never absolute disk paths
    const filename = path.basename(req.file.filename || req.file.path || "");
    if (!filename) {
      return res.status(200).json({ status: false, message: "Fichier invalide" });
    }
    const rel = `storage/${filename}`;
    const base = String(process.env.baseURL || "").replace(/\/?$/, "/");
    const url = base + rel;
    return res.status(200).json({ status: true, url, path: rel });
  } catch (error) {
    console.error("[blogAdmin.upload]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
