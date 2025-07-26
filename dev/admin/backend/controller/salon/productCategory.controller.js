
const Category = require('../../models/productCategory.model')


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