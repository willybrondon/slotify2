const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Product = require("../../models/product.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const SalonWalletHistory = require("../../models/salonWalletHistory.model");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const { PAYMENT_GATEWAY } = require("../../types/constant");

const { deleteFile, deleteFiles } = require("../../middleware/deleteFile");
const fs = require("fs");
const moment = require("moment");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.address ||
      !req.body.landMark ||
      !req.body.city ||
      !req.body.state ||
      !req.body.country ||
      !req.body.mobile ||
      !req.body.email ||
      !req.body.password ||
      !req.body.platformFee ||
      !req.body.latitude ||
      !req.body.about ||
      req.files?.image?.length === 0
    ) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).send({
        status: false,
        message: "Oops ! Invalid details!!",
      });
    }
    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const salon = new Salon();
    salon.name = req.body.name;
    salon.email = req.body.email;
    salon.addressDetails = {
      addressLine1: capitalizeFirstLetter(req.body.address),
      landMark: req.body.landMark,
      city: capitalizeFirstLetter(req.body.city),
      state: capitalizeFirstLetter(req.body.state),
      country: capitalizeFirstLetter(req.body.country),
    };
    salon.mobile = req.body.mobile;
    salon.password = req.body.password;
    salon.platformFee = req.body.platformFee;
    salon.minWalletBalance =
      req.body.minWalletBalance !== undefined && req.body.minWalletBalance !== ""
        ? parseFloat(req.body.minWalletBalance)
        : 0;
    salon.wallet = 0;
    salon.paymentMethods = { acceptCash: true, acceptStripe: false };
    salon.locationCoordinates = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
    salon.about = req.body.about;

    let uniqueId;
    let isUniqueId = false;
    while (!isUniqueId) {
      uniqueId = Math.floor(Math.random() * 10000000);
      const existingSalon = await Salon.findOne({ id: uniqueId });
      isUniqueId = !existingSalon;
    }
    salon.uniqueId = uniqueId;

    const imagePaths = req.files?.image?.map((file) => file.path);
    salon.image = process.env.baseURL + imagePaths;
    salon.mainImage = process.env.baseURL + imagePaths[0];

    const defaultSalonTime = {
      openTime: "09:00 AM",
      closedTime: "09:00 PM",
      isActive: true,
      breakStartTime: "01:30 PM",
      breakEndTime: "02:30 PM",
      time: 15,
    };

    salon.salonTime = [
      { day: "Monday", ...defaultSalonTime },
      { day: "Tuesday", ...defaultSalonTime },
      { day: "Wednesday", ...defaultSalonTime },
      { day: "Thursday", ...defaultSalonTime },
      { day: "Friday", ...defaultSalonTime },
      { day: "Saturday", ...defaultSalonTime },
      { day: "Sunday", ...defaultSalonTime },
    ];

    await salon.save();
    return res.status(200).send({
      status: true,
      message: "Salon Created Successfully!!",
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

exports.update = async (req, res) => {
  try {
    if (!req.query.salonId) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Oops ! Salon Not Found!!" });
    }
    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
    salon.name = req.body.name ? req.body.name : salon.name;
    salon.email = req.body.email ? req.body.email : salon.email;
    salon.addressDetails = {
      addressLine1: req.body.address ? capitalizeFirstLetter(req.body.address) : salon.addressDetails.addressLine1,
      landMark: req.body.landMark ? req.body.landMark : salon.addressDetails.landMark,
      city: req.body.city ? req.body.city : salon.addressDetails.city,
      state: req.body.state ? req.body.state : salon.addressDetails.state,
      country: req.body.country ? req.body.country : salon.addressDetails.country,
    };
    salon.about = req.body.about ? req.body.about : salon.about;
    salon.mobile = req.body.mobile ? req.body.mobile : salon.mobile;
    salon.locationCoordinates = {
      latitude: req.body.latitude ? req.body.latitude : salon.locationCoordinates.latitude,
      longitude: req.body.longitude ? req.body.longitude : salon.locationCoordinates.longitude,
    };
    salon.platformFee = req.body.platformFee ? req.body.platformFee : salon.platformFee;
    if (req.body.minWalletBalance !== undefined && req.body.minWalletBalance !== "") {
      salon.minWalletBalance = parseFloat(req.body.minWalletBalance);
    } else if (req.body.minWalletBalance === "" || req.body.minWalletBalance === null) {
      salon.minWalletBalance = null;
    }
    salon.password = req.body.password ? req.body.password : salon.password;
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
    await salon.save();
    return res.status(200).send({
      status: true,
      message: "Salon Created Successfully!!",
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

exports.getAll = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const regex = new RegExp(searchQuery, "i");

    let searchFilter = {};

    if (searchQuery !== "" && searchQuery !== "ALL") {
      searchFilter = {
        $or: [{ "salon.name": { $regex: regex } }, { mobile: { $regex: regex } }, { email: { $regex: regex } }, { "address.landmark": { $regex: regex } }],
      };
    }

    // Get all salon data, excluding only salonTime array
    // IMPORTANT: Only show non-deleted salons (isDelete: false)
    // When using $project with exclusions (field: 0), all other fields are included by default
    // We then ensure isClaimed defaults to false if not set in database
    const data = await Salon.aggregate([
      {
        $match: {
          isDelete: false, // Only show non-deleted salons
          ...searchFilter,
        },
      },
      {
        $project: {
          salonTime: 0, // Exclude salonTime array - all other fields included automatically
        },
      },
      {
        $addFields: {
          // Ensure isClaimed defaults to false if not set (for old salons without this field)
          isClaimed: { $ifNull: ["$isClaimed", false] },
          // Ensure claimToken exists (empty string if not set)
          claimToken: { $ifNull: ["$claimToken", ""] },
        },
      },
    ]);

    return res.status(200).send({ status: true, message: "Success", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getSalon = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
    const salon = await Salon.findById(req.query.salonId).populate({
      path: "serviceIds",
      populate: {
        path: "id",
      },
    });

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }
    return res.status(200).json({ status: true, message: "success", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.updateSalonTime = async (req, res) => {
  try {
    if (!req.query.salonId || !req.query.day) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
    const salon = await Salon.findById(req.query.salonId);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
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
      salonDay.breakStartTime = req.body.breakStartTime ? req.body.breakStartTime : salonDay.breakStartTime;
      salonDay.breakEndTime = req.body.breakEndTime ? req.body.breakEndTime : salonDay.breakEndTime;

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

exports.manageBreak = async (req, res) => {
  try {
    const { salonId, day } = req.query;

    if (!salonId || !day) {
      return res.status(400).json({ status: false, message: "Invalid Details" });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon does not exist" });
    }

    const salonDay = salon.salonTime.find((time) => time.day === day);
    if (!salonDay) {
      return res.status(404).json({ status: false, message: "Day not found in salon schedule" });
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

exports.getSalonTime = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
    const salon = await Salon.findById(req.query.salonId);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    const salonTIme = salon.salonTime;

    return res.status(200).json({
      status: true,
      message: "Salon time updated successfully",
      salonTIme,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.isActive = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    salon.isActive = !salon.isActive;
    await salon.save();

    return res.status(200).json({ status: true, message: "success", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.isBestSeller = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    salon.isBestSeller = !salon.isBestSeller;
    await salon.save();

    return res.status(200).json({ status: true, message: "success", salon });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.getProductsOfParticularSalon = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }

    const salonId = new mongoose.Types.ObjectId(req.query.salonId);

    const query = [
      { path: "category", select: "name" },
      {
        path: "salon",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const [salon, totalProducts, product] = await Promise.all([
      Salon.findById(salonId),
      Product.countDocuments({ salon: salonId, isAddByAdmin: false }),
      Product.find({ salon: salonId, isAddByAdmin: false })
        .populate(query)
        .sort({ createdAt: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive the products.",
      totalProducts: totalProducts,
      product: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    // SAFEGUARD: Require salonId parameter
    if (!req.query.salonId) {
      console.error("[Salon Delete] ERROR: Attempted to delete salon without salonId");
      return res.status(200).json({ status: false, message: "Invalid Details: salonId is required" });
    }

    // SAFEGUARD: Validate salonId format to prevent injection
    let salonId;
    try {
      salonId = new mongoose.Types.ObjectId(req.query.salonId);
    } catch (error) {
      console.error("[Salon Delete] ERROR: Invalid salonId format:", req.query.salonId);
      return res.status(200).json({ status: false, message: "Invalid salonId format" });
    }

    const salon = await Salon.findById(salonId);

    if (!salon) {
      console.error("[Salon Delete] ERROR: Salon not found:", salonId);
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    // SAFEGUARD: Log deletion for audit
    console.log(`[Salon Delete] Soft deleting salon: ${salon.name} (${salon.email}) - ID: ${salonId}`);

    // Soft delete: Set isDelete flag instead of actually deleting
    salon.isDelete = true;
    await salon.save();

    // Also soft delete associated experts
    const expertUpdateResult = await Expert.updateMany(
      { salonId: salon._id, isDelete: false }, 
      { $set: { isDelete: true } }
    );
    
    console.log(`[Salon Delete] Soft deleted ${expertUpdateResult.modifiedCount} associated experts`);

    return res.status(200).json({ status: true, message: "Salon deleted successfully", salon });
  } catch (error) {
    console.error("[Salon Delete] ERROR:", error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.fetchSalonWalletHistoryByAdmin = async (req, res) => {
  try {
    const { type, salonId } = req.query;

    if (!type || !salonId) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const salonObjId = new mongoose.Types.ObjectId(salonId);

    let dateFilterQuery = {};
    if (startDate !== "ALL" && endDate !== "ALL") {
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

    let typeQuery = {}; //2.deduct Or 3.deposite Or 4.deposite 
    if (type !== "All") {
      if (parseInt(type) === 3) {
        typeQuery.type = { $in: [3, 4] };
      } else {
        typeQuery.type = parseInt(type);
      }
    }

    const [salon, total, data] = await Promise.all([
      Salon.findById(salonObjId),
      SalonExpertWalletHistory.countDocuments({
        type: { $ne: 1 },
        salon: salonObjId,
        ...dateFilterQuery,
        ...typeQuery,
      }),
      SalonExpertWalletHistory.find({
        type: { $ne: 1 },
        salon: salonObjId,
        ...dateFilterQuery,
        ...typeQuery,
      })
        .select("type payoutStatus amount uniqueId date time createdAt")
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
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Generate slug from salon name (same as user controller)
const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Get salon share link for admin
exports.getSalonShareLink = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({
        status: false,
        message: "Salon ID is required",
      });
    }

    const salon = await Salon.findOne({
      _id: req.query.salonId,
      isActive: true,
      isDelete: false,
    });

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon not found",
      });
    }

    // Generate slug from salon name
    const slug = generateSlug(salon.name);
    // Get short ID (first 6 characters of ObjectId)
    const shortId = salon._id.toString().substring(0, 6);
    // Combine slug and short ID
    const slugWithId = `${slug}-${shortId}`;

    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${slugWithId}`;

    return res.status(200).json({
      status: true,
      message: "Share URL generated successfully",
      shareUrl: shareUrl,
      salonId: salon._id,
      salonName: salon.name,
    });
  } catch (error) {
    console.error("[Admin Share URL] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Admin adds money to salon wallet
exports.addMoneyToSalonWallet = async (req, res) => {
  try {
    const { salonId, amount, paymentGateway, description } = req.body;

    if (!salonId || !amount || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const requestedAmount = parseFloat(amount);
    const salonObjId = new mongoose.Types.ObjectId(salonId);

    if (requestedAmount <= 0) {
      return res.status(200).json({ status: false, message: "Amount must be greater than 0." });
    }

    // Validate payment gateway
    const paymentGatewayNum = parseInt(paymentGateway);
    if (!Object.values(PAYMENT_GATEWAY).includes(paymentGatewayNum)) {
      return res.status(200).json({ status: false, message: "Invalid payment gateway." });
    }

    const salon = await Salon.findById(salonObjId);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon not found." });
    }

    // Add amount to salon wallet
    salon.wallet = (salon.wallet || 0) + requestedAmount;
    await salon.save();

    // Create wallet history entry
    const uniqueId = await generateUniqueIdentifier();
    const walletHistory = new SalonWalletHistory({
      salon: salon._id,
      amount: requestedAmount,
      paymentGateway: paymentGatewayNum,
      type: 4, // Admin manual addition
      description: description || `Admin added funds via ${paymentGatewayNum === PAYMENT_GATEWAY.STRIPE ? 'Stripe' : 'Payment Gateway'}`,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm a"),
      uniqueId: uniqueId,
      addedBy: "admin",
    });

    await walletHistory.save();

    return res.status(200).json({
      status: true,
      message: "Amount successfully added to salon wallet.",
      walletBalance: salon.wallet,
      salon: {
        _id: salon._id,
        name: salon.name,
        email: salon.email,
        wallet: salon.wallet,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};