const Category = require("../../models/productCategory.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Salon = require("../../models/salon.model");
const Rating = require("../../models/rating.model");
const Review = require("../../models/review.model");

const mongoose = require("mongoose");

const normalizeCityName = (cityName) => {
  return cityName
    .replace(/\s*\(.*?\)$/, "")
    .trim()
    .toLowerCase();
};

const buildPipeline = (userId, categoryId, start, limit) => {
  const pipeline = [
    {
      $match: {
        category: categoryId,
        createStatus: "Approved",
        isOutOfStock: false,
      },
    },
    {
      $project: {
        salon: 1,
        productName: 1,
        productCode: 1,
        description: 1,
        price: 1,
        review: 1,
        mainImage: 1,
        images: 1,
        shippingCharges: 1,
        quantity: 1,
        sold: 1,
        isOutOfStock: 1,
        category: 1,
        rating: 1,
        createStatus: 1,
        updateStatus: 1,
      },
    },
    {
      $project: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
    { $skip: start },
    { $limit: limit },
  ];

  if (userId) {
    pipeline.splice(1, 0, {
      $lookup: {
        from: "favourites",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$productId", "$$productId"] },
                  { $eq: ["$userId", userId] },
                ],
              },
            },
          },
        ],
        as: "isFavourite",
      },
    });

    pipeline.push({
      $addFields: {
        isFavourite: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ["$isFavourite", []] } }, 0] },
            then: true,
            else: false,
          },
        },
      },
    });
  }

  return pipeline;
};

