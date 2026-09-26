const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const ServiceDemand = require("../../models/serviceDemand.model");
const { computeQuote, getSalonServiceEntry, getAfroConfig } = require("../../services/afroQuote.service");

function bad(res, message, code = 400) {
  return res.status(code).json({ status: false, message });
}

async function loadSalon(salonId) {
  if (!salonId) return null;
  return Salon.findOne({ _id: salonId, isDelete: false, isActive: true }).lean();
}

function entryAllowsDepositWithoutAfroFlow(entry) {
  if (!entry) return false;
  const pct = Number(entry.detailCard?.depositPercent);
  if (pct > 0) return true;
  const policy = entry.afroConfig?.depositPolicy;
  return Boolean(policy?.enabled && Number(policy.value) > 0);
}

/**
 * GET /api/public/demand/services?salonId=
 * Lists services with afroConfig when afroProjectFlowEnabled.
 */
exports.publicListDemandServices = async (req, res) => {
  try {
    const salon = await loadSalon(req.query.salonId);
    if (!salon) return bad(res, "Salon not found", 404);
    if (!salon.afroProjectFlowEnabled) {
      return res.status(200).json({
        status: true,
        afroProjectFlowEnabled: false,
        services: [],
        message: "Afro project flow not enabled for this salon",
      });
    }

    const serviceIds = (salon.serviceIds || []).map((s) => s.id).filter(Boolean);
    const services = await Service.find({ _id: { $in: serviceIds }, isDelete: false, status: true }).lean();
    const byId = Object.fromEntries(services.map((s) => [String(s._id), s]));

    const list = (salon.serviceIds || [])
      .map((entry) => {
        const svc = byId[String(entry.id)];
        if (!svc) return null;
        const afro = getAfroConfig(entry);
        const tier = afro?.complexityTier || "S0";
        const { resolveAddonCatalog } = require("../../services/afroQuote.service");
        const addons = resolveAddonCatalog(entry, afro);
        return {
          serviceId: entry.id,
          name: svc.name,
          image: svc.image,
          basePrice: entry.price,
          baseDuration: afro?.baseDurationMinutes || svc.duration,
          prepBufferMinutes: Math.max(0, Number(afro?.prepBufferMinutes) || 0),
          complexityTier: tier,
          requirePhoto: Boolean(afro?.requirePhoto),
          configSchema: afro?.configSchema || [],
          addonDefs: addons,
          materials: afro?.materials || entry.detailCard?.materials || null,
          prepMust: Array.isArray(entry.detailCard?.prepMust)
            ? entry.detailCard.prepMust.slice(0, 5)
            : [],
          prepAvoid: Array.isArray(entry.detailCard?.prepAvoid)
            ? entry.detailCard.prepAvoid.slice(0, 5)
            : [],
          depositPolicy: afro?.depositPolicy || { enabled: false },
          usesProjectFlow: tier !== "S0" && Boolean(afro),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      status: true,
      afroProjectFlowEnabled: true,
      services: list,
    });
  } catch (error) {
    console.error("[publicListDemandServices]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/demand/quote
 * Body: { salonId, serviceId, answers?, photoUrls? }
 * Dry-run quote — does not persist.
 */
exports.publicQuoteDemand = async (req, res) => {
  try {
    const { salonId, serviceId, answers, photoUrls } = req.body || {};
    const salon = await loadSalon(salonId);
    if (!salon) return bad(res, "Salon not found", 404);
    if (!salon.afroProjectFlowEnabled) return bad(res, "Afro project flow not enabled", 403);

    const service = await Service.findById(serviceId).lean();
    if (!service || service.isDelete) return bad(res, "Service not found", 404);

    const result = computeQuote({
      salon,
      service,
      serviceId,
      answers: answers || {},
      photoUrls: photoUrls || [],
      skipRequired: Boolean(
        req.body?.skipPrecision || answers?._skipPrecision
      ),
    });
    if (!result.ok) return bad(res, result.error);

    return res.status(200).json({
      status: true,
      needsSalonReview: result.needsSalonReview,
      quote: result.quote,
    });
  } catch (error) {
    console.error("[publicQuoteDemand]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/demand/create
 * Body: { salonId, serviceId, answers, photoUrls?, source?, channelHint?, guestName?, guestEmail?, guestPhone?, userId? }
 * Persists a quoted (or needs_salon_review) demand.
 */
exports.publicCreateDemand = async (req, res) => {
  try {
    const body = req.body || {};
    const { salonId, serviceId } = body;
    const salon = await loadSalon(salonId);
    if (!salon) return bad(res, "Salon not found", 404);

    const service = await Service.findById(serviceId).lean();
    if (!service || service.isDelete) return bad(res, "Service not found", 404);

    const entry = getSalonServiceEntry(salon, serviceId);
    if (!entry) return bad(res, "Service not offered by this salon");

    if (
      !salon.afroProjectFlowEnabled &&
      !entryAllowsDepositWithoutAfroFlow(entry)
    ) {
      return bad(res, "Afro project flow not enabled", 403);
    }

    const result = computeQuote({
      salon,
      service,
      serviceId,
      answers: body.answers || {},
      photoUrls: body.photoUrls || [],
      skipRequired: Boolean(body.skipPrecision || body.answers?._skipPrecision),
    });
    if (!result.ok) return bad(res, result.error);

    const q = result.quote;
    const status = result.needsSalonReview ? "needs_salon_review" : "quoted";

    const demand = await ServiceDemand.create({
      salonId,
      serviceId,
      userId: body.userId || null,
      guestName: body.guestName || "",
      guestEmail: body.guestEmail || "",
      guestPhone: body.guestPhone || "",
      answers: body.answers || {},
      photoUrls: body.photoUrls || [],
      complexityTier: q.complexityTier,
      estimatedPrice: q.estimatedPrice,
      estimatedDurationMinutes: q.estimatedDurationMinutes,
      priceBreakdown: q.priceBreakdown,
      durationBreakdown: q.durationBreakdown,
      depositAmount: q.depositAmount,
      depositStatus: q.depositStatus,
      balanceDue: q.balanceDue,
      status,
      configSnapshot: q.configSnapshot,
      source: body.source || "web",
      channelHint: body.channelHint || "",
    });

    // Devis emails retired — no notifySalonDemandCreated

    return res.status(201).json({
      status: true,
      demand: {
        id: demand._id,
        status: demand.status,
        estimatedPrice: demand.estimatedPrice,
        estimatedDurationMinutes: demand.estimatedDurationMinutes,
        depositAmount: demand.depositAmount,
        depositStatus: demand.depositStatus,
        balanceDue: demand.balanceDue,
        priceBreakdown: demand.priceBreakdown,
        durationBreakdown: demand.durationBreakdown,
        needsSalonReview: status === "needs_salon_review",
      },
    });
  } catch (error) {
    console.error("[publicCreateDemand]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /api/public/demand/:id
 */
exports.publicGetDemand = async (req, res) => {
  try {
    const demand = await ServiceDemand.findById(req.params.id).lean();
    if (!demand) return bad(res, "Demand not found", 404);
    return res.status(200).json({ status: true, demand });
  } catch (error) {
    console.error("[publicGetDemand]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/demand/stripe-intent
 * Body: { demandId }
 */
exports.publicDemandStripeIntent = async (req, res) => {
  try {
    const demand = await ServiceDemand.findById(req.body?.demandId);
    if (!demand) return bad(res, "Demand not found", 404);
    if (!["quoted", "awaiting_slot"].includes(demand.status)) {
      return bad(res, "Demand not payable in status " + demand.status);
    }
    if (demand.depositStatus === "paid" || demand.depositStatus === "waived") {
      return res.status(200).json({
        status: true,
        alreadyPaid: true,
        depositStatus: demand.depositStatus,
      });
    }
    if (!(demand.depositAmount > 0)) {
      return bad(res, "No deposit required");
    }

    const salon = await Salon.findById(demand.salonId);
    if (!salon) return bad(res, "Salon not found", 404);

    const {
      salonPaymentOptions,
      createBookingPaymentIntent,
    } = require("../../services/stripeConnect.service");
    if (!salonPaymentOptions(salon).acceptStripe) {
      return bad(res, "Online card payment not available for this salon");
    }

    const result = await createBookingPaymentIntent({
      salon,
      amount: demand.depositAmount,
      withoutTax: demand.depositAmount,
      metadata: {
        source: "skedisy_afro_deposit",
        demandId: String(demand._id),
        type: "deposit",
      },
    });

    demand.status = "awaiting_slot";
    await demand.save();

    return res.status(200).json({
      status: true,
      clientSecret: result.clientSecret,
      publishableKey: result.publishableKey,
      connectedAccountId: result.connectedAccountId,
      depositAmount: demand.depositAmount,
      demandId: demand._id,
    });
  } catch (error) {
    console.error("[publicDemandStripeIntent]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/demand/confirm-deposit
 * Body: { demandId, paymentIntentId }
 */
exports.publicConfirmDeposit = async (req, res) => {
  try {
    const { demandId, paymentIntentId } = req.body || {};
    const demand = await ServiceDemand.findById(demandId);
    if (!demand) return bad(res, "Demand not found", 404);

    if (demand.depositStatus === "paid") {
      return res.status(200).json({ status: true, demand });
    }

    const salon = await Salon.findById(demand.salonId);
    if (!salon?.stripeConnect?.accountId) {
      return bad(res, "Salon Stripe not configured");
    }

    const stripe = require("stripe");
    const secretKey = (global.settingJSON?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "").trim();
    const stripeClient = stripe(secretKey);
    const pi = await stripeClient.paymentIntents.retrieve(paymentIntentId, {
      stripeAccount: salon.stripeConnect.accountId,
    });

    if (pi.status !== "succeeded") {
      return bad(res, "Payment not succeeded (" + pi.status + ")");
    }
    if (String(pi.metadata?.demandId || "") !== String(demand._id)) {
      return bad(res, "PaymentIntent demand mismatch");
    }

    demand.depositStatus = "paid";
    demand.depositPaidAt = new Date();
    demand.status = "deposit_paid";
    demand.balanceDue = Math.max(0, demand.estimatedPrice - (demand.depositAmount || 0));
    await demand.save();

    return res.status(200).json({ status: true, demand });
  } catch (error) {
    console.error("[publicConfirmDeposit]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/** Expand a start slot into consecutive 15-min labels covering duration (same rules as salon-booking.js). */
function expandSlotsForDuration(startTime, durationMinutes, slotMinutes = 15) {
  const moment = require("moment");
  const start = moment(String(startTime).trim(), ["hh:mm A", "h:mm A", "HH:mm"]);
  if (!start.isValid()) return String(startTime || "");
  const interval = Math.max(1, Number(slotMinutes) || 15);
  const duration = Math.max(interval, Number(durationMinutes) || interval);
  const slots = [start.format("hh:mm A")];
  const end = start.clone().add(duration, "minutes");
  let cursor = start.clone().add(interval, "minutes");
  while (cursor.isBefore(end)) {
    slots.push(cursor.format("hh:mm A"));
    cursor.add(interval, "minutes");
  }
  return slots.join(",");
}

/**
 * POST /api/public/demand/convert
 * Body: { demandId, userId, expertId, date, time, paymentType? }
 * Creates booking from demand (deposit must be paid/waived/not_required).
 * `time` may be a single start slot — expanded to cover estimatedDurationMinutes.
 */
exports.publicConvertDemand = async (req, res) => {
  try {
    const body = req.body || {};
    const demand = await ServiceDemand.findById(body.demandId);
    if (!demand) return bad(res, "Demand not found", 404);
    if (demand.bookingId) {
      return bad(res, "Already converted");
    }
    if (demand.status === "needs_salon_review") {
      // Soft: allow convert as pending booking; salon confirms / may ask a question.
    } else if (demand.status === "cancelled" || demand.status === "converted") {
      return bad(res, "Demand not convertible");
    }

    if (
      demand.depositAmount > 0 &&
      demand.depositStatus === "unpaid"
    ) {
      return bad(res, "Deposit required before booking");
    }

    const tax = parseFloat(global.settingJSON?.tax) || 0;
    const withoutTax = Number(demand.estimatedPrice);
    const amount = withoutTax + (withoutTax * tax) / 100;

    let timeStr = String(body.time || "").trim();
    if (timeStr && !timeStr.includes(",")) {
      const salon = await Salon.findById(demand.salonId).select("salonTime").lean();
      const dayName = require("moment")(body.date, "YYYY-MM-DD").format("dddd");
      const dayCfg = (salon?.salonTime || []).find((t) => t.day === dayName);
      const slotMin = parseInt(dayCfg?.time, 10) || 15;
      timeStr = expandSlotsForDuration(
        timeStr,
        demand.estimatedDurationMinutes,
        slotMin
      );
    }

    const bookingController = require("./booking.cotroller");
    const secretKey = process.env.secretKey;
    const fakeReq = {
      headers: { key: secretKey },
      body: {
        key: secretKey,
        demandId: String(demand._id),
        salonId: String(demand.salonId),
        serviceId: String(demand.serviceId),
        userId: String(body.userId),
        expertId: String(body.expertId),
        date: body.date,
        time: timeStr,
        atPlace: 1,
        withoutTax,
        amount,
        paymentType: body.paymentType || "cashAfterService",
        channel:
          body.channel ||
          demand.channelHint ||
          demand.source ||
          "web",
      },
    };

    const result = await new Promise((resolve, reject) => {
      const mockRes = {
        statusCode: 200,
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
      Promise.resolve(bookingController.newBooking(fakeReq, mockRes)).catch(reject);
    });

    return res.status(result.statusCode || 200).json(result.payload);
  } catch (error) {
    console.error("[publicConvertDemand]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/demand/upload-photo
 * multipart field "photo" — inspiration image for booking config.
 */
exports.publicUploadDemandPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return bad(res, "Aucune photo reçue");
    }
    const mime = String(req.file.mimetype || "");
    if (!mime.startsWith("image/")) {
      try {
        require("fs").unlinkSync(req.file.path);
      } catch (e) {
        /* ignore */
      }
      return bad(res, "Fichier image requis (jpg, png, webp…)");
    }
    const base = (process.env.baseURL || "").replace(/\/?$/, "/");
    const rel = String(req.file.path || `storage/${req.file.filename}`).replace(/\\/g, "/");
    const url = `${base}${rel}`;
    return res.status(200).json({
      status: true,
      url,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("[publicUploadDemandPhoto]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
