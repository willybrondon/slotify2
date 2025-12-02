const jwt = require("jsonwebtoken");

const Admin = require("../models/admin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization) {
      return res.status(403).json({ status: false, message: "Oops ! You are not Authorized" });
    }

    const decodeToken = await jwt.verify(Authorization, process?.env?.JWT_SECRET);

    if (!decodeToken || !decodeToken._id) {
      return res.status(403).json({ status: false, message: "Oops ! You are not Authorized" });
    }

    const admin = await Admin.findById(decodeToken._id);
    
    if (!admin) {
      return res.status(403).json({ status: false, message: "Oops ! You are not Authorized" });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.log("Admin middleware error:", error);
    // Handle JWT verification errors specifically
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(403).json({ status: false, message: "Oops ! You are not Authorized" });
    }
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
