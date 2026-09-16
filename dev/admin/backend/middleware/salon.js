const jwt = require("jsonwebtoken");

const Salon = require("../models/salon.model");

/**
 * Resolve salon id from various JWT payload shapes (legacy + current).
 */
function salonIdFromToken(decodeToken) {
  if (!decodeToken) return null;
  if (decodeToken.salon?._id) return decodeToken.salon._id;
  if (decodeToken.salon?.id) return decodeToken.salon.id;
  if (decodeToken.salonId) return decodeToken.salonId;
  if (decodeToken._id) return decodeToken._id;
  if (decodeToken.id) return decodeToken.id;
  return null;
}

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

    const salonId = salonIdFromToken(decodeToken);
    if (!salonId) {
      return res.status(403).json({
        status: false,
        message: "Invalid session. Please log in again.",
        code: "E_UNAUTHORIZED",
      });
    }

    const salon = await Salon.findById(salonId);
    if (!salon || salon.isDelete) {
      return res
        .status(403)
        .json({ status: false, message: "Salon not found or inactive" });
    }
    req.salon = salon;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
