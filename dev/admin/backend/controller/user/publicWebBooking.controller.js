const crypto = require("crypto");
const mongoose = require("mongoose");
const moment = require("moment");
const sgMail = require("@sendgrid/mail");
const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Service = require("../../models/service.model");
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const guestBookingController = require("./guestBooking.controller");
const bookingController = require("./booking.cotroller");
const expertForUserController = require("./expertForUser.controller");

const CANCEL_HOURS_BEFORE = 24;

function runController(handler, req, res) {
  return new Promise((resolve, reject) => {
    const mockRes = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
      send(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
    };
    Promise.resolve(handler(req, mockRes)).catch(reject);
  });
}

function attachSecret(req) {
  req.headers = req.headers || {};
  req.headers.key = process.env.secretKey;
  req.body = req.body || {};
  req.body.key = process.env.secretKey;
}

exports.publicCheckSlots = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(
      bookingController.getBookingBasedDate,
      req,
      res
    );
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicCheckSlots]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicExpertsForService = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(
      expertForUserController.getExpertServiceWise,
      req,
      res
    );
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicExpertsForService]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicGuestSendOtp = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(guestBookingController.sendOtp, req, res);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicGuestSendOtp]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicGuestVerifyOtp = async (req, res) => {
  try {
    attachSecret(req);
    const result = await runController(guestBookingController.verifyOtp, req, res);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicGuestVerifyOtp]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

function makeCancelToken(bookingId) {
  return crypto
    .createHmac("sha256", process.env.secretKey || "skedisy")
    .update(String(bookingId))
    .digest("hex");
}

async function sendCustomerBookingEmail(booking, user, salon, expert) {
  if (!process.env.SENDGRID_API_KEY || !user?.email) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const token = makeCancelToken(booking._id);
  const cancelUrl = `${baseURL}/api/public/booking/cancel?bookingId=${booking._id}&token=${token}`;
  const serviceNames = booking.serviceId?.length
    ? "(voir détail sur Skedisy)"
    : "";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#111;max-width:560px">
  <h2 style="margin:0 0 12px">Réservation confirmée — Skedisy</h2>
  <p>Bonjour ${user.fname || ""},</p>
  <p>Votre réservation chez <strong>${salon.name}</strong> est enregistrée.</p>
  <ul>
    <li><strong>Date :</strong> ${booking.date}</li>
    <li><strong>Heure :</strong> ${booking.startTime || (booking.time && booking.time[0]) || ""}</li>
    <li><strong>Experte :</strong> ${expert.fname || ""} ${expert.lname || ""}</li>
    <li><strong>Montant :</strong> ${booking.amount} ${global.settingJSON?.currencySymbol || "€"}</li>
  </ul>
  <p style="color:#444;font-size:14px">Paiement au salon (réservation web). Rappel : vous pouvez annuler au plus tard <strong>${CANCEL_HOURS_BEFORE} h</strong> avant le rendez-vous.</p>
  <p><a href="${cancelUrl}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Annuler ma réservation</a></p>
  <p style="font-size:12px;color:#888">Beauté afro · Île-de-France — Skedisy</p>
</body></html>`;
  await sgMail.send({
    to: user.email,
    from: process.env.EMAIL,
    subject: `Skedisy — Réservation ${booking.bookingId || ""}`,
    html,
  });
}

exports.publicCreateBooking = async (req, res) => {
  try {
    attachSecret(req);
    if (!req.body.paymentType) {
      req.body.paymentType = "cashAfterService";
    }
    if (!req.body.atPlace) {
      req.body.atPlace = 1;
    }

    const result = await runController(bookingController.newBooking, req, res);
    const payload = result.payload;

    if (payload?.status && payload?.data?._id) {
      try {
        const [booking, user, salon, expert] = await Promise.all([
          Booking.findById(payload.data._id).populate("serviceId", "name"),
          User.findById(payload.data.userId),
          Salon.findById(payload.data.salonId),
          Expert.findById(payload.data.expertId),
        ]);
        if (booking && user && salon && expert) {
          await sendCustomerBookingEmail(booking, user, salon, expert);
        }
      } catch (mailErr) {
        console.error("[publicCreateBooking] email:", mailErr.message);
      }
    }

    return res.status(result.statusCode || 200).json(payload);
  } catch (error) {
    console.error("[publicCreateBooking]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicCancelBooking = async (req, res) => {
  try {
    const { bookingId, token } = req.query;
    if (!bookingId || !token) {
      return res.status(400).send("<p>Lien invalide.</p>");
    }
    if (token !== makeCancelToken(bookingId)) {
      return res.status(403).send("<p>Lien d'annulation invalide ou expiré.</p>");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).send("<p>Réservation introuvable.</p>");
    }
    if (booking.status === "cancel") {
      return res.status(200).send("<p>Cette réservation est déjà annulée.</p>");
    }

    const appt = moment(`${booking.date} ${booking.startTime || "00:00"}`, "YYYY-MM-DD hh:mm A");
    const hoursUntil = appt.diff(moment(), "hours", true);
    if (hoursUntil < CANCEL_HOURS_BEFORE) {
      return res.status(400).send(
        `<p>Annulation impossible moins de ${CANCEL_HOURS_BEFORE} h avant le rendez-vous. Contactez le salon.</p>`
      );
    }

    attachSecret(req);
    req.body = {
      bookingId,
      reason: "Annulation via email (web)",
      person: "user",
      title: "Réservation annulée",
      message: "Le client a annulé depuis le lien email.",
      key: process.env.secretKey,
    };

    const result = await runController(bookingController.cancelBookingByUser, req, res);
    const ok = result.payload?.status;
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    return res
      .status(ok ? 200 : 400)
      .send(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px"><h1>${
          ok ? "Réservation annulée" : "Erreur"
        }</h1><p>${result.payload?.message || ""}</p><p><a href="${baseURL}">Retour à Skedisy</a></p></body></html>`
      );
  } catch (error) {
    console.error("[publicCancelBooking]", error);
    return res.status(500).send("<p>Erreur serveur.</p>");
  }
};
