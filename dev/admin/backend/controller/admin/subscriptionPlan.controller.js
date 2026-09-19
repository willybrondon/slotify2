const SubscriptionPlan = require("../../models/subscriptionPlan.model");
const {
  SUBSCRIPTION_FEATURES,
  ensureDefaultPlans,
  sanitizeFeatureList,
  assignPlanToSalon,
  resolveSalonSubscription,
} = require("../../services/subscription.service");

exports.listFeatures = async (_req, res) => {
  try {
    return res.status(200).json({
      status: true,
      message: "success",
      data: SUBSCRIPTION_FEATURES,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.listPlans = async (_req, res) => {
  try {
    await ensureDefaultPlans();
    const plans = await SubscriptionPlan.find().sort({ sortOrder: 1 });
    return res.status(200).json({
      status: true,
      message: "success",
      data: plans,
      featuresCatalog: SUBSCRIPTION_FEATURES,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const body = req.body || {};
    const planId = String(body.planId || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");
    if (!planId || !body.name) {
      return res
        .status(200)
        .json({ status: false, message: "planId et name requis" });
    }
    const exists = await SubscriptionPlan.findOne({ planId });
    if (exists) {
      return res
        .status(200)
        .json({ status: false, message: "Ce planId existe déjà" });
    }

    if (body.isDefault === true || body.isDefault === "true") {
      await SubscriptionPlan.updateMany({}, { isDefault: false });
    }

    const plan = await SubscriptionPlan.create({
      planId,
      name: body.name,
      tagline: body.tagline || "",
      tier: body.tier || "custom",
      priceMonthly: Number(body.priceMonthly) || 0,
      priceYearly: Number(body.priceYearly) || 0,
      currency: body.currency || "EUR",
      trialDays: Number(body.trialDays) >= 0 ? Number(body.trialDays) : 14,
      sortOrder: Number(body.sortOrder) || 100,
      isActive: body.isActive !== false && body.isActive !== "false",
      isDefault: body.isDefault === true || body.isDefault === "true",
      isHighlighted:
        body.isHighlighted === true || body.isHighlighted === "true",
      features: sanitizeFeatureList(body.features),
      limits: {
        maxExperts: Number(body.maxExperts) || 0,
        maxLocations: Number(body.maxLocations) || 1,
      },
      stripePriceIdMonthly: body.stripePriceIdMonthly || "",
      stripePriceIdYearly: body.stripePriceIdYearly || "",
      notes: body.notes || "",
    });

    return res.status(201).json({ status: true, message: "Plan créé", data: plan });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) {
      return res.status(200).json({ status: false, message: "id requis" });
    }
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(200).json({ status: false, message: "Plan introuvable" });
    }

    const body = req.body || {};
    if (body.name != null) plan.name = body.name;
    if (body.tagline != null) plan.tagline = body.tagline;
    if (body.tier != null) plan.tier = body.tier;
    if (body.priceMonthly != null) plan.priceMonthly = Number(body.priceMonthly) || 0;
    if (body.priceYearly != null) plan.priceYearly = Number(body.priceYearly) || 0;
    if (body.currency != null) plan.currency = body.currency;
    if (body.trialDays != null) plan.trialDays = Number(body.trialDays) || 0;
    if (body.sortOrder != null) plan.sortOrder = Number(body.sortOrder) || 0;
    if (body.isActive != null) {
      plan.isActive = body.isActive === true || body.isActive === "true";
    }
    if (body.isHighlighted != null) {
      plan.isHighlighted =
        body.isHighlighted === true || body.isHighlighted === "true";
    }
    if (body.features != null) {
      plan.features = sanitizeFeatureList(body.features);
    }
    if (body.maxExperts != null || body.maxLocations != null) {
      plan.limits = plan.limits || {};
      if (body.maxExperts != null) plan.limits.maxExperts = Number(body.maxExperts) || 0;
      if (body.maxLocations != null)
        plan.limits.maxLocations = Number(body.maxLocations) || 0;
    }
    if (body.stripePriceIdMonthly != null)
      plan.stripePriceIdMonthly = body.stripePriceIdMonthly;
    if (body.stripePriceIdYearly != null)
      plan.stripePriceIdYearly = body.stripePriceIdYearly;
    if (body.notes != null) plan.notes = body.notes;

    if (body.isDefault === true || body.isDefault === "true") {
      await SubscriptionPlan.updateMany(
        { _id: { $ne: plan._id } },
        { isDefault: false }
      );
      plan.isDefault = true;
    } else if (body.isDefault === false || body.isDefault === "false") {
      plan.isDefault = false;
    }

    await plan.save();
    return res.status(200).json({ status: true, message: "Plan mis à jour", data: plan });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.togglePlanActive = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(200).json({ status: false, message: "id requis" });
    }
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(200).json({ status: false, message: "Plan introuvable" });
    }
    plan.isActive = !plan.isActive;
    await plan.save();
    return res.status(200).json({ status: true, message: "Statut mis à jour", data: plan });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(200).json({ status: false, message: "id requis" });
    }
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(200).json({ status: false, message: "Plan introuvable" });
    }
    if (["free", "basic", "premium"].includes(plan.planId)) {
      return res.status(200).json({
        status: false,
        message: "Les plans Free / Basic / Premium ne peuvent pas être supprimés — désactivez-les",
      });
    }
    await plan.deleteOne();
    return res.status(200).json({ status: true, message: "Plan supprimé" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.assignSalonPlan = async (req, res) => {
  try {
    const salonId = req.query.salonId || req.body.salonId;
    if (!salonId) {
      return res.status(200).json({ status: false, message: "salonId requis" });
    }
    const resolved = await assignPlanToSalon(salonId, {
      planId: req.body.planId,
      status: req.body.status,
      featureOverrides: req.body.featureOverrides,
    });
    return res.status(200).json({
      status: true,
      message: "Abonnement salon mis à jour",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).json({ status: false, message: error.message });
  }
};

exports.getSalonSubscription = async (req, res) => {
  try {
    const salonId = req.query.salonId;
    if (!salonId) {
      return res.status(200).json({ status: false, message: "salonId requis" });
    }
    const Salon = require("../../models/salon.model");
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable" });
    }
    const resolved = await resolveSalonSubscription(salon);
    return res.status(200).json({ status: true, data: resolved });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
