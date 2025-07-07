const Salon = require("../../models/salon.model");
const { deleteFile } = require("../../middleware/deleteFile");
const Expert = require("../../models/expert.model");
const Review = require("../../models/review.model");
const Service = require("../../models/service.model");
const Setting = require("../../models/setting.model");
const User = require("../../models/user.model");
const geolib = require("geolib");

exports.getAll = async (req, res) => {
  try {
    let data;
    if (req.query.latitude && req.query.longitude) {
      const firstArray = [];

      //for host
      const result1 = await Salon.find({ isDelete: false, isActive: true });

      await firstArray.push(...result1);

      const distanceArray = [];
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };

      for (let i = 0; i < firstArray.length; i++) {
        const element = firstArray[i];

        const device2 = {
          latitude: parseFloat(element.locationCoordinates.latitude),
          longitude: parseFloat(element.locationCoordinates.longitude),
        };

        const distanceInMeters = geolib.getDistance(device1, device2);

        const distanceInKilometers = distanceInMeters / 1000;

        await distanceArray.push({
          ...element.toObject(),
          distance: distanceInKilometers,
        });
      }

      distanceArray.sort((a, b) => a.distance - b.distance);
      data = distanceArray;
    } else {
      data = await Salon.find({ isActive: true, isDelete: false })
        .select("-salonTime")
        .sort({ createdAt: -1 });
    }

    return res.status(200).send({ status: true, message: "Success", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.serviceBaseSalon = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details" });
    }

    const serviceIds = req.query.serviceId.split(",");
    const experts = await Expert.find({
      serviceId: { $all: serviceIds },
      isDelete: false,
      isBlock: false,
    });

    const uniqueSalonIds = [...new Set(experts.map(expert => expert.salonId.toString()))];



    console.log("uniqueSalonIds------",uniqueSalonIds);


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
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.salonWithExpertReview = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details" });
    }

    const salon = await Salon.findOne({_id:req.query.salonId,isActive:true,isDelete:false}).populate("serviceIds.id");
    if (!salon ) {
      return res.status(200).send({
        status: false,
        message: "Salon Not Found",
      });
    }

    const [reviews, experts, tax] = await Promise.all([
      Review.find({ salonId: salon?._id }).populate({
        path: "userId",
        select: "fname lname image _id",
      }),
      Expert.find({
        salonId: salon._id,
        isBlock: false,
        isDelete: false,
      }).select("fname lname image review reviewCount serviceId"),

      Setting.findOne({}).select("tax"),
    ]);

    if (!tax) {
      return res.status(200).send({
        status: false,
        message: "Setting Not Found",
      });
    }



    let data = [];
    if (req.query.latitude && req.query.longitude) {
     
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };

      console.log("device1", device1);
      const device2 = {
        latitude: parseFloat(salon.locationCoordinates.latitude),
        longitude: parseFloat(salon.locationCoordinates.longitude),
      };
      console.log("device1", device1);
      const distanceInMeters = geolib.getDistance(device1, device2);

      const distanceInKilometers = distanceInMeters / 1000;
      console.log("distanceInMeters", distanceInMeters);
      console.log("distanceInKilometers", distanceInKilometers);

      await data.push({
        ...salon.toObject(),
        distance: distanceInKilometers,
      });
    }

    console.log("data", data);
    return res.status(200).send({
      status: true,
      message: "Success",
      salon: data.length ? data[0] : salon,

      reviews,
      experts,
      tax: tax.tax,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
