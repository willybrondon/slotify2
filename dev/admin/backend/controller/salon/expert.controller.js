const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

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
      !req.body.password
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const expert = new Expert();
    expert.fname = capitalizeFirstLetter(req.body.fname);
    expert.lname = capitalizeFirstLetter(req.body.lname);
    expert.email = req.body.email;
    expert.age = req.body.age;
    expert.gender = req.body.gender;
    expert.mobile = req.body.mobile;
    expert.commission = req.body.commission;
    expert.password = req.body.password;
    expert.uniqueId = Math.floor(Math.random() * 1000000 + 999999);

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(201).send({
        status: false,
        message: "Salon Not Found Login again",
      });
    }
    if (req.body.serviceId) {
      let serviceIds = [];
      if (req.body.serviceId) {
        serviceIds = req.body.serviceId.split(",").map((id) => id.trim());
      }

      const isValidService = await Salon.findOne({
        _id: salon._id,
        "serviceIds.id": {
          $all: serviceIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });

      if (!isValidService) {
        return res.status(200).json({
          status: false,
          message: "Invalid serviceIds provided for the salon.",
        });
      }
      expert.serviceId = serviceIds.map((id) => new mongoose.Types.ObjectId(id));
    }

    expert.image = req.file ? process?.env?.baseURL + req?.file?.path : "";

    expert.salonId = salon._id;

    await expert.save();
    const data = await Expert.findOne(expert._id).populate("serviceId");
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
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Oops ! Salon not found !!" });
    }
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    let matchQuery = {};

    const searchString = req.query.search || "";
    if (req.query.search !== "ALL" && req.query.search !== "") {
      const searchRegex = new RegExp(searchString, "i");

      console.log("searchRegex", searchRegex);

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
          salonId: salon._id,
          ...matchQuery,
          isDelete: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "expertId",
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "services",
          let: { serviceId: "$serviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ["$_id", "$$serviceId"] }, { $eq: ["$isDelete", false] }],
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
          isBlock: 1,
          serviceData: 1,
          password: 1,
          uniqueId: 1,
          review: 1,
          reviewCount: 1,
        },
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];
    const [experts, total] = await Promise.all([
      Expert.aggregate(pipeline),
      Expert.countDocuments({
        salonId: salon._id,
        isDelete: false,
        ...matchQuery,
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
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      if (req.files) deleteFile(req.files.image[0]);
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    // Update expert properties based on request data
    expert.fname = req.body.fname ? req.body.fname : expert.fname;
    expert.lname = req.body.lname ? req.body.lname : expert.lname;
    expert.email = req.body.email ? req.body.email : expert.email;
    expert.mobile = req.body.mobile ? req.body.mobile : expert.mobile;
    expert.age = req.body.age ? req.body.age : expert.age;
    expert.gender = req.body.gender ? req.body.gender : expert.gender;
    expert.commission = req.body.commission ? req.body.commission : expert.commission;

    //Update serviceId if provided in the request
    if (req.body.serviceId) {
      let service = Array.isArray(req.body.serviceId) ? req.body.serviceId : [req.body.serviceId];

      const serviceIdArray = service[0].split(",");
      expert.serviceId = serviceIdArray.map((id) => new mongoose.Types.ObjectId(id));
    }

    // Update the expert's image if a new file is uploaded
    if (req.file) {
      var image_ = expert.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }
      expert.image = req.file ? process.env.baseURL + req.file.path : expert.image;
    }

    await expert.save();

    // Populate the updated expert data
    const data = await Expert.findById(expert._id).populate("serviceId");

    return res.status(200).send({ status: true, message: "Updated successfully", expert: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.isBlock = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(200).send({ status: false, message: "invalid details" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not exist" });
    }
    expert.isBlock = !expert.isBlock;
    await expert.save();

    return res.status(200).send({ status: true, message: "Status changed Successfully", expert });
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
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not exist" });
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
                  $and: [{ $in: ["$_id", "$$serviceId"] }, { $eq: ["$isDelete", false] }],
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
          uniqueId: 1,
          earning: 1,
          bookingCount: 1,
          totalBookingCount: 1,
          review: 1,
          reviewCount: 1,
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

exports.delete = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(200).send({ status: false, message: "invalid details" });
    }
    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not exists" });
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

exports.retriveParExpertWalletHistoryBySalon = async (req, res) => {
  try {
    const { expertId, type } = req.query;

    if (!expertId || !type) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

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

    let typeQuery = {}; //1.deposite Or 2.deduct
    if (type !== "All") {
      typeQuery.type = parseInt(type);
    }

    const expertObjId = new mongoose.Types.ObjectId(expertId);

    const [expert, total, data] = await Promise.all([
      Expert.findOne({ _id: expertObjId, isDelete: false }),
      SalonExpertWalletHistory.countDocuments({
        type: { $ne: 3 },
        expert: expertObjId,
        ...dateFilterQuery,
        ...typeQuery,
      }),
      SalonExpertWalletHistory.aggregate([
        {
          $match: {
            type: { $ne: 3 },
            expert: expertObjId,
            ...dateFilterQuery,
            ...typeQuery,
          },
        },
        {
          $project: {
            type: 1,
            payoutStatus: 1,
            uniqueId: 1,
            amount: 1,
            date: 1,
            time: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: start * limit },
        { $limit: limit },
      ]),
    ]);

    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert does not found." });
    }

    if (expert.isBlock) {
      return res.status(200).json({ status: false, message: "Your account is blocked by the admin." });
    }

    const totalAmount = expert.earning || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      totalEarning: totalAmount,
      total: total,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
