const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const ServiceDemand = require("../../models/serviceDemand.model");
const { KNOTLESS_S2_DEMO_CONFIG, getAfroConfig } = require("../../services/afroQuote.service");

/**
 * GET /salon/demand/getAll?status=
 */
exports.getAll = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const filter = { salonId };
    if (req.query.status) filter.status = req.query.status;

    const demands = await ServiceDemand.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100)
      .populate("serviceId", "name image duration")
      .populate("userId", "fname lname email mobile")
      .lean();

    return res.status(200).json({ status: true, demands });
  } catch (error) {
    console.error("[salonDemand.getAll]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /salon/demand/afro-config
 * Returns flow flag + per-service afroConfig summary for panel UI.
 */
exports.getAfroConfigStatus = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id).lean();
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }

    const ids = (salon.serviceIds || []).map((s) => s.id).filter(Boolean);
    const services = await Service.find({ _id: { $in: ids }, isDelete: false })
      .select("name image duration")
      .lean();
    const byId = Object.fromEntries(services.map((s) => [String(s._id), s]));

    const list = (salon.serviceIds || [])
      .map((entry) => {
        const svc = byId[String(entry.id)];
        if (!svc) return null;
        const afro = getAfroConfig(entry);
        return {
          serviceId: entry.id,
          name: svc.name,
          image: svc.image,
          price: entry.price,
          duration: svc.duration,
          afroConfig: afro || null,
          complexityTier: afro?.complexityTier || "S0",
          usesProjectFlow: Boolean(afro && afro.complexityTier && afro.complexityTier !== "S0"),
          depositPolicy: afro?.depositPolicy || null,
          schemaFieldCount: Array.isArray(afro?.configSchema) ? afro.configSchema.length : 0,
        };
      })
      .filter(Boolean);

    const slugBase = (salon.name || "salon")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const salonShortId = String(salon._id).substring(0, 6);
    const slug = `${slugBase}-${salonShortId}`;

    return res.status(200).json({
      status: true,
      afroProjectFlowEnabled: Boolean(salon.afroProjectFlowEnabled),
      services: list,
      publicDemandPath: `/salon/${slug}?flow=devis`,
      salonId: salon._id,
      salonName: salon.name,
      stripeConnect: {
        accountId: salon.stripeConnect?.accountId || "",
        chargesEnabled: Boolean(salon.stripeConnect?.chargesEnabled),
        payoutsEnabled: Boolean(salon.stripeConnect?.payoutsEnabled),
      },
      onboarding: {
        flowEnabled: Boolean(salon.afroProjectFlowEnabled),
        hasProjectService: list.some((s) => s.usesProjectFlow),
        stripeReady: Boolean(salon.stripeConnect?.chargesEnabled),
      },
    });
  } catch (error) {
    console.error("[salonDemand.getAfroConfigStatus]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * PUT /salon/demand/adjust/:id
 * Body: { estimatedPrice?, estimatedDurationMinutes?, depositAmount?, status?, reviewNote?, waiveDeposit? }
 */
exports.adjust = async (req, res) => {
  try {
    const demand = await ServiceDemand.findOne({
      _id: req.params.id,
      salonId: req.salon._id,
    });
    if (!demand) {
      return res.status(404).json({ status: false, message: "Demand not found" });
    }
    if (demand.status === "converted" || demand.bookingId) {
      return res.status(400).json({ status: false, message: "Cannot adjust converted demand" });
    }

    const body = req.body || {};
    if (body.estimatedPrice != null) demand.estimatedPrice = Number(body.estimatedPrice);
    if (body.estimatedDurationMinutes != null) {
      demand.estimatedDurationMinutes = Number(body.estimatedDurationMinutes);
    }
    if (body.depositAmount != null) {
      demand.depositAmount = Number(body.depositAmount);
      if (demand.depositAmount > 0 && demand.depositStatus === "not_required") {
        demand.depositStatus = "unpaid";
      }
      if (demand.depositAmount === 0 && demand.depositStatus !== "paid") {
        demand.depositStatus = "not_required";
      }
    }
    if (body.reviewNote != null) demand.reviewNote = String(body.reviewNote);
    if (body.salonQuestion != null) {
      const q = String(body.salonQuestion).trim();
      demand.salonQuestion = q;
      demand.salonQuestionAt = q ? new Date() : null;
      if (q && demand.status === "quoted") {
        demand.status = "needs_salon_review";
      }
    }
    if (body.clientReply != null) {
      demand.clientReply = String(body.clientReply).trim();
      demand.clientReplyAt = demand.clientReply ? new Date() : null;
    }

    demand.balanceDue = Math.max(0, demand.estimatedPrice - (demand.depositAmount || 0));

    if (body.status) {
      const allowed = ["quoted", "awaiting_slot", "needs_salon_review", "cancelled", "deposit_paid"];
      if (!allowed.includes(body.status)) {
        return res.status(400).json({ status: false, message: "Invalid status" });
      }
      demand.status = body.status;
    } else if (demand.status === "needs_salon_review") {
      demand.status = "quoted";
    }

    if (body.waiveDeposit) {
      demand.depositStatus = "waived";
      demand.depositAmount = 0;
      demand.balanceDue = demand.estimatedPrice;
    }

    await demand.save();
    return res.status(200).json({ status: true, demand });
  } catch (error) {
    console.error("[salonDemand.adjust]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * PUT /salon/demand/afro-config
 * Body: { enabled?: boolean, serviceId, afroConfig } | { enabled, seedKnotlessDemo?: true, serviceId }
 *        | { serviceId, clearAfroConfig?: true } | { serviceId, depositPercent?: number }
 */
exports.updateAfroConfig = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(404).json({ status: false, message: "Salon not found" });
    }

    const body = req.body || {};
    if (typeof body.enabled === "boolean") {
      salon.afroProjectFlowEnabled = body.enabled;
    }

    if (body.serviceId) {
      const entry = salon.serviceIds.find((s) => String(s.id) === String(body.serviceId));
      if (!entry) {
        return res.status(400).json({ status: false, message: "Service not on salon" });
      }
      if (body.clearAfroConfig) {
        entry.afroConfig = undefined;
      } else if (body.seedKnotlessDemo) {
        entry.afroConfig = { ...KNOTLESS_S2_DEMO_CONFIG };
      } else if (body.afroConfig !== undefined) {
        entry.afroConfig = body.afroConfig;
      } else if (body.depositPercent != null) {
        const afro = entry.afroConfig
          ? JSON.parse(JSON.stringify(entry.afroConfig))
          : {
              complexityTier: "S2",
              requirePhoto: false,
              configSchema: [],
              pricingRules: [],
              durationRules: [],
              depositPolicy: { enabled: true, type: "percent", value: 30 },
            };
        const pct = Math.max(0, Math.min(100, Number(body.depositPercent)));
        afro.depositPolicy = {
          enabled: pct > 0,
          type: "percent",
          value: pct,
        };
        entry.afroConfig = afro;
      }
      salon.markModified("serviceIds");
    }

    await salon.save();
    return res.status(200).json({
      status: true,
      afroProjectFlowEnabled: salon.afroProjectFlowEnabled,
      serviceIds: salon.serviceIds,
    });
  } catch (error) {
    console.error("[salonDemand.updateAfroConfig]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
