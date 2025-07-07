const SalonClose = require("../../models/salonClose.model");
const Salon = require("../../models/salon.model");
const moment = require('moment');

exports.addHoliday = async (req, res) => {
  try {
    if (!req.body.startDate || !req.query.salonId || !req.body.endDate) {
      return res
        .status(200)
        .send({ status: false, message: "Oops! Invalid details!" });
    }

    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Salon not found!" });
    }

    const startDate = moment(req.body.startDate).format('YYYY-MM-DD');
    const endDate = moment(req.body.endDate).format('YYYY-MM-DD');

    const datesToAdd = [];
    const currentDate = moment(startDate);
    while (currentDate <= moment(endDate)) {
      datesToAdd.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }

    for (const dateToAdd of datesToAdd) {
      const alreadyHoliday = await SalonClose.findOne({
        date: dateToAdd,
        salonId: salon._id,
      });

      if (alreadyHoliday) {
        return res.status(200).send({
          status: false,
          message: `Date ${dateToAdd} is already added as a holiday`,
        });
      }
    }

    const addedHolidays = [];
    for (const dateToAdd of datesToAdd) {
      const salonOff = new SalonClose();
      salonOff.date = dateToAdd;
      salonOff.reason = req.body.reason || null;
      salonOff.salonId = salon._id;
      await salonOff.save();
      addedHolidays.push(salonOff);
    }

    await SalonClose.populate(addedHolidays, { path: 'salonId' ,select:"name _id"});
    return res.status(200).send({
      status: true,
      message: "Salon Holidays Added!",
      data:addedHolidays,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

exports.getHoliday = async (req, res) => {
  try {
    const startDate = req?.query.startDate || "ALL";
    const endDate = req?.query.endDate || "ALL";
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = start * limit;

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const pipeline = [
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "salonId",
        },
      },
      {
        $match: dateFilter,
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          createdAt: 1,
          salonId: { $arrayElemAt: ["$salonId", 0] },
          reason:1
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]

    const [holidays,total] = await Promise.all([
      SalonClose.aggregate(pipeline),
      SalonClose.countDocuments(dateFilter)
    ])



    return res.status(200).send({
      status: true,
      message: "Success!!",
      total: total ? total : 0,
      data: holidays
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.id) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const holiday = await SalonClose.findByIdAndDelete(req.query.id);
    if (!holiday) {
      return res
        .status(200)
        .send({ status: false, message: "Holiday Not Exist" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Holiday Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
