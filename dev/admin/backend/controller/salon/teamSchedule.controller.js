const Expert = require("../../models/expert.model");
const BusyExpert = require("../../models/busyExpert.model");
const moment = require("moment");
const { getTeamScheduleForSalon, getTeamScheduleRange, normalizeTimeString } = require("../../services/teamSchedule.service");
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

exports.setExpertBusy = async (req, res) => {
  try {
    const salon = req.salon;
    const { expertId, date, time } = req.body;

    if (!expertId || !date || !time) {
      return res.status(200).send({ status: false, message: "expertId, date et time sont requis" });
    }

    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(200).send({ status: false, message: "Date invalide" });
    }

    const expert = await Expert.findOne({
      _id: expertId,
      salonId: salon._id,
      isDelete: false,
    });

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert introuvable pour ce salon" });
    }

    const timeArray = String(time)
      .split(",")
      .map((slot) => normalizeTimeString(slot))
      .filter(Boolean);

    if (!timeArray.length) {
      return res.status(200).send({ status: false, message: "Créneau horaire invalide" });
    }

    let busyRecord = await BusyExpert.findOne({ expertId, date });
    if (busyRecord) {
      const merged = new Set([...(busyRecord.time || []), ...timeArray]);
      busyRecord.time = Array.from(merged);
      await busyRecord.save();
    } else {
      busyRecord = await BusyExpert.create({ expertId, date, time: timeArray });
    }

    return res.status(200).send({
      status: true,
      message: "Créneau bloqué",
      data: busyRecord,
    });
  } catch (error) {
    console.error("[teamSchedule.salon.busy]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const clients = await searchPlanningClients(req.query.search);
    return res.status(200).send({ status: true, message: "success", data: clients });
  } catch (error) {
    console.error("[teamSchedule.salon.clients]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.createPlanningBooking = async (req, res) => {
  try {
    const booking = await createPlanningBooking(req.salon, req.body);
    return res.status(200).send({ status: true, message: "Réservation créée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.salon.booking]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur création RDV" });
  }
};

exports.reschedulePlanningBooking = async (req, res) => {
  try {
    const booking = await reschedulePlanningBooking(req.salon, req.body);
    return res.status(200).send({ status: true, message: "Réservation déplacée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.salon.reschedule]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur déplacement RDV" });
  }
};

exports.resizePlanningBooking = async (req, res) => {
  try {
    const booking = await resizePlanningBooking(req.salon, req.body);
    return res.status(200).send({ status: true, message: "Durée mise à jour", data: booking });
  } catch (error) {
    console.error("[teamSchedule.salon.resize]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur redimensionnement RDV" });
  }
};

exports.getPlanningBookingDetail = async (req, res) => {
  try {
    const bookingId = req.query.bookingId;
    if (!bookingId) {
      return res.status(200).send({ status: false, message: "bookingId requis" });
    }
    const data = await getPlanningBookingDetail(req.salon, bookingId);
    return res.status(200).send({ status: true, message: "success", data });
  } catch (error) {
    console.error("[teamSchedule.salon.detail]", error);
    return res.status(200).send({ status: false, message: error.message || "Réservation introuvable" });
  }
};

exports.cancelPlanningBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const booking = await cancelPlanningBooking(req.salon, bookingId, reason, "salon");
    return res.status(200).send({ status: true, message: "Réservation annulée", data: booking });
  } catch (error) {
    console.error("[teamSchedule.salon.cancel]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur annulation RDV" });
  }
};

exports.updatePlanningBookingServices = async (req, res) => {
  try {
    const booking = await updatePlanningBookingServices(req.salon, req.body);
    return res.status(200).send({ status: true, message: "Services mis à jour", data: booking });
  } catch (error) {
    console.error("[teamSchedule.salon.updateServices]", error);
    return res.status(200).send({ status: false, message: error.message || "Erreur mise à jour services" });
  }
};

exports.removeExpertBusy = async (req, res) => {
  try {
    const salon = req.salon;
    const { expertId, date, time } = req.body;

    if (!expertId || !date) {
      return res.status(200).send({ status: false, message: "expertId et date sont requis" });
    }

    const expert = await Expert.findOne({
      _id: expertId,
      salonId: salon._id,
      isDelete: false,
    });

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert introuvable pour ce salon" });
    }

    const busyRecord = await BusyExpert.findOne({ expertId, date });
    if (!busyRecord) {
      return res.status(200).send({ status: true, message: "Aucun créneau bloqué" });
    }

    if (!time) {
      await BusyExpert.deleteOne({ _id: busyRecord._id });
      return res.status(200).send({ status: true, message: "Indisponibilités supprimées" });
    }

    const slotsToRemove = String(time)
      .split(",")
      .map((slot) => normalizeTimeString(slot))
      .filter(Boolean);

    busyRecord.time = (busyRecord.time || []).filter((slot) => !slotsToRemove.includes(normalizeTimeString(slot)));
    if (!busyRecord.time.length) {
      await BusyExpert.deleteOne({ _id: busyRecord._id });
    } else {
      await busyRecord.save();
    }

    return res.status(200).send({ status: true, message: "Créneau débloqué" });
  } catch (error) {
    console.error("[teamSchedule.salon.unbusy]", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};
