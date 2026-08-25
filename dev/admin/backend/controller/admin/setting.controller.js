const Setting = require("../../models/setting.model");

/** Accept 0 — do not use truthy checks on numeric settings. */
const parseOptionalInt = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const parseOptionalFloat = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
};

exports.get = async (req, res) => {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).send({ status: false, message: "oops! setting Not Found!!" });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).send({ status: false, message: "Setting Not Exist" });
    }

    setting.minWithdrawalRequestedAmount = parseOptionalInt(
      req.body.minWithdrawalRequestedAmount,
      setting.minWithdrawalRequestedAmount
    );
    setting.minSalonWalletBalance = parseOptionalFloat(
      req.body.minSalonWalletBalance,
      setting.minSalonWalletBalance
    );
    setting.minUserWalletBalance = parseOptionalFloat(
      req.body.minUserWalletBalance,
      setting.minUserWalletBalance
    );
    setting.tax = parseOptionalInt(req.body.tax, setting.tax);
    setting.adminCommissionCharges = parseOptionalInt(
      req.body.adminCommissionCharges,
      setting.adminCommissionCharges
    );
    setting.customerCommissionCharges = parseOptionalFloat(
      req.body.customerCommissionCharges,
      setting.customerCommissionCharges
    );
    setting.salonCommissionCharges = parseOptionalFloat(
      req.body.salonCommissionCharges,
      setting.salonCommissionCharges
    );
    setting.cancelOrderCharges = parseOptionalInt(
      req.body.cancelOrderCharges,
      setting.cancelOrderCharges
    );

    setting.tnc = req.body.tnc ? req.body.tnc : setting.tnc;
    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.razorPayId = req.body.razorPayId ? req.body.razorPayId : setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey ? req.body.razorSecretKey : setting.razorSecretKey;
    setting.stripePublishableKey = req.body.stripePublishableKey ? req.body.stripePublishableKey : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ? req.body.stripeSecretKey : setting.stripeSecretKey;

    setting.zitopayApiKey = req.body.zitopayApiKey ? req.body.zitopayApiKey : setting.zitopayApiKey;
    setting.zitopaySecretKey = req.body.zitopaySecretKey ? req.body.zitopaySecretKey : setting.zitopaySecretKey;
    setting.zitopayMerchantId = req.body.zitopayMerchantId ? req.body.zitopayMerchantId : setting.zitopayMerchantId;

    // MTN MoMo fields
    if (req.body.mtnMomoPrimaryKey !== undefined) setting.mtnMomoPrimaryKey = req.body.mtnMomoPrimaryKey;
    if (req.body.mtnMomoSecondaryKey !== undefined) setting.mtnMomoSecondaryKey = req.body.mtnMomoSecondaryKey;
    if (req.body.mtnMomoSubscriptionKey !== undefined) setting.mtnMomoSubscriptionKey = req.body.mtnMomoSubscriptionKey;
    if (req.body.mtnMomoApiUserId !== undefined) setting.mtnMomoApiUserId = req.body.mtnMomoApiUserId;
    if (req.body.mtnMomoApiKey !== undefined) setting.mtnMomoApiKey = req.body.mtnMomoApiKey;
    if (req.body.mtnMomoCallbackHost !== undefined) setting.mtnMomoCallbackHost = req.body.mtnMomoCallbackHost;
    if (req.body.mtnMomoEnvironment !== undefined) setting.mtnMomoEnvironment = req.body.mtnMomoEnvironment;

    setting.flutterWaveKey = req.body.flutterWaveKey ? req.body.flutterWaveKey : setting.flutterWaveKey;
    setting.currencySymbol = req.body.currencySymbol ? req.body.currencySymbol : setting.currencySymbol;
    setting.currencyName = req.body.currencyName ? req.body.currencyName : setting.currencyName;

    setting.firebaseKey = req.body.firebaseKey ? JSON.parse(req.body.firebaseKey.trim()) : setting.firebaseKey;

    if (req.body.reservationNotificationEmails !== undefined) {
      setting.reservationNotificationEmails = String(req.body.reservationNotificationEmails).trim();
    }
    if (req.body.autoConfirmBookings !== undefined) {
      setting.autoConfirmBookings =
        req.body.autoConfirmBookings === true ||
        req.body.autoConfirmBookings === "true";
    }

    await setting.save();
    updateSettingFile(setting);
    return res.status(200).send({ status: true, message: "success!!", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.handleSwitch = async (req, res) => {
  try {
    const type = req.query.type;
    if (!type) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).send({ status: false, message: "Setting Not Exist" });
    }

    if (type == 1) {
      setting.isRazorPay = !setting.isRazorPay;
    }
    if (type == 2) {
      setting.isStripePay = !setting.isStripePay;
    }
    if (type == 3) {
      setting.maintenanceMode = !setting.maintenanceMode;
    }
    if (type == 4) {
      setting.isFlutterWave = !setting.isFlutterWave;
    }
    // Deprecated: Zitopay removed from platform (kept for backward compatibility)
    // if (type == 5) {
    //   setting.isZitopay = !setting.isZitopay;
    // }
    if (type == 6) {
      setting.isAddProductRequest = !setting.isAddProductRequest;
    }
    if (type == 7) {
      setting.isUpdateProductRequest = !setting.isUpdateProductRequest;
    }
    if (type == 8) {
      setting.isMtnMomo = !setting.isMtnMomo;
    }
    if (type == 9) {
      setting.autoConfirmBookings = !setting.autoConfirmBookings;
    }
    if (type == 10) {
      setting.isWalletPay = !setting.isWalletPay;
    }
    if (type == 11) {
      setting.isSalonWalletRecharge = !setting.isSalonWalletRecharge;
    }
    if (type == 12) {
      setting.isProductStripePay = !setting.isProductStripePay;
    }

    await setting.save();
    updateSettingFile(setting);

    return res.status(200).send({ status: true, message: "success", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
