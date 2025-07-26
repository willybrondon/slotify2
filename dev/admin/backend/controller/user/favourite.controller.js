const Favourite = require("../../models/favourite.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");
const Category = require("../../models/productCategory.model");
const Salon = require("../../models/salon.model");

const geolib = require("geolib");

//mongoose
const mongoose = require("mongoose");

//create Favourite [Only User can do favourite product]  [Add product to favourite list]
exports.productFavourite = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.categoryId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const categoryId = new mongoose.Types.ObjectId(req.body.categoryId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [user, category, product, favourite] = await Promise.all([
      User.findById(userId),
      Category.findById(categoryId),
      Product.findOne({ _id: productId, category: categoryId }),
      Favourite.findOne({
        userId: userId,
        productId: productId,
        categoryId: categoryId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (!category) {
      return res.status(200).json({ status: false, message: "No category Was found!!" });
    }

    if (!product) {
      return res.status(200).json({ status: false, message: "No product Was found!!" });
    }

    if (favourite) {
      await Favourite.deleteOne({
        userId: user._id,
        productId: product._id,
        categoryId: category._id,
      });

      return res.status(200).json({
        status: true,
        message: "Unfavourite successfully!",
        isFavourite: false,
      });
    } else {
      const favourite = new Favourite();
      favourite.userId = user._id;
      favourite.productId = product._id;
      favourite.categoryId = category._id;
      favourite.type = 1;
      await favourite.save();

      return res.status(200).json({
        status: true,
        message: "Favourite successfully!",
        isFavourite: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get product's favourite list for user
exports.getFavouriteList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, favourite] = await Promise.all([
      User.findById(userId),
      Favourite.aggregate([
        {
          $match: {
            type: 1,
            userId: { $eq: userId },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "products",
            let: {
              productId: "$productId", // $productId is field of favourite table
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$productId", "$_id"], // $_id is field of product table
                  },
                },
              },
              {
                $lookup: {
                  from: "productcategories",
                  localField: "category", // localField - category is field of product table
                  foreignField: "_id",
                  as: "category",
                },
              },
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: false,
                },
              },

              {
                $project: {
                  productName: 1,
                  price: 1,
                  size: 1,
                  mainImage: 1,
                  category: "$category.name",
                },
              },
            ],
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    return res.status(200).json({
      status: true,
      message: favourite.length > 0 ? "Success" : "No data found!",
      favourite: favourite.length > 0 ? favourite : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//add or remove salon from favourite
exports.salonFavourite = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.salonId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const salonId = new mongoose.Types.ObjectId(req.body.salonId);

    const [user, salon, favourite] = await Promise.all([
      User.findById(userId),
      Salon.findById(salonId),
      Favourite.findOne({
        userId: userId,
        salonId: salonId,
        type: 2,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not found!!" });
    }

    if (favourite) {
      await Favourite.deleteOne({
        userId: user._id,
        salonId: salon._id,
        type: 2,
      });

      return res.status(200).json({
        status: true,
        message: "Unfavourite successfully!",
        isFavourite: false,
      });
    } else {
      const favourite = new Favourite();
      favourite.userId = user._id;
      favourite.salonId = salon._id;
      favourite.type = 2;
      await favourite.save();

      return res.status(200).json({
        status: true,
        message: "Favourite successfully!",
        isFavourite: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get favourite salon list for user
exports.getFavouriteSalonList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    let favourite;
    let user;

    [user, favourite] = await Promise.all([
      User.findById(userId),
      Favourite.aggregate([
        {
          $match: {
            type: 2,
            userId: { $eq: userId },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "salons",
            localField: "salonId",
            foreignField: "_id",
            as: "salon",
          },
        },
        {
          $unwind: "$salon",
        },

        {
          $project: {
            _id: 1,
            createdAt: 1,
            salonId: 1,
            salonName: "$salon.name",
            mainImage: "$salon.mainImage",
            description: "$salon.description",
            address: "$salon.addressDetails",
            review: "$salon.review",
            reviewCount: "$salon.reviewCount",
            locationCoordinates: "$salon.locationCoordinates",
          },
        },
      ]),
    ]);

    let favouriteWithDistance = favourite;

    // Check if latitude and longitude are provided
    if (req.query.latitude && req.query.longitude) {
      const userLocation = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };

      // Calculate distance for each salon and add it to the response
      favouriteWithDistance = favourite.map((salon) => {
        const salonLocation = {
          latitude: parseFloat(salon.locationCoordinates.latitude),
          longitude: parseFloat(salon.locationCoordinates.longitude),
        };

        const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
        const distanceInKilometers = distanceInMeters / 1000;

        // Return the salon with added distance field
        return {
          ...salon,
          distance: distanceInKilometers,
        };
      });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    const data = req.query.latitude && req.query.longitude ? favouriteWithDistance : favourite;

    return res.status(200).json({
      status: true,
      message: "Success",
      favourite: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};