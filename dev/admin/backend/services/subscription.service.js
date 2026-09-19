const SubscriptionPlan = require("../models/subscriptionPlan.model");
const Salon = require("../models/salon.model");
const {
  SUBSCRIPTION_FEATURES,
  FEATURE_KEYS,
  DEFAULT_PLAN_FEATURES,
} = require("../constants/subscriptionFeatures");

const DEFAULT_PLANS = [
  {
    planId: "free",
    name: "Free / Essai",
    tagline: "Découvrir Skedisy — agenda + page publique",
    tier: "free",
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 14,
    sortOrder: 10,
    isDefault: true,
    isHighlighted: false,
    features: DEFAULT_PLAN_FEATURES.free,
    limits: { maxExperts: 2, maxLocations: 1 },
  },
  {
    planId: "basic",
    name: "Basic",
    tagline: "Logiciel salon au quotidien (paiements, messagerie, rebook)",
    tier: "basic",
    priceMonthly: 29,
    priceYearly: 290,
    trialDays: 14,
    sortOrder: 20,
    isDefault: false,
    isHighlighted: false,
    features: DEFAULT_PLAN_FEATURES.basic,
    limits: { maxExperts: 5, maxLocations: 1 },
  },
  {
    planId: "premium",
    name: "Premium",
    tagline: "Croissance StyleSeat-like : marketplace, leads, marketing, fidélité",
    tier: "premium",
    priceMonthly: 49,
    priceYearly: 490,
    trialDays: 14,
    sortOrder: 30,
    isDefault: false,
    isHighlighted: true,
    features: DEFAULT_PLAN_FEATURES.premium,
    limits: { maxExperts: 15, maxLocations: 1 },
  },
  {
    planId: "enterprise",
    name: "Enterprise",
    tagline: "Multi-lieux, branding, support prioritaire",
    tier: "enterprise",
    priceMonthly: 99,
    priceYearly: 990,
    trialDays: 30,
    sortOrder: 40,
    isDefault: false,
    isHighlighted: false,
    features: DEFAULT_PLAN_FEATURES.enterprise,
    limits: { maxExperts: 0, maxLocations: 0 },
  },
];

async function ensureDefaultPlans() {
  for (const plan of DEFAULT_PLANS) {
    const existing = await SubscriptionPlan.findOne({ planId: plan.planId });
    if (!existing) {
      await SubscriptionPlan.create(plan);
      continue;
    }
    // Keep admin edits; only backfill empty features
    if (!existing.features?.length) {
      existing.features = plan.features;
      await existing.save();
    }
  }
  // Ensure single default
  const defaults = await SubscriptionPlan.find({ isDefault: true });
  if (defaults.length === 0) {
    await SubscriptionPlan.updateOne({ planId: "free" }, { isDefault: true });
  } else if (defaults.length > 1) {
    const keep = defaults[0]._id;
    await SubscriptionPlan.updateMany(
      { _id: { $ne: keep }, isDefault: true },
      { isDefault: false }
    );
  }
  return SubscriptionPlan.find().sort({ sortOrder: 1 }).lean();
}

function sanitizeFeatureList(features) {
  if (!Array.isArray(features)) return [];
  const set = new Set();
  features.forEach((k) => {
    const key = String(k || "").trim();
    if (FEATURE_KEYS.includes(key)) set.add(key);
  });
  return [...set];
}

async function getPlanByPlanId(planId) {
  if (!planId) return null;
  return SubscriptionPlan.findOne({
    planId: String(planId).toLowerCase().trim(),
    isActive: true,
  }).lean();
}

async function getDefaultPlan() {
  let plan = await SubscriptionPlan.findOne({ isDefault: true, isActive: true }).lean();
  if (!plan) {
    plan = await SubscriptionPlan.findOne({ planId: "free", isActive: true }).lean();
  }
  return plan;
}

/**
 * Resolve effective features for a salon.
 * StyleSeat pattern: plan includes tools; salon can opt-out via featureOverrides.
 * featureOverrides: { [featureKey]: false } disables; true forces enable (admin gift).
 */
function resolveFeaturesFromPlan(plan, featureOverrides = {}) {
  const base = new Set(plan?.features || []);
  const overrides =
    featureOverrides && typeof featureOverrides === "object"
      ? featureOverrides
      : {};
  Object.entries(overrides).forEach(([key, value]) => {
    if (!FEATURE_KEYS.includes(key)) return;
    if (value === false) base.delete(key);
    if (value === true) base.add(key);
  });
  return [...base];
}

async function resolveSalonSubscription(salon) {
  const sub = salon?.subscription || {};
  let plan = null;
  if (sub.planId) {
    plan = await getPlanByPlanId(sub.planId);
  }
  if (!plan) {
    plan = await getDefaultPlan();
  }
  const features = resolveFeaturesFromPlan(plan, sub.featureOverrides);
  const status = sub.status || "none";
  const entitled =
    status === "active" ||
    status === "trialing" ||
    (plan?.tier === "free" && (status === "none" || status === "active"));

  return {
    plan,
    planId: plan?.planId || "",
    status,
    features: entitled ? features : [],
    limits: plan?.limits || {},
    entitled,
    featureOverrides: sub.featureOverrides || {},
  };
}

function salonHasFeature(resolved, featureKey) {
  if (!resolved?.entitled) return false;
  return (resolved.features || []).includes(featureKey);
}

async function assignPlanToSalon(salonId, { planId, status, featureOverrides }) {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new Error("Salon introuvable");

  if (planId) {
    const plan = await SubscriptionPlan.findOne({
      planId: String(planId).toLowerCase().trim(),
    });
    if (!plan || !plan.isActive) throw new Error("Plan introuvable ou inactif");
    salon.subscription = salon.subscription || {};
    salon.subscription.planId = plan.planId;
  }

  if (status) {
    salon.subscription.status = status;
  } else if (salon.subscription?.planId && salon.subscription.status === "none") {
    const plan = await getPlanByPlanId(salon.subscription.planId);
    salon.subscription.status =
      plan?.tier === "free" ? "active" : "trialing";
  }

  if (featureOverrides && typeof featureOverrides === "object") {
    const cleaned = {};
    Object.entries(featureOverrides).forEach(([k, v]) => {
      if (FEATURE_KEYS.includes(k) && typeof v === "boolean") cleaned[k] = v;
    });
    salon.subscription.featureOverrides = cleaned;
  }

  salon.markModified("subscription");
  await salon.save();
  return resolveSalonSubscription(salon);
}

module.exports = {
  SUBSCRIPTION_FEATURES,
  FEATURE_KEYS,
  DEFAULT_PLANS,
  ensureDefaultPlans,
  sanitizeFeatureList,
  getPlanByPlanId,
  getDefaultPlan,
  resolveFeaturesFromPlan,
  resolveSalonSubscription,
  salonHasFeature,
  assignPlanToSalon,
};
