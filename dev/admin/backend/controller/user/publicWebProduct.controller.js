const mongoose = require("mongoose");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const orderController = require("./order.controller");
const addressController = require("./address.controller");

function runController(handler, req) {
  return new Promise((resolve, reject) => {
    const mockRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
      send(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
    };
    Promise.resolve(handler(req, mockRes)).catch(reject);
  });
}

function attachSecret(req) {
  req.headers = req.headers || {};
  req.headers.key = process.env.secretKey;
  req.body = req.body || {};
  if (!req.body.key) req.body.key = process.env.secretKey;
}

exports.publicProductDetail = async (req, res) => {
  try {
    const productId = (req.query.productId || "").trim();
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json({ status: false, message: "Invalid product." });
    }

    const product = await Product.findOne({
      _id: productId,
      createStatus: "Approved",
      isDelete: { $ne: true },
    })
      .select(
        "productName brand description price mrp shippingCharges mainImage images attributes quantity isOutOfStock salon"
      )
      .populate("salon", "name")
      .lean();

    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Product detail.",
      product: {
        _id: product._id,
        productName: product.productName,
        brand: product.brand,
        description: product.description,
        price: product.price || 0,
        mrp: product.mrp || 0,
        shippingCharges: product.shippingCharges || 0,
        mainImage: product.mainImage,
        images: product.images || [],
        attributes: product.attributes || [],
        quantity: product.quantity,
        isOutOfStock: !!product.isOutOfStock,
        salon: product.salon
          ? { _id: product.salon._id, name: product.salon.name }
          : null,
      },
    });
  } catch (error) {
    console.error("[publicProductDetail]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicUserAddresses = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(addressController.getAllAddress, req);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicUserAddresses]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicStoreAddress = async (req, res) => {
  try {
    attachSecret(req);
    const storeResult = await runController(addressController.store, req);
    if (!storeResult.payload?.status || !storeResult.payload?.address?._id) {
      return res.status(storeResult.statusCode || 200).json(storeResult.payload);
    }

    const selectReq = {
      headers: req.headers,
      query: {
        addressId: String(storeResult.payload.address._id),
        userId: String(req.body.userId),
      },
    };
    const selectResult = await runController(addressController.selectedOrNot, selectReq);
    return res.status(selectResult.statusCode || 200).json({
      ...selectResult.payload,
      address: selectResult.payload?.address || storeResult.payload.address,
    });
  } catch (error) {
    console.error("[publicStoreAddress]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicSelectAddress = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(addressController.selectedOrNot, req);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicSelectAddress]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicCreateOrder = async (req, res) => {
  try {
    const userId = (req.body?.userId || "").trim();
    const finalTotal = Number(req.body?.finalTotal);
    if (!userId || !Number.isFinite(finalTotal)) {
      return res.status(200).json({ status: false, message: "Invalid order details." });
    }

    const user = await User.findById(userId).select("amount isBlock");
    if (!user || user.isBlock) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    const wallet = Number(user.amount) || 0;
    if (wallet < finalTotal) {
      return res.status(200).json({
        status: false,
        message: "Insufficient wallet balance.",
        code: "WALLET_INSUFFICIENT",
        walletBalance: wallet,
      });
    }

    attachSecret(req);
    req.body.type = "withoutcart";
    req.body.paymentGateway = "wallet";

    const result = await runController(orderController.createOrder, req);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicCreateOrder]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
