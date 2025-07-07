// JWT Token
const jwt = require("jsonwebtoken");

// Admin
const Salon = require("../models/salon.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization) {
      return res
        .status(403)
        .json({ status: false, message: "Oops ! You are not Authorized" });
    }
    const decodeToken = await jwt.verify(
      Authorization,
      process?.env?.JWT_SECRET
    );

    const salon = await Salon.findById(decodeToken.salon._id);
    req.salon = salon;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};
