const Salon = require("../../models/salon.model");
const Product = require("../../models/product.model");
const {
  salonProductPaymentOptions,
  createProductPaymentIntent,
} = require("../../services/stripeConnect.service");

exports.createOrderStripePaymentIntent = async (req, res) => {
  try {
    const { salonId, productId, amount, subTotal } = req.body || {};

    if (!salonId || amount === undefined || subTotal === undefined) {
      return res.status(200).send({
        status: false,
        message: "salonId, amount and subTotal are required.",
      });
    }

    const amountNum = parseFloat(amount);
    const subTotalNum = parseFloat(subTotal);
    if (
      Number.isNaN(amountNum) ||
      amountNum <= 0 ||
      Number.isNaN(subTotalNum) ||
      subTotalNum <= 0
    ) {
      return res.status(200).send({ status: false, message: "Invalid payment amount." });
    }

    if (!global.settingJSON?.isStripePay) {
      return res.status(200).send({ status: false, message: "Stripe is not available." });
    }

    if (global.settingJSON?.isProductStripePay === false) {
      return res.status(200).send({
        status: false,
        message: "Online card payment for products is disabled.",
      });
    }

    const salon = await Salon.findById(salonId);
    if (!salon || salon.isDelete || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found." });
    }

    if (productId) {
      const product = await Product.findOne({
        _id: productId,
        salon: salon._id,
        createStatus: "Approved",
      });
      if (!product) {
        return res.status(200).send({ status: false, message: "Product not found for this salon." });
      }
    }

    const options = salonProductPaymentOptions(salon);
    if (!options.acceptStripe) {
      return res.status(200).send({
        status: false,
        message: "This salon does not accept online card payments for products.",
      });
    }

    const result = await createProductPaymentIntent({
      salon,
      amount: amountNum,
      subTotal: subTotalNum,
      metadata: {
        userId: String(req.body.userId || ""),
        productId: String(productId || ""),
      },
    });

    return res.status(200).send({
      status: true,
      message: "success",
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      publishableKey: result.publishableKey,
      applicationFeeAmount: 0,
      connectedAccountId: result.connectedAccountId,
      salonName: result.salonName,
    });
  } catch (error) {
    console.error("[createOrderStripePaymentIntent]", error);
    return res.status(500).send({ status: false, message: error.message || "Stripe error" });
  }
};
