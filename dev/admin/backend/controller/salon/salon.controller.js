const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Setting = require("../../models/setting.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const SalonWalletHistory = require("../../models/salonWalletHistory.model");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const { PAYMENT_GATEWAY } = require("../../types/constant");
const stripe = require("stripe");
const axios = require("axios");

const jwt = require("jsonwebtoken");
const fs = require("fs");
const { deleteFile } = require("../../middleware/deleteFile");
const moment = require("moment");
const mongoose = require("mongoose");

exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const salon = await Salon.findOne({ email: req.body.email.trim(), isDelete: false });

    if (!salon) {
      console.log(`[Salon Login] Salon not found or deleted: ${req.body.email.trim()}`);
      return res.status(200).send({ status: false, message: "Salon Not Found! Contact Admin!" });
    }

    // Check password
    if (req.body.password != salon.password) {
      console.log(`[Salon Login] Invalid password for salon: ${salon.email}`);
      return res.status(200).send({ status: false, message: "Oops ! Invalid Password!" });
    }

    // Check if salon is active
    if (!salon.isActive) {
      console.log(`[Salon Login] Salon is inactive: ${salon.email}`);
      return res.status(200).send({
        status: false,
        message: "Salon is blocked by admin ! Contact Admin from more details",
      });
    }

    // Check if salon is claimed (for newly claimed salons)
    // Allow admin bypass using secret key for support purposes
    const adminBypass = req.headers.key === process.env.secretKey || req.body.key === process.env.secretKey || req.query.key === process.env.secretKey;
    
    if (!salon.isClaimed && !adminBypass) {
      console.log(`[Salon Login] Salon not yet claimed: ${salon.email}`);
      return res.status(200).send({
        status: false,
        message: "Please claim your salon profile first using the invitation link.",
      });
    }
    
    if (!salon.isClaimed && adminBypass) {
      console.log(`[Salon Login] Admin bypass used for unclaimed salon: ${salon.email}`);
    }

    const payload = {
      salon: salon,
    };

    const key = process.env.JWT_SECRET;
    const token = jwt.sign(payload, key);

    return res.status(200).json({
      status: true,
      message: "Salon Login Successfully!!",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id).populate("serviceIds.id");
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    return res.status(200).json({ status: true, message: "success", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.query.salonId) {
      if (req.files) deleteFile(req.files);
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      if (req.files) deleteFile(req.files);
      return res.status(200).send({ status: false, message: "Oops ! Salon Not Found!!" });
    }

    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    salon.name = req.body.name ? req.body.name : salon.name;
    salon.addressDetails = {
      addressLine1: req.body.address ? capitalizeFirstLetter(req.body.address) : salon.addressDetails.addressLine1,
      landMark: req.body.landMark ? req.body.landMark : salon.addressDetails.landMark,
      city: salon.addressDetails.city,
      state: salon.addressDetails.state,
      country: salon.addressDetails.country,
    };

    salon.mobile = req.body.mobile ? req.body.mobile : salon.mobile;
    salon.about = req.body.about ? req.body.about : salon.about;
    salon.locationCoordinates = {
      latitude: req.body.latitude ? req.body.latitude : salon.locationCoordinates.latitude,
      longitude: req.body.longitude ? req.body.longitude : salon.locationCoordinates.longitude,
    };

    // Handle value proposition fields
    if (req.body.valuePropositionTitle) {
      if (!salon.valueProposition) {
        salon.valueProposition = {};
      }
      salon.valueProposition.title = req.body.valuePropositionTitle;
    }
    if (req.body.valuePropositionDescription) {
      if (!salon.valueProposition) {
        salon.valueProposition = {};
      }
      salon.valueProposition.description = req.body.valuePropositionDescription;
    }
    if (req.body.valuePropositionFeatures) {
      if (!salon.valueProposition) {
        salon.valueProposition = {};
      }
      // Parse features from comma-separated string or JSON array
      try {
        salon.valueProposition.features = typeof req.body.valuePropositionFeatures === 'string' 
          ? JSON.parse(req.body.valuePropositionFeatures) 
          : req.body.valuePropositionFeatures;
      } catch (e) {
        // If not JSON, treat as comma-separated string
        salon.valueProposition.features = req.body.valuePropositionFeatures.split(',').map(f => f.trim()).filter(f => f);
      }
    }

    if (req.files.mainImage) {
      const image = salon?.mainImage.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
      salon.mainImage = process.env.baseURL + req.files.mainImage[0].path;
    }

    if (req.files.image) {
      var imagesData = [];

      if (salon.image.length > 0) {
        for (var i = 0; i < salon.image.length; i++) {
          const images = salon.image[i].split("storage");
          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }

      await req.files.image.map((data) => {
        imagesData.push(process.env.baseURL + data.path);
      });

      salon.image = imagesData;
    }

    // Handle hero image upload
    if (req.files.heroImage) {
      if (salon.heroImage) {
        const heroImage = salon.heroImage.split("storage");
        if (heroImage && heroImage[1] && fs.existsSync("storage" + heroImage[1])) {
          fs.unlinkSync("storage" + heroImage[1]);
        }
      }
      salon.heroImage = process.env.baseURL + req.files.heroImage[0].path;
    }

    await salon.save();
    return res.status(200).send({
      status: true,
      message: "Salon Updated Successfully!!",
      data: salon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.addServices = async (req, res) => {
  try {
    const { serviceId, price } = req.body;

    if (!price || !serviceId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    console.log("---------------", req.salon._id);

    const salon = await Salon.findById(req.salon._id).populate("serviceIds.id");

    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    const existingService = salon.serviceIds.find((s) => String(s.id._id) === String(serviceId));

    if (existingService) {
      existingService.price = price;
    } else {
      salon.serviceIds.push({ id: serviceId, price: price });
    }

    await salon.save();
    const updatedSalon = await Salon.findById(salon._id).populate("serviceIds.id");
    return res.status(200).send({
      status: true,
      message: "ServiceId and Price added successfully",
      services: updatedSalon.serviceIds,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: " Internal Server Error" });
  }
};

exports.removeService = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const salon = await Salon.findById(req.salon._id).populate("serviceIds.id");
    console.log("salon", salon);

    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    const serviceIndex = salon.serviceIds.findIndex((service) => service.id._id.toString() === req.query.serviceId);

    if (serviceIndex === -1) {
      return res.status(200).json({ status: false, message: "Service ID not found in salon" });
    }

    const removedService = salon.serviceIds.splice(serviceIndex, 1)[0];

    const experts = await Expert.find({
      serviceId: { $in: [req.query.serviceId] },
    });

    for (const expert of experts) {
      expert.serviceId = expert.serviceId.filter((id) => id.toString() !== req.query.serviceId);
      await expert.save();
    }

    await salon.save();

    return res.status(200).send({
      status: true,
      message: "Service Remove Successfully",
      salon: salon.serviceIds,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: "Server Error" });
  }
};

exports.updateSalonTime = async (req, res) => {
  try {
    if (!req.query.day || !req.body || !["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(req.query.day)) {
      return res.status(200).json({ status: false, message: "Invalid day provided" });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not found" });
    }

    const salonDay = salon.salonTime.find((time) => time.day === req.query.day);
    const convertTo24HourFormat = (time) => moment(time, ["hh:mm A"]).format("HH:mm");

    const openTime = req.body.openTime ? convertTo24HourFormat(req.body.openTime) : convertTo24HourFormat(salonDay.openTime);
    const closedTime = req.body.closedTime ? convertTo24HourFormat(req.body.closedTime) : convertTo24HourFormat(salonDay.closedTime);
    const breakStartTime = req.body.breakStartTime ? convertTo24HourFormat(req.body.breakStartTime) : convertTo24HourFormat(salonDay.breakStartTime);
    const breakEndTime = req.body.breakEndTime ? convertTo24HourFormat(req.body.breakEndTime) : convertTo24HourFormat(salonDay.breakEndTime);

    salonDay.openTime = req.body.openTime ? req.body.openTime : salonDay.openTime;
    salonDay.closedTime = req.body.closedTime ? req.body.closedTime : salonDay.closedTime;

    if (salonDay.isBreak === false) {
      if (closedTime < openTime) {
        return res.status(200).send({
          status: false,
          message: "End time cannot be before start time.",
        });
      }
    } else {
      salonDay.breakStartTime = req.body.breakStartTime || salonDay.breakStartTime;
      salonDay.breakEndTime = req.body.breakEndTime || salonDay.breakEndTime;

      if (breakStartTime < openTime) {
        return res.status(200).send({
          status: false,
          message: "Break start time cannot be before start time.",
        });
      }

      if (breakEndTime < breakStartTime) {
        return res.status(200).send({
          status: false,
          message: "Break end time cannot be before break start time.",
        });
      }

      if (breakEndTime > closedTime) {
        return res.status(200).send({
          status: false,
          message: "Break end time cannot be after end time.",
        });
      }

      if (closedTime < openTime) {
        return res.status(200).send({
          status: false,
          message: "End time cannot be before start time.",
        });
      }
    }

    await salon.save();

    return res.status(200).json({
      status: true,
      message: "Salon time updated successfully",
      salonTime: salon.salonTime,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.getSalonTime = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Oops ! Salon not found !!" });
    }

    const salonTime = salon.salonTime;

    return res.status(200).json({
      status: true,
      message: "Salon time updated successfully",
      salonTime,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.updateSalonPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not exist" });
    }

    if (salon.password !== req.body.oldPass) {
      return res.status(200).send({ status: false, message: "old password is Invalid" });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "password does not match" });
    }

    salon.password = req.body.newPass;
    await salon.save();
    return res.status(200).send({ status: true, message: "password updated", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};

exports.isActive = async (req, res) => {
  try {
    const salon = await Salon.findById(req?.salon?._id);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not exist" });
    }

    salon.isActive = !salon.isActive;
    await salon.save();

    return res.status(200).json({ status: true, message: "success", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.getCurrency = async (req, res) => {
  try {
    const setting = await Setting.findOne().select("currencyName currencySymbol isStripePay isZitopay isRazorPay isFlutterWave isMtnMomo minSalonWalletBalance");
    if (!setting) {
      return res.status(200).send({ status: false, message: "currency Not Found" });
    }
    return res.status(200).send({ status: true, data: setting, message: "currency found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPass, newPass, confirmPass } = req.body;

    // Input Validation
    if (!oldPass || !newPass || !confirmPass) {
      return res.status(400).json({ status: false, message: "Please provide all required fields" });
    }
    const salon = await Salon.findById(req.salon._id);
    if (salon.password !== req.body.oldPass) {
      return res.status(200).send({ status: false, message: "old password is Invalid" });
    }

    if (newPass !== confirmPass) {
      return res.status(200).send({ status: false, message: "password does not match" });
    }

    salon.password = req.body.newPass;
    await salon.save();
    return res.status(200).send({ status: true, message: "password updated", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};

exports.manageBreak = async (req, res) => {
  try {
    const { day } = req.query;

    if (!day) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const salon = await Salon.findById(req.salon._id);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not exist" });
    }

    const salonDay = salon.salonTime.find((time) => time.day === day);

    if (!salonDay) {
      return res.status(200).json({ status: false, message: "Day not found in salon schedule" });
    }

    salonDay.isBreak = !salonDay.isBreak;

    await salon.save();

    return res.status(200).json({
      status: true,
      message: "Salon time updated successfully",
      salonDay,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.fetchSalonWalletHistory = async (req, res) => {
  try {
    const { type } = req.query;
    const salonId = req.salon._id;

    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const salonObjId = new mongoose.Types.ObjectId(salonId);

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const formateStartDate = new Date(startDate);
      const formateEndDate = new Date(endDate);
      formateEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formateStartDate,
          $lte: formateEndDate,
        },
      };
    }

    let typeQuery = {};
    if (type !== "All") {
      const typeNum = parseInt(type);
      // Map frontend types to backend types:
      // Frontend "3" = Credit (types 1, 2, 5)
      // Frontend "2" = Debit (types 3, 4)
      if (typeNum === 3) {
        typeQuery.type = { $in: [1, 2, 5] }; // All credit types
      } else if (typeNum === 2) {
        typeQuery.type = { $in: [3, 4] }; // All debit types
      } else {
        typeQuery.type = typeNum;
      }
    }

    const [salon, total, data] = await Promise.all([
      Salon.findById(salonObjId),
      SalonExpertWalletHistory.countDocuments({
        salon: salonObjId,
        ...dateFilterQuery,
        ...typeQuery,
      }),
      SalonExpertWalletHistory.find({
        salon: salonObjId,
        ...dateFilterQuery,
        ...typeQuery,
      })
        .select("type paymentGateway payoutStatus amount uniqueId date time createdAt")
        .sort({ date: -1, time: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Oops ! Salon not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      total: total,
      data: data,
      walletBalance: salon.wallet || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Deposit amount to salon wallet (by salon owner via Stripe/Zitopay)
exports.depositeToWallet = async (req, res) => {
  try {
    const { amount, paymentGateway } = req.query;

    if (!amount || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const requestedAmount = parseFloat(amount);
    const salonId = req.salon._id;

    if (requestedAmount <= 0) {
      return res.status(200).json({ status: false, message: "Amount must be greater than 0." });
    }

    // Validate payment gateway
    const paymentGatewayNum = parseInt(paymentGateway);
    if (!Object.values(PAYMENT_GATEWAY).includes(paymentGatewayNum)) {
      return res.status(200).json({ status: false, message: "Invalid payment gateway." });
    }

    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "Salon account is inactive." });
    }

    // Add amount to salon wallet
    salon.wallet = (salon.wallet || 0) + requestedAmount;
    await salon.save();

    // Create wallet history entry
    const uniqueId = await generateUniqueIdentifier();
    const walletHistory = new SalonExpertWalletHistory({
      salon: salon._id,
      amount: requestedAmount,
      paymentGateway: paymentGatewayNum,
      type: 2, // CREDIT_FROM_SELF (salon owner self-recharge)
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm a"),
      uniqueId: uniqueId,
    });

    await walletHistory.save();

    return res.status(200).json({
      status: true,
      message: "Wallet successfully credited.",
      walletBalance: salon.wallet,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Create Stripe Checkout Session for salon wallet recharge
exports.createStripeCheckoutSession = async (req, res) => {
  try {
    const { amount } = req.query;
    const salonId = req.salon._id;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(200).json({ status: false, message: "Invalid amount." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "Salon account is inactive." });
    }

    // Get Stripe settings
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting || !setting.isStripePay || !setting.stripeSecretKey) {
      return res.status(200).json({ status: false, message: "Stripe is not configured or enabled." });
    }

    // Initialize Stripe with secret key
    const stripeInstance = stripe(setting.stripeSecretKey);

    // Get currency from settings
    const currency = (setting.currencyName || "usd").toLowerCase();
    const currencySymbol = setting.currencySymbol || "";

    // Convert amount to cents (Stripe uses smallest currency unit)
    // For XAF and other currencies that don't use cents, use the amount as-is
    const amountInSmallestUnit = currency === "xaf" || currency === "eur" ? Math.round(parseFloat(amount) * 100) : Math.round(parseFloat(amount) * 100);

    // Get base URL for callbacks
    const baseURL = process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com";
    // Fix double slash issue - remove trailing slash if present
    const baseURLClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const successURL = `${baseURLClean}/salonpanel/wallet?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelURL = `${baseURLClean}/salonpanel/wallet?payment=cancelled`;

    // Create Stripe Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Salon Wallet Recharge",
              description: `Recharge wallet for ${salon.name}`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successURL,
      cancel_url: cancelURL,
      metadata: {
        salonId: salonId.toString(),
        amount: amount,
        type: "wallet_recharge",
      },
      customer_email: salon.email || undefined,
    });

    return res.status(200).json({
      status: true,
      message: "Stripe Checkout Session created successfully.",
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe Checkout Session creation error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Handle Stripe payment success callback (called after payment is confirmed)
exports.handleStripePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(200).json({ status: false, message: "Session ID is required." });
    }

    // Get Stripe settings
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting || !setting.stripeSecretKey) {
      return res.status(200).json({ status: false, message: "Stripe is not configured." });
    }

    // Initialize Stripe
    const stripeInstance = stripe(setting.stripeSecretKey);

    // Retrieve the checkout session
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(200).json({
        status: false,
        message: "Payment not completed.",
      });
    }

    // Get salon ID from metadata
    const salonId = session.metadata?.salonId;
    const amount = parseFloat(session.metadata?.amount || session.amount_total / 100);

    if (!salonId) {
      return res.status(200).json({ status: false, message: "Salon ID not found in session." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    // Add amount to salon wallet
    salon.wallet = (salon.wallet || 0) + amount;
    await salon.save();

    // Create wallet history entry
    const uniqueId = await generateUniqueIdentifier();
    const walletHistory = new SalonExpertWalletHistory({
      salon: salon._id,
      amount: amount,
      paymentGateway: PAYMENT_GATEWAY.STRIPE,
      type: 2, // CREDIT_FROM_SELF (salon owner self-recharge)
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm a"),
      uniqueId: uniqueId,
    });

    await walletHistory.save();

    return res.status(200).json({
      status: true,
      message: "Payment successful! Wallet credited.",
      walletBalance: salon.wallet,
    });
  } catch (error) {
    console.error("Stripe payment success handler error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Get salon wallet history
exports.walletHistory = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const month = req.query.month || moment().format("YYYY-MM");

    if (!month) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing month." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    // Get wallet history for the specified month
    const startDate = moment(month, "YYYY-MM").startOf("month").toDate();
    const endDate = moment(month, "YYYY-MM").endOf("month").toDate();

    const walletHistory = await SalonWalletHistory.find({
      salon: salonId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ createdAt: -1 })
      .populate("booking", "bookingId date time");

    return res.status(200).json({
      status: true,
      message: "Wallet history retrieved successfully.",
      walletBalance: salon.wallet || 0,
      data: walletHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Create MTN MoMo Payment Request for salon wallet recharge
/**
 * Create MTN MoMo Payment Request
 * 
 * IMPORTANT: INVALID_CURRENCY errors are usually NOT about currency!
 * Common causes:
 * 1. Wrong Subscription Key: Using key from Disbursement/Remittance instead of Collection
 * 2. Wrong API User: API User created in production URL instead of sandbox
 * 3. Wrong Access Token: Token generated from wrong product (not Collection)
 * 4. Missing Header: X-Target-Environment missing or wrong value
 * 
 * Solution: Recreate API User in sandbox and use Collection subscription key
 */
exports.createMTNMomoPaymentRequest = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.query;
    const salonId = req.salon._id;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(200).json({ status: false, message: "Invalid amount." });
    }

    if (!phoneNumber || phoneNumber.trim() === "") {
      return res.status(200).json({ status: false, message: "Phone number is required for MTN MoMo payment." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    if (!salon.isActive) {
      return res.status(200).json({ status: false, message: "Salon account is inactive." });
    }

    // Get MTN MoMo settings
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    
    // Check each requirement and provide specific error messages
    if (!setting) {
      return res.status(200).json({ status: false, message: "Settings not found." });
    }
    
    if (!setting.isMtnMomo) {
      return res.status(200).json({ 
        status: false, 
        message: "MTN MoMo is not enabled. Please enable it in Admin Settings > Payment Settings > MTN MoMo." 
      });
    }
    
    // Validate required MTN MoMo credentials according to official documentation
    if (!setting.mtnMomoSubscriptionKey || setting.mtnMomoSubscriptionKey.trim() === "") {
      return res.status(200).json({ 
        status: false, 
        message: "MTN MoMo Subscription Key is required. Get it from MTN Developer Portal > Products > Collection > Subscription (Primary or Secondary Key)." 
      });
    }
    
    if (!setting.mtnMomoApiUserId || setting.mtnMomoApiUserId.trim() === "") {
      return res.status(200).json({ 
        status: false, 
        message: "MTN MoMo API User ID is required. Create an API User in MTN Developer Portal and use the UUID as API User ID." 
      });
    }
    
    if (!setting.mtnMomoApiKey || setting.mtnMomoApiKey.trim() === "") {
      return res.status(200).json({ 
        status: false, 
        message: "MTN MoMo API Key is required. Generate it for your API User in MTN Developer Portal." 
      });
    }
    
    // Determine base URL based on environment
    const environment = (setting.mtnMomoEnvironment || "sandbox").toLowerCase();
    const baseUrl = environment === "production"
      ? "https://api.momodeveloper.mtn.com"
      : "https://sandbox.momodeveloper.mtn.com";

    // MTN MoMo for Cameroon only supports XAF currency
    // Always use XAF regardless of the currency in settings
    const currency = "XAF"; // Fixed to XAF for MTN MoMo (Cameroon)
    let paymentAmount = parseFloat(amount);
    
    // Get the original currency from settings to convert if needed
    const originalCurrency = (setting.currencyName || "XAF").toUpperCase();
    
    // Convert to XAF if the original currency is not XAF
    if (originalCurrency !== "XAF") {
      // Conversion rates (approximate)
      const conversionRates = {
        "EUR": 655, // 1 EUR ≈ 655 XAF
        "USD": 600, // 1 USD ≈ 600 XAF (approximate)
        "GBP": 750, // 1 GBP ≈ 750 XAF (approximate)
      };
      
      const rate = conversionRates[originalCurrency] || 655; // Default to EUR rate if unknown
      paymentAmount = paymentAmount * rate;
      console.log(`Converted ${amount} ${originalCurrency} to ${paymentAmount.toFixed(2)} XAF (rate: ${rate})`);
    } else {
      console.log(`Using XAF currency directly: ${paymentAmount.toFixed(2)} XAF`);
    }

    // Step 1: Get access token
    // According to MTN MoMo documentation:
    // - Basic Auth uses: base64(API_USER_ID:API_KEY)
    // - Subscription Key goes in Ocp-Apim-Subscription-Key header
    const tokenCredentials = Buffer.from(`${setting.mtnMomoApiUserId}:${setting.mtnMomoApiKey}`).toString("base64");
    const targetEnvironment = environment === "production" ? "production" : "sandbox";
    
    // Use Subscription Key from subscription (Primary or Secondary from subscription)
    const subscriptionKey = setting.mtnMomoSubscriptionKey;
    
    const tokenHeaders = {
      "Authorization": `Basic ${tokenCredentials}`, // Basic Auth: base64(API_USER_ID:API_KEY)
      "Ocp-Apim-Subscription-Key": subscriptionKey, // Subscription Key from subscription (MUST be from Collection product)
      "X-Target-Environment": targetEnvironment, // MUST be "sandbox" (lowercase) for sandbox environment
      "Content-Type": "application/json",
    };

    // Log token request details for debugging
    console.log("MTN MoMo Token Request:", {
      url: `${baseUrl}/collection/token/`,
      environment: targetEnvironment,
      baseUrl: baseUrl,
      hasSubscriptionKey: !!setting.mtnMomoSubscriptionKey,
      hasApiUserId: !!setting.mtnMomoApiUserId,
      hasApiKey: !!setting.mtnMomoApiKey,
      apiUserIdLength: setting.mtnMomoApiUserId?.length || 0,
      subscriptionKeyLength: setting.mtnMomoSubscriptionKey?.length || 0,
    });

    let tokenResponse;
    try {
      tokenResponse = await axios.post(`${baseUrl}/collection/token/`, {}, { headers: tokenHeaders });
    } catch (error) {
      console.error("MTN MoMo Token Error:", error.response?.data || error.message);
      console.error("MTN MoMo Token Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        environment: targetEnvironment,
        baseUrl: baseUrl,
        hasSubscriptionKey: !!setting.mtnMomoSubscriptionKey,
        hasApiUserId: !!setting.mtnMomoApiUserId,
        hasApiKey: !!setting.mtnMomoApiKey,
      });
      
      // Provide specific guidance based on error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error("⚠️ IMPORTANT: This error usually means:");
        console.error("1. Subscription Key is from wrong product (Disbursement/Remittance instead of Collection)");
        console.error("2. API User was created in production URL instead of sandbox");
        console.error("3. API User ID or API Key is incorrect");
        console.error("SOLUTION: Recreate API User in sandbox and use Collection subscription key");
      }
      
      let errorMessage = `Failed to get MTN MoMo access token: ${error.response?.data?.error || error.response?.data?.message || error.message}`;
      
      if (error.response?.status === 500 && error.response?.data?.error === "login_failed") {
        errorMessage = "Authentication failed (login_failed). Please verify:\n" +
          "1. Subscription Key is correct (from MTN Developer Portal > Products > Collection > Subscription)\n" +
          "2. API User ID is correct (UUID format, created when creating API User)\n" +
          "3. API Key is correct (generated for your API User)\n" +
          "4. Environment matches your API credentials (sandbox/production)\n" +
          "5. API User is created and active in MTN MoMo Developer Portal\n" +
          "6. Your API subscription is active in the Developer Portal";
      }
      
      return res.status(200).json({
        status: false,
        message: errorMessage,
      });
    }

    if (tokenResponse.status !== 200 || !tokenResponse.data.access_token) {
      return res.status(200).json({
        status: false,
        message: "Failed to get MTN MoMo access token.",
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Create payment request
    // Generate unique payment reference - MTN MoMo requires UUID format for X-Reference-Id
    // Using crypto to generate a UUID v4 format
    const crypto = require("crypto");
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 
      `${crypto.randomBytes(16).toString('hex').substring(0, 8)}-${crypto.randomBytes(16).toString('hex').substring(0, 4)}-4${crypto.randomBytes(16).toString('hex').substring(0, 3)}-${crypto.randomBytes(16).toString('hex').substring(0, 4)}-${crypto.randomBytes(16).toString('hex').substring(0, 12)}`;
    const reference = uuid; // Use UUID format for X-Reference-Id
    const externalId = `SALON_${Date.now()}_${salonId}`; // Use timestamp-based for externalId
    const cleanPhone = phoneNumber.replace(/\D/g, ""); // Remove non-digits

    // Validate phone number format (should start with country code, e.g., 237 for Cameroon)
    if (!cleanPhone || cleanPhone.length < 9) {
      return res.status(200).json({
        status: false,
        message: "Invalid phone number format. Please include country code (e.g., 237XXXXXXXXX for Cameroon).",
      });
    }

    // MTN MoMo requires amount as string without decimal points for XAF
    // For XAF, amount should be a whole number (no decimals)
    const amountString = currency === "XAF" 
      ? Math.round(paymentAmount).toString() 
      : paymentAmount.toFixed(2);

    // MTN MoMo payment body
    // IMPORTANT: Currency must be "XAF" for Cameroon MTN MoMo
    // The sandbox environment should support XAF, but if it doesn't, 
    // you may need to configure your API User for XAF currency in MTN Developer Portal
    const paymentBody = {
      amount: amountString, // String format, whole number for XAF
      currency: "XAF", // Hardcoded to XAF - required for Cameroon MTN MoMo
      externalId: externalId, // External reference for tracking
      payer: {
        partyIdType: "MSISDN",
        partyId: cleanPhone,
      },
      payerMessage: `Wallet recharge for ${salon.name}`,
      payeeNote: "Salon Wallet Recharge",
    };
    
    // Log the exact payment body being sent
    console.log("MTN MoMo Payment Body (exact):", JSON.stringify(paymentBody, null, 2));

    const baseURL = (process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com").replace(/\/+$/, ''); // Remove trailing slashes
    const callbackUrl = `${baseURL}/salon/handleMTNMomoPaymentCallback`;

    const paymentHeaders = {
      "Authorization": `Bearer ${accessToken}`, // Access Token from OAuth
      "Ocp-Apim-Subscription-Key": subscriptionKey, // Subscription Key from subscription
      "X-Target-Environment": targetEnvironment,
      "X-Reference-Id": reference, // Payment reference (UUID format required by MTN MoMo)
      "X-Callback-Url": callbackUrl,
      "Content-Type": "application/json",
    };

    // Log payment request details for debugging
    console.log("MTN MoMo Payment Request:", {
      url: `${baseUrl}/collection/v1_0/requesttopay`,
      amount: amountString,
      currency: currency,
      phoneNumber: cleanPhone,
      reference: reference,
      externalId: externalId,
      environment: targetEnvironment,
      hasAccessToken: !!accessToken,
      hasSubscriptionKey: !!subscriptionKey,
    });
    console.log("MTN MoMo Payment Body:", JSON.stringify(paymentBody, null, 2));

    let paymentResponse;
    try {
      paymentResponse = await axios.post(
        `${baseUrl}/collection/v1_0/requesttopay`,
        paymentBody,
        { headers: paymentHeaders }
      );
    } catch (error) {
      console.error("MTN MoMo Payment Request Error:", error.response?.data || error.message);
      console.error("MTN MoMo Payment Request Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestUrl: `${baseUrl}/collection/v1_0/requesttopay`,
        requestBody: paymentBody,
        requestHeaders: {
          ...paymentHeaders,
          Authorization: paymentHeaders.Authorization ? "Bearer ***" : undefined,
        },
      });
      
      let errorMessage = `Payment request failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`;
      
      // Provide more specific error messages based on common causes
      if (error.response?.status === 500) {
        const errorCode = error.response?.data?.code;
        const errorMsg = error.response?.data?.message || error.response?.data?.error || "Internal server error";
        
        if (errorCode === "INVALID_CURRENCY" || errorMsg.includes("Currency not supported")) {
          errorMessage = "INVALID_CURRENCY Error - This is usually NOT a currency issue!\n\n" +
            "Common causes:\n" +
            "1. ❌ Wrong Subscription Key: Using key from Disbursement/Remittance instead of Collection\n" +
            "2. ❌ Wrong API User: API User created in production URL instead of sandbox\n" +
            "3. ❌ Wrong Access Token: Token generated from wrong product (not Collection)\n" +
            "4. ❌ Missing/Incorrect Header: X-Target-Environment missing or wrong value\n\n" +
            "✅ SOLUTION: Recreate everything cleanly:\n" +
            "1. Create new API User in sandbox: POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser\n" +
            "2. Generate new API Key: POST /v1_0/apiuser/{apiUserId}/apikey\n" +
            "3. Use Collection subscription key (not Disbursement/Remittance)\n" +
            "4. Ensure X-Target-Environment: sandbox (lowercase)\n" +
            "5. Generate new token from Collection API\n\n" +
            "Note: MTN sandbox sometimes randomly rejects XAF - this is a known MTN limitation.";
        } else {
          errorMessage = "MTN MoMo server error. Please check:\n" +
            "1. Amount format is correct (whole number for XAF)\n" +
            "2. Phone number format is correct (with country code)\n" +
            "3. X-Reference-Id is in UUID format\n" +
            "4. All required headers are present\n" +
            `Error details: ${errorMsg}`;
        }
      }
      
      return res.status(200).json({
        status: false,
        message: errorMessage,
      });
    }

    if (paymentResponse.status === 202) {
      // 202 Accepted means payment request was created successfully
      return res.status(200).json({
        status: true,
        message: "Payment request sent. Please approve on your phone.",
        reference: reference,
        phoneNumber: cleanPhone,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: paymentResponse.data?.message || "Failed to create payment request",
      });
    }
  } catch (error) {
    console.error("MTN MoMo Payment Request creation error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Check MTN MoMo Payment Status
exports.checkMTNMomoPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.query;
    const salonId = req.salon._id;

    if (!reference) {
      return res.status(200).json({ status: false, message: "Reference ID is required." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    // Get MTN MoMo settings
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).json({ status: false, message: "Settings not found." });
    }
    
    // Validate required MTN MoMo credentials
    if (!setting.mtnMomoSubscriptionKey || setting.mtnMomoSubscriptionKey.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo Subscription Key is not configured." });
    }
    
    if (!setting.mtnMomoApiUserId || setting.mtnMomoApiUserId.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo API User ID is not configured." });
    }
    
    if (!setting.mtnMomoApiKey || setting.mtnMomoApiKey.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo API Key is not configured." });
    }

    // Determine base URL based on environment
    const environment = (setting.mtnMomoEnvironment || "sandbox").toLowerCase();
    const baseUrl = environment === "production"
      ? "https://api.momodeveloper.mtn.com"
      : "https://sandbox.momodeveloper.mtn.com";

    // Use Subscription Key from subscription
    const subscriptionKey = setting.mtnMomoSubscriptionKey;

    // Get access token using API User ID and API Key for Basic Auth
    const tokenCredentials = Buffer.from(`${setting.mtnMomoApiUserId}:${setting.mtnMomoApiKey}`).toString("base64");
    const targetEnvironment = environment === "production" ? "production" : "sandbox";

    const tokenHeaders = {
      "Authorization": `Basic ${tokenCredentials}`, // Basic Auth: base64(API_USER_ID:API_KEY)
      "Ocp-Apim-Subscription-Key": subscriptionKey, // Subscription Key from subscription
      "X-Target-Environment": targetEnvironment,
    };

    let tokenResponse;
    try {
      tokenResponse = await axios.post(`${baseUrl}/collection/token/`, {}, { headers: tokenHeaders });
    } catch (error) {
      return res.status(200).json({
        status: false,
        message: "Failed to get access token for status check",
      });
    }

    if (tokenResponse.status !== 200 || !tokenResponse.data.access_token) {
      return res.status(200).json({
        status: false,
        message: "Failed to get access token",
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Check payment status
    const statusHeaders = {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey, // API Key or Primary Key as Subscription Key
      "X-Target-Environment": targetEnvironment,
    };
    
    // Add API User ID if provided
    if (setting.mtnMomoApiUserId && setting.mtnMomoApiUserId.trim() !== "") {
      statusHeaders["X-API-User-Id"] = setting.mtnMomoApiUserId;
    }

    let statusResponse;
    try {
      statusResponse = await axios.get(
        `${baseUrl}/collection/v1_0/requesttopay/${reference}`,
        { headers: statusHeaders }
      );
    } catch (error) {
      return res.status(200).json({
        status: false,
        message: "Failed to check payment status",
      });
    }

    if (statusResponse.status === 200) {
      const paymentStatus = statusResponse.data.status;
      
      if (paymentStatus === "SUCCESSFUL") {
        // Payment successful - credit wallet
        const amount = parseFloat(statusResponse.data.amount || 0);
        
        // Check if already processed (avoid duplicate credits)
        const existingHistory = await SalonExpertWalletHistory.findOne({
          uniqueId: reference,
        });

        if (!existingHistory) {
          // Add amount to salon wallet
          salon.wallet = (salon.wallet || 0) + amount;
          await salon.save();

          // Create wallet history entry
          const uniqueId = await generateUniqueIdentifier();
          const walletHistory = new SalonExpertWalletHistory({
            salon: salon._id,
            amount: amount,
            paymentGateway: PAYMENT_GATEWAY.MTN_MOMO,
            type: 2, // CREDIT_FROM_SELF (salon owner self-recharge)
            date: moment().format("YYYY-MM-DD"),
            time: moment().format("HH:mm a"),
            uniqueId: reference, // Use reference as uniqueId to prevent duplicates
          });

          await walletHistory.save();
        }

        return res.status(200).json({
          status: true,
          message: "Payment successful! Wallet credited.",
          walletBalance: salon.wallet,
          paymentStatus: paymentStatus,
        });
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        return res.status(200).json({
          status: false,
          message: `Payment ${paymentStatus}`,
          paymentStatus: paymentStatus,
        });
      } else {
        // PENDING - still processing
        return res.status(200).json({
          status: true,
          message: "Payment is still being processed. Please wait...",
          paymentStatus: paymentStatus,
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "Failed to check payment status",
      });
    }
  } catch (error) {
    console.error("MTN MoMo Payment Status check error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Handle MTN MoMo Payment Callback (webhook)
exports.handleMTNMomoPaymentCallback = async (req, res) => {
  try {
    // MTN MoMo sends webhook callbacks here
    const { reference } = req.body || req.query;
    
    if (!reference) {
      return res.status(200).json({ status: false, message: "Reference ID is required." });
    }

    // Get MTN MoMo settings
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).json({ status: false, message: "Settings not found." });
    }
    
    // Validate required MTN MoMo credentials
    if (!setting.mtnMomoSubscriptionKey || setting.mtnMomoSubscriptionKey.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo Subscription Key is not configured." });
    }
    
    if (!setting.mtnMomoApiUserId || setting.mtnMomoApiUserId.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo API User ID is not configured." });
    }
    
    if (!setting.mtnMomoApiKey || setting.mtnMomoApiKey.trim() === "") {
      return res.status(200).json({ status: false, message: "MTN MoMo API Key is not configured." });
    }

    // Determine base URL based on environment
    const environment = (setting.mtnMomoEnvironment || "sandbox").toLowerCase();
    const baseUrl = environment === "production"
      ? "https://api.momodeveloper.mtn.com"
      : "https://sandbox.momodeveloper.mtn.com";

    // Use Subscription Key from subscription
    const subscriptionKey = setting.mtnMomoSubscriptionKey;

    // Get access token using API User ID and API Key for Basic Auth
    const tokenCredentials = Buffer.from(`${setting.mtnMomoApiUserId}:${setting.mtnMomoApiKey}`).toString("base64");
    const targetEnvironment = environment === "production" ? "production" : "sandbox";

    const tokenHeaders = {
      "Authorization": `Basic ${tokenCredentials}`, // Basic Auth: base64(API_USER_ID:API_KEY)
      "Ocp-Apim-Subscription-Key": subscriptionKey, // Subscription Key from subscription
      "X-Target-Environment": targetEnvironment,
    };

    let tokenResponse;
    try {
      tokenResponse = await axios.post(`${baseUrl}/collection/token/`, {}, { headers: tokenHeaders });
    } catch (error) {
      return res.status(200).json({ status: false, message: "Failed to get access token" });
    }

    if (tokenResponse.status !== 200 || !tokenResponse.data.access_token) {
      return res.status(200).json({ status: false, message: "Failed to get access token" });
    }

    const accessToken = tokenResponse.data.access_token;

    // Check payment status
    const statusHeaders = {
      "Authorization": `Bearer ${accessToken}`, // Access Token from OAuth
      "Ocp-Apim-Subscription-Key": subscriptionKey, // Subscription Key from subscription
      "X-Target-Environment": targetEnvironment,
    };

    let statusResponse;
    try {
      statusResponse = await axios.get(
        `${baseUrl}/collection/v1_0/requesttopay/${reference}`,
        { headers: statusHeaders }
      );
    } catch (error) {
      return res.status(200).json({ status: false, message: "Failed to check payment status" });
    }

    if (statusResponse.status === 200 && statusResponse.data.status === "SUCCESSFUL") {
      // Extract salon ID from reference (format: SALON_timestamp_salonId)
      const parts = reference.split("_");
      if (parts.length >= 3) {
        const salonId = parts[2];
        const salon = await Salon.findById(salonId);
        
        if (salon) {
          const amount = parseFloat(statusResponse.data.amount || 0);
          
          // Check if already processed (avoid duplicate credits)
          const existingHistory = await SalonExpertWalletHistory.findOne({
            uniqueId: reference,
          });

          if (!existingHistory) {
            // Add amount to salon wallet
            salon.wallet = (salon.wallet || 0) + amount;
            await salon.save();

            // Create wallet history entry
            const uniqueId = await generateUniqueIdentifier();
            const walletHistory = new SalonExpertWalletHistory({
              salon: salon._id,
              amount: amount,
              paymentGateway: PAYMENT_GATEWAY.MTN_MOMO,
              type: 2, // CREDIT_FROM_SELF
              date: moment().format("YYYY-MM-DD"),
              time: moment().format("HH:mm a"),
              uniqueId: reference, // Use reference as uniqueId to prevent duplicates
            });

            await walletHistory.save();
          }
        }
      }
    }

    return res.status(200).json({ status: true, message: "Callback processed" });
  } catch (error) {
    console.error("MTN MoMo Payment Callback error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
