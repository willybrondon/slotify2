const Service = require("../../models/service.model");
const Category = require("../../models/category.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");

const fs = require("fs");
const { deleteFile } = require("../../middleware/deleteFile");

exports.create = async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.categoryId ||
      !req.file ||
      !req.body.duration
      // || !req.body.price
    ) {
      if (req.files) deleteFile(req.files);
      return res.status(200).send({ status: false, message: "Oops ! Invalid details" });
    }

    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      if (req.files) deleteFile(req.files);
      return res.status(200).send({ status: false, message: "Oops ! Category Not Found" });
    }

    const service = new Service();

    service.name = capitalizeFirstLetter(req.body.name);
    service.price = req?.body?.price;
    service.duration = req.body.duration;
    service.categoryId = req.body.categoryId;
    service.image = req.file ? process.env.baseURL + req.file.path : "";
    await service.save();

    return res.status(200).send({
      status: true,
      message: "Service Created Successful !",
      data: service,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

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
        $match: { isDelete: false },
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
        $match: { ...query },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt field in descending order
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];

    const [result, total] = await Promise.all([Service.aggregate(aggregationPipeline), Service.countDocuments({ isDelete: false, ...query })]);

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

exports.update = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      if (req.files.image) deleteFile(req.files.image[0]);
      return res.status(200).send({ status: false, message: "Service not exist" });
    }

    service.name = req.body.name ? capitalizeFirstLetter(req.body.name) : service.name;
    service.price = req.body.price ? req.body.price : service.price;
    service.status = req.body.status ? req.body.status : service.status;

    if (req.file) {
      const image = service.image.split("storage");
      if (image !== "/noImage.png") {
        if (fs.existsSync(`storage${image[1]}`)) {
          fs.unlinkSync(`storage${image[1]}`);
        }
      }

      service.image = req.file ? process?.env?.baseURL + req?.file?.path : service.image;
    }
    service.duration = req.body.duration ? req.body.duration : service.duration;
    service.categoryId = req.body.categoryId ? req.body.categoryId : service.categoryId;
    await service.save();

    const data = await Service.aggregate([
      {
        $match: { _id: service._id },
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$$categoryId", "$_id"] } },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          categoryname: "$category.name",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          image: 1,
          duration: 1,
          price: 1,
          categoryId: 1,
          categoryname: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: "Service Updated Successfully",
      service: data[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      return res.status(200).send({ status: false, message: "service not exist" });
    }

    await Expert.updateMany({ serviceIds: service._id }, { $pull: { serviceIds: service._id } });
    await Salon.updateMany({ "serviceIds.id": service._id }, { $pull: { serviceIds: { id: service._id } } });

    const image = service.image?.split("storage");
    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }

    service.isDelete = true;
    await service.save();

    return res.status(200).send({ status: true, message: "Service Deleted!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.handleStatus = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      return res.status(200).send({ status: false, message: "service not exists" });
    }

    service.status = !service.status;
    await service.save();

    if (service.status === false) {
      await Promise.all([
        await Expert.updateMany({ serviceIds: service._id }, { $pull: { serviceIds: service._id } }),

        await Salon.updateMany({ "serviceIds.id": service._id }, { $pull: { serviceIds: { id: service._id } } }),
      ]);
    }

    return res.status(200).send({ status: true, message: "service status updated", service });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
