const WithdrawMethod = require("../../models/withdrawMethod.model");

//get Withdraw method
exports.getWithdrawMethodsBySalon = async (req, res) => {
  try {
    const withdrawMethods = await WithdrawMethod.find({ isEnabled: true }).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Retrive Withdraw methods.", data: withdrawMethods });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
