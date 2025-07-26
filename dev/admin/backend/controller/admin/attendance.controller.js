const Attendance = require("../../models/attendance.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const Booking = require("../../models/booking.model");
const moment = require("moment");

exports.getAllAttendance = async (req, res) => {
  try {
    const { expertId, action } = req.query;
    const todayDate = moment().format("YYYY-MM-DD");

    if (!expertId || !action) {
      return res.status(200).json({ status: false, message: "Invalid details provided" });
    }

    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(200).json({ status: false, message: "Expert Not Found" });
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

      expert.isAttend = true;
      expert.showDialog = true;
      await expert.save();
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

      //Cancel all bookings for today if expert is absent
      try {
        await Booking.updateMany(
          {
            expertId,
            date: todayDate,
            status: { $in: ["pending", "confirm"] }, //Only cancel pending and confirmed bookings
          },
          {
            $set: {
              status: "cancel",
              cancelTime: moment().format("HH:mm a"),
              reason: {
                reason: "Expert is absent",
                person: "expert",
              },
            },
          }
        );
      } catch (cancelError) {
        console.error("Error canceling bookings:", cancelError);
      }

      expert.isAttend = false;
      expert.showDialog = true;
      await expert.save();
    }

    attendanceRecord.totalDays = attendanceRecord.attendCount + attendanceRecord.absentCount;

    savedAttendance = await attendanceRecord.save();

    res.status(200).json({
      status: true,
      message: `${action === "attend" ? "Attendance" : "Absent"} marked successfully`,
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

exports.attendance = async (req, res) => {
  try {
    if (!req.query.month || !req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid details" });
    }
    let matchQuery;
    if (req.query.salonId !== "ALL") {
      const salon = await Salon.findById(req.query.salonId);
      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon not Found" });
      }
      matchQuery = {
        salonId: salon._id,
      };
    }

    const attendances = await Attendance.aggregate([
      {
        $match: {
          month: req.query.month,
          ...matchQuery,
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $match: {
          "expert.isDelete": false,
        },
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
        $match: {
          ...matchQuery,
        },
      },
      {
        $project: {
          _id: 1,
          month: 1,
          attendCount: 1,
          absentCount: 1,
          totalDays: 1,
          attendDates: 1,
          absentDates: 1,
          expert: {
            name: { $concat: ["$expert.fname", " ", "$expert.lname"] },
            _id: "$expert._id",
            image: "$expert.image",
          },
          salon: "$salon.name",
        },
      },
    ]);

    return res.status(200).json({ status: true, data: attendances });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
