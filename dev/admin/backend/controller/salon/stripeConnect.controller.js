const Salon = require("../../models/salon.model");
const {
  salonPaymentOptions,
  syncConnectAccountStatus,
  createConnectAccountLink,
} = require("../../services/stripeConnect.service");

function resolveBaseUrl() {
  const baseURL = process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com";
  return baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
}

exports.getStatus = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    if (salon.stripeConnect?.accountId) {
      await syncConnectAccountStatus(salon);
    }

    if (!global.settingJSON?.isStripePay && salon.paymentMethods?.acceptStripe === true) {
      salon.paymentMethods = salon.paymentMethods || {};
      salon.paymentMethods.acceptStripe = false;
      await salon.save();
    }

    return res.status(200).send({
      status: true,
      message: "success",
      data: {
        paymentMethods: {
          acceptCash: salon.paymentMethods?.acceptCash !== false,
          acceptStripe: salon.paymentMethods?.acceptStripe === true,
        },
        stripeConnect: {
          accountId: salon.stripeConnect?.accountId || "",
          onboardingComplete: !!salon.stripeConnect?.onboardingComplete,
          chargesEnabled: !!salon.stripeConnect?.chargesEnabled,
          payoutsEnabled: !!salon.stripeConnect?.payoutsEnabled,
          detailsSubmitted: !!salon.stripeConnect?.detailsSubmitted,
        },
        options: salonPaymentOptions(salon),
        platformStripeEnabled: !!global.settingJSON?.isStripePay,
      },
    });
  } catch (error) {
    console.error("[stripeConnect.getStatus]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.updatePaymentMethods = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    salon.paymentMethods = salon.paymentMethods || {};
    const previousAcceptStripe = salon.paymentMethods.acceptStripe === true;
    const platformStripeEnabled = !!global.settingJSON?.isStripePay;

    if (req.body.acceptCash !== undefined) {
      salon.paymentMethods.acceptCash =
        req.body.acceptCash === true || req.body.acceptCash === "true";
    }
    if (req.body.acceptStripe !== undefined) {
      const wantsStripe =
        req.body.acceptStripe === true || req.body.acceptStripe === "true";
      if (wantsStripe && !previousAcceptStripe && !platformStripeEnabled) {
        return res.status(200).send({
          status: false,
          message: "Stripe Connect n'est pas activé sur la plateforme Skedisy.",
        });
      }
      salon.paymentMethods.acceptStripe = wantsStripe;
    }

    // Stripe Connect unavailable on platform — keep cash working, clear stale Stripe preference
    if (!platformStripeEnabled) {
      salon.paymentMethods.acceptStripe = false;
    }

    if (salon.paymentMethods?.acceptCash === false && salon.paymentMethods?.acceptStripe !== true) {
      return res.status(200).send({
        status: false,
        message: "Au moins un mode de paiement doit rester actif (espèces ou Stripe).",
      });
    }

    await salon.save();

    return res.status(200).send({
      status: true,
      message: "Payment methods updated.",
      data: {
        paymentMethods: salon.paymentMethods,
        options: salonPaymentOptions(salon),
      },
    });
  } catch (error) {
    console.error("[stripeConnect.updatePaymentMethods]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.createOnboardingLink = async (req, res) => {
  try {
    if (!global.settingJSON?.isStripePay) {
      return res.status(200).send({ status: false, message: "Stripe is not enabled on Skedisy." });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    salon.paymentMethods = salon.paymentMethods || {};
    salon.paymentMethods.acceptStripe = true;

    const base = resolveBaseUrl();
    const onboardingUrl = await createConnectAccountLink(salon, {
      refreshUrl: `${base}/salonpanel/paymentSettings?stripe=refresh`,
      returnUrl: `${base}/salonpanel/paymentSettings?stripe=return`,
    });

    return res.status(200).send({
      status: true,
      message: "Stripe onboarding link created.",
      url: onboardingUrl,
    });
  } catch (error) {
    console.error("[stripeConnect.createOnboardingLink]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.refreshAccount = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    if (salon.stripeConnect?.accountId) {
      await syncConnectAccountStatus(salon);
    }

    return res.status(200).send({
      status: true,
      message: "Stripe account refreshed.",
      data: {
        stripeConnect: salon.stripeConnect,
        options: salonPaymentOptions(salon),
      },
    });
  } catch (error) {
    console.error("[stripeConnect.refreshAccount]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};
