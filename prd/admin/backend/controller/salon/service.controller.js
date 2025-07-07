const Service = require("../../models/service.model");
const Salon = require("../../models/salon.model");

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const search = req.query.search || "";
    let query = {};

    if (search !== "ALL") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { categoryname: { $regex: search, $options: "i" } },
        ],
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

    const [result,total]  = await Promise.all([
      Service.aggregate(aggregationPipeline),
      Service.countDocuments({ isDelete: false, status: true, ...query }),
    ])


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
      return res
        .status(200)
        .json({ status: false, message: "Salon Not Found" });
    }

    return res.status(200).json({ status: true, data: salon.serviceIds });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
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
      return res
        .status(200)
        .json({ status: false, message: "Salon Not Found" });
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

    return res
      .status(200)
      .json({ status: true,total, data: notAddedServices  });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};
