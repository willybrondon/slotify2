const Review = require("../../models/review.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

const mongoose = require("mongoose");

exports.serviceReviewByUser = async (req, res) => {
  try {
    if (!req.body || !req.body.bookingId || !req.body.rating) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const booking = await Booking.findOne({ bookingId: req.body.bookingId });
    if (!booking) {
      return res.status(200).send({ status: false, message: "Booking Not Found!!" });
    }

    if (booking.status !== "completed") {
      return res.status(200).send({
        status: false,
        message: "This Booking Is Not Completed Yet!!",
      });
    }

    const [expert, salon] = await Promise.all([Expert.findOne({ _id: booking.expertId }), Salon.findById(booking.salonId)]);

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert Not Found!!" });
    }
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon Not Found!!" });
    }

    if (parseInt(req.body.rating) > 5 || req.body.rating < 1) {
      return res.status(200).send({ status: false, message: "Invalid Rating!!" });
    }

    const totalSalonReviewAmount = salon.review * salon.reviewCount;
    salon.reviewCount += 1;
    salon.review = (totalSalonReviewAmount + req.body.rating) / salon.reviewCount;

    const totalExpertReviewAmount = expert.review * expert.reviewCount;
    expert.reviewCount += 1;
    expert.review = (totalExpertReviewAmount + req.body.rating) / expert.reviewCount;

    const review = new Review();
    review.bookingId = booking?._id;
    review.userId = booking.userId;
    review.salonId = booking.salonId;
    review.expertId = booking.expertId;
    review.review = req.body.review ? req.body.review : "";
    review.rating = req.body.rating;
    review.reviewType = 1;

    booking.isReviewed = true;
    await Promise.all([salon.save(), expert.save(), booking.save(), review.save()]);

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
    return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
  }

  const expert = await Expert.findById(req.query.expertId).select("image fname lname review reviewCount serviceId email mobile age").populate({
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

exports.productReviewByUser = async (req, res) => {
  try {
    const { productId, rating, userId, review } = req.body;

    console.log("productReviewByUser", req.body);

    if (!productId || !rating || !userId) {
      return res.status(200).send({ status: false, message: "Oops! Invalid details!!" });
    }

    // Use select to limit fields returned from the database for performance optimization
    const product = await Product.findOne({ createStatus: "Approved", _id: productId }).select("_id rating reviewCount salon");
    if (!product) {
      return res.status(1200).send({ status: false, message: "Product Not Found!" });
    }

    const [user, salon, alreadyReviewed] = await Promise.all([User.findById(userId).select("_id"), Salon.findById(product.salon).select("_id"), Review.findOne({ userId, productId, type: 2 })]);

    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon Not Found!" });
    }

    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found!" });
    }

    if (alreadyReviewed) {
      return res.status(200).send({ status: false, message: "Already Reviewed!" });
    }

    if (parseInt(rating) > 5 || rating < 1) {
      return res.status(200).send({ status: false, message: "Invalid Rating!" });
    }

    // Optimization: store total rating and update it, rather than recalculating
    const totalRating = product.rating * product.reviewCount;
    product.reviewCount += 1;
    product.rating = (totalRating + rating) / product.reviewCount;

    const newReview = new Review({
      productId: product._id,
      userId: user._id,
      salonId: salon._id,
      review: review || "", // handle empty review
      rating,
      reviewType: 2,
    });

    // Save all in parallel to improve performance
    await Promise.all([product.save(), newReview.save()]);

    // Populate necessary fields for the response
    const populatedReview = await Review.findById(newReview._id).populate([
      { path: "userId", select: "fname lname image" },
      { path: "salonId", select: "name" },
      { path: "productId", select: "name image" },
    ]);

    return res.status(200).send({
      status: true,
      message: "Review Created Successfully!",
      review: populatedReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};
