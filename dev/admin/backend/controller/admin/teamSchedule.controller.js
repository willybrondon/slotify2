const Salon = require("../../models/salon.model");
const moment = require("moment");
const { getTeamScheduleForSalon, getTeamScheduleRange } = require("../../services/teamSchedule.service");
const {
  createPlanningBooking,
  reschedulePlanningBooking,
  resizePlanningBooking,
  getPlanningBookingDetail,
  cancelPlanningBooking,
  updatePlanningBookingServices,
  searchPlanningClients,
} = require("../../services/teamScheduleBooking.service");

exports.getTeamSchedule = async (req, res) => {
  try {
    const salonId = req.query.salonId;
    if (!salonId) {
      return res.status(200).send({ status: false, message: "salonId is required" });
    }

    const salon = await Salon.findById(salonId);
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
    console.error("[teamSchedule.admin]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const clients = await searchPlanningClients(req.query.search);
    return res.status(200).send({ status: true, message: "success", data: clients });
  } catch (error) {
    console.error("[teamSchedule.admin.clients]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.createPlanningBooking = async (req, res) => {
  try {
    const salonId = req.body.salonId || req.query.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const booking = await createPlanningBooking(salon, req.body);
    return res.status(200).send({ status: true, message: "Réservation créée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.admin.booking]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur création RDV" });
  }
};

exports.reschedulePlanningBooking = async (req, res) => {
  try {
    const salonId = req.body.salonId || req.query.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const booking = await reschedulePlanningBooking(salon, req.body);
    return res.status(200).send({ status: true, message: "Réservation déplacée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.admin.reschedule]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur déplacement RDV" });
  }
};

exports.resizePlanningBooking = async (req, res) => {
  try {
    const salonId = req.body.salonId || req.query.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const booking = await resizePlanningBooking(salon, req.body);
    return res.status(200).send({ status: true, message: "Durée mise à jour", data: booking });
  } catch (error) {
    console.error("[teamSchedule.admin.resize]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur redimensionnement RDV" });
  }
};

exports.getPlanningBookingDetail = async (req, res) => {
  try {
    const salonId = req.query.salonId;
    const bookingId = req.query.bookingId;
    if (!salonId || !bookingId) {
      return res.status(200).send({ status: false, message: "salonId et bookingId requis" });
    }
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const data = await getPlanningBookingDetail(salon, bookingId);
    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.error("[teamSchedule.admin.detail]", error);
    return res.status(200).send({ status: false, message: error.message || "Réservation introuvable" });
  }
};

exports.cancelPlanningBooking = async (req, res) => {
  try {
    const salonId = req.body.salonId || req.query.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const { bookingId, reason } = req.body;
    const booking = await cancelPlanningBooking(salon, bookingId, reason, "admin");
    return res.status(200).send({ status: true, message: "Réservation annulée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.admin.cancel]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur annulation RDV" });
  }
};

exports.updatePlanningBookingServices = async (req, res) => {
  try {
    const salonId = req.body.salonId || req.query.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }
    const booking = await updatePlanningBookingServices(salon, req.body);
    return res.status(200).send({ status: true, message: "Services mis à jour", data: booking });
  } catch (error) {
    console.error("[teamSchedule.admin.updateServices]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur mise à jour services" });
  }
};
