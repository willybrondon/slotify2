const Notification = require("../../models/notification.model");
const User = require("../../models/user.model");
const Expert = require("../../models/expert.model");

const admin = require("../../firebase");

exports.particularUserNotification = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Oops! Invalid details!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User does not exist" });
    }

    const payload = {
      token: user.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    const notification = new Notification();

    notification.userId = user._id;
    notification.title = req.body.title;
    notification.image = req.file ? process?.env?.baseURL + req.file.path : "";
    notification.message = req.body.message;
    notification.notificationType = 0;
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    await notification.save();

    if (user && user.fcmToken !== null) {
      try {
        const adminPromise = await admin;
        console.log("admin---------------", admin);
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.particularExpertNotification = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert does not exist" });
    }

    if (!req.body.message || !req.body.title) {
      return res.status(200).send({
        status: false,
        message: "Missing message or title in the request body.",
      });
    }

    const payload = {
      token: expert.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    console.log("payload", payload);
    const notification = new Notification();

    notification.expertId = expert._id;
    notification.title = req.body.title;
    notification.image = req.file ? process?.env?.baseURL + req.file.path : "";
    notification.message = req.body.message;
    notification.notificationType = 1;
    notification.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await notification.save();
    const adminPromise = await admin;
    if (expert && expert.fcmToken !== null) {
      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully sent message",
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

exports.allUserNotification = async (req, res) => {
  try {
    const userId = await User.find({
      isDelete: false,
      isBlock: false,
    }).distinct("_id");

    await userId.map(async (data) => {
      const notification = new Notification();

      notification.userId = data._id;
      notification.title = req.body.title;
      notification.message = req.body.message;
      notification.image = req.file ? process.env.baseURL + req.file.path : "";
      notification.notificationType = 0;
      notification.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      await notification.save();
    });
    const userFCM = await User.find({
      isBlock: false,
      isBlock: false,
    }).distinct("fcmToken");

    const payload = {
      tokens: userFCM,
      notification: {
        title: req.body.title,
        body: req.body.message,
      },
    };

    const adminPromise = await admin;

    adminPromise
      .messaging()
      .sendEachForMulticast(payload)
      .then(async (response) => {
        console.log("Successfully sent with response: ", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
