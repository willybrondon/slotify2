const Booking = require("../../models/booking.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");
const Notification = require("../../models/notification.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const Review = require("../../models/review.model");
const UserWalletHistory = require("../../models/userWalletHistory.model");

const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const moment = require("moment");
const mongoose = require("mongoose");

const admin = require("../../firebase");
const UString = require("../../models/uniqueString.model");

function getStatusFilter(status) {
  switch (status) {
    case "pending":
      return { status: { $in: ["pending", "confirm"] } };
    case "ALL":
      return {};
    default:
      return { status };
  }
}

exports.bookingForExpert = async (req, res) => {
  try {
    if (!req?.query?.expertId || !req?.query?.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const status = req.query.status.trim().toString();

    if (status && status !== "cancel" && status !== "completed" && status !== "pending") {
      return res.status(200).send({ status: false, message: "Invalid Booking Type" });
    }

    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert Not Found" });
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const pipeline = [
      { $match: { expertId: expert._id } },
      { $match: getStatusFilter(status) },
      { $sort: { date: -1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          as: "expert",
        },
      },
      { $unwind: "$expert" },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "service.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, fname: 1, lname: 1, image: 1 },
          expert: { _id: 1, fname: 1, lname: 1, image: 1 },
          service: 1,
          category: { _id: 1, name: 1, image: 1 },
          date: 1,
          time: 1,
          bookingId: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          expertEarning: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const bookings = await Booking.aggregate(pipeline);

    return res.status(200).send({ status: true, message: "Success", data: bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.bookingTypeStatusWiseForExpert = async (req, res) => {
  try {
    let type = req?.query?.type;
    let status = req?.query?.status;

    if (type && type !== "Today" && type !== "Yesterday" && type !== "Week" && type !== "Month") {
      return res.status(200).send({ status: false, message: " Type" });
    }

    if (status && status !== "ALL" && status !== "cancel" && status !== "confirm" && status !== "completed" && status !== "pending") {
      return res.status(200).send({ status: false, message: "Invalid Booking Status" });
    }

    if (!req?.query?.expertId || !status || !type) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const expertId = new mongoose.Types.ObjectId(req?.query?.expertId);

    let dateFilterQuery = {};

    if (type === "Today") {
      const startOfDay = moment().startOf("day");
      const endOfDay = moment().endOf("day");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Yesterday") {
      const startOfDay = moment().startOf("day").subtract(1, "days");
      const endOfDay = moment().endOf("day").subtract(1, "days");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Week") {
      const startOfDay = moment().startOf("week");
      const endOfDay = moment().endOf("week");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Month") {
      const startOfDay = moment().startOf("month");
      const endOfDay = moment().endOf("month");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else {
      return res.status(200).send({ status: false, message: "Invalid Status" });
    }

    let statusQuery = {};

    if (status === "ALL") {
      statusQuery = { $in: ["pending", "confirm", "completed", "cancel"] };
    } else if (status == "pending") {
      statusQuery = "pending";
    } else if (status == "confirm") {
      statusQuery = "confirm";
    } else if (status == "completed") {
      statusQuery = "completed";
    } else if (status == "cancel") {
      statusQuery = "cancel";
    } else {
      return res.status(200).send({ status: false, message: "Invalid Type" });
    }

    const [expert, bookings, reviews] = await Promise.all([
      Expert.findOne({
        _id: expertId,
        isDelete: false,
      }),
      Booking.aggregate([
        {
          $match: {
            expertId: expertId,
            $or: [{ status: statusQuery }, { status: { $eq: statusQuery } }],
          },
        },
        {
          $addFields: {
            analytic: { $toDate: "$date" },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $lookup: {
            from: "experts",
            localField: "expertId",
            foreignField: "_id",
            as: "expert",
          },
        },

        {
          $unwind: "$expert",
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },

        {
          $lookup: {
            from: "categories",
            localField: "service.categoryId",
            foreignField: "_id",
            as: "category",
          },
        },

        {
          $project: {
            _id: 1,
            status: 1,
            // expertId: 1,
            service: "$service.name",
            serviceImage: "$service.image",
            userLname: "$user.lname",
            userFname: "$user.fname",
            expertEarning: 1,
            cancel: 1,
            date: 1,
            startTime: 1,
            date: 1,
            amount: 1,
            withoutTax: 1,
            bookingId: 1,
            checkInTime: 1,
            checkOutTime: 1,
            isReviewed: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { date: -1, startTime: 1 },
        },
      ]),
      Review.find({ expertId: expertId }).populate({
        path: "userId",
        select: "fname lname",
      }),
    ]);

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert Not found" });
    }

    return res.status(200).send({ status: true, message: "Success", data: bookings, reviews: reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error!!" });
  }
};

exports.cancelConfirmBooking = async (req, res) => {
  try {
    let payload;
    const status = req?.body?.status;
    const date = moment().format("YYYY-MM-DD");

    if (!req?.body?.bookingId || !status) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }
    const booking = await Booking.findById(req?.body?.bookingId).populate("serviceId");
    if (!booking) {
      return res.status(200).send({ status: false, message: "data not found" });
    }

    const [user, expert] = await Promise.all([User.findById(booking.userId), Expert.findById(booking.expertId)]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not found Of this booking" });
    }

    const notification = new Notification();
    const adminPromise = await admin;
    if (status !== "confirm" && status !== "cancel") {
      return res.status(200).send({ status: false, message: "Invalid Booking Status" });
    }

    if (status == "confirm") {
      if (booking.date != date) {
        return res.status(200).send({ status: false, message: "CheckIn only On booked date" });
      } else {
        booking.checkInTime = moment().format("hh:mm A");
        booking.status = "confirm";

        payload = {
          token: user.fcmToken,
          notification: {
            body: `Your Booking with Id ${booking.bookingId} is Starting Soon`,
            title: "Booking Confirm",
          },
        };
      }
    }

    if (status == "cancel") {
      if (!req.body.reason || !req.body.person) {
        return res.status(200).send({ status: false, message: "Add details to cancel Booking" });
      }

      if (booking.status == "confirm") {
        return res.status(200).send({ status: false, message: "User is already checked In" });
      }

      if (booking.status == "cancel") {
        return res.status(200).send({ status: false, message: "Booking is already cancel" });
      }

      payload = {
        token: user.fcmToken,
        notification: {
          body: `Your Booking with Id ${booking.bookingId}  is cancelled By Salon`,
          title: "Booking Cancel",
          image: booking.serviceId[0].image,
        },
      };

      booking.status = "cancel";
      booking.cancel.reason = req.body.reason;
      booking.cancel.time = moment().format("hh:mm A");
      booking.cancel.date = moment().format("YYYY-MM-DD");
      booking.cancel.person = "expert";

      await Promise.all([
        booking.save(),
        notification.save(),
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: booking.amount,
            },
          }
        ),
        UString.deleteMany({ bookingId: booking._id }),
        UserWalletHistory.findOneAndDelete({ booking: booking._id }),
      ]);
    }

    res.status(200).send({
      status: true,
      message: `Booking ${status} Successfully by expert`,
    });

    notification.userId = user._id;
    notification.title = payload.notification.title;
    notification.image = booking.serviceId[0].image;
    notification.notificationType = 0;
    notification.message = status == "confirm" ? payload.notification.body : payload.notification.body + " Reason : " + booking.cancel.reason;
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    await Promise.all([booking.save(), notification.save(), UString.deleteMany({ bookingId: booking._id })]);

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
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const bookingId = req?.query?.bookingId;
    if (!bookingId) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(200).send({ status: false, message: "data not found" });
    }

    const [user, expert, salon] = await Promise.all([User.findById(booking.userId), Expert.findById(booking.expertId), Salon.findOne({ _id: booking.salonId })]);

    console.log("Salon earning =============== ", salon.earning);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not found Of this booking" });
    }

    if (booking.paymentStatus == 0) {
      return res.status(200).send({
        status: false,
        message: "Client has Not Paid For The Service Yet",
      });
    }

    if (booking.status == "completed") {
      return res.status(200).send({ status: false, message: "Client has already checked out" });
    }

    if (booking.status != "confirm") {
      return res.status(200).send({ status: false, message: "Client has not been checked in yet" });
    }

    const currentTime = moment().format("hh:mm A");
    const currentDate = moment().format("YYYY-MM-DD");

    res.status(200).send({ status: true, message: "Success", booking });

    const [uniqueId1, uniqueI2] = await Promise.all([generateUniqueIdentifier(), generateUniqueIdentifier()]);

    await Promise.all([
      Expert.updateOne(
        { _id: expert._id },
        {
          $inc: {
            earning: parseInt(booking.expertEarning),
            bookingCount: 1,
            totalBookingCount: 1,
          },
        }
      ),
      Booking.updateOne(
        { _id: booking._id },
        {
          status: "completed",
          checkOutTime: currentTime,
        }
      ),
      Expert.updateOne(
        { _id: salon._id, earning: { $gt: 0 } },
        {
          $inc: {
            earning: booking.expertEarning,
          },
        }
      ),
      UString.deleteOne({ bookingId: booking._id }),
      Salon.findOneAndUpdate(
        { _id: salon._id, earning: { $gt: 0 } },
        {
          $inc: { earning: booking.salonEarning },
        },
        {
          new: true,
        }
      )
        .then((updatedSalon) => {
          console.log("Complete booking ============================", updatedSalon.earning);
        })
        .catch((err) => {
          console.error(err);
        }),
      SalonExpertWalletHistory.create({
        expert: expert._id,
        booking: booking._id,
        amount: booking.expertEarning,
        type: 1,
        date: currentDate,
        time: moment().format("HH:MM a"),
        uniqueId: uniqueId1,
      }),
      SalonExpertWalletHistory.create({
        salon: salon._id,
        booking: booking._id,
        amount: booking.salonEarning,
        type: 4,
        date: currentDate,
        time: moment().format("HH:MM a"),
        uniqueId: uniqueI2,
      }),
    ]);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.expertEarning = async (req, res) => {
  try {
    const { expertId, type, month } = req?.query;
    if (!expertId || !type) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const expert = await Expert.findOne({
      _id: req.query.expertId,
      isDelete: false,
    });
    if (!expert) {
      return res.status(200).send({ status: false, message: "expert not found" });
    }
    if (type === "Month" && !month) {
      return res.status(200).send({
        status: false,
        message: "month must be required for type Month.",
      });
    }

    let dateFilterQuery = {};
    if (type === "Today") {
      const startOfDay = moment().startOf("day");
      const endOfDay = moment().endOf("day");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Yesterday") {
      const startOfDay = moment().startOf("day").subtract(1, "days");
      const endOfDay = moment().endOf("day").subtract(1, "days");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Week") {
      const startOfDay = moment().startOf("week");
      const endOfDay = moment().endOf("week");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type === "Month" && month) {
      // const startOfDay = moment().startOf("month");
      // const endOfDay = moment().endOf("month");

      const startOfMonth = moment(month, "YYYY-MM").startOf("month");
      const endOfMonth = moment(month, "YYYY-MM").endOf("month");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) },
      };
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }

    const bookingAggregate = await Booking.aggregate([
      {
        $addFields: {
          analytic: { $toDate: "$date" },
        },
      },
      {
        $match: {
          expertId: expert._id,
          ...dateFilterQuery,
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "services",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "categories",
          localField: "services.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $facet: {
          pendingBooking: [
            {
              $match: { status: "pending" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                bookings: { $push: "$$ROOT" },
              },
            },
          ],
          completedBooking: [
            {
              $match: { status: "completed" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                amount: { $sum: "$expertEarning" },
                bookings: { $push: "$$ROOT" },
              },
            },
          ],
          cancelBooking: [
            {
              $match: { status: "cancel" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                bookings: { $push: "$$ROOT" },
              },
            },
          ],
        },
      },
    ]);

    const bookingStats = {
      amount: bookingAggregate[0]?.completedBooking[0]?.amount || 0,
      pendingBooking: bookingAggregate[0]?.pendingBooking[0]?.total || 0,
      completedBooking: bookingAggregate[0]?.completedBooking[0]?.total || 0,
      cancelBooking: bookingAggregate[0]?.cancelBooking[0]?.total || 0,
      pendingBookingsArray: bookingAggregate[0]?.pendingBooking[0]?.bookings || [],
      completedBookingsArray: bookingAggregate[0]?.completedBooking[0]?.bookings || [],
      cancelledBookingsArray: bookingAggregate[0]?.cancelBooking[0]?.bookings || [],
    };

    return res.status(200).send({ status: true, message: "Success", bookingStats });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
