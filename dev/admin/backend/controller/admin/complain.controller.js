const Expert = require("../../models/expert.model");
const User = require("../../models/user.model");
const Complain = require("../../models/complain.model");
const moment = require("moment");
const admin = require("../../firebase.js");

exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;
    const type = req.query.type;
    const person = req.query.person;
    let query = {};
    if (type != 1 && type != 0 && type != 2) {
      return res.status(200).send({ status: false, message: "Invalid Type" });
    }
    if (person != 1 && person != 0 && person != 2) {
      return res.status(200).send({ status: false, message: "Invalid Complain Person" });
    }
    if (type == 0 && person == 0) {
      query = { type: 0, person: 0 };
    } else if (type == 1 && person == 0) {
      query = { type: 1, person: 0 };
    } else if (type == 2 && person == 0) {
      query = { person: 0 };
    } else if (type == 0 && person == 1) {
      query = { type: 0, person: 1 };
    } else if (type == 1 && person == 1) {
      query = { type: 1, person: 1 };
    } else if (type == 2 && person == 1) {
      query = { person: 1 };
    }

    const result = await Complain.find(query).populate("expertId userId bookingData").sort({ createdAt: -1 }).skip(skipAmount).limit(limit).exec();

    const total = await Complain.countDocuments(query);

    return res.status(200).send({ status: true, message: "success", total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.solveComplain = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    const complain = await Complain.findById(req.query.id);
    if (!complain) {
      return res.status(200).send({ status: false, message: "No Complain Found!!" });
    }
    if (complain.type == 1) {
      return res.status(200).send({ status: false, message: "Complain is already Solved!" });
    }
    complain.type = 1;

    complain.solvedDate = moment().format("YYYY-MM-DD");

    complain.save();
    let user = complain.userId ? await User.findById(complain.userId) : await Expert.findById(complain.expertId);

    if (complain.userId && !user) {
      console.log("User Not Found");
    }
    if (complain.expertId && !user) {
      console.log("expert Not Found");
    }
    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Dear ${user?.fname ? user?.fname + " " + user?.lname : "Salon "} Your Complain is Solve Successfully.Your feedback is crucial, and we're here to assist you.Thank you`,
        title: "Complain Solved",
      },
    };

    const adminPromise = await admin;
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
    return res.status(200).send({ status: true, message: "success", complain });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
