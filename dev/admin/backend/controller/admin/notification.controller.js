const Notification = require("../../models/notification.model");
const User = require("../../models/user.model");
const Expert = require("../../models/expert.model");

const admin = require("../../firebase");
const { sendSMS } = require("../../services/sms.service");

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

    // Send SMS notification to customer's mobile number
    if (user && user.mobile && user.mobile.trim() !== "") {
      try {
        const smsMessage = `${req.body.title}\n\n${req.body.message}`;
        const smsResult = await sendSMS(user.mobile, smsMessage);
        
        if (smsResult.success) {
          console.log(`[Notification] SMS sent successfully to ${user.mobile} for user ${user._id}`);
        } else {
          console.error(`[Notification] Failed to send SMS to ${user.mobile} for user ${user._id}: ${smsResult.error}`);
        }
      } catch (error) {
        console.error(`[Notification] Error sending SMS to ${user.mobile} for user ${user._id}:`, error.message);
        // Don't fail the request if SMS fails, just log the error
      }
    } else {
      console.log(`[Notification] User ${user?._id || req.query.userId} does not have a mobile number. Skipping SMS notification.`);
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

    // Send SMS notifications to all users with mobile numbers
    try {
      const usersWithMobile = await User.find({
        isDelete: false,
        isBlock: false,
        mobile: { $exists: true, $ne: null, $ne: "" }
      }).select("_id mobile");

      const smsMessage = `${req.body.title}\n\n${req.body.message}`;
      let smsSuccessCount = 0;
      let smsFailureCount = 0;

      // Send SMS to each user (with a small delay to avoid rate limiting)
      for (const user of usersWithMobile) {
        if (user.mobile && user.mobile.trim() !== "") {
          try {
            const smsResult = await sendSMS(user.mobile, smsMessage);
            if (smsResult.success) {
              smsSuccessCount++;
              console.log(`[Notification] SMS sent successfully to ${user.mobile} for user ${user._id}`);
            } else {
              smsFailureCount++;
              console.error(`[Notification] Failed to send SMS to ${user.mobile} for user ${user._id}: ${smsResult.error}`);
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            smsFailureCount++;
            console.error(`[Notification] Error sending SMS to ${user.mobile} for user ${user._id}:`, error.message);
          }
        }
      }

      console.log(`[Notification] SMS summary: ${smsSuccessCount} sent successfully, ${smsFailureCount} failed out of ${usersWithMobile.length} users`);
    } catch (error) {
      console.error("[Notification] Error processing SMS notifications for all users:", error.message);
      // Don't fail the request if SMS fails, just log the error
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
