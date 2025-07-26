const Review = require("../../models/review.model");
const Salon = require("../../models/salon.model");
const Product = require("../../models/product.model");

const mongoose = require("mongoose");
const dayjs = require("dayjs");

exports.salonReviews = async (req, res) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = start * limit;

  const salon = await Salon.findById(req.salon._id);
  if (!salon) {
    return res.status(200).json({ status: false, message: "Oops ! Salon not found !!" });
  }

  const pipeline = [
    {
      $match: { salonId: salon._id },
    },
    {
      $sort: { createAt: -1 },
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
        from: "bookings",
        localField: "bookingId",
        foreignField: "_id",
        as: "booking",
      },
    },
    {
      $unwind: "$booking",
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
      $addFields: { bookingIds: "$booking.bookingId" },
    },
    { $sort: { createdAt: -1 } },
    {
      $skip: skipAmount,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 1,
        review: 1,
        rating: 1,
        userFname: "$user.fname",
        userLname: "$user.lname",
        userImage: "$user.image",
        userId: 1,
        expertId: 1,
        expertFname: "$expert.fname",
        expertLname: "$expert.lname",
        createdAt: 1,
        updatedAt: 1,
        booking: 1,
        bookingIds: 1,
      },
    },
  ];

  const [reviews, total] = await Promise.all([Review.aggregate(pipeline), Review.countDocuments({ salonId: salon._id })]);

  return res.status(200).json({
    status: true,
    message: "Data found",
    data: reviews,
    total,
  });
};

exports.fetchProductReview = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let now = dayjs();

    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details." });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);

    const [product, total, reviews] = await Promise.all([
      Product.findById(productId),
      Review.countDocuments({ productId: productId }),
      Review.aggregate([
        {
          $match: { productId: productId, reviewType: 2 },
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
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "ratings",
            let: { productId: "$productId", userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "rating",
          },
        },
        {
          $project: {
            review: 1,
            date: 1,
            createdAt: 1,
            productId: 1,
            userId: "$user._id",
            fname: "$user.fname",
            lname: "$user.lname",
            userImage: "$user.image",
            rating: { $ifNull: [{ $arrayElemAt: ["$rating.rating", 0] }, 0] },
            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now.toDate(), "$createdAt"] },
                },
                in: {
                  $concat: [
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $gte: ["$$timeDiff", 31536000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
                          },
                          { case: true, then: "Just now" },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $skip: start * limit,
        },
        {
          $limit: limit,
        },
      ]),
    ]);

    if (!product) {
      return res.status(200).json({ status: false, message: "No product Was Found." });
    }

    return res.status(200).json({
      status: reviews.length > 0 ? true : false,
      message: reviews.length > 0 ? "Success" : "No reviews found.",
      total: total,
      reviews: reviews.length > 0 ? reviews : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skipAmount = start * limit;

    const search = req.query.search || "";
    let query = {};

    if (search !== "ALL" || search !== "") {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { "user.fname": { $regex: search, $options: "i" } },
          { "user.lname": { $regex: search, $options: "i" } },
          { "user.username": { $regex: search, $options: "i" } },
          { "expert.fname": { $regex: search, $options: "i" } },
          { "expert.lname": { $regex: search, $options: "i" } },
          { "expert.username": { $regex: search, $options: "i" } },
          { review: { $regex: search, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$rating" },
                regex: searchRegex,
              },
            },
          },
        ],
      };
    }

    const reviews = await Review.aggregate([
      {
        $sort: { createAt: -1 },
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
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      {
        $unwind: "$booking",
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
        $project: {
          _id: 1,
          review: 1,
          rating: 1,
          userFname: "$user.fname",
          userLname: "$user.lname",
          image: "$user.image",
          userImage: "$user.image",
          userId: 1,
          expertId: 1,
          expertFname: "$expert.fname",
          expertLname: "$expert.lname",
          createdAt: 1,
          updatedAt: 1,
          booking: 1,
        },
      },
      {
        $match: {
          $or: [
            { "user.fname": { $regex: search, $options: "i" } },
            { "user.lname": { $regex: search, $options: "i" } },
            { "expert.fname": { $regex: search, $options: "i" } },
            { "expert.lname": { $regex: search, $options: "i" } },
            { "booking.bookingId": { $regex: search, $options: "i" } },
            { review: { $regex: search, $options: "i" } },
            { rating: parseInt(search) || 0 },
          ],
        },
      },
      {
        $facet: {
          history: [{ $skip: skipAmount }, { $limit: limit }],
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Reviews found",
      total: reviews[0].total[0]?.total > 0 ? reviews[0]?.total[0]?.total : 0,
      reviews: reviews[0].history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
