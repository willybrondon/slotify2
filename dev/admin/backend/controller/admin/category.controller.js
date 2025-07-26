const Category = require("../../models/category.model");
const Expert = require("../../models/expert.model");
const Service = require("../../models/service.model");

const fs = require("fs");
const { deleteFile } = require("../../middleware/deleteFile");

//get all category
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isDelete: false }).select("-isDelete -updatedAt").sort({ createdAt: -1 }).lean();

    return res.status(200).send({
      status: true,
      message: "Categories Found",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//create category
exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req?.file) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const category = new Category();
    category.name = req.body.name;
    category.image = req.file ? process?.env?.baseURL + req?.file?.path : "";
    await category.save();

    return res.status(200).send({
      status: true,
      message: "Category Created Successful !",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error!!" });
  }
};

//update category
exports.update = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const category = await Category.findById(req.query.categoryId);
    if (!category) {
      if (req.files.image) deleteFile(req.files.image[0]);
      return res.status(200).send({ status: false, message: "category not exist" });
    }

    category.name = req.body.name ? req.body.name : category.name;

    if (req.file) {
      var image_ = category.image.split("storage");
      if (image_[1] !== "/noImage.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      category.image = req.file ? process?.env?.baseURL + req?.file?.path : category.image;
    }

    await category.save();

    return res.status(200).send({
      status: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error!!" });
  }
};

//delete category
exports.delete = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const category = await Category.findById(req.query.categoryId);
    if (!category) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    await Service.updateMany({ categoryId: category._id }, { $set: { isDelete: true } });

    const experts = await Expert.find({
      serviceId: { $in: category.serviceIds },
      isDelete: false,
    });

    // Update each expert to remove the deleted services
    await Promise.all(
      experts.map(async (expert) => {
        expert.serviceId = expert.serviceId.filter((id) => !category.serviceIds.includes(id));
        await expert.save();
      })
    );

    category.isDelete = true;
    await category.save();

    return res.status(200).send({ status: true, message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//active or not category
exports.status = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const category = await Category.findById(req.query.categoryId);
    if (!category) {
      return res.status(200).send({ status: false, message: "category not exist" });
    }

    category.status = !category.status;
    await category.save();

    return res.status(200).send({ status: true, message: "Status Updated Successfully", category });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
