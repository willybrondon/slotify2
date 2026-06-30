const Salon = require("../../models/salon.model");
const moment = require("moment");
const { getTeamScheduleForSalon, getTeamScheduleRange } = require("../../services/teamSchedule.service");

exports.getTeamSchedule = async (req, res) => {
  try {
    const salon = req.salon;
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    const date = req.query.date || moment().format("YYYY-MM-DD");
    const view = req.query.view || "day";

    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(200).send({ status: false, message: "Invalid date format" });
    }

    if (view === "week") {
      const start = moment(date).startOf("week").format("YYYY-MM-DD");
      const end = moment(date).endOf("week").format("YYYY-MM-DD");
      const data = await getTeamScheduleRange(salon, start, end);
      return res.status(200).send({ status: true, message: "success", data });
    }

    const data = await getTeamScheduleForSalon(salon, date);
    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.error("[teamSchedule.salon]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};
