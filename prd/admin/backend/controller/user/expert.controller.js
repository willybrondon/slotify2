const Expert = require("../../models/expert.model");
const Notification = require("../../models/notification.model");
const mongoose = require("mongoose");
const BusyExpert = require("../../models/busyExpert.model");
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const Setting = require("../../models/setting.model");
const fs = require("fs");
const { deleteFile } = require("../../middleware/deleteFile");
const admin = require('../../firebase')


// Expert Side Apis
exports.expertLogin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details" });
    }

    const expert = await Expert.findOne({
      email: req.body.email,
      password: req.body.password,
      isDelete: false,
    });
    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "expert not found" });
    }

    if (expert.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "You are blocked by admin!!" });
    }

    expert.fcmToken = req?.body?.fcmToken
      ? req?.body?.fcmToken
      : expert?.fcmToken;

    await expert.save();
    return res.status(200).json({
      status: true,
      message: "finally, Expert login Successfully!!",
      expert: expert,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server error",
    });
  }
};

exports.getExpertProfile = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

  

    const [tax, expert] = await Promise.all([
      Setting.findOne().select("tax"),
      Expert.findById(req.query.expertId).populate({
        path: "serviceId",
        match: { status: true, isDelete: false },
      })
        .populate("salonId", "name addressDetails ")
        .select("-password -isDelete -isBlock  -isAvailable ")
    ])

    if (!tax) {
      return res
        .status(200)
        .send({ status: false, message: "setting does not found." });
    }

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "expert not found" });
    }

    if (expert.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "You are blocked by admin!!" });
    }

    return res.status(200).json({
      status: true,
      message: "Data found",
      tax: tax,
      data: expert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateExpert = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      if (req.files) deleteFile(req.files.image[0]);
      return res
        .status(200)
        .send({ status: false, message: "Expert not found" });
    }

    // Update expert properties based on request data
    expert.fname = req.body.fname ? req.body.fname : expert.fname;
    expert.lname = req.body.lname ? req.body.lname : expert.lname;
    expert.email = req.body.email ? req.body.email : expert.email;
    expert.mobile = req.body.mobile ? req.body.mobile : expert.mobile;
    expert.age = req.body.age ? req.body.age : expert.age;
    expert.gender = req.body.gender ? req.body.gender : expert.gender;

    expert.upiId = req.body.upiId || expert.upiId;
    expert.bankDetails.bankName =
      req.body.bankName || expert.bankDetails.bankName;
    expert.bankDetails.accountNumber =
      req.body.accountNumber || expert.bankDetails.accountNumber;
    expert.bankDetails.IFSCCode =
      req.body.IFSCCode || expert.bankDetails.IFSCCode;
    expert.bankDetails.branchName =
      req.body.branchName || expert.bankDetails.branchName;
    // // Update serviceId if provided in the request
    if (req.body.serviceId) {
      let service = Array.isArray(req.body.serviceId)
        ? req.body.serviceId
        : [req.body.serviceId];

      const serviceIdArray = service[0].split(",");
      expert.serviceId = serviceIdArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Update the expert's image if a new file is uploaded
    if (req.file) {
      var image_ = expert.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }
      expert.image = req.file
        ? process.env.baseURL + req.file.path
        : expert.image;
    }

    await expert.save();

    // Populate the updated expert data
    const data = await Expert.findById(expert._id).populate("serviceId");

    return res
      .status(200)
      .send({ status: true, message: "Updated successfully", expert: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.busyExpert = async (req, res) => {
  try {
    const expertId = req.query.expertId;
    const { date, time } = req.body;

    // Check if required parameters are provided
    if (!expertId || !date || !time) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    }

    const [expert, existingBusyExpert] = await Promise.all([
      Expert.findOne({ _id: expertId }),
      BusyExpert.findOne({ expertId, date }),
    ]);

    if (!expert) {
      return res
        .status(200)
        .json({ status: false, message: "Expert not found" });
    }

    const timeArray = time.split(",").map((trimmedTime) => trimmedTime.trim());

    let newBusyExpert;
    if (existingBusyExpert) {
      existingBusyExpert.time.push(...timeArray);
      await existingBusyExpert.save();
    } else {
      newBusyExpert = new BusyExpert({ expertId, date, time: timeArray });
      await newBusyExpert.save();
    }

    return res.status(200).json({
      status: true,
      message: "Busy schedule updated successfully",
      expert: existingBusyExpert ? existingBusyExpert : newBusyExpert,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

exports.selectPaymentMethod = async (req, res) => {
  try {
    if (!req?.query.expertId || !req.query.paymentType) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }

    const expert = await Expert.findById(req?.query.expertId);
    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert Not Found" });
    }

    expert.paymentType = req.query.paymentType;

    await expert.save();
    return res.status(200).send({ status: true, message: "Success", expert });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.payForCashAfterService = async (req, res) => {
  try {
    const bookingId = req?.query?.bookingId;
    if (!bookingId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(200).send({ status: false, message: "data not found" });
    }

    const [user, expert] = await Promise.all([
      User.findById(booking.userId),
      Expert.findById(booking.expertId),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert not found Of this booking" });
    }

    if (booking.paymentStatus == 1) {
      return res.status(200).send({
        status: false,
        message: "Client has Already Paid For The Service ",
      });
    } else if (booking.paymentStatus == 0) {
      booking.paymentStatus = 1;

      payload = {
        token: user.fcmToken,
        notification: {
          body: `Your payment is successful for the booking with bookingId ${booking.bookingId} `,
          title: "Payment Successful",
          image: booking.serviceId[0].image,
        },
      };
      console.log("payload", payload);
      const notification = new Notification();

      notification.userId = user._id;
      notification.title = payload.notification.title;
      notification.image = booking.serviceId[0].image;
      notification.notificationType = 0;
      notification.message = payload.notification.body;
      notification.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      const adminPromise = await admin
      if (user && user.fcmToken !== null) {
        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }

      await booking.save();
      return res.status(200).send({
        status: true,
        message: "Client  Paid For The Service Successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};
