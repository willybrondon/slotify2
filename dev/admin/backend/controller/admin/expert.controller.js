const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const mongoose = require("mongoose");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    if (
      // !req.body ||
      !req.body.fname ||
      !req.body.lname ||
      !req.body.email ||
      !req.body.age ||
      !req.body.gender ||
      !req.body.mobile ||
      !req.body.commission ||
      !req.body.bankName ||
      !req.body.accountNumber ||
      !req.body.IFSCCode ||
      !req.body.upiId ||
      !req.body.branchName ||
      !req.body.password || //
      !req.body.salonId
    ) {
      if (req.files) deleteFile(req.files.image[0]);
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const capitalizeAllLetters = (str) => {
      return str.toUpperCase();
    };
    const expert = new Expert();
    expert.fname = capitalizeFirstLetter(req.body.fname);
    expert.lname = capitalizeFirstLetter(req.body.lname);
    expert.email = req.body.email;
    expert.age = req.body.age;
    expert.gender = req.body.gender;
    expert.mobile = req.body.mobile;
    expert.commission = req.body.commission;
    expert.bankDetails.bankName = req.body.bankName;
    expert.bankDetails.branchName = req.body.branchName;
    expert.bankDetails.accountNumber = req.body.accountNumber;
    expert.bankDetails.IFSCCode = capitalizeAllLetters(req.body.IFSCCode);
    expert.upiId = capitalizeAllLetters(req.body.upiId);
    expert.password = req.body.password;
    expert.uniqueId = Math.floor(Math.random() * 1000000 + 999999);

    if (req.body.serviceId) {
      let service = Array.isArray(req.body.serviceId)
        ? req.body.serviceId
        : [req.body.serviceId];

      const serviceIdArray = service[0].split(",");
      expert.serviceId = serviceIdArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    expert.image = req.file ? process?.env?.baseURL + req?.file?.path : "";
    const salon = await Salon.findById(req.body.salonId);
    if (!salon) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Salon not found !!" });
    }

    expert.salonId = req.body.salonId;

    await expert.save();
    const data = await Expert.findById(expert._id).populate("serviceId");
    return res.status(200).send({
      status: true,
      message: "Expert Created Successful !",
      expert: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }
    let salonQuery;

    if (req.query.salonId !== "ALL" && req.query.salonId !== "") {
      let salon = await Salon.findById(req.query.salonId);
      if (!salon) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! Salon not found !!" });
      }
      salonQuery = { salonId: salon._id };
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
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
        $match: {
          isDelete: false,
          ...matchQuery,
          ...salonQuery,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $lookup: {
          from: "services",
          let: { serviceId: "$serviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$serviceId"] },
                    { $eq: ["$isDelete", false] },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
              },
            },
          ],
          as: "serviceData",
        },
      },
      {
        $project: {
          _id: 1,
          fname: 1,
          lname: 1,
          email: 1,
          age: 1,
          gender: 1,
          mobile: 1,
          commission: 1,
          image: 1,
          createdAt: 1,
          paymentType: 1,
          isBlock: 1,
          serviceData: 1,
          bankDetails: 1,
          upiId: 1,
          password: 1,
          uniqueId: 1,
          review: 1,
          reviewCount: 1,
          salonId: "$salon._id",
          salon: "$salon.name",
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ];

    const [experts, total] = await Promise.all([
      Expert.aggregate(pipeline),
      Expert.countDocuments({
        ...matchQuery,
        ...salonQuery,
        isDelete: false,
      }),
    ]);


    return res.status(200).json({
      status: true,
      message: "Data found",
      total: total ? total : 0,
      experts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateExpert = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      if (req.files) deleteFile(req.files.image[0]);
      return res
        .status(200)
        .send({ status: false, message: "Expert not found" });
    }

    // Update expert properties based on request data
    expert.fname = req.body.fname ? req.body.fname : expert.fname;
    expert.lname = req.body.lname ? req.body.lname : expert.lname;
    expert.email = req.body.email ? req.body.email : expert.email;
    expert.mobile = req.body.mobile ? req.body.mobile : expert.mobile;
    expert.age = req.body.age ? req.body.age : expert.age;
    expert.gender = req.body.gender ? req.body.gender : expert.gender;
    expert.commission = req.body.commission
      ? req.body.commission
      : expert.commission;

    expert.upiId = req.body.upiId || expert.upiId;
    expert.bankDetails.bankName =
      req.body.bankName || expert.bankDetails.bankName;
    expert.bankDetails.accountNumber =
      req.body.accountNumber || expert.bankDetails.accountNumber;
    expert.bankDetails.IFSCCode =
      req.body.IFSCCode || expert.bankDetails.IFSCCode;
    expert.bankDetails.branchName =
      req.body.branchName || expert.bankDetails.branchName;
    // // Update serviceId if provided in the request
    if (req.body.serviceId) {
      let service = Array.isArray(req.body.serviceId)
        ? req.body.serviceId
        : [req.body.serviceId];

      const serviceIdArray = service[0].split(",");
      expert.serviceId = serviceIdArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Update the expert's image if a new file is uploaded
    if (req.file) {
      var image_ = expert.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }
      expert.image = req.file
        ? process.env.baseURL + req.file.path
        : expert.image;
    }

    await expert.save();

    // Populate the updated expert data
    const data = await Expert.findById(expert._id).populate("serviceId");

    return res
      .status(200)
      .send({ status: true, message: "Updated successfully", expert: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "invalid details" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert not exists" });
    }
    const image = expert.image?.split("storage");
    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }
    expert.isDelete = true;

    await expert.save();
    return res.status(200).send({ status: true, message: "Expert deleted!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.isBlock = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "invalid details" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res
        .status(200)
        .send({ status: false, message: "Expert not exist" });
    }
    expert.isBlock = !expert.isBlock;
    await expert.save();

    return res
      .status(200)
      .send({ status: true, message: "Status changed Successfully", expert });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.getExpert = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);
    if (!expert || expert.isDelete) {
      return res
        .status(200)
        .send({ status: false, message: "Expert not exist" });
    }
    const experts = await Expert.aggregate([
      {
        $match: { _id: expert._id, isDelete: false },
      },
      {
        $lookup: {
          from: "services",
          let: { serviceId: "$serviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$serviceId"] },
                    { $eq: ["$isDelete", false] },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
              },
            },
          ],
          as: "serviceData",
        },
      },
      {
        $project: {
          _id: 1,
          fname: 1,
          lname: 1,
          email: 1,
          age: 1,
          gender: 1,
          mobile: 1,
          serviceData: 1,
          image: 1,
          createdAt: 1,
          commission: 1,
          currentEarning: 1,
          uniqueId: 1,
          bankDetails: 1,
          earning: 1,
          bookingCount: 1,
          totalBookingCount: 1,
          upiId: 1,
          review: 1,
          reviewCount: 1,
          paymentType: 1,
        },
      },
    ]);


    return res.status(200).json({
      status: true,
      message: "Data found",
      experts: experts[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
