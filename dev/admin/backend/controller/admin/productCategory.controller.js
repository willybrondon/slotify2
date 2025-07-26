const Category = require("../../models/productCategory.model");

const { deleteFile } = require("../../middleware/deleteFile");
const fs = require("fs");

exports.store = async (req, res) => {
  try {
    if (!req.body.name.trim()) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const category = new Category();

    category.name = req.body.name.trim();
    category.image = process.env.baseURL + req?.file?.path;
    await category.save();

    return res.status(200).json({ status: true, message: "Category has been Created by the admin.", data: category });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "category Id is required!!" });
    }

    const category = await Category.findById(req.query.categoryId).populate();
    if (!category) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "category does not found!" });
    }

    if (req?.file) {
      const image = category?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      category.image = process.env.baseURL + req?.file?.path;
    }

    category.name = req.body.name.trim() ? req.body.name.trim() : category.name.trim();
    await category.save();

    return res.status(200).json({ status: true, message: "category has been Updated by the admin.", category: category });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.isActive = async (req, res) => {
  try {
    if (!req.query.productCategoryId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const category = await Category.findById(req.query.productCategoryId);
    if (!category) {
      return res.status(200).json({ status: false, message: "category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.status(200).json({ status: true, message: "Status Updated Successfully", category });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1, isActive: -1, productCount: -1 });

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved all Categories by the admin.",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