exports.getProductsForUser = async (req, res) => {
  try {
    if (!req.query.categoryId || !req.query.start || !req.query.limit) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details." });
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    const categoryId = new mongoose.Types.ObjectId(req.query.categoryId);

    let userId = null;
    if (req.query.userId) {
      userId = new mongoose.Types.ObjectId(req.query.userId);
    }

    // Use Promise.all to run these queries in parallel
    const [user, userIsSalon, category, data] = await Promise.all([
      userId ? User.findById(userId) : null,
      userId ? Salon.findOne({ userId: userId }).lean() : null,
      Category.findById(categoryId),
      Product.aggregate(buildPipeline(userId, categoryId, skipAmount, limit)),
    ]);

    if (userId && !user) {
      return res
        .status(200)
        .json({ status: false, message: "User not found." });
    }

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: "Category not found." });
    }

    // Filter out products from user's own salon if user is a salon owner
    const filteredProducts = userIsSalon
      ? data.filter(
          (product) =>
            product.salon &&
            product.salon.toString() !== userIsSalon._id.toString()
        )
      : data;

    // Populate the filtered products with category details
    const data_ = await Product.populate(filteredProducts, [
      { path: "category", select: "name" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieved category-wise products successfully.",
      product: data_ || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getTrendingProducts = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const userId = req.query.userId;
    const city = normalizeCityName(req.query.city);

    if (!city) {
      return res.status(200).json({
        status: false,
        message: "City is required in query parameters.",
      });
    }

    let user;

    if (userId) {
      user = await User.findById(userId);

      if (!user) {
        return res.status(200).json({
          status: false,
          message: "User does not found.",
        });
      }
    }

    const pipeline = [
      {
        $match: {
          createStatus: "Approved",
          "allowCities.city": city,
          isOutOfStock: false,
        },
      },
      {
        $lookup: {
          from: "favourites",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
          ],
          as: "favourites",
        },
      },
      {
        $addFields: {
          isFavourite: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$favourites", []] } }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          salon: 1,
          productName: 1,
          productCode: 1,
          description: 1,
          price: 1,
          mrp: 1,
          review: 1,
          mainImage: 1,
          images: 1,
          shippingCharges: 1,
          quantity: 1,
          sold: 1,
          isOutOfStock: 1,
          category: 1,
          rating: 1,
          brand: 1,
          createStatus: 1,
          updateStatus: 1,
          isBestSeller: 1,
          isFavourite: 1,
        },
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const products = await Product.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.newProducts = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const city = normalizeCityName(req.query.city);

    if (!city) {
      return res.status(200).json({
        status: false,
        message: "City is required in query parameters.",
      });
    }

    const userId = req.query.userId
      ? new mongoose.Types.ObjectId(req.query.userId)
      : null;

    const pipeline = [
      {
        $match: {
          createStatus: "Approved",
          "allowCities.city": city,
          isOutOfStock: false,
        },
      },
      {
        $lookup: {
          from: "favourites",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: "favourites",
        },
      },
      {
        $addFields: {
          isFavourite: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$favourites", []] } }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          salon: 1,
          productName: 1,
          productCode: 1,
          description: 1,
          price: 1,
          review: 1,
          mainImage: 1,
          images: 1,
          shippingCharges: 1,
          quantity: 1,
          sold: 1,
          brand: 1,
          isOutOfStock: 1,
          category: 1,
          rating: 1,
          createStatus: 1,
          updateStatus: 1,
          isBestSeller: 1,
          isFavourite: 1,
          mrp: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const products = await Product.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.salonProducts = async (req, res) => {
  try {
    // Check if salonId is provided
    if (!req.query.salonId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    const salonId = new mongoose.Types.ObjectId(req.query.salonId);
    const salon = await Salon.findOne({
      _id: salonId,
      isDelete: false,
      isActive: true,
    });

    if (!salon) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    // Optional userId for checking favorites
    const userId = req.query.userId
      ? new mongoose.Types.ObjectId(req.query.userId)
      : null;

    // Create the aggregation pipeline
    const pipeline = [
      {
        $match: {
          createStatus: "Approved",
          salon: salon._id,
          isOutOfStock: false,
        },
      },
      {
        $lookup: {
          from: "favourites",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] }, // Match the product ID in favourites
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] }, // Match the user ID
                  ],
                },
              },
            },
          ],
          as: "favourites", // This will contain an array of matching favourites
        },
      },
      {
        $addFields: {
          isFavourite: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$favourites", []] } }, 0] }, // If favourites found, true
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          salon: 1,
          productName: 1,
          productCode: 1,
          description: 1,
          price: 1,
          review: 1,
          mainImage: 1,
          images: 1,
          shippingCharges: 1,
          quantity: 1,
          sold: 1,
          isOutOfStock: 1,
          category: 1,
          brand: 1,
          rating: 1,
          createStatus: 1,
          updateStatus: 1,
          isBestSeller: 1,
          isFavourite: 1,
          mrp: 1,
        },
      },
      {
        $sort: {
          createdAt: -1, // Sort by most recent
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      { $skip: start * limit }, // How many records to skip
      { $limit: limit },
    ];

    const products = await Product.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.search = async (req, res) => {
  try {
    const { searchString, userId } = req.query;

    if (!searchString || !userId) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Product name and userId are required for search.",
          data: [],
        });
    }

    const searchQuery = {
      $or: [
        { productName: { $regex: searchString?.trim(), $options: "i" } },
        { description: { $regex: searchString?.trim(), $options: "i" } },
        { brand: { $regex: searchString?.trim(), $options: "i" } },
        { "category.name": { $regex: searchString?.trim(), $options: "i" } },
      ],
    };

    const userObjId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          createStatus: "Approved",
          isOutOfStock: false,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: searchQuery,
      },
      {
        $lookup: {
          from: "favourites",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    {
                      $eq: ["$userId", new mongoose.Types.ObjectId(userObjId)],
                    },
                  ],
                },
              },
            },
          ],
          as: "favourites",
        },
      },
      {
        $addFields: {
          isFavourite: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$favourites", []] } }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          salon: 1,
          productName: 1,
          productCode: 1,
          description: 1,
          price: 1,
          review: 1,
          mainImage: 1,
          brand: 1,
          images: 1,
          shippingCharges: 1,
          quantity: 1,
          sold: 1,
          isOutOfStock: 1,
          category: { name: 1 },
          rating: 1,
          createStatus: 1,
          updateStatus: 1,
          isBestSeller: 1,
          isFavourite: 1,
          mrp: 1,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.filterWiseProduct = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: true, message: "userId must be requried." });
    }

    if (!req.body.category || !req.body.minPrice || !req.body.maxPrice)
      return res.status(200).json({
        status: false,
        message: "OOps ! Invalid details.",
      });

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    //category filter
    let categoryArray = [];
    if (req.body?.category) {
      if (Array.isArray(req.body.category)) {
        categoryArray = req.body.category.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      } else {
        categoryArray = [new mongoose.Types.ObjectId(req.body.category)];
      }
    }

    const categoryQuery =
      categoryArray?.length > 0 ? { category: { $in: categoryArray } } : {};

    //priceQuery filter
    const priceQuery = {};
    if (req.body.minPrice) {
      priceQuery.price = { $gte: req.body.minPrice };
    }

    if (req.body.maxPrice) {
      priceQuery.price = {
        ...priceQuery.price,
        $lte: req.body.maxPrice,
      };
    }

    const query = {
      $and: [categoryQuery, priceQuery],
    };

    const matchQuery = { createStatus: "Approved" };

    const [user, userIsSalon, product] = await Promise.all([
      User.findOne({ _id: userId, isBlock: false }),
      Salon.findOne({ userId: userId }).lean(),
      Product.aggregate([
        {
          $match: {
            $and: [matchQuery, ...query.$and],
            isOutOfStock: false,
          },
        },
        {
          $lookup: {
            from: "favourites",
            let: {
              productId: "$_id",
              userId: userId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$productId", "$$productId"] },
                      { $eq: ["$userId", userId] },
                    ],
                  },
                },
              },
            ],
            as: "isFavourite",
          },
        },
        {
          $lookup: {
            from: "ratings",
            localField: "_id",
            foreignField: "productId",
            as: "productRating",
          },
        },
        {
          $project: {
            _id: 1,
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            productCode: 1,
            location: 1,
            sold: 1,
            review: 1,
            isOutOfStock: 1,
            description: 1,
            category: 1,
            salon: 1,
            brand: 1,
            createStatus: 1,
            isFavourite: {
              $cond: [{ $eq: [{ $size: "$isFavourite" }, 0] }, false, true],
            },
            ratingAverage: {
              $cond: {
                if: { $eq: [{ $avg: "$productRating.rating" }, null] },
                then: { $avg: 0 },
                else: { $avg: "$productRating.rating" },
              },
            },
          },
        },
      ]),
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found." });
    }

    const filteredProducts = product.filter(
      (product) =>
        !userIsSalon || product.salon.toString() !== userIsSalon._id.toString()
    );

    return res.status(200).json({
      status: true,
      message: "Retrive Filter wise products Successfully!",
      product: filteredProducts.length > 0 ? filteredProducts : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

exports.productDetail = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.userId) {
      return res
        .status(200)
        .json({ status: true, message: "Oops ! Invalid details." });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [product, user, ratingExist] = await Promise.all([
      Product.findOne({ _id: productId, createStatus: "Approved" }),
      User.findOne({ _id: userId, isBlock: false }),
      Rating.findOne({ userId: userId, productId: productId }),
    ]);

    if (!product) {
      return res
        .status(500)
        .json({ status: false, message: "No product was found." });
    }

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found." });
    }

    const salon = await Salon.findById(product.salon);
    if (!salon) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Salon of this product does not found.",
        });
    }

    const [data, popularProducts, reviews] = await Promise.all([
      Product.aggregate([
        { $match: { _id: product._id } },
        {
          $addFields: {
            isRating: ratingExist ? true : false,
          },
        },
        {
          $lookup: {
            from: "followers",
            let: { salonId: "$salon" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$salonId", "$$salonId"] },
                },
              },
            ],
            as: "isFollow",
          },
        },
        {
          $lookup: {
            from: "favourites",
            let: { productId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$productId", "$$productId"] },
                      { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: "favourites",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "salons",
            localField: "salon",
            foreignField: "_id",
            as: "salon",
          },
        },
        {
          $unwind: { path: "$salon", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            productCode: 1,
            attributes: 1,
            location: 1,
            sold: 1,
            isOutOfStock: 1,
            isNewCollection: 1,
            description: 1,
            brand: 1,
            category: { name: 1 },
            salon: {
              name: 1,
              addresDetails: 1,
              mainImage: 1,
              images: 1,
              isBestSeller: 1,
            },
            rating: 1,
            mrp: 1,
            createStatus: 1,
            updateStatus: 1,
            isFollow: {
              $cond: [{ $eq: [{ $size: "$isFollow" }, 0] }, false, true],
            },
            isFavourite: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$favourites", []] } }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      ]),
      Product.aggregate([
        {
          $match: { createStatus: "Approved" },
        },
        {
          $match: { salon: salon._id },
        },
        {
          $sort: { sold: -1 },
        },
        {
          $limit: 3,
        },
        {
          $lookup: {
            from: "favorites",
            let: {
              productId: "$_id",
              userId: user._id,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$productId", "$$productId"] },
                      { $eq: ["$userId", user._id] },
                    ],
                  },
                },
              },
            ],
            as: "isFavorite",
          },
        },

        {
          $project: {
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            productCode: 1,
            attributes: 1,
            location: 1,
            sold: 1,
            review: 1,
            isOutOfStock: 1,
            isNewCollection: 1,
            description: 1,
            category: 1,
            brand: 1,
            salon: 1,
            rating: 1,
            mrp: 1,
            createStatus: 1,
            updateStatus: 1,
            isFollow: {
              $cond: [
                { $eq: [{ $size: { $ifNull: ["$isFollow", []] } }, 0] },
                false,
                true,
              ],
            },
            isFavorite: {
              $cond: [
                { $eq: [{ $size: { $ifNull: ["$isFavorite", []] } }, 0] },
                false,
                true,
              ],
            },
          },
        },
      ]),
      Review.find({ productId: product._id, reviewType: 2 }).populate(
        "userId",
        "fname lname image"
      ),
    ]);

    if (product?.isOutOfStock) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Product is out of stock.",
          product: data[0],
          popularProducts,
          reviews,
        });
    }

    return res.status(200).json({
      status: true,
      message: "Product details Retrive Successfully.",
      product: data[0],
      popularProducts,
      reviews,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
