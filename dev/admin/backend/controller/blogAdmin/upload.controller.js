exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(200).json({ status: false, message: "Image requise" });
    }
    const rel = String(req.file.path || "").replace(/\\/g, "/");
    const base = String(process.env.baseURL || "").replace(/\/?$/, "/");
    const url = base + rel;
    return res.status(200).json({ status: true, url, path: rel });
  } catch (error) {
    console.error("[blogAdmin.upload]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
