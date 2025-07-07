const Attendance = require("../../models/attendance.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const moment = require("moment");

exports.getSalonWiseAttendance = async (req, res) => {
  try {
    const months = moment().format("YYYY-MM");
    const monthOfData = req.query.month || months;

    const salon = await Salon.findById(req.salon._id);

    if (!salon) {
      return res
        .status(200)
        .json({ status: false, message: "Salon does not Exist" });
    }
    attendanceForExpert = await Attendance.find({
      month: monthOfData,
      salonId: salon._id,
    }).populate("expertId");
    return res.status(200).send({
      status: true,
      message: "data fetch successfully",
      data: attendanceForExpert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
