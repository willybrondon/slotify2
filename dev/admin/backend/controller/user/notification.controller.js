const Notification = require("../../models/notification.model");
const mongoose = require("mongoose");

exports.getNotificationForUser = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res?.status(200).send({ status: false, message: "Invalid details" });
    }

    const notification = await Notification.find({ userId: req.query.userId });
    return res.status(200).json({
      status: true,
      message: "Success",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Delete notification by ID
exports.deleteNotification = async (req, res) => {
  try {
    if (!req?.query?.notificationId || !req?.query?.userId) {
      return res?.status(200).send({ status: false, message: "notificationId and userId are required" });
    }

    const notificationId = new mongoose.Types.ObjectId(req.query.notificationId);
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const notification = await Notification.findOne({ _id: notificationId, userId: userId });

    if (!notification) {
      return res.status(200).json({
        status: false,
        message: "Notification not found or you don't have permission to delete it",
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
