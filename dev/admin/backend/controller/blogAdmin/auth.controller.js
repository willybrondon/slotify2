const jwt = require("jsonwebtoken");
const Cryptr = require("cryptr");
const BlogAdmin = require("../../models/blogAdmin.model");

const cryptr = new Cryptr("myTotallySecretKey", {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Email et mot de passe requis." });
    }

    const author = await BlogAdmin.findOne({ email, isDelete: false });
    if (!author) {
      return res.status(200).json({ status: false, message: "Compte introuvable. Contactez l'admin." });
    }
    if (!author.isActive) {
      return res.status(200).json({ status: false, message: "Compte désactivé." });
    }

    let ok = false;
    try {
      ok = cryptr.decrypt(author.password) === password;
    } catch (_) {
      ok = author.password === password;
    }
    if (!ok) {
      return res.status(200).json({ status: false, message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      {
        blogAdmin: {
          _id: author._id,
          email: author.email,
          name: author.name,
        },
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      status: true,
      message: "Connexion réussie",
      token,
      apiKey: process.env.secretKey,
      author: {
        id: author._id,
        name: author.name,
        email: author.email,
        bio: author.bio,
        avatar: author.avatar,
      },
    });
  } catch (error) {
    console.error("[blogAdmin.login]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const a = req.blogAdmin;
    return res.status(200).json({
      status: true,
      author: {
        id: a._id,
        name: a.name,
        email: a.email,
        bio: a.bio,
        avatar: a.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
