const Notification = require("../../models/notification.model");

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
