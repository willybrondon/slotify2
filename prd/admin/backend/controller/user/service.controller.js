const Service = require("../../models/service.model");
const Setting = require("../../models/setting.model");

exports.getAll = async (req, res) => {
  try {
    const search = req.query.search || "";
    let query = {};

    const tax = await Setting.findOne().select("tax");
    if (search !== "ALL") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "category.name": { $regex: search, $options: "i" } },
        ],
      };
    }

    const aggregationPipeline = [
      {
        $match: { isDelete: false, status: true, ...query },
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

exports.serviceBasedCategory = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details" });
    }

    const [service, tax] = await Promise.all([
      Service.find({
        categoryId: req.query.categoryId,
        status: true,
        isDelete: false,
      }),
      Setting.findOne().select("tax"),
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      services: service,
      tax: tax.tax,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};
