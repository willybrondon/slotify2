const User = require("../../models/user.model");

const UserWalletHistory = require("../../models/userWalletHistory.model");

const mongoose = require("mongoose");

exports.getAllUsers = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = start * limit;
    let matchQuery = {};

    const searchString = req.query.search || "";

    if (req.query.search !== "ALL" && req.query.search !== "") {
      const searchRegex = new RegExp(searchString, "i");
      matchQuery = {
        $or: [
          { fname: { $regex: searchString, $options: "i" } },
          { lname: { $regex: searchString, $options: "i" } },
          { email: { $regex: searchString, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobile" },
                regex: searchRegex,
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$uniqueId" },
                regex: searchRegex,
              },
            },
          },
        ],
      };
    }

    const pipeline = [
      {
        $match: { isDelete: false, ...matchQuery },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const [users, total] = await Promise.all([User.aggregate(pipeline), User.countDocuments({ isDelete: false, ...matchQuery })]);

    return res.status(200).send({
      status: true,
      message: "Success",
      users,
      total: total ? total : 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.userBlock = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User not exist" });
    }
    user.isBlock = !user.isBlock;
    await user.save();
    return res.status(200).send({
      status: true,
      message: "Status Updated Successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

//retrive wallet history of particular user
exports.getUserWalletHistoryByAdmin = async (req, res) => {
  try {
    const { userId, type } = req.query;

    if (!userId || !type) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const userObjId = new mongoose.Types.ObjectId(userId);

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

    let typeQuery = {}; //deposite Or deduct
    if (type !== "All") {
      if (parseInt(type) === 2) {
        typeQuery.type = { $in: [2, 3] };
      } else {
        typeQuery.type = parseInt(type);
      }
    }

    const [user, total, data] = await Promise.all([
      User.findOne({ _id: userObjId, isDelete: false }),
      UserWalletHistory.countDocuments({ user: userObjId, ...dateFilterQuery, ...typeQuery }),
      UserWalletHistory.find({ user: userObjId, ...dateFilterQuery, ...typeQuery })
        .select("type amount uniqueId date time createdAt")
        .sort({ date: -1, time: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
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

//retrive wallet history of customers
exports.fetchAllUserWalletRecords = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

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

    let typeQuery = {}; //deposite Or deduct
    if (type !== "All") {
      if (parseInt(type) === 2) {
        typeQuery.type = { $in: [2, 3] };
      } else {
        typeQuery.type = parseInt(type);
      }
    }

    const [total, data] = await Promise.all([
      UserWalletHistory.countDocuments({ user: { $ne: null }, ...dateFilterQuery, ...typeQuery }),
      UserWalletHistory.find({ user: { $ne: null }, ...dateFilterQuery, ...typeQuery })
        .select("type amount paymentGateway uniqueId date time coupon createdAt")
        .populate("user", "fname lname")
        .sort({ date: -1, time: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

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
