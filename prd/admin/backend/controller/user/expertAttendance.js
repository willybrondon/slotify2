const Attendance = require("../../models/attendance.model");
const Expert = require("../../models/expert.model");
const moment = require("moment");

exports.expertAttendance = async (req, res) => {
  try {
    const { expertId, action } = req.query;
    const todayDate = moment().format("YYYY-MM-DD");

    if (!expertId || !action) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details provided" });
    }

    const expert = await Expert.findById(expertId);

    if (!expert) {
      return res
        .status(200)
        .json({ status: false, message: "Expert Not Found" });
    }

    let attendanceRecord = await Attendance.findOne({
      expertId,
      month: moment().format("YYYY-MM"),
    }).populate("expertId");

    let savedAttendance;

    if (!attendanceRecord) {
      attendanceRecord = new Attendance();
      attendanceRecord.expertId = expertId;
      attendanceRecord.month = moment().format("YYYY-MM");
    }

    const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
    const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

    if (action === "attend") {
      if (dateIndex !== -1) {
        return res.status(200).json({
          status: false,
          message: `Attendance for today has already been marked`,
        });
      }

      if (absentIndex !== -1) {
        attendanceRecord.absentCount -= 1;
        attendanceRecord.absentDates.splice(absentIndex, 1);
      }

      attendanceRecord.attendCount += 1;
      attendanceRecord.attendDates.push(todayDate);
    } else if (action === "absent") {
      if (absentIndex !== -1 || dateIndex !== -1) {
        return res.status(200).json({
          status: false,
          message: `Attendance for today has already been marked`,
        });
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays =
      attendanceRecord.attendCount + attendanceRecord.absentCount;
    attendanceRecord.salonId = expert.salonId;
    savedAttendance = await attendanceRecord.save();
    expert.isAttend = true;
    expert.showDialog = true;
    await expert.save();

    res.status(200).json({
      status: true,
      message: `${
        action === "attend" ? "Attendance" : "Absent"
      } marked successfully`,
      data: savedAttendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAttendanceForExpert = async (req, res) => {
  try {
    const expertId = req.query.expertId;
    const month = req.query.month;

    if (!expertId || !month) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details provided" });
    }

    const expert = await Expert.findById(req.query.expertId);
    if (!expert) {
      return res
        .status(200)
        .json({ status: false, message: "Expert Not Found" });
    }

    const attendanceForExpert = await Attendance.find({
      expertId: expert._id,
      month: month,
    });
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
