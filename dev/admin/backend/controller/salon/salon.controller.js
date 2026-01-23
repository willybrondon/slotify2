const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Setting = require("../../models/setting.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const { PAYMENT_GATEWAY } = require("../../types/constant");

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
    const setting = await Setting.findOne().select("currencyName currencySymbol isStripePay isZitopay isRazorPay isFlutterWave minSalonWalletBalance");
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
