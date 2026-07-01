const Salon = require("../../models/salon.model");
const {
  salonPaymentOptions,
  createBookingPaymentIntent,
} = require("../../services/stripeConnect.service");

exports.createBookingStripePaymentIntent = async (req, res) => {
  try {
    const { salonId, amount, withoutTax } = req.body || {};

    if (!salonId || amount === undefined || withoutTax === undefined) {
      return res.status(200).send({
        status: false,
        message: "salonId, amount and withoutTax are required.",
      });
    }

    const amountNum = parseFloat(amount);
    const withoutTaxNum = parseFloat(withoutTax);
    if (Number.isNaN(amountNum) || amountNum <= 0 || Number.isNaN(withoutTaxNum) || withoutTaxNum <= 0) {
      return res.status(200).send({ status: false, message: "Invalid payment amount." });
    }

    if (!global.settingJSON?.isStripePay) {
      return res.status(200).send({ status: false, message: "Stripe is not available." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon || salon.isDelete || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found." });
    }

    const options = salonPaymentOptions(salon);
    if (!options.acceptStripe) {
      return res.status(200).send({
        status: false,
        message: "This salon does not accept online card payments.",
      });
    }

    const result = await createBookingPaymentIntent({
      salon,
      amount: amountNum,
      withoutTax: withoutTaxNum,
      metadata: {
        userId: String(req.body.userId || ""),
        expertId: String(req.body.expertId || ""),
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
    console.error("[createBookingStripePaymentIntent]", error);
    return res.status(500).send({ status: false, message: error.message || "Stripe error" });
  }
};
