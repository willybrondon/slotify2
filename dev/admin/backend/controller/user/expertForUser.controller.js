const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const mongoose = require("mongoose");

exports.getExpertServiceWise = async (req, res) => {
  try {
    if (!req.query.serviceId || !req.query.salonId) {
      return res.status(201).json({ status: false, message: "Oops Invalid Detail" });
    }

    let service = Array.isArray(req.query.serviceId) ? req.query.serviceId : [req.query.serviceId];

    let serviceIds = service[0].split(",").map((element) => new mongoose.Types.ObjectId(element));

    const [salon, tax] = await Promise.all([
      Salon.findOne({
        _id: req.query.salonId,
        isActive: true,
        isDelete: false,
      }).populate("serviceIds.id"),
      global.settingJSON,
    ]);

    if (!salon) {
      return res.status(201).json({ status: false, message: "Oops! Salon Not Found!!" });
    }

    const expert = await Expert.find({
      salonId: salon._id,
      serviceId: { $all: serviceIds },
      isBlock: false,
      isDelete: false,
    }).populate({
      path: "salonId",
      select: "name",
    });

    let matchedServices = [];
    if (expert.length > 0) {
      matchedServices = salon.serviceIds.filter((service) => {
        return serviceIds.toString().includes(service.id?._id);
      });
    }

    return res.status(200).json({
      status: true,
      message: "Data found",
      data: expert,
      tax: tax.tax,
      matchedServices,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getTopExperts = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skipAmount = start * limit;

    const experts = await Expert.aggregate([
      {
        $match: { isBlock: false, isDelete: false },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salonInfo",
        },
      },
      {
        $match: {
          "salonInfo.isActive": true,
          "salonInfo.isDelete": false,
        },
      },
      {
        $project: {
          review: 1,
          reviewCount: 1,
          fname: 1,
          lname: 1,
          image: 1,
          _id: 1,
        },
      },
      { $skip: skipAmount },
      { $limit: limit },
      { $sort: { review: -1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Data found",
      data: experts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertWithServiceForUser = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(201).send({ status: false, message: "Invalid Details" });
    }

    const expertId = req.query.expertId;

    const expert = await Expert.findById(expertId).populate("salonId", "name _id");
    if (!expert) {
      return res.status(201).send({ status: false, message: "Expert not found" });
    }

    const expertServiceIds = expert.serviceId;

    const [salon, tax] = await Promise.all([
      Salon.findOne({
        _id: expert.salonId,
        isActive: true,
        isDelete: false,
      }).populate("serviceIds.id"),
      global.settingJSON,
    ]);

    // const salon = await Salon.findOne({
    //   _id: expert.salonId,
    //   isActive: true,
    //   isDelete: false,
    // }).populate("serviceIds.id");

    if (!salon) {
      return res.status(201).send({ status: false, message: "Salon not found" });
    }

    if (!tax) {
      return res.status(201).send({ status: false, message: "Setting not found" });
    }

    const matchedServices = salon.serviceIds.filter((service) => expertServiceIds.includes(service.id?._id));

    const servicesWithPrice = matchedServices.map((service) => {
      const { id, price } = service;
      return { id, price };
    });

    const data = {
      services: servicesWithPrice,
      expert,
      tax: tax.tax,
    };

    return res.status(200).json({
      status: true,
      message: "Expert's services with prices found",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};
