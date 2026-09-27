const Cryptr = require("cryptr");
const BlogAdmin = require("../../models/blogAdmin.model");

const cryptr = new Cryptr("myTotallySecretKey", {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

exports.list = async (req, res) => {
  try {
    const authors = await BlogAdmin.find({ isDelete: false })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ status: true, authors });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const name = String(req.body.name || "").trim();
    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Email et mot de passe requis." });
    }
    const exists = await BlogAdmin.findOne({ email, isDelete: false });
    if (exists) {
      return res.status(200).json({ status: false, message: "Cet email existe déjà." });
    }
    const author = await BlogAdmin.create({
      name: name || email.split("@")[0],
      email,
      password: cryptr.encrypt(password),
      bio: String(req.body.bio || "").trim(),
      isActive: req.body.isActive !== false && req.body.isActive !== "false",
    });
    const safe = author.toObject();
    delete safe.password;
    return res.status(201).json({ status: true, author: safe });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const author = await BlogAdmin.findById(req.params.id);
    if (!author || author.isDelete) {
      return res.status(404).json({ status: false, message: "Auteur introuvable" });
    }
    if (req.body.name != null) author.name = String(req.body.name).trim();
    if (req.body.bio != null) author.bio = String(req.body.bio).trim();
    if (req.body.isActive != null) {
      author.isActive = req.body.isActive === true || req.body.isActive === "true";
    }
    if (req.body.password && String(req.body.password).trim()) {
      author.password = cryptr.encrypt(String(req.body.password).trim());
    }
    if (req.body.email != null) {
      const email = String(req.body.email).trim().toLowerCase();
      const clash = await BlogAdmin.findOne({
        email,
        isDelete: false,
        _id: { $ne: author._id },
      });
      if (clash) {
        return res.status(200).json({ status: false, message: "Email déjà utilisé." });
      }
      author.email = email;
    }
    await author.save();
    const safe = author.toObject();
    delete safe.password;
    return res.status(200).json({ status: true, author: safe });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const author = await BlogAdmin.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ status: false, message: "Auteur introuvable" });
    }
    author.isDelete = true;
    author.isActive = false;
    await author.save();
    return res.status(200).json({ status: true, message: "Auteur désactivé" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
