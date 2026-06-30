const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const moment = require("moment");
const mongoose = require("mongoose");
const { getTeamScheduleForSalon, buildExpertDaySchedule } = require("../../services/teamSchedule.service");
const Booking = require("../../models/booking.model");
const BusyExpert = require("../../models/busyExpert.model");
const Holiday = require("../../models/salonClose.model");

/** Expert / customer: day schedule for one expert */
exports.getExpertDaySchedule = async (req, res) => {
  try {
    const { date, salonId, expertId } = req.query;
    if (!date || !salonId || !expertId) {
      return res.status(200).send({ status: false, message: "date, salonId and expertId are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(salonId) || !mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(200).send({ status: false, message: "Invalid id format" });
    }

    const [salon, expert] = await Promise.all([
      Salon.findById(salonId),
      Expert.findOne({ _id: expertId, salonId, isDelete: false }),
    ]);

    if (!salon || !expert) {
      return res.status(200).send({ status: false, message: "Salon or expert not found" });
    }

    const dayOfWeek = moment(date, "YYYY-MM-DD").format("dddd");
    const salonTime = salon.salonTime?.find((t) => t.day === dayOfWeek) || null;
    const holiday = await Holiday.findOne({ date, salonId: salon._id });

    const bookings = await Booking.find({
      expertId: expert._id,
      date,
      status: { $in: ["pending", "confirm", "completed"] },
    })
      .populate("userId", "fname lname image")
      .lean();

    const busyRecord = await BusyExpert.findOne({ expertId: expert._id, date }).lean();

    const data = await buildExpertDaySchedule(expert, salon, date, {
      holiday,
      salonTime,
      bookings,
      busyRecord,
    });

    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.error("[teamSchedule.expertDay]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

/** Public team view for salon (read-only, by salonId) */
exports.getSalonTeamSchedule = async (req, res) => {
  try {
    const { date, salonId } = req.query;
    if (!date || !salonId) {
      return res.status(200).send({ status: false, message: "date and salonId are required" });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    const data = await getTeamScheduleForSalon(salon, date);
    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.error("[teamSchedule.salonTeam]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};
