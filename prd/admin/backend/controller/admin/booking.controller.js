const Service = require("../../models/service.model");
const Booking = require("../../models/booking.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");

const User = require("../../models/user.model");
const moment = require("moment");

const Notification = require("../../models/notification.model");
const UString = require("../../models/uniqueString.model");

const admin = require("../../firebase");
exports.getUserBookings = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User not exist" });
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    let statusFilter = {};
    const type = req?.query?.type || "ALL";
    if (
      type &&
      type !== "ALL" &&
      type !== "cancel" &&
      type !== "confirm" &&
      type !== "completed" &&
      type !== "pending"
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Booking Type" });
    }

    if (type && type !== "ALL") {
      statusFilter = { status: type };
    }
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const bookings = await Booking.aggregate([
      {
        $match: { userId: user._id, ...statusFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                image: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: { $concat: ["$fname", " ", "$lname"] },
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $project: {
          user: 1,
          services: 1,
          date: 1,
          time: 1,
          bookingId: 1,
          createdAt: 1,
          status: 1,
          amount: 1,
          duration: 1,
          commission: 1,
          expert: 1,
          expertEarning: 1,
          salon: 1,
          amount: 1,
          platformFee: 1,
          cancel: 1,
          checkOutTime: 1,
          checkInTime: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ]);

    const pipeline = [
      {
        $match: { userId: user._id, ...statusFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                image: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: { $concat: ["$fname", " ", "$lname"] },
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $project: {
          user: 1,
          services: 1,
          date: 1,
          time: 1,
          bookingId: 1,
          createdAt: 1,
          status: 1,
          amount: 1,
          duration: 1,
          commission: 1,
          expert: 1,
          expertEarning: 1,
          salon: 1,
          amount: 1,
          platformFee: 1,
          cancel: 1,
          checkOutTime: 1,
          checkInTime: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];

    const total = await Booking.countDocuments({
      userId: user._id,
      ...statusFilter,
      ...dateFilter,
    });

    const stats = await Booking.aggregate([
      {
        $match: { userId: user._id, ...statusFilter, ...dateFilter },
      },
      {
        $group: {
          _id: null,
          totalExpertEarning: { $sum: "$expertEarning" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalSalonCommission: { $sum: "$salonCommission" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    return res.status(200).json({
      status: true,
      message: "Bookings Found Successfully",
      total,
      services: bookings,
      stats: stats[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    let statusFilter = {};
    const type = req?.query?.type || "ALL";
    if (
      type &&
      type !== "ALL" &&
      type !== "cancel" &&
      type !== "confirm" &&
      type !== "completed" &&
      type !== "pending"
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Booking Type" });
    }

    if (type && type !== "ALL") {
      statusFilter = { status: type };
    }
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: { ...statusFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                image: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: { $concat: ["$fname", " ", "$lname"] },
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $project: {
          user: 1,
          services: 1,
          date: 1,
          time: 1,
          bookingId: 1,
          createdAt: 1,
          status: 1,
          duration: 1,
          commission: 1,
          expert: 1,
          expertEarning: 1,
          salon: 1,
          amount: 1,
          platformFee: 1,
          cancel: 1,
          checkOutTime: 1,
          checkInTime: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];
    const [bookings, total, stats] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.countDocuments({ ...statusFilter, ...dateFilter }),
      Booking.aggregate([
        {
          $match: { ...statusFilter, ...dateFilter },
        },
        {
          $group: {
            _id: null,
            totalExpertEarning: { $sum: "$expertEarning" },
            totalPlatformFee: { $sum: "$platformFee" },
            totalSalonCommission: { $sum: "$salonCommission" },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Bookings Found Successfully",
      total,
      services: bookings,
      stats: stats[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertBookings = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert not exist" });
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    let statusFilter = {};
    const type = req?.query?.type || "ALL";
    if (
      type &&
      type !== "ALL" &&
      type !== "cancel" &&
      type !== "confirm" &&
      type !== "completed" &&
      type !== "pending"
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Booking Type" });
    }

    if (type && type !== "ALL") {
      statusFilter = { status: type };
    }
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: { expertId: expert._id, ...statusFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                image: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: { $concat: ["$fname", " ", "$lname"] },
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $project: {
          user: 1,
          services: 1,
          date: 1,
          time: 1,
          bookingId: 1,
          createdAt: 1,
          status: 1,
          amount: 1,
          duration: 1,
          commission: 1,
          expert: 1,
          expertEarning: 1,
          salon: 1,
          amount: 1,
          platformFee: 1,
          cancel: 1,
          checkOutTime: 1,
          checkInTime: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];

    const [bookings, total, stats] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.countDocuments({
        expertId: expert._id,
        ...statusFilter,
        ...dateFilter,
      }),
      Booking.aggregate([
        {
          $match: { expertId: expert._id, ...statusFilter, ...dateFilter },
        },
        {
          $group: {
            _id: null,
            totalExpertEarning: { $sum: "$expertEarning" },
            totalPlatformFee: { $sum: "$platformFee" },
            totalSalonCommission: { $sum: "$salonCommission" },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Bookings Found Successfully",
      total,
      services: bookings,
      stats: stats[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getSalonBookings = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    let statusFilter = {};
    const type = req?.query?.type || "ALL";
    if (
      type &&
      type !== "ALL" &&
      type !== "cancel" &&
      type !== "confirm" &&
      type !== "completed" &&
      type !== "pending"
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Booking Type" });
    }

    if (type && type !== "ALL") {
      statusFilter = { status: type };
    }
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: { salonId: salon._id, ...statusFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                image: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: { $concat: ["$fname", " ", "$lname"] },
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $project: {
          user: 1,
          services: 1,
          date: 1,
          time: 1,
          bookingId: 1,
          createdAt: 1,
          status: 1,
          amount: 1,
          duration: 1,
          commission: 1,
          expert: 1,
          expertEarning: 1,
          salon: 1,
          amount: 1,
          platformFee: 1,
          cancel: 1,
          checkOutTime: 1,
          checkInTime: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];

    const [bookings, total, stats] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.countDocuments({
        salonId: salon._id,
        ...statusFilter,
        ...dateFilter,
      }),
      Booking.aggregate([
        {
          $match: { salonId: salon._id, ...statusFilter, ...dateFilter },
        },
        {
          $group: {
            _id: null,
            totalExpertEarning: { $sum: "$expertEarning" },
            totalPlatformFee: { $sum: "$platformFee" },
            totalSalonCommission: { $sum: "$salonCommission" },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Bookings Found Successfully",
      total,
      services: bookings,
      stats: stats[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.dailyBookings = async (req, res) => {
  try {
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 200;
    const skip = start * limit;

    const dailyData = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$date",
          totalAmount: { $sum: "$amount" },
          totalTax: { $sum: "$tax" },
          totalWithoutTax: { $sum: "$withoutTax" },
          totalBookings: { $sum: 1 },
          experts: { $addToSet: "$expertId" },
          platFormFee: { $sum: "$platformFee" },
          expertEarning: { $sum: "$expertEarning" },
          salonCommission: { $sum: "$salonCommission" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: 1,
          totalTax: 1,
          totalWithoutTax: 1,
          totalBookings: 1,
          experts: { $size: "$experts" },
          platFormFee: 1,
          expertEarning: 1,
          salonCommission: 1,
        },
      },
      { $sort: { date: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $group: { _id: null, totalRecord: { $sum: 1 } } }],
        },
      },
    ]);

    res.status(200).json({
      status: true,
      message: "success",
      total:
        dailyData[0].totalCount.length > 0
          ? dailyData[0].totalCount[0].totalRecord
          : 0,
      data: dailyData[0].data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.upcomingBookings = async (req, res) => {
  try {
    const { type } = req.query;

    const todayDate = moment().format("YYYY-MM-DD");

    let futureBookings = await Booking.find({
      date: todayDate,
      status: "pending",
    })
      .populate("userId serviceId expertId")
      .populate({
        path: "salonId",
        select: "name",
      })
      .sort({ startTime: 1 });

    let bookings;

    if (type == "1") {
      bookings = futureBookings.slice(0, 5);
    } else bookings = futureBookings;

    return res
      .status(200)
      .send({ status: true, message: "success", data: bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.monthlyState = async (req, res) => {
  try {
    const currentYear = moment().format("YYYY");
    const year = req.query.year || currentYear;
    let dateFilter;
    if (year !== "ALL") {
      dateFilter = {
        year: {
          $eq: req.query.year,
        },
      };
    }
    const result = await Booking.aggregate([
      {
        $addFields: {
          year: { $substr: ["$date", 0, 4] },
        },
      },
      {
        $match: { status: "completed", ...dateFilter },
      },
      {
        $addFields: {
          month: { $substr: ["$date", 0, 7] },
        },
      },
      {
        $project: {
          month: "$month",
          expertId: "$expertId",
          amount: "$amount",
          tax: "$tax",
          platformFee: "$platformFee",
          salonCommission: "$salonCommission",
          withoutTax: "$withoutTax",
          expertEarning: "$expertEarning",
        },
      },
      {
        $group: {
          _id: { month: "$month", expertId: "$expertId" },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          tax: { $sum: "$tax" },
          expertEarning: { $sum: "$expertEarning" },
          platformFee: { $sum: "$platformFee" },
          withoutTax: { $sum: "$withoutTax" },
          salonCommission: { $sum: "$salonCommission" },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          uniqueExpertIds: { $addToSet: "$_id.expertId" },
          completedBookings: { $sum: "$count" },
          amount: { $sum: "$amount" },
          tax: { $sum: "$tax" },
          expertEarning: { $sum: "$expertEarning" },
          platformFee: { $sum: "$platformFee" },
          withoutTax: { $sum: "$withoutTax" },
          salonCommission: { $sum: "$salonCommission" },
        },
      },

      {
        $project: {
          _id: 0,
          month: "$_id",
          completedBookings: 1,
          amount: 1,
          experts: { $size: "$uniqueExpertIds" },
          tax: 1,
          expertEarning: 1,
          platformFee: 1,
          salonCommission: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: "Success",
      result,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    if (!req?.body?.bookingId || !req.body.reason) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
    const booking = await Booking.findById(req?.body?.bookingId);
    if (!booking) {
      return res.status(200).send({ status: false, message: "data not found" });
    }

    if (booking.status !== "pending") {
      return res
        .status(200)
        .send({
          status: false,
          message: "Only pending booking can be cancelled",
        });
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
        .send({ status: false, message: "Expert not found of this booking" });
    }

    booking.status = "cancel";
    booking.cancel.reason = req.body.reason;
    booking.cancel.time = moment().format("hh:mm A");
    booking.cancel.date = moment().format("YYYY-MM-DD");
    booking.cancel.person = "admin";

    payload = {
      token: user.fcmToken,
      notification: {
        body: `Your Booking with Id ${booking.bookingId}  is cancelled `,
        title: "Booking Cancel",
        image: booking.serviceId[0].image,
      },
    };
    console.log("payload", payload);
    const notification = new Notification();

    notification.userId = user._id;
    notification.title = payload.notification.title;
    notification.image = booking.serviceId[0].image;
    notification.notificationType = 0;
    notification.message =
      payload.notification.body + " Reason : " + booking.cancel.reason;
    notification.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const adminPromise = await admin
    await Promise.all([
      booking.save,
      UString.deleteMany({ bookingId: booking._id }),
      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        }),
    ]);

    return res
      .status(200)
      .send({ status: true, message: "success!!", booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};
