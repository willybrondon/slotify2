const ProductRequest = require("../../models/productRequest.model");

//import model
const Product = require("../../models/product.model");

//product request accept or decline (update product)
exports.acceptUpdateRequest = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.type) {
      return res.status(200).json({ status: false, message: "requestId must be requried." });
    }

    const type = req.query.type.trim();

    const updateRequest = await ProductRequest.findOne({ _id: req.query.requestId, updateStatus: "Pending" });
    if (!updateRequest) {
      return res.status(200).json({ status: false, message: "Product request to update the product does not found." });
    }

    if (updateRequest.updateStatus === "Approved") {
      return res.status(200).json({
        status: false,
        message: "Product request already accepted by admin for update that product.",
      });
    }

    if (type === "Approved") {
      const product = await Product.findOne({
        productCode: updateRequest.productCode,
        createStatus: "Approved",
      });

      if (!product) {
        return res.status(200).json({ status: false, message: "No product Was Found." });
      }

      product.productName = updateRequest.productName;
      product.brand = updateRequest.brand;
      product.productCode = updateRequest.productCode;
      product.description = updateRequest.description;
      product.mainImage = updateRequest.mainImage;
      product.images = updateRequest.images;
      product.attributes = updateRequest.attributes;
      product.price = updateRequest.price;
      product.mrp = updateRequest.mrp;
      product.shippingCharges = updateRequest.shippingCharges;
      product.salon = updateRequest.salon;
      product.category = updateRequest.category;
      product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      product.updateStatus = "Approved";

      updateRequest.updateStatus = "Approved";

      await Promise.all([product.save(), updateRequest.save()]);

      return res.status(200).json({
        status: true,
        message: "Product request accepted by the admin for update that product.",
        updateRequest,
      });
    } else if (type === "Rejected") {
      const product = await Product.findOne({
        productCode: updateRequest.productCode,
        createStatus: "Approved",
      });

      if (!product) {
        return res.status(200).json({ status: false, message: "No product Was Found." });
      }

      product.productName = updateRequest.productName;
      product.brand = updateRequest.brand;
      product.productCode = updateRequest.productCode;
      product.description = updateRequest.description;
      product.mainImage = updateRequest.mainImage;
      product.images = updateRequest.images;
      product.attributes = updateRequest.attributes;
      product.price = updateRequest.price;
      product.mrp = updateRequest.mrp;
      product.shippingCharges = updateRequest.shippingCharges;
      product.salon = updateRequest.salon;
      product.category = updateRequest.category;
      product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      product.updateStatus = "Rejected";

      updateRequest.updateStatus = "Rejected";

      await Promise.all([product.save(), updateRequest.save()]);

      return res.status(200).json({
        status: true,
        message: "Product request rejected by admin for update that product.",
        updateRequest,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error.!",
    });
  }
};

//get status wise update product requests
exports.updateProductRequestStatusWise = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: true, message: "status must be requried." });
    }

    const status = req.query.status.trim();

    let statusQuery = {};
    if (status === "Pending") {
      statusQuery = { updateStatus: "Pending" };
    } else if (status === "Approved") {
      statusQuery = { updateStatus: "Approved" };
    } else if (status === "Rejected") {
      statusQuery = { updateStatus: "Rejected" };
    } else if (status === "All") {
      statusQuery = {
        updateStatus: {
          $in: ["Pending", "Approved", "Rejected"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const productRequests = await ProductRequest.find(statusQuery);

    return res.status(200).json({
      status: true,
      message: `Retrive product's request to update the product with status ${req.query.status}`,
      productRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
