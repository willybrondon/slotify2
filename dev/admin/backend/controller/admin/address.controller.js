const Address = require("../../models/address.model");

//import model
const User = require("../../models/user.model");

exports.getAllAddress = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required." });
    }

    const userId = req.query.userId;

    const [user, address] = await Promise.all([User.findOne({ _id: userId }), Address.find({ userId: userId }).populate("userId", "firstName lastName").sort({ createdAt: -1 })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive addresses for this user.",
      address: address.length > 0 ? address : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
