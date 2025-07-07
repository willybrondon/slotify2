const Category = require("../../models/category.model");

//get all category for admin panel
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isDelete: false ,status:true}).select("-isDelete -updatedAt -createdAt").sort({
      createdAt: -1,
    });

    return res.status(200).send({
      status: true,
      message: "Categories Found",
      data:categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
