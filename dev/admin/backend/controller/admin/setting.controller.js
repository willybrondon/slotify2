const Setting = require("../../models/setting.model");

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

    setting.minWithdrawalRequestedAmount = req.body.minWithdrawalRequestedAmount ? parseInt(req.body.minWithdrawalRequestedAmount) : setting.minWithdrawalRequestedAmount;
    setting.tax = req.body.tax ? parseInt(req.body.tax) : setting.tax;
    setting.adminCommissionCharges = req.body.adminCommissionCharges ? parseInt(req.body.adminCommissionCharges) : setting.adminCommissionCharges;
    setting.cancelOrderCharges = req.body.cancelOrderCharges ? parseInt(req.body.cancelOrderCharges) : setting.cancelOrderCharges;

    setting.tnc = req.body.tnc ? req.body.tnc : setting.tnc;
    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.mtnMoneyApiKey = req.body.mtnMoneyApiKey ? req.body.mtnMoneyApiKey : setting.mtnMoneyApiKey;
    setting.mtnMoneyApiSecret = req.body.mtnMoneyApiSecret ? req.body.mtnMoneyApiSecret : setting.mtnMoneyApiSecret;
    setting.orangeMoneyApiKey = req.body.orangeMoneyApiKey ? req.body.orangeMoneyApiKey : setting.orangeMoneyApiKey;
    setting.orangeMoneyApiSecret = req.body.orangeMoneyApiSecret ? req.body.orangeMoneyApiSecret : setting.orangeMoneyApiSecret;
    setting.stripePublishableKey = req.body.stripePublishableKey ? req.body.stripePublishableKey : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ? req.body.stripeSecretKey : setting.stripeSecretKey;
    setting.currencySymbol = req.body.currencySymbol ? req.body.currencySymbol : setting.currencySymbol;
    setting.currencyName = req.body.currencyName ? req.body.currencyName : setting.currencyName;

    setting.firebaseKey = req.body.firebaseKey ? JSON.parse(req.body.firebaseKey.trim()) : setting.firebaseKey;

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
      setting.isMTNMoney = !setting.isMTNMoney;
    }
    if (type == 2) {
      setting.isOrangeMoney = !setting.isOrangeMoney;
    }
    if (type == 3) {
      setting.isStripePay = !setting.isStripePay;
    }
    if (type == 4) {
      setting.maintenanceMode = !setting.maintenanceMode;
    }
    if (type == 6) {
      setting.isAddProductRequest = !setting.isAddProductRequest;
    }
    if (type == 7) {
      setting.isUpdateProductRequest = !setting.isUpdateProductRequest;
    }

    await setting.save();
    updateSettingFile(setting);

    return res.status(200).send({ status: true, message: "success", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
