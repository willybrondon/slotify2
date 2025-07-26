const Product = require("../../models/product.model");

//import model
const Salon = require("../../models/salon.model");
const Category = require("../../models/productCategory.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const Favorite = require("../../models/favourite.model");
const Review = require("../../models/review.model");
const Rating = require("../../models/rating.model");
const ProductRequest = require("../../models/productRequest.model");

//mongoose
const mongoose = require("mongoose");

//fs
const fs = require("fs");

//deleteFiles
const { deleteFiles } = require("../../middleware/deleteFile");

//product request accept or decline (create product)
exports.acceptCreateRequest = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.type) {
      return res.status(200).json({ status: false, message: "ProductId and type must be requried." });
    }

    const type = req.query.type.trim();

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found." });
    }

    if (product.createStatus === "Approved") {
      return res.status(200).json({
        status: false,
        message: "product request already accepted by the admin for create the product.",
      });
    }

    if (type === "Approved") {
      product.createStatus = "Approved";
      await product.save();

      return res.status(200).json({
        status: true,
        message: "Product request accepted by the admin.",
        product: product,
      });
    } else if (type === "Rejected") {
      product.createStatus = "Rejected";
      await product.save();

      //await Product.findByIdAndDelete(product._id);

      return res.status(200).json({
        status: true,
        message: "Product request rejected by the admin for create the product.",
        product: product,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get status wise create product requests
exports.statusWiseProduct = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const status = req.query.status.trim();

    let statusQuery = {};
    if (status === "Pending") {
      statusQuery = { createStatus: "Pending" };
    } else if (status === "Approved") {
      statusQuery = { createStatus: "Approved" };
    } else if (status === "Rejected") {
      statusQuery = { createStatus: "Rejected" };
    } else if (status === "All") {
      statusQuery = {
        createStatus: {
          $in: ["Pending", "Approved", "Rejected"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(statusQuery),
      Product.find(statusQuery)
        .populate("category", "name _id")
        .populate("salon", "name mainImage _id")
        .sort({ createdAt: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: `Retrive products with status ${req.query.status}`,
      totalProducts: total,
      products: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//update product
exports.updateProduct = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.salonId || !req.query.productCode) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);
    const salonId = new mongoose.Types.ObjectId(req.query.salonId);
    const productCode = req.query.productCode.trim();

    const [salon, product] = await Promise.all([
      Salon.findById(salonId),
      Product.findOne({
        _id: productId,
        productCode: productCode,
        salon: salonId,
        createStatus: "Approved",
      }),
    ]);

    if (!salon) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "salon does not found!!" });
    }

    if (!product) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "No product Was found." });
    }

    if (req?.body?.category) {
      var category = await Category.findById(req.body.category);
      if (!category) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "category does not found." });
      }
    }

    product.productName = req.body.productName ? req.body.productName : product.productName;
    product.brand = req.body.brand ? req.body.brand : product.brand;
    product.description = req.body.description ? req.body.description : product.description;
    product.price = req.body.price ? req.body.price : product.price;
    product.mrp = req.body.mrp ? req.body.mrp : product.mrp;
    product.shippingCharges = req.body.shippingCharges ? req.body.shippingCharges : product.shippingCharges;
    product.category = req.body.category ? category._id : product.category;
    product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    product.updateStatus = "Approved";
    product.isUpdateByAdmin = true;

    if (req?.files?.mainImage) {
      const image = product?.mainImage.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      product.mainImage = process.env.baseURL + req.files.mainImage[0].path;
    }

    if (req?.files?.images) {
      var imagesData = [];

      if (product.images.length > 0) {
        for (var i = 0; i < product.images.length; i++) {
          const images = product.images[i].split("storage");
          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }

      await req.files.images.map((data) => {
        imagesData.push(process.env.baseURL + data.path);
      });

      product.images = imagesData;
    }

    if (req.body.attributes) {
      let attributes;

      if (typeof req.body.attributes === "string") {
        console.log("attributes in body: ", typeof req.body.attributes);

        attributes = JSON.parse(req.body.attributes);
      } else if (typeof req.body.attributes === "object") {
        console.log("attributes in body: ", typeof req.body.attributes);

        attributes = req.body.attributes;
      } else {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({
          status: false,
          message: "Invalid attributes format",
        });
      }

      if (Array.isArray(attributes)) {
        const updatedAttributes = attributes.map((attr) => {
          if (attr && attr._id) {
            const existingAttribute = product.attributes.find((attribute) => attribute && attribute._id && attribute._id.toString() === attr._id.toString());

            if (existingAttribute) {
              const updatedAttribute = {
                ...existingAttribute,
                name: attr.name || existingAttribute.name,
                value: attr.value || existingAttribute.value,
              };

              return updatedAttribute;
            }
          }

          return attr;
        });

        product.attributes = updatedAttributes;
      } else {
        console.log("req.body.attributes is not an array.");
      }
    }

    await product.save();

    const product_ = await Product.findById(product._id).populate([
      { path: "category", select: "name" },
      { path: "salon", select: "name" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Product has been updated.",
      product: product_,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//product handle (isTrending OR isOutOfStock OR isNewCollection)
exports.manageProduct = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.type) {
      return res.status(200).json({ status: false, message: "productId must be requried." });
    }

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found." });
    }

    const type = req.query.type.trim().toLowerCase();

    if (type === "trending") {
      product.isTrending = !product.isTrending;
    } else if (type === "outofstock") {
      product.isOutOfStock = !product.isOutOfStock;
    } else if (type === "new") {
      product.isNewCollection = !product.isNewCollection;
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }

    await product.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get product details
exports.productDetails = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(200).json({ status: true, message: "Oops! Invalid details!!" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "No product was found." });
    }

    if (!product.salon) {
      return res.status(200).json({ status: false, message: "Salon of this product was not found." });
    }

    const [salon, productData] = await Promise.all([Salon.findById(product.salon), Product.findOne({ _id: product._id }).populate("category", "name")]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon of this product was not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Product details retrieved successfully.",
      product: productData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get products
exports.getProducts = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: false, message: "status must be requried." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status.trim();

    let statusQuery = {};
    if (status === "Pending") {
      statusQuery = { createStatus: "Pending" };
    } else if (status === "Approved") {
      statusQuery = { createStatus: "Approved" };
    } else if (status === "Rejected") {
      statusQuery = { createStatus: "Rejected" };
    } else if (status === "All") {
      statusQuery = {
        createStatus: {
          $in: ["Pending", "Approved", "Rejected"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const query = [
      { path: "category", select: "name" },
      {
        path: "salon",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const [totalProducts, product] = await Promise.all([
      Product.countDocuments({ isAddByAdmin: false, ...statusQuery }),
      Product.find({ isAddByAdmin: false, ...statusQuery })
        .populate(query)
        .sort({ createdAt: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive the products.",
      totalProducts: totalProducts,
      product: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete product
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "productId must be requried!" });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);

    const product = await Product.findOne({ _id: productId, createStatus: "Approved" });
    if (!product) {
      return res.status(200).json({ status: false, message: "Product does not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Product has been deleted.",
    });

    if (product.mainImage) {
      const image = product?.mainImage?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
    }

    if (product.images) {
      if (product.images.length > 0) {
        for (var i = 0; i < product?.images?.length; i++) {
          const images = product?.images[i]?.split("storage");
          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }
    }

    const [cart, order, favorite, review, rating, productRequest] = await Promise.all([
      Cart.deleteMany({ "items.product": productId }),
      Order.deleteMany({ "items.product": productId }),
      Favorite.deleteMany({ productId: productId }),
      Review.deleteMany({ productId: productId }),
      Rating.deleteMany({ productId: productId }),
      ProductRequest.find({ productCode: product?.productCode }),
    ]);

    if (productRequest.length > 0) {
      await productRequest.forEach(async (product) => {
        if (product.mainImage) {
          const image = product?.mainImage?.split("storage");
          if (image) {
            if (fs.existsSync("storage" + image[1])) {
              fs.unlinkSync("storage" + image[1]);
            }
          }
        }

        if (product.images) {
          if (product.images.length > 0) {
            for (var i = 0; i < product?.images?.length; i++) {
              const images = product?.images[i]?.split("storage");
              if (images) {
                if (fs.existsSync("storage" + images[1])) {
                  fs.unlinkSync("storage" + images[1]);
                }
              }
            }
          }
        }
      });
    }

    await ProductRequest.deleteMany({ productCode: product?.productCode });
    await product.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
