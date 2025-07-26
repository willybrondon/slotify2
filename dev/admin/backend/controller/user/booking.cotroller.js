const Service = require("../../models/service.model");
const Booking = require("../../models/booking.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const BusyExpert = require("../../models/busyExpert.model");
const User = require("../../models/user.model");
const Holiday = require("../../models/salonClose.model");
const Notification = require("../../models/notification.model");
const UString = require("../../models/uniqueString.model");
const UserWalletHistory = require("../../models/userWalletHistory.model");
const Coupon = require("../../models/coupon.model");

const mongoose = require("mongoose");

const admin = require("../../firebase");
const moment = require("moment");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

exports.getBookingBasedDate = async (req, res) => {
  try {
    if (!req.query.date || !req.query.expertId || !req.query.salonId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }

    const dayOfWeek = moment(req.query.date).format("dddd");
    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon Not Found!!!" });
    }

    const [holiday, salonTime, expert] = await Promise.all([
      Holiday.findOne({ date: req.query.date, salonId: salon._id }),
      salon.salonTime.find((time) => time.day == dayOfWeek),
      Expert.findById(req.query.expertId),
    ]);

    if (holiday) {
      return res.status(200).send({
        status: true,
        timeSlots: [],
        isOpen: false,
        message: "Salon Closed!!!",
      });
    }

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert Not Found!!!" });
    }

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon Closed!!!" });
    }

    const bookingDate = req.query.date;

    console.log("bookingDate", bookingDate);
    const bookings = await Booking.aggregate([
      {
        $match: {
          expertId: expert._id,
          date: bookingDate,
          status: { $in: ["pending", "confirm"] },
        },
      },
    ]);

    const generateTimeSlots = (startTime, endTime, slotSize) => {
      const slots = [];
      let start = moment(startTime, "hh:mm A");
      const end = moment(endTime, "hh:mm A");

      while (start < end) {
        slots.push(start.format("hh:mm A"));
        start.add(slotSize, "minutes");
      }
      return slots;
    };

    const { openTime, closedTime, breakStartTime, breakEndTime, time, isBreak } = salonTime;

    const morningSlots = isBreak === true ? generateTimeSlots(openTime, breakStartTime.trim(), time) : generateTimeSlots(openTime, closedTime.trim(), time);

    const eveningSlots = isBreak === true ? generateTimeSlots(breakEndTime.trim(), closedTime, time) : [];

    const managedSlots = {
      morning: morningSlots,
      evening: eveningSlots,
    };

    const timeSlots = [].concat(...bookings.map((booking) => booking.time));

    const busyExpert = await BusyExpert.findOne({
      expertId: req.query.expertId,
      date: req.query.date,
    });

    const mergedTimeSlots = busyExpert ? [...timeSlots, ...busyExpert.time] : timeSlots;

    return res.status(200).send({
      status: true,
      message: "success",
      allSlots: managedSlots,
      timeSlots: mergedTimeSlots,
      salonTime,
      isOpen: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.newBooking = async (req, res, next) => {
  try {
    console.log("req.body++++++++", req.body);

    if (!req.body.serviceId || !req.body.userId || !req.body.expertId || !req.body.date || !req.body.time || !req.body.amount || !req.body.withoutTax || !req.body.salonId || !req.body.atPlace) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    const today = moment().format("YYYY-MM-DD");
    let timeSlots = Array.isArray(req.body.time) ? req.body.time : [req.body.time];
    const timeArray = timeSlots[0].split(",");
    // const timeArray = bookingSlots.map((time) => time.trim());

    const [uniqueIdForWalletHistory, user, expert, salon] = await Promise.all([
      generateUniqueIdentifier(),
      User.findOne({ _id: req.body.userId }),
      Expert.findOne({ _id: req.body.expertId }),
      Salon.findOne({ _id: req.body.salonId }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(200).send({ status: false, message: "User is blocked. Please contact admin" });
    }

    if (!expert || expert.isBlock) {
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    if (!salon || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    const isTimeAlreadyBooked = await Booking.exists({
      $and: [
        { date: req.body.date },
        { expertId: expert._id },
        { status: { $eq: "pending" } },
        {
          time: {
            $elemMatch: { $in: timeArray },
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `One or more selected time slots are already booked for Date ${req.body.date} for Expert ${expert.fname + " " + expert.lname}`,
      });
    }

    const services = req.body.serviceId.split(",");

    const expertServices = services.every((service) => expert.serviceId.includes(service.trim()));

    if (!expertServices) {
      return res.status(200).send({
        status: false,
        message: "One or more provided serviceIds are not valid for the expert",
      });
    }

    const bookingDates = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = bookingDates.format("dddd");
    const salonTime = salon.salonTime.find((time) => time.day == dayOfWeek);

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon time not found" });
    }

    const salonOpenTime = moment(salonTime.openTime, "hh:mm A");
    const salonCloseTime = moment(salonTime.closedTime, "hh:mm A");
    const breakStartTime = moment(salonTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(salonTime.breakEndTime, "hh:mm A");

    const isWithinSalonHours = timeArray.every((time) => {
      const bookingStartTime = moment(time, "hh:mm:ss A");
      return bookingStartTime.isSameOrAfter(salonOpenTime) && bookingStartTime.isSameOrBefore(salonCloseTime);
    });

    if (
      !isWithinSalonHours ||
      timeArray.some((time) => {
        const bookingStartTime = moment(time, "hh:mm A");
        return (
          bookingStartTime.isSameOrBefore(salonOpenTime) ||
          bookingStartTime.isSameOrAfter(salonCloseTime) ||
          (bookingStartTime.isSameOrAfter(breakStartTime) && bookingStartTime.isSameOrBefore(breakEndTime))
        );
      })
    ) {
      return res.status(200).send({
        status: false,
        message: "One or more booking times are outside salon hours or during the break",
      });
    }

    const booking = new Booking();

    booking.userId = user._id;
    booking.expertId = expert._id;
    booking.startTime = timeArray[0];

    const bookingDate = moment(req.body.date, "YYYY-MM-DD");
    booking.date = bookingDate.format("YYYY-MM-DD");

    booking.salonId = salon._id;
    booking.atPlace = req?.body?.atPlace;
    booking.address = req?.body?.address || "";
    booking.withoutTax = req.body.withoutTax;
    booking.serviceId = services;

    const servicesData = await Service.find({ _id: { $in: services } });

    const matchedServices = salon.serviceIds.filter((service) => {
      return services.toString().includes(service.id?._id);
    });

    let totalServicePrice = 0;
    let totalDuration = 0;
    servicesData.forEach((service) => {
      totalDuration += service.duration;
    });

    matchedServices.forEach((service) => {
      totalServicePrice += parseInt(service.price);
    });

    const totalSlots = Math.ceil(totalDuration / 15);
    const resultOfGreater = totalDuration / totalSlots;
    const result = totalDuration / timeArray.length;

    if (result > 15 || result < 1 || resultOfGreater !== result) {
      return res.status(200).send({ status: false, message: "Slots not correctly booked" });
    }
    const servicePrice = totalServicePrice.toFixed(2);

    console.log("totalServicePrice      ", totalServicePrice);
    console.log("servicePrice           ", servicePrice);
    console.log("req.body.withoutTax    ", req.body.withoutTax);

    if (servicePrice !== req.body.withoutTax.toFixed(2)) {
      return res.status(200).send({ status: false, message: "Invalid Service Price" });
    }

    let coupon, discountAmount, totalAmount;

    const taxAmount = (req.body.withoutTax * settingJSON.tax) / 100;
    const withTaxAmount = (taxAmount + req.body.withoutTax).toFixed(2);
    const bookingAmount = req?.body?.amount.toFixed(2);

    console.log("withTaxAmount         ", withTaxAmount);
    console.log("bookingAmount         ", bookingAmount);
    console.log("taxAmount             ", taxAmount);

    totalAmount = withTaxAmount;

    if (req.body.couponId) {
      const couponObjId = new mongoose.Types.ObjectId(req.body.couponId);

      coupon = await Coupon.findOne({ _id: couponObjId, isActive: true, type: 2, expiryDate: { $gte: today } });

      if (!coupon) {
        return res.status(200).json({
          status: false,
          message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
        });
      }

      const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === user._id.toString() && entry.usageType === 2);
      console.log("alreadyUsed", alreadyUsed);

      if (alreadyUsed) {
        return res.status(200).json({
          status: false,
          message: "Coupon has already been used by this customer for the specified type.",
        });
      }

      if (coupon.discountType == 1) {
        discountAmount = coupon.maxDiscount;
      } else if (coupon.discountType == 2) {
        const discount = (parseInt(req.body.withoutTax) * coupon.discountPercent) / 100;
        const formatedDiscount = parseFloat(discount.toFixed(2));

        discountAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
      }

      if (!alreadyUsed) {
        coupon.usedBy.push({
          customerId: customerObjId,
          usageType: coupon.type,
        });
      }

      totalAmount = withTaxAmount - discountAmount;
    }

    console.log("totalAmount after add tax and deduct the discount (if any)", totalAmount);

    if (totalAmount !== bookingAmount) {
      return res.status(200).send({ status: false, message: "Invalid amount after add tax and deduct the discount (if any)" });
    }

    booking.amount = req.body.amount;
    booking.tax = taxAmount.toFixed(2);

    const platformFee = (salon.platformFee * req.body.withoutTax) / 100;
    booking.platformFee = parseInt(platformFee);
    booking.platformFeePercent = salon.platformFee.toFixed(2);

    const salonCommission = ((req.body.withoutTax - platformFee) * expert.commission) / 100;
    booking.salonCommission = salonCommission.toFixed(2);
    booking.salonCommissionPercent = expert.commission;

    booking.salonEarning = parseInt(req.body.withoutTax - platformFee).toFixed(2);
    booking.expertEarning = (req.body.withoutTax - (platformFee + salonCommission)).toFixed(2);
    booking.duration = totalDuration;
    booking.time = timeArray;

    booking.coupon = coupon
      ? {
          title: coupon.title,
          description: coupon.description,
          code: coupon.code,
          discountType: coupon.discountType,
          maxDiscount: coupon.maxDiscount,
          minAmountToApply: coupon.minAmountToApply,
        }
      : {};

    const uniqueBookingId = await generateUniqueBookingId();
    booking.bookingId = uniqueBookingId;

    const bookingDateFormat = moment().format("YYYY-MM-DD");
    const uniqueStrings = await Promise.all(
      timeArray.map((time) =>
        UString.create({
          string: `${bookingDateFormat}-${expert._id}-${time}`,
          bookingId: booking._id,
        })
      )
    );

    await booking.save();

    res.status(200).send({
      status: true,
      message: "Booking Created!",
      data: booking,
    });

    if (coupon) {
      await coupon.save();
    }

    await Promise.all([
      User.updateOne(
        { _id: user._id, amount: { $gt: 0 } },
        {
          $inc: {
            amount: -totalAmount,
          },
        }
      ),
      new UserWalletHistory({
        user: user._id,
        amount: totalAmount,
        type: 2,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm a"), //moment().format("hh:mm A")
        uniqueId: uniqueIdForWalletHistory,
        booking: booking._id,
        couponAmount: discountAmount,
        coupon: coupon
          ? {
              title: coupon.title,
              description: coupon.description,
              code: coupon.code,
              discountType: coupon.discountType,
              maxDiscount: coupon.maxDiscount,
              minAmountToApply: coupon.minAmountToApply,
            }
          : {},
      }).save(),
    ]);

    if (expert && expert.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: expert.fcmToken,
        notification: {
          body: `Your Booking Is Confirm On ${booking.date} At ${booking.startTime}.`,
          title: "New Booking Request.",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);

          const notification = new Notification();
          notification.expertId = expert._id;
          notification.title = "New Booking Request";
          notification.image = req.file ? process.env.baseURL + req.file.path : "";
          notification.message = `Your Booking Is Confirm On ${booking.date} At ${booking.startTime}.`;
          notification.notificationType = 1;
          notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await notification.save();
        })
        .catch((error) => {
          console.log("Error sending message: ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.checkSlots = async (req, res, next) => {
  try {
    if (!req.body.serviceId || !req.body.userId || !req.body.expertId || !req.body.date || !req.body.time || !req.body.amount || !req.body.withoutTax || !req.body.salonId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    let timeSlots = Array.isArray(req.body.time) ? req.body.time : [req.body.time];
    const bookingSlots = timeSlots[0].split(",");
    const timeArray = bookingSlots.map((time) => time.trim());

    const [user, expert, salon, setting, isTimeAlreadyBooked] = await Promise.all([
      User.findOne({ _id: req.body.userId }),
      Expert.findOne({ _id: req.body.expertId }),
      Salon.findOne({ _id: req.body.salonId }),
      global.settingJSON,
      Booking.exists({
        $and: [
          { date: req.body.date },
          { expertId: req.body.expertId },
          { status: { $eq: "pending" } },
          {
            time: {
              $elemMatch: { $in: timeArray },
            },
          },
        ],
      }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: "You Are blocked. Please contact admin",
      });
    }

    if (!expert || expert.isBlock) {
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    if (!salon || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `One or more selected time slots are already booked for Date ${req.body.date} for Expert ${expert.fname + " " + expert.lname}`,
      });
    }

    const services = req.body.serviceId.split(",");

    const expertServices = services.every((service) => expert.serviceId.includes(service.trim()));

    if (!expertServices) {
      return res.status(200).send({
        status: false,
        message: "One or more provided serviceIds are not valid for the expert",
      });
    }

    const bookingDates = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = bookingDates.format("dddd");
    const salonTime = salon.salonTime.find((time) => time.day == dayOfWeek);

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon time not found" });
    }

    const salonOpenTime = moment(salonTime.openTime, "hh:mm A");
    const salonCloseTime = moment(salonTime.closedTime, "hh:mm A");

    const breakStartTime = moment(salonTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(salonTime.breakEndTime, "hh:mm A");
    const isWithinSalonHours = timeArray.every((time) => {
      const bookingStartTime = moment(time, "hh:mm:ss A");
      return bookingStartTime.isSameOrAfter(salonOpenTime) && bookingStartTime.isSameOrBefore(salonCloseTime);
    });

    if (
      !isWithinSalonHours ||
      timeArray.some((time) => {
        const bookingStartTime = moment(time, "hh:mm A");
        return (
          bookingStartTime.isSameOrBefore(salonOpenTime) ||
          bookingStartTime.isSameOrAfter(salonCloseTime) ||
          (bookingStartTime.isSameOrAfter(breakStartTime) && bookingStartTime.isSameOrBefore(breakEndTime))
        );
      })
    ) {
      return res.status(200).send({
        status: false,
        message: "One or more booking times are outside salon hours or during the break",
      });
    }

    const servicesData = await Service.find({ _id: { $in: services } });

    const matchedServices = salon.serviceIds.filter((service) => {
      return services.toString().includes(service.id?._id);
    });

    let totalServicePrice = 0;
    let totalDuration = 0;
    servicesData.forEach((service) => {
      totalDuration += service.duration;
    });

    matchedServices.forEach((service) => {
      totalServicePrice += parseInt(service.price);
    });

    const totalSlots = Math.ceil(totalDuration / 15);
    const resultOfGreater = totalDuration / totalSlots;
    const result = totalDuration / timeArray.length;

    if (result > 15 || result < 1 || resultOfGreater !== result) {
      return res.status(200).send({ status: false, message: "Slots not correctly booked" });
    }

    const servicePrice = totalServicePrice.toFixed(2);

    console.log("totalServicePrice", totalServicePrice);
    console.log("servicePrice", servicePrice);
    console.log("req.body.withoutTax", req.body.withoutTax);

    if (servicePrice !== req.body.withoutTax.toFixed(2)) {
      return res.status(200).send({ status: false, message: "Invalid Service Price" });
    }

    const taxAmount = (req.body.withoutTax * global.settingJSON.tax) / 100;
    const withTaxAmount = (taxAmount + req.body.withoutTax).toFixed(2);
    const bookingAmount = req?.body?.amount.toFixed(2);

    console.log("withTaxAmount", withTaxAmount);
    console.log("bookingAmount", bookingAmount);
    console.log("taxAmount", taxAmount);
    console.log(typeof taxAmount);

    if (withTaxAmount !== bookingAmount) {
      return res.status(200).send({ status: false, message: "Invalid Amount" });
    }

    return res.status(200).send({
      status: true,
      message: "Slots Checked Successfully!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.bookingForUser = async (req, res) => {
  try {
    if (!req?.query?.userId || !req?.query?.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const status = req.query.status.trim();
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const searchString = req.query.search || "";

    const pipeline = [
      { $match: { userId: user._id } },
      { $match: getStatusFilter(status) },

      { $sort: { date: 1, time: 1 } },
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
        $match: {
          $or: [{ "service.name": { $regex: new RegExp(searchString, "i") } }, { "service.name": { $exists: false } }],
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
          date: 1,
          time: 1,
          amount: 1,
          bookingId: 1,
          checkInTime: 1,
          checkOutTime: 1,
          isReview: 1,
          cancel: 1,
          user: { _id: 1, fname: 1, lname: 1, image: 1 },
          expert: { _id: 1, fname: 1, lname: 1, image: 1 },
          service: 1,
          category: { _id: 1, name: 1, image: 1 },
          isReviewed: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const [bookings, total] = await Promise.all([Booking.aggregate(pipeline), Booking.countDocuments({ userId: user._id, ...getStatusFilter(status) })]);

    return res.status(200).send({ status: true, message: "Success", data: bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.cancelBookingByUser = async (req, res) => {
  try {
    if (!req?.body?.bookingId || !req.body.reason || !req.body.person) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const booking = await Booking.findById(req?.body?.bookingId);
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

    if (booking.status == "cancel") {
      return res.status(200).send({ status: false, message: "Booking is already cancel" });
    }

    if (booking.status == "confirm") {
      return res.status(200).send({
        status: false,
        message: "You are already checked In.Cancellation is not allowed after checkIn.Contact Salon for more details",
      });
    }

    booking.status = "cancel";
    booking.cancel.reason = req.body.reason;
    booking.cancel.time = moment().format("hh:mm A");
    booking.cancel.date = moment().format("YYYY-MM-DD");
    booking.cancel.person = "user";
    await booking.save();

    res.status(200).send({
      status: true,
      message: "Booking Cancelled successfully!!",
      booking,
    });

    await Promise.all([
      User.updateOne(
        { _id: user._id, amount: { $gt: 0 } },
        {
          $inc: {
            amount: booking.amount,
          },
        }
      ),
      Notification.create({
        expertId: expert._id,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
      UString.deleteMany({ bookingId: booking._id }),
      UserWalletHistory.findOneAndDelete({ booking: booking._id }),
    ]);

    if (expert && expert.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: expert?.fcmToken,
        notification: {
          body: `Your Booking with Id ${booking.bookingId} is cancelled By ${user.fname} ${user.lname}`,
          title: "Booking Cancel",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:           ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.bookingInfo = async (req, res) => {
  try {
    const { bookingId } = req.query;
    if (!bookingId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("expertId userId")
      .populate({
        path: "salonId",
        select: "name addressDetails locationCoordinates mobile",
      })
      .populate({
        path: "serviceId",
        populate: {
          path: "categoryId",
        },
      });

    if (!booking) {
      return res.status(200).send({ status: false, message: "Booking Not Found" });
    }

    return res.status(200).send({ status: true, message: "Success", booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

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

async function generateUniqueBookingId() {
  let newBookingId;

  do {
    newBookingId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await Booking.exists({ bookingId: newBookingId }));

  return newBookingId;
}
