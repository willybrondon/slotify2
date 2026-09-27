const jwt = require("jsonwebtoken");
const BlogAdmin = require("../models/blogAdmin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");
    if (!Authorization) {
      return res
        .status(403)
        .json({ status: false, message: "Oops ! You are not Authorized" });
    }

    let decodeToken;
    try {
      decodeToken = jwt.verify(Authorization, process?.env?.JWT_SECRET);
    } catch (e) {
      return res.status(403).json({
        status: false,
        message: "Session expired. Please log in again.",
        code: "E_UNAUTHORIZED",
      });
    }

    const id =
      decodeToken?.blogAdmin?._id ||
      decodeToken?.blogAdmin?.id ||
      decodeToken?.blogAdminId ||
      null;

    if (!id) {
      return res.status(403).json({
        status: false,
        message: "Invalid session. Please log in again.",
        code: "E_UNAUTHORIZED",
      });
    }

    const blogAdmin = await BlogAdmin.findById(id);
    if (!blogAdmin || blogAdmin.isDelete || !blogAdmin.isActive) {
      return res.status(403).json({
        status: false,
        message: "Blog author not found or inactive",
      });
    }

    req.blogAdmin = blogAdmin;
    next();
  } catch (error) {
    console.error("[blogAdmin middleware]", error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
