const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Favorite = require("../../models/favourite.model");

const { deleteFile } = require("../../middleware/deleteFile");

const geolib = require("geolib");

const normalizeCityName = (cityName) => {
  return cityName
    .replace(/\s*\(.*?\)$/, "")
    .trim()
    .toLowerCase();
};

exports.getAll = async (req, res) => {
  try {
    const userId = req.query.userId;
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    let user;
    if (userId) {
      user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(200).json({ status: false, message: "User not found" });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "User is blocked. Please contact admin" });
      }
    }

    let salons = await Salon.find({ isDelete: false, isActive: true });

    if (latitude && longitude) {
      const userLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const distanceArray = await Promise.all(
        salons.map(async (salon) => {
          const salonLocation = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };

          const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
          const distanceInKilometers = distanceInMeters / 1000;

          const isFavorite = userId ? await Favorite.exists({ userId: userId, salonId: salon._id, type: 2 }) : false;

          return {
            ...salon.toObject(),
            distance: distanceInKilometers,
            isFavorite: !!isFavorite,
          };
        })
      );

      distanceArray.sort((a, b) => a.distance - b.distance);
      salons = distanceArray;
    } else {
      salons = await Promise.all(
        salons.map(async (salon) => {
          const isFavorite = userId ? await Favorite.exists({ userId: userId, salonId: salon._id, type: 2 }) : false;

          return {
            ...salon.toObject(),
            isFavorite: !!isFavorite,
          };
        })
      );
    }

    return res.status(200).json({ status: true, message: "Success", data: salons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.serviceBaseSalon = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details" });
    }

    const serviceIds = req.query.serviceId.split(",");
    const experts = await Expert.find({
      serviceId: { $all: serviceIds },
      isDelete: false,
      isBlock: false,
    });

    const uniqueSalonIds = [...new Set(experts.map((expert) => expert.salonId.toString()))];

    const salons = await Promise.all(
      uniqueSalonIds.map(async (salonId) => {
        const salon = await Salon.findOne({ isDelete: false, _id: salonId });
        if (req.query.latitude && req.query.longitude) {
          const device1 = {
            latitude: parseFloat(req.query.latitude),
            longitude: parseFloat(req.query.longitude),
          };

          const device2 = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };

          const distanceInMeters = geolib.getDistance(device1, device2);

          const distanceInKilometers = distanceInMeters / 1000;
          console.log("distanceInMeters", distanceInMeters);
          console.log("distanceInKilometers", distanceInKilometers);

          return {
            _id: salon._id,
            name: salon.name,
            addressDetails: salon.addressDetails,
            image: salon.mainImage,
            mobile: salon.mobile,
            rating: salon.review,
            ratingCount: salon.reviewCount,
            distance: distanceInKilometers,
          };
        } else
          return {
            _id: salon._id,
            name: salon.name,
            addressDetails: salon.addressDetails,
            image: salon.mainImage,
            mobile: salon.mobile,
            rating: salon.review,
            ratingCount: salon.reviewCount,
          };
      })
    );
    return res.status(200).send({ status: true, data: salons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.salonData = async (req, res) => {
  try {
    const city = req.query.city ? req.query.city.trim() : null;

    if (!city) {
      return res.status(200).json({
        status: false,
        message: "City is required in query parameters.",
      });
    }

    if (!req.query.salonId) {
      return res.status(200).send({ status: false, message: "Invalid salon details." });
    }

    const salon = await Salon.findOne({
      _id: req.query.salonId,
      isActive: true,
      isDelete: false,
    }).populate("serviceIds.id");

    if (!salon) {
      return res.status(404).send({
        status: false,
        message: "Salon Not Found",
      });
    }

    const filteredServices = salon.serviceIds.filter((service) => service.allowCities.some((allowedCity) => allowedCity.city.toLowerCase() === city.toLowerCase()));

    const [reviews, experts, product] = await Promise.all([
      Review.find({ salonId: salon._id }).populate({
        path: "userId",
        select: "fname lname image _id",
      }),
      Expert.find({
        salonId: salon._id,
        isBlock: false,
        isDelete: false,
      }).select("fname lname image review reviewCount serviceId"),
      Product.aggregate([
        { $match: { createStatus: "Approved" } },
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
            isBestSeller: 1,
            mrp: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    const tax = global.settingJSON.tax;
    if (!tax) {
      return res.status(200).send({ status: false, message: "Tax settings not found." });
    }

    let salonData = salon.toObject();
    if (req.query.latitude && req.query.longitude) {
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };
      const device2 = {
        latitude: parseFloat(salon.locationCoordinates.latitude),
        longitude: parseFloat(salon.locationCoordinates.longitude),
      };
      const distanceInKilometers = geolib.getDistance(device1, device2) / 1000;

      salonData = { ...salonData, distance: distanceInKilometers };
    }

    salonData.serviceIds = filteredServices;

    return res.status(200).json({
      status: true,
      message: "Success",
      salon: salonData,
      product,
      reviews,
      experts,
      tax,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
