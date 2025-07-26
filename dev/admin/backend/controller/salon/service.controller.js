const Service = require("../../models/service.model");
const Salon = require("../../models/salon.model");

const mongoose = require("mongoose");

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const search = req.query.search || "";
    let query = {};

    if (search !== "ALL") {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { categoryname: { $regex: search, $options: "i" } }],
      };
    }

    const aggregationPipeline = [
      {
        $match: { isDelete: false, status: true },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },

      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          image: 1,
          duration: 1,
          price: 1,
          categoryId: "$category._id",
          categoryname: "$category.name",
          createdAt: 1,
        },
      },
      {
        $match: query,
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const [result, total] = await Promise.all([Service.aggregate(aggregationPipeline), Service.countDocuments({ isDelete: false, status: true, ...query })]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      services: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getSalonBasedServiceForExpert = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id).populate({
      path: "serviceIds",
      populate: {
        path: "id",
      },
    });

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon Not Found" });
    }

    return res.status(200).json({ status: true, data: salon.serviceIds });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.getNotAddedServices = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id).populate({
      path: "serviceIds",
      populate: {
        path: "id",
      },
    });

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon Not Found" });
    }

    const salonServiceIds = salon.serviceIds.map((service) => service.id._id);

    const notAddedServices = await Service.find({
      _id: { $nin: salonServiceIds },
      isDelete: false,
      status: true,
    });

    const total = await Service.countDocuments({
      _id: { $nin: salonServiceIds },
      status: true,
      isDelete: false,
    });

    return res.status(200).json({ status: true, total, data: notAddedServices });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.allowCityForSalonService = async (req, res) => {
  try {
    const { salonId, serviceId, allowCities } = req.body;

    if (!salonId || !serviceId || !Array.isArray(allowCities) || allowCities.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Salon ID, Service ID, and a non-empty allowCities array are required.",
      });
    }

    // Normalize input data (convert to lowercase and trim)
    const citiesToAdd = allowCities.map(({ city, country }) => {
      if (!city || !country) {
        return res.status(200).json({
          status: false,
          message: "Each city must include both 'city' and 'country'.",
        });
      }
      return {
        city: city.trim().toLowerCase(),
        country: country.trim().toLowerCase(),
      };
    });

    console.log("salonId ===============================", salonId);
    console.log("serviceId ===============================", serviceId);
    console.log("citiesToAdd ===============================", citiesToAdd);

    const salonObjId = new mongoose.Types.ObjectId(salonId);
    const serviceObjId = new mongoose.Types.ObjectId(serviceId);

    // Find the salon and check for duplicate cities
    const salon = await Salon.findOne(
      {
        _id: salonObjId,
        "serviceIds.id": serviceObjId,
      },
      { "serviceIds.$": 1 }
    );

    if (!salon || !salon.serviceIds.length) {
      return res.status(200).json({
        status: false,
        message: "Salon or Service not found.",
      });
    }

    // Extract existing cities for the given serviceId
    const existingCities = salon.serviceIds[0].allowCities.map(({ city, country }) => ({
      city: city.toLowerCase(),
      country: country.toLowerCase(),
    }));

    // Check for duplicates
    const duplicates = citiesToAdd.filter(({ city, country }) => existingCities.some((existing) => existing.city === city && existing.country === country));

    if (duplicates.length > 0) {
      return res.status(200).json({
        status: false,
        message: `The following cities are already allowed: ${duplicates.map((c) => `${c.city}, ${c.country}`).join("; ")}`,
      });
    }

    // Proceed with adding new cities
    const updatedSalon = await Salon.findOneAndUpdate(
      {
        _id: salonObjId,
        "serviceIds.id": serviceObjId,
      },
      {
        $addToSet: {
          "serviceIds.$[elem].allowCities": { $each: citiesToAdd },
        },
      },
      {
        arrayFilters: [{ "elem.id": serviceObjId }],
        new: true,
        maxTimeMS: 5000,
      }
    );

    return res.status(200).json({
      status: true,
      message: "Cities added successfully for the service in the salon.",
      data: updatedSalon,
    });
  } catch (error) {
    console.error("Error in allowCityForSalonService:", error);

    if (error.message.includes("Each city must include both")) {
      return res.status(200).json({
        status: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.blockCityForSalonService = async (req, res) => {
  try {
    const { salonId, serviceId, blockCities } = req.body;

    if (!salonId || !serviceId || !Array.isArray(blockCities) || blockCities.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Salon ID, Service ID, and a non-empty blockCities array are required.",
      });
    }

    const citiesToBlock = blockCities.map(({ city, country }) => {
      if (!city || !country) {
        throw new Error("Each city must include both 'city' and 'country'.");
      }
      return {
        city: city.trim().toLowerCase(),
        country: country.trim().toLowerCase(),
      };
    });

    const salonObjId = new mongoose.Types.ObjectId(salonId);
    const serviceObjId = new mongoose.Types.ObjectId(serviceId);

    const salon = await Salon.findOne({ _id: salonObjId, "serviceIds.id": serviceObjId });

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon or Service not found.",
      });
    }

    for (const cityToBlock of citiesToBlock) {
      await Salon.updateOne(
        {
          _id: salonObjId,
          "serviceIds.id": serviceObjId,
        },
        {
          $pull: {
            "serviceIds.$.allowCities": cityToBlock,
          },
        }
      );
    }

    const updatedSalon = await Salon.findOne({
      _id: salonObjId,
      "serviceIds.id": serviceObjId,
    });

    return res.status(200).json({
      status: true,
      message: "Cities blocked successfully for the service in the salon.",
      data: updatedSalon,
    });
  } catch (error) {
    console.error("Error in blockCityForSalonService:", error);

    if (error.message.includes("Each city must include both")) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getAllowedCitiesForSalonServices = async (req, res) => {
  try {
    const { salonId } = req.query;

    if (!salonId) {
      return res.status(200).json({ message: "Salon ID is required." });
    }

    const salonObjId = new mongoose.Types.ObjectId(salonId);

    const salon = await Salon.findById(salonObjId).select("serviceIds.allowCities").lean();

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Allowed cities for services retrieved successfully.",
      data: salon,
    });
  } catch (error) {
    console.error("Error in getAllowedCitiesForSalonServices:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
