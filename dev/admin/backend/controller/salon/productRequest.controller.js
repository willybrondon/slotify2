const ProductRequest = require("../../models/productRequest.model");

//fs
const fs = require("fs");




//import model
const Salon = require("../../models/salon.model");
const Category = require("../../models/productCategory.model");

const Product = require("../../models/product.model");
const { deleteFiles } = require("../../middleware/deleteFile");

//create product update request by salon to admin or directly product update by salon
exports.updateProductRequest = async (req, res) => {
    try {
      const { productId, salonId, productCode } = req.query;
  
      if (!productId || !salonId || !productCode) {
        cleanUpFiles(req.files);
        return res.status(200).json({
          status: true,
          message: "Oops! Invalid details.",
        });
      }
  
      const [salon, product] = await Promise.all([
        Salon.findById(salonId),
        Product.findOne({
          _id: productId,
          productCode,
          salon: salonId,
          createStatus: "Approved",
        }),
      ]);
  
      if (!salon || !product) {
        cleanUpFiles(req.files);
        return res.status(200).json({
          status: false,
          message: !salon ? "Salon not found." : "No product found.",
        });
      }
  
      if (global.settingJSON.isUpdateProductRequest) {
        if (product.updateStatus === "Approved") {
          product.updateStatus = "Pending";
          await product.save();
        }
  
        if (req?.body?.category && !(await validateCategory(req.body.category))) {
          cleanUpFiles(req.files);
          return res.status(200).json({
            status: false,
            message: "Category not found.",
          });
        }
  
        const updateProductRequest = await createUpdateProductRequest(req, product);
  
        return res.status(200).json({
          status: true,
          message: "Product update request created by salon for admin approval.",
          updateProductrequest: updateProductRequest,
        });
      } else {
        if (req?.body?.category && !(await validateCategory(req.body.category))) {
          cleanUpFiles(req.files);
          return res.status(200).json({
            status: false,
            message: "Category not found.",
          });
        }
  
        await updateProduct(req, product);
  
        const updatedProduct = await Product.findById(product._id).populate([
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
          { path: "salon", select: "firstName lastName businessTag businessName image" },
        ]);
  
        return res.status(200).json({
          status: true,
          message: "Product updated directly by the salon.",
          product: updatedProduct,
        });
      }
    } catch (error) {
      cleanUpFiles(req.files);
      console.error(error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  };
  
  // Helper functions
  
  const cleanUpFiles = (files) => {
    if (files) deleteFiles(files);
  };
  
  const validateCategory = async (categoryId) => {
    const category = await Category.findById(categoryId);
    return !!category;
  };
  
  const createUpdateProductRequest = async (req, product) => {
    const updateProductRequest = new ProductRequest({
      productName: req.body.productName || product.productName,
      brand: req.body.brand || product.brand,
      description: req.body.description || product.description,
      price: req.body.price || product.price,
      mrp: req.body.mrp || product.mrp,
      shippingCharges: req.body.shippingCharges || product.shippingCharges,
      category: req.body.category || product.category,
      salon: product.salon,
      productCode: product.productCode,
      updateStatus: "Pending",
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      mainImage: req.files?.mainImage ? await updateImage(req.files.mainImage[0], product.mainImage) : product.mainImage,
      images: req.files?.images ? await updateImages(req.files.images, product.images) : product.images,
      attributes: await updateAttributes(req.body.attributes, product.attributes),
    });
  
    await updateProductRequest.save();
    return await ProductRequest.findById(updateProductRequest._id).populate([
      { path: "salon", select: "name email mainImage" },
      { path: "category", select: "name" },
    ]);
  };
  
  const updateProduct = async (req, product) => {
    product.productName = req.body.productName || product.productName;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.shippingCharges = req.body.shippingCharges || product.shippingCharges;
    product.category = req.body.category || product.category;
    product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    product.updateStatus = "Approved";
    product.mainImage = req.files?.mainImage ? await updateImage(req.files.mainImage[0], product.mainImage) : product.mainImage;
    product.images = req.files?.images ? await updateImages(req.files.images, product.images) : product.images;
    product.attributes = await updateAttributes(req.body.attributes, product.attributes);
  
    await product.save();
  };
  
  const updateImage = async (newImage, oldImage) => {
    if (oldImage) {
      const imagePath = oldImage.split("storage")[1];
      if (fs.existsSync("storage" + imagePath)) {
        fs.unlinkSync("storage" + imagePath);
      }
    }
    return process.env.baseURL + newImage.path;
  };
  
  const updateImages = async (newImages, oldImages) => {
    if (oldImages.length > 0) {
      for (const image of oldImages) {
        const imagePath = image.split("storage")[1];
        if (fs.existsSync("storage" + imagePath)) {
          fs.unlinkSync("storage" + imagePath);
        }
      }
    }
    return newImages.map((img) => process.env.baseURL + img.path);
  };
  
  const updateAttributes = async (newAttributes, oldAttributes) => {
    let attributes = [];
  
    if (typeof newAttributes === "string") {
      attributes = JSON.parse(newAttributes);
    } else if (typeof newAttributes === "object") {
      attributes = newAttributes;
    } else {
      throw new Error("Invalid attributes format");
    }
  
    if (Array.isArray(attributes)) {
      return attributes.map((attr) => {
        if (attr?._id) {
          const existingAttr = oldAttributes.find(
            (attribute) => attribute?._id?.toString() === attr._id.toString()
          );
          return existingAttr ? { ...existingAttr, ...attr } : attr;
        }
        return attr;
      });
    }
    return oldAttributes;
  };
  