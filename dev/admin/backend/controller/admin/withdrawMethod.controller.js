const WithdrawMethod = require("../../models/withdrawMethod.model");

//fs
const fs = require("fs");

//deletefile
const { deleteFile } = require("../../middleware/deleteFile");

//store Withdraw
exports.store = async (req, res) => {
  try {
    if (!req?.body?.name || !req?.body?.details || !req?.file) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const withdrawMethod = new WithdrawMethod();
    withdrawMethod.name = req?.body?.name;
    withdrawMethod.details = req?.body?.details?.split(",");
    withdrawMethod.image = req.file ? req.file.path : "";
    await withdrawMethod.save();

    return res.status(200).json({
      status: true,
      message: "Withdraw method created by the admin.",
      data: withdrawMethod,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update Withdraw
exports.update = async (req, res) => {
  try {
    if (!req.query.withdrawMethodId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const withdrawMethod = await WithdrawMethod.findById(req.query.withdrawMethodId);
    if (!withdrawMethod) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Withdraw method does not found." });
    }

    if (req?.file) {
      const image = withdrawMethod?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      withdrawMethod.image = req.file ? req.file.path : withdrawMethod.image;
    }

    withdrawMethod.name = req?.body?.name ? req?.body?.name : withdrawMethod.name;
    withdrawMethod.details = req?.body?.details?.toString() ? req?.body?.details?.toString().split(",") : withdrawMethod.details;
    await withdrawMethod.save();

    return res.status(200).json({
      status: true,
      message: "Withdraw method updated by the admin.",
      data: withdrawMethod,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get Withdraw
exports.getMethods = async (req, res) => {
  try {
    const withdraw = await WithdrawMethod.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Retrive Withdraw methods.", data: withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete Withdraw
exports.delete = async (req, res) => {
  try {
    if (!req.query.withdrawMethodId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const withdrawMethod = await WithdrawMethod.findById(req.query.withdrawMethodId);
    if (!withdrawMethod) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Withdraw method does not found." });
    }

    const image = withdrawMethod?.image?.split("storage");
    if (image) {
      if (fs.existsSync("storage" + image[1])) {
        fs.unlinkSync("storage" + image[1]);
      }
    }

    await withdrawMethod.deleteOne();

    return res.status(200).json({ status: true, message: "Withdraw method deleted by the admin." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle isActive switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.withdrawMethodId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const withdrawMethod = await WithdrawMethod.findById(req.query.withdrawMethodId);
    if (!withdrawMethod) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Withdraw method does not found." });
    }

    withdrawMethod.isEnabled = !withdrawMethod.isEnabled;
    await withdrawMethod.save();

    return res.status(200).json({ status: true, message: "Success", data: withdrawMethod });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
