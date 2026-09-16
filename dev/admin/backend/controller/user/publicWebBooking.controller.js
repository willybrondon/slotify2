const crypto = require("crypto");
const mongoose = require("mongoose");
const moment = require("moment");
const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Service = require("../../models/service.model");
const Booking = require("../../models/booking.model");
const User = require("../../models/user.model");
const stripe = require("stripe");
const Coupon = require("../../models/coupon.model");
const guestBookingController = require("./guestBooking.controller");
const bookingController = require("./booking.cotroller");
const expertForUserController = require("./expertForUser.controller");
const couponController = require("./coupon.controller");

const BOOKING_COUPON_TYPE = 2;
const {
  evaluateBookingActions,
  applyClientReschedule,
} = require("../../services/bookingLifecycle.service");

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

exports.publicPaymentSettings = async (req, res) => {
  try {
    const settings = getPaymentSettings();
    let walletBalance = null;
    const userId = (req.query.userId || "").trim();
    if (userId && settings.isWalletPay && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).select("amount");
      if (user) walletBalance = Number(user.amount) || 0;
    }
    return res.status(200).json({ status: true, settings, walletBalance });
  } catch (error) {
    console.error("[publicPaymentSettings]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicListCoupons = async (req, res) => {
  try {
    attachSecret(req);
    req.query = req.query || {};
    if (!req.query.type) req.query.type = String(BOOKING_COUPON_TYPE);
    const result = await runController(couponController.retriveCoupons, req, res);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicListCoupons]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicValidateCoupon = async (req, res) => {
  try {
    const userId = req.body?.userId;
    const amount = parseFloat(req.body?.amount);
    const code = (req.body?.code || req.body?.couponCode || "").trim();
    const couponDbId = (req.body?.couponId || req.body?.couponDbId || "").trim();

    if (!userId || Number.isNaN(amount) || amount <= 0) {
      return res.status(200).json({
        status: false,
        message: "userId and amount are required.",
      });
    }
    if (!code && !couponDbId) {
      return res.status(200).json({ status: false, message: "Coupon code is required." });
    }

    const customerObjId = new mongoose.Types.ObjectId(userId);
    const todayDate = moment().format("YYYY-MM-DD");
    const amountInt = Math.floor(amount);

    let coupon = null;
    if (couponDbId && mongoose.Types.ObjectId.isValid(couponDbId)) {
      coupon = await Coupon.findOne({
        _id: couponDbId,
        type: BOOKING_COUPON_TYPE,
        isActive: true,
        minAmountToApply: { $lte: amountInt },
        expiryDate: { $gte: todayDate },
      });
    } else if (code) {
      coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        type: BOOKING_COUPON_TYPE,
        isActive: true,
        minAmountToApply: { $lte: amountInt },
        expiryDate: { $gte: todayDate },
      });
    }

    if (!coupon) {
      return res.status(200).json({
        status: false,
        message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
      });
    }

    const requestSalonId = (req.body?.salonId || "").trim();
    if (coupon.salonId) {
      if (!requestSalonId || String(coupon.salonId) !== String(requestSalonId)) {
        return res.status(200).json({
          status: false,
          message: "This promo is only valid at the salon that created it.",
        });
      }
    }

    const alreadyUsed =
      coupon.usedBy &&
      coupon.usedBy.some(
        (entry) =>
          entry.userId.toString() === customerObjId.toString() &&
          entry.usageType === BOOKING_COUPON_TYPE
      );

    if (alreadyUsed) {
      return res.status(200).json({
        status: false,
        message: "Coupon has already been used by this customer for the specified type.",
      });
    }

    const discountAmount = computeCouponDiscount(coupon, amount);

    return res.status(200).json({
      status: true,
      message: "Coupon validation successful.",
      data: discountAmount,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (error) {
    console.error("[publicValidateCoupon]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicCreateStripePaymentIntent = async (req, res) => {
  try {
    const amount = parseFloat(req.body?.amount);
    const withoutTax = parseFloat(req.body?.withoutTax);
    const salonId = req.body?.salonId;
    const email = (req.body?.email || "").trim();

    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(200).json({ status: false, message: "Invalid payment amount." });
    }

    const settings = getPaymentSettings();
    if (!settings.isStripePay || !settings.stripePublishableKey) {
      return res.status(200).json({ status: false, message: "Stripe is not available." });
    }

    if (salonId) {
      const Salon = require("../../models/salon.model");
      const { salonPaymentOptions, createBookingPaymentIntent } = require("../../services/stripeConnect.service");
      const salon = await Salon.findById(salonId);
      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon not found." });
      }
      if (!salonPaymentOptions(salon).acceptStripe) {
        return res.status(200).json({ status: false, message: "Online card payment not available for this salon." });
      }
      const result = await createBookingPaymentIntent({
        salon,
        amount,
        withoutTax: Number.isNaN(withoutTax) ? amount : withoutTax,
        metadata: { userId: String(req.body?.userId || ""), source: "skedisy_web_booking" },
      });
      return res.status(200).json({
        status: true,
        clientSecret: result.clientSecret,
        publishableKey: result.publishableKey,
        connectedAccountId: result.connectedAccountId,
        salonName: result.salonName,
      });
    }

    // Web booking without salonId: card payments require the salon's Connect account
    return res.status(200).json({
      status: false,
      message: "Salon requis pour le paiement carte (Stripe Connect).",
    });
  } catch (error) {
    console.error("[publicCreateStripePaymentIntent]", error);
    return res.status(500).json({ status: false, message: error.message || "Stripe error" });
  }
};

function makeCancelToken(bookingId) {
  return crypto
    .createHmac("sha256", process.env.secretKey || "skedisy")
    .update(String(bookingId))
    .digest("hex");
}

function getPaymentSettings() {
  const s = global.settingJSON || {};
  return {
    isStripePay: !!s.isStripePay,
    isWalletPay: !!s.isWalletPay,
    cashAfterService: s.cashAfterService !== false,
    stripePublishableKey: (s.stripePublishableKey || "").trim(),
    currencyName: (s.currencyName || "eur").toLowerCase(),
    currencySymbol: s.currencySymbol || "€",
    tax: s.tax || 0,
  };
}

function computeCouponDiscount(coupon, withoutTax) {
  if (!coupon) return 0;
  if (coupon.discountType === 1) return coupon.maxDiscount || 0;
  if (coupon.discountType === 2) {
    const base = Math.floor(parseFloat(withoutTax));
    const discount = (base * (coupon.discountPercent || 0)) / 100;
    const formatted = parseFloat(discount.toFixed(2));
    return formatted > coupon.maxDiscount ? coupon.maxDiscount : formatted;
  }
  return 0;
}

exports.publicCreateBooking = async (req, res) => {
  try {
    attachSecret(req);
    if (!req.body.paymentType) {
      req.body.paymentType = "cashAfterService";
    }
    if (req.body.atPlace === undefined || req.body.atPlace === null || req.body.atPlace === "") {
      req.body.atPlace = 1;
    }
    if (req.body.amount !== undefined && req.body.amount !== null) {
      req.body.amount = parseFloat(req.body.amount);
    }
    if (req.body.withoutTax !== undefined && req.body.withoutTax !== null) {
      req.body.withoutTax = parseFloat(req.body.withoutTax);
    }

    const result = await runController(bookingController.newBooking, req, res);
    const payload = result.payload;

    if (payload?.status && payload?.data?._id) {
      // Confirmation email (+ bouton Annuler) is already sent by newBooking
      // via sendCustomerBookingConfirmationEmail — no second email here.
      try {
        const [booking, salon] = await Promise.all([
          Booking.findById(payload.data._id),
          Salon.findById(payload.data.salonId),
        ]);
        if (booking && salon) {
          payload.manageToken = makeCancelToken(booking._id);
          payload.evaluation = evaluateBookingActions(booking, salon);
        }
      } catch (enrichErr) {
        console.error("[publicCreateBooking] enrich:", enrichErr.message);
      }
    }

    return res.status(result.statusCode || 200).json(payload);
  } catch (error) {
    console.error("[publicCreateBooking]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

function assertManageToken(bookingId, token) {
  return Boolean(bookingId && token && token === makeCancelToken(bookingId));
}

/** GET — preview free / late cancel + reschedule rights */
exports.publicBookingLifecycle = async (req, res) => {
  try {
    const { bookingId, token } = req.query;
    if (!assertManageToken(bookingId, token)) {
      return res.status(403).json({ status: false, message: "Lien invalide" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ status: false, message: "Réservation introuvable" });
    }
    const salon = await Salon.findById(booking.salonId);
    const evaluation = evaluateBookingActions(booking, salon);
    return res.status(200).json({
      status: true,
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        date: booking.date,
        startTime: booking.startTime,
        status: booking.status,
        expertId: booking.expertId,
        salonId: booking.salonId,
        depositAmount: booking.depositAmount,
        amount: booking.amount,
      },
      evaluation,
    });
  } catch (error) {
    console.error("[publicBookingLifecycle]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/** POST JSON cancel (modal / account) — same policy as email link */
exports.publicCancelBookingJson = async (req, res) => {
  try {
    const bookingId = req.body?.bookingId || req.query?.bookingId;
    const token = req.body?.token || req.query?.token;
    if (!assertManageToken(bookingId, token)) {
      return res.status(403).json({ status: false, message: "Lien invalide" });
    }

    attachSecret(req);
    req.body = {
      bookingId,
      reason: req.body?.reason || "Annulation client (web)",
      person: "user",
      title: "Réservation annulée",
      message: "Le client a annulé depuis Skedisy web.",
      key: process.env.secretKey,
    };

    const result = await runController(bookingController.cancelBookingByUser, req, res);
    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicCancelBookingJson]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/** POST — reschedule only in free window */
exports.publicRescheduleBooking = async (req, res) => {
  try {
    const { bookingId, token, date, startTime, expertId } = req.body || {};
    if (!assertManageToken(bookingId, token)) {
      return res.status(403).json({ status: false, message: "Lien invalide" });
    }
    if (!date || !startTime) {
      return res.status(400).json({ status: false, message: "date et startTime requis" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ status: false, message: "Réservation introuvable" });
    }
    const salon = await Salon.findById(booking.salonId);
    const applied = await applyClientReschedule(booking, salon, {
      date,
      startTime,
      expertId: expertId || booking.expertId,
    });
    if (!applied.ok) {
      return res.status(200).json({
        status: false,
        message: applied.message,
        evaluation: applied.evaluation,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Créneau mis à jour",
      booking: applied.booking,
      evaluation: applied.evaluation,
    });
  } catch (error) {
    console.error("[publicRescheduleBooking]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publicCancelBooking = async (req, res) => {
  try {
    const { bookingId, token } = req.query;
    if (!assertManageToken(bookingId, token)) {
      return res.status(403).send("<p>Lien d'annulation invalide ou expiré.</p>");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).send("<p>Réservation introuvable.</p>");
    }
    if (booking.status === "cancel") {
      return res.status(200).send("<p>Cette réservation est déjà annulée.</p>");
    }

    const salon = await Salon.findById(booking.salonId);
    const preview = evaluateBookingActions(booking, salon);
    if (!preview.canCancel) {
      return res.status(400).send(`<p>${preview.message}</p>`);
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
    const extra =
      ok && result.payload?.evaluation?.mode === "late"
        ? `<p>Acompte retenu : ${result.payload.evaluation.retainedAmount} (${result.payload.evaluation.retainPercent} %).</p>`
        : "";
    return res
      .status(ok ? 200 : 400)
      .send(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px"><h1>${
          ok ? "Réservation annulée" : "Erreur"
        }</h1><p>${result.payload?.message || ""}</p>${extra}<p><a href="${baseURL}">Retour à Skedisy</a></p></body></html>`
      );
  } catch (error) {
    console.error("[publicCancelBooking]", error);
    return res.status(500).send("<p>Erreur serveur.</p>");
  }
};
