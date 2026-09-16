const express = require("express");
const route = express.Router();
const Category = require("../../models/category.model");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const salon = require("../../middleware/salon");

async function getAllCategory(req, res) {
  try {
    const categories = await Category.find({ isDelete: { $ne: true } })
      .select("-isDelete -updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      status: true,
      message: "Categories Found",
      data: categories || [],
      total: categories?.length || 0,
    });
  } catch (error) {
    console.error("[salon/category/getAllCategory]", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
}

/**
 * GET /salon/category/getAllCategory
 * Read-only list for salon panel (ServiceDialogue, etc.).
 * Older panels called this path; it was never mounted → HTML/JSON 404.
 */
route.get("/getAllCategory", checkAccessWithSecretKey(), salon, getAllCategory);
route.get("/getAll", checkAccessWithSecretKey(), salon, getAllCategory);

module.exports = route;
