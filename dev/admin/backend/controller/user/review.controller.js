const Review = require("../../models/review.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");
const Booking = require("../../models/booking.model");
const mongoose = require("mongoose");

exports.store = async (req, res) => {
  try {
    if (!req.body || !req.body.bookingId || !req.body.rating) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const booking = await Booking.findOne({ bookingId: req.body.bookingId });
    if (!booking) {
      return res
        .status(200)
        .send({ status: false, message: "Booking Not Found!!" });
    }

    if (booking.status !== "completed") {
      return res.status(200).send({
        status: false,
        message: "This Booking Is Not Completed Yet!!",
      });
    }

    const [expert, salon] = await Promise.all([
      Expert.findOne({ _id: booking.expertId }),
      Salon.findById(booking.salonId),
    ]);

    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert Not Found!!" });
    }
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon Not Found!!" });
    }

    if (parseInt(req.body.rating) > 5 || req.body.rating < 1) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Rating!!" });
    }

    const totalSalonReviewAmount = salon.review * salon.reviewCount;
    salon.reviewCount += 1;
    salon.review =
      (totalSalonReviewAmount + req.body.rating) / salon.reviewCount;

    const totalExpertReviewAmount = expert.review * expert.reviewCount;
    expert.reviewCount += 1;
    expert.review =
      (totalExpertReviewAmount + req.body.rating) / expert.reviewCount;

    const review = new Review();
    review.bookingId = booking?._id;
    review.userId = booking.userId;
    review.salonId = booking.salonId;
    review.expertId = booking.expertId;
    review.review = req.body.review ? req.body.review : "";
    review.rating = req.body.rating;

    booking.isReviewed = true;
    await Promise.all([
      salon.save(),
      expert.save(),
      booking.save(),
      review.save(),
    ]);

    const data = await Review.findById(review._id).populate([
      { path: "userId", select: "fname lname image" },
      { path: "salonId", select: "name" },
      {
        path: "bookingId",
        select: "time serviceId _id isReviewed paymentStatus amount",
      },
      { path: "expertId", select: "fname lname" },
    ]);
    return res.status(200).send({
      status: true,
      message: "Review Created Successful !!",
      review: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.expertReviews = async (req, res) => {
  if (!req.query.expertId) {
    return res
      .status(200)
      .send({ status: false, message: "Oops ! Invalid details!!" });
  }
  const expert = await Expert.findById(req.query.expertId)
    .select("image fname lname review reviewCount serviceId email mobile age")
    .populate({
      path: "serviceId",
      select: "name",
    });

  if (!expert) {
    return res.status(200).send({ status: false, message: "expert not found" });
  }
  const expertReviews = await Review.find({ expertId: expert._id }).populate({
    path: "userId",
    select: "fname lname",
  });

  return res.status(200).json({
    status: true,
    message: "Data found",
    data: expertReviews,
    expert,
  });
};
