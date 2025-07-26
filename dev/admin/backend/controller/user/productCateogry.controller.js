
const Category = require('../../models/productCategory.model')
const Product = require('../../models/product.model')
const User = require('../../models/user.model')


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



exports.getCategoryProducts = async (req, res) => {
  try {
    if (!req.query.categoryId) {

      return res.status(200).json({
        status: false,
        message: "CagoryId is required",
      })

    }
    const category = await Category.findById(req.query.categoryId).sort({ createdAt: -1, isActive: -1, productCount: -1 });

    if (!category) {
      return res.status(200).json({
        status: false,
        message: "No Category Found",
        data: category
      })
    }
    const userId = req.query.userId; // Get userId from query if available

    let user;

    // Only check user if userId is provided
    if (userId) {
      user = await User.findById(userId);

      if (!user) {
        return res.status(200).json({
          status: false,
          message: "User does not found.",
        });
      }
    }

    const products = await Product.aggregate([
      {
        $match: { createStatus: "Approved", category: category._id },
      },

      {
        $sort: { sold: -1 },
      },
      {
        $lookup: {
          from: "favorites",
          let: {
            productId: "$_id",
            userId: userId,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
          ],
          as: "isFavorite",
        },
      },
      {
       $lookup: {
          from:"salons",
          localField:"salon",
          foreignField:"_id",
          as:"salonInfo"
       }
       
      },
      {
        $unwind: { path: "$salonInfo", preserveNullAndEmptyArrays: true }
     },
      {
        $project: {
          mainImage: 1,
          images: 1,
          price: 1,
          shippingCharges: 1,
          productName: 1,
          productCode: 1,
          attributes: 1,
          location: 1,
          sold: 1,
          review: 1,
          isOutOfStock: 1,
          isNewCollection: 1,
          description: 1,
          category: 1,
          brand: 1,
          salon: 1,
          rating: 1,
          mrp: 1,
          isBestSeller: { $ifNull: ["$salonInfo.isBestSeller", false] },
          createStatus: 1,
          updateStatus: 1,
          isFollow: {
            $cond: [
              { $eq: [{ $size: { $ifNull: ["$isFollow", []] } }, 0] },
              false,
              true
            ],
          },
          isFavorite: {
            $cond: [
              { $eq: [{ $size: { $ifNull: ["$isFavorite", []] } }, 0] },
              false,
              true
            ],
          },
        },
      },


    ]);

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved all Categories by the admin.",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};