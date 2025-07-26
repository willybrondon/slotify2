const Booking = require("../../models/booking.model");
const Expert = require("../../models/expert.model");
const User = require("../../models/user.model");
const Complain = require("../../models/complain.model");
const Salon = require("../../models/salon.model");

const admin = require("../../firebase");

exports.raiseComplain = async (req, res) => {
  try {
    if (!req.body.details || !req.body.bookingId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    if (!req.body.userId && !req.body.expertId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    const user = await User.findById(req.body.userId);

    if (req.body.userId) {
      if (!user) {
        return res.status(200).send({ status: false, message: "User Not Found!!" });
      }
    }

    const expert = await Expert.findById(req.body.expertId);
    if (req.body.expertId && !expert) {
      return res.status(200).send({ status: false, message: "Expert Not Found!!" });
    }

    const booking = await Booking.findOne({ bookingId: req.body.bookingId });
    if (!booking) {
      return res.status(200).send({ status: false, message: "Booking Not Found!!" });
    }

    const salon = await Salon.findOne({ _id: booking.salonId });
    if (!salon) {
      return res.status(200).send({ status: false, message: "salon Not Found!!" });
    }

    let payload;
    let complain = new Complain();
    if (req.body.expertId) {
      complain.expertId = expert._id;
      complain.person = 0;
    }

    if (req.body.userId) {
      complain.userId = user._id;
      complain.person = 1;

      payload = {
        token: user?.fcmToken,
        notification: {
          body: `Dear ${user?.fname ? user?.fname + " " + user?.lname : "Salon User"} Your Complain for Booking Id ${
            booking.bookingId
          } is raise Successfully.Your feedback is crucial, and we're here to assist you.Thank you`,
          title: "Booking Completed",
        },
      };
    }

    complain.details = req.body.details;
    complain.bookingData = booking._id;
    complain.bookingId = req.body.bookingId;
    await complain.save();

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

    return res.status(200).send({
      status: true,
      message: "Your Complain Have Been Raised Successfully",
      complain,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;
    const type = req.query.type;
    const person = req.query.person;
    let query = {};

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

    console.log("query+++++++++++++++++++", result);

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

    complain.solvedDate = new Date().toLocaleString();

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

    if (user.fcmToken !== null) {
      admin
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

exports.getComplainForUserOrExpert = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.expertId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    let complain;
    if (req.query.userId) {
      const user = await User.findById(req.query.userId);
      if (!user) {
        return res.status(200).send({ status: false, message: "User Not Found!!" });
      }

      complain = await Complain.find({ userId: user._id });
    }
    if (req.query.expertId) {
      const expert = await Expert.findById(req.query.expertId);
      if (!expert) {
        return res.status(200).send({ status: false, message: "Expert Not Found!!" });
      }

      complain = await Complain.find({ expertId: expert._id });
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
