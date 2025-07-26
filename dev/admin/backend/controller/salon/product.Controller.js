const Category = require("../../models/productCategory.model");
const Product = require("../../models/product.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");

const mongoose = require("mongoose");
const fs = require("fs");
const { deleteFiles } = require("../../middleware/deleteFile");

exports.createProduct = async (req, res) => {
  try {
    if (
      !req.body.productName ||
      !req.body.description ||
      !req.body.price ||
      !req.body.mrp ||
      !req.body.category ||
      !req.body.shippingCharges ||
      !req.body.productCode ||
      !req.body.attributes ||
      !req.body.brand ||
      !req.files
    ) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid deatils." });
    }

    if (Number(req.body.price) > Number(req.body.mrp)) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Product price can not be greater than MRP." });
    }

    const [category, salon] = await Promise.all([Category.findById(req.body.category), Salon.findById(req.salon._id)]);

    if (!category) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "category does not found." });
    }

    if (!salon) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "salon does not found." });
    }

    if (global.settingJSON.isAddProductRequest) {
      const existProduct = await Product.findOne({ salon: salon._id, productCode: req.body.productCode });
      if (existProduct) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({
          status: false,
          message: "Product with the same product code already exists.",
          product: existProduct,
        });
      }

      if (existProduct?.createStatus === "Pending") {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({
          status: true,
          message: "You have already sent a request to admin for create the product.",
          createStatus: existProduct.createStatus,
          request: existProduct,
        });
      }

      if (existProduct?.createStatus === "Approved") {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({
          status: false,
          message: "product request already has been accepted for create the product.",
          createStatus: existProduct.createStatus,
          request: existProduct,
        });
      }

      const product = new Product();

      product.productName = req.body.productName.trim();
      product.description = req.body.description.trim();
      product.price = req.body.price;
      product.category = category._id;
      product.mrp = req.body.mrp;

      product.salon = salon._id;
      product.brand = req.body.brand;
      product.createStatus = "Pending";
      product.shippingCharges = req.body.shippingCharges;
      product.productCode = req.body.productCode;
      product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      if (req.files.mainImage) {
        product.mainImage = process.env.baseURL + req.files.mainImage[0].path;
      }

      if (req.files.images) {
        const imagesData = [];
        await req.files.images.map((data) => {
          imagesData.push(process.env.baseURL + data.path);
        });
        product.images = imagesData;
      }

      if (req.body.attributes) {
        console.log("type: ", typeof req.body.attributes);

        let attributes;

        if (typeof req.body.attributes === "string") {
          attributes = JSON.parse(req.body.attributes);
        } else if (typeof req.body.attributes === "object") {
          attributes = req.body.attributes;
        } else {
          if (req.files) deleteFiles(req.files);
          return res.status(200).json({
            status: false,
            message: "Invalid attributes format",
          });
        }

        if (Array.isArray(attributes)) {
          product.attributes = attributes.map((attr) => ({
            name: attr.name,
            value: Array.isArray(attr.value) ? attr.value.map(String) : [attr.value.toString()],
          }));
        } else {
          console.log("req.body.attributes is not an array.");
        }
      }

      console.log("product.attributes: ", product.attributes);

      await product.save();

      const product_ = await Product.findById(product._id).populate([
        { path: "category", select: "name" },

        {
          path: "salon",
          select: "firstName lastName businessTag businessName image",
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "Product request created by salon to admin.",
        product: product_,
      });
    } else {
      const existProduct = await Product.findOne({ salon: salon._id, productCode: req.body.productCode });
      if (existProduct) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({
          status: false,
          message: "Product with the same product code already exists.",
          product: existProduct,
        });
      }

      const product = new Product();

      product.productName = req.body.productName.trim();
      product.description = req.body.description.trim();
      product.price = req.body.price;
      product.category = category._id;

      product.salon = salon._id;
      product.createStatus = "Approved";
      product.shippingCharges = req.body.shippingCharges;
      product.productCode = req.body.productCode;
      product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      if (req.files.mainImage) {
        product.mainImage = process.env.baseURL + req.files.mainImage[0].path;
      }

      if (req.files.images) {
        const imagesData = [];
        await req.files.images.map((data) => {
          imagesData.push(process.env.baseURL + data.path);
        });
        product.images = imagesData;
      }

      if (req.body.attributes) {
        console.log("type: ", typeof req.body.attributes);

        let attributes;

        if (typeof req.body.attributes === "string") {
          attributes = JSON.parse(req.body.attributes);
        } else if (typeof req.body.attributes === "object") {
          attributes = req.body.attributes;
        } else {
          if (req.files) deleteFiles(req.files);
          return res.status(200).json({
            status: false,
            message: "Invalid attributes format",
          });
        }

        if (Array.isArray(attributes)) {
          product.attributes = attributes.map((attr) => ({
            name: attr.name,
            value: Array.isArray(attr.value) ? attr.value.map(String) : [attr.value.toString()],
          }));
        } else {
          console.log("req.body.attributes is not an array.");
        }
      }

      console.log("product.attributes: ", product.attributes);

      await product.save();

      const product_ = await Product.findById(product._id).populate([
        { path: "category", select: "name" },

        {
          path: "salon",
          select: "firstName lastName businessTag businessName image",
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "isAddProductRequest is false by admin then directly product added by the salon.",
        product: product_,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.updateProductBySalon = async (req, res) => {
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
        //createStatus: "Approved",
      }),
    ]);

    if (!salon) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "salon does not found." });
    }

    if (product.createStatus !== "Approved") {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Product approval is pending." });
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

exports.isOutOfStock = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "salon does not found." });
    }

    const product = await Product.findOne({ _id: req.query.productId, salon: req.salon._id });
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found." });
    }

    product.isOutOfStock = !product.isOutOfStock;
    await product.save();

    return res.status(200).json({
      status: true,
      message: "product is out of stock",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.detailforSalon = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [product, salon] = await Promise.all([Product.findById(req.query.productId), Salon.findById(req.salon._id)]);

    if (!product) {
      return res.status(200).json({ status: false, message: "No product was found!" });
    }

    if (!salon) {
      return res.status(200).json({ status: false, message: "salon does not found!" });
    }

    const productData = await Product.find({ _id: product._id, salon: salon._id }).populate("category", "name");

    return res.status(200).json({
      status: true,
      message: "Retrive product details for the salon!",
      product: productData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    if (!req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const query = [
      { path: "category", select: "name" },

      {
        path: "salon",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const [salon, totalProducts, products] = await Promise.all([
      Salon.findById(req.salon._id),
      Product.countDocuments({ salon: req.salon._id }),
      Product.find({ salon: req.salon._id })
        .populate(query)
        .sort({ createdAt: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "salon does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive products for the salon",
      totalProducts: totalProducts,
      products: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.allowCityForProduct = async (req, res) => {
  try {
    const { productId, allowCities } = req.body;

    if (!productId || !Array.isArray(allowCities)) {
      return res.status(200).json({ status: false, message: "Product ID and allowCities array are required." });
    }

    const citiesToUnblock = allowCities.map(({ city, country }) => ({
      city: city?.trim()?.toLowerCase(),
      country: country?.trim()?.toLowerCase(),
    }));

    const productObjId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findOne({
      _id: productObjId,
      salon: req?.salon?._id,
    });

    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found!" });
    }

    const alreadyBlocked = product.allowCities.map((blocked) => `${blocked.city}-${blocked.country}`);
    const newBlockedCities = citiesToUnblock.filter((item) => !alreadyBlocked.includes(`${item.city}-${item.country}`));

    if (newBlockedCities.length === 0) {
      return res.status(200).json({ status: false, message: "All provided cities are already blocked for this product." });
    }

    product.allowCities.push(...newBlockedCities);

    const updatedProduct = await product.save();

    return res.status(200).json({
      status: true,
      message: "Cities have been successfully unblocked for the product.",
      data: updatedProduct.allowCities,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.blockCityForProduct = async (req, res) => {
  try {
    const { productId, blockedCities } = req.body;

    if (!productId || !Array.isArray(blockedCities) || blockedCities.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Product ID and an array of blocked cities with country are required.",
      });
    }

    const normalizedBlockedCities = blockedCities.map(({ city, country }) => ({
      city: city.trim().toLowerCase(),
      country: country.trim().toLowerCase(),
    }));

    const productObjId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findOne({ _id: productObjId, salon: req.salon._id });
    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found!" });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productObjId },
      {
        $pull: {
          allowCities: {
            $or: normalizedBlockedCities,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Cities have been successfully blocked for the product.",
      data: updatedProduct?.allowCities,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.getAllowedCitiesForProduct = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(200).json({ message: "Product ID is required." });
    }

    const productObjId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findById(productObjId).select("allowCities").lean();

    if (!product) {
      return res.status(200).json({ status: false, message: "Product is not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Allowed cities retrieved successfully.",
      data: product?.allowCities || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};