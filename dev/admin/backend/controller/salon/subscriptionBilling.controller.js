/**
 * Salon SaaS subscription checkout + status (Price IDs auto-created from catalog if missing).
 */

const Salon = require("../../models/salon.model");
const SubscriptionPlan = require("../../models/subscriptionPlan.model");
const billing = require("../../services/subscriptionBilling.service");
const {
  ensureDefaultPlans,
  resolveSalonSubscription,
} = require("../../services/subscription.service");
const {
  SUBSCRIPTION_FEATURES,
} = require("../../constants/subscriptionFeatures");
const {
  SUBSCRIPTION_BILLING_PACKS,
} = require("../../constants/subscriptionBillingPacks");

const FEATURE_LABELS = Object.fromEntries(
  SUBSCRIPTION_FEATURES.map((f) => [f.key, f.label])
);

exports.getSubscriptionStatus = async (req, res) => {
  try {
    await ensureDefaultPlans();
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable" });
    }
    const resolved = await resolveSalonSubscription(salon);
    const plans = await SubscriptionPlan.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    return res.status(200).json({
      status: true,
      data: {
        subscription: {
          planId: salon.subscription?.planId || "free",
          packId: salon.subscription?.packId || "",
          status: salon.subscription?.status || "none",
          currentPeriodEnd: salon.subscription?.currentPeriodEnd || null,
          cancelAtPeriodEnd: Boolean(salon.subscription?.cancelAtPeriodEnd),
          stripeSubscriptionId: salon.subscription?.stripeSubscriptionId || "",
        },
        features: resolved?.features || [],
        partnero: {
          attributed: Boolean(salon.partnero?.partnerKey),
          signupSynced: Boolean(salon.partnero?.signupSynced),
        },
        /** Entitlement plan used when paying a Blow Up pack (Premium by default). */
        checkoutPlanId:
          plans.find((p) => p.isHighlighted && p.tier !== "free")?.planId ||
          plans.find((p) => p.tier === "premium")?.planId ||
          plans.find((p) => p.tier !== "free" && (Number(p.priceMonthly) > 0 || Number(p.priceYearly) > 0))
            ?.planId ||
          "premium",
        billingPacks: SUBSCRIPTION_BILLING_PACKS.map((pack) => ({
          ...pack,
          perDay: Number((pack.price / (pack.months * 30)).toFixed(2)),
        })),
        plans: plans.map((p) => {
          const amountMonthly = Number(p.priceMonthly) || 0;
          const amountYearly = Number(p.priceYearly) || 0;
          const isFree = p.tier === "free" || (!(amountMonthly > 0) && !(amountYearly > 0));
          return {
            planId: p.planId,
            name: p.name,
            tagline: p.tagline || "",
            tier: p.tier,
            priceMonthly: amountMonthly,
            priceYearly: amountYearly,
            currency: p.currency || "EUR",
            trialDays: p.trialDays || 0,
            isHighlighted: !!p.isHighlighted,
            isFree,
            // Checkout is available for any paid plan (Price IDs auto-created at pay time).
            hasCheckoutMonthly: !isFree && amountMonthly > 0,
            hasCheckoutYearly: !isFree && amountYearly > 0,
            limits: p.limits || {},
            features: (Array.isArray(p.features) ? p.features : []).map((key) => ({
              key,
              label: FEATURE_LABELS[key] || key,
            })),
            featureCount: Array.isArray(p.features) ? p.features.length : 0,
          };
        }),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * Choose or change plan — Stripe Checkout (new) or in-place update (existing sub).
 */
exports.createCheckout = async (req, res) => {
  try {
    const packId = String(req.body?.packId || req.query?.packId || "")
      .toLowerCase()
      .trim();
    let planId = String(req.body?.planId || req.query?.planId || "")
      .toLowerCase()
      .trim();
    const interval =
      String(req.body?.interval || req.query?.interval || "month").toLowerCase() ===
      "year"
        ? "year"
        : "month";

    // Pack checkout: default entitlement plan = highlighted Premium.
    if (packId && !planId) {
      await ensureDefaultPlans();
      const highlighted = await SubscriptionPlan.findOne({
        isActive: true,
        isHighlighted: true,
        tier: { $ne: "free" },
      }).lean();
      const premium = await SubscriptionPlan.findOne({
        planId: "premium",
        isActive: true,
      }).lean();
      planId = highlighted?.planId || premium?.planId || "premium";
    }

    if (!planId) {
      return res.status(200).json({ status: false, message: "planId requis" });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable" });
    }

    const result = await billing.chooseOrChangePlan(salon, {
      planId,
      interval,
      packId: packId || undefined,
    });

    return res.status(200).json({
      status: true,
      message:
        result.message ||
        (result.checkoutUrl ? "Checkout créé" : "Plan mis à jour"),
      data: result,
    });
  } catch (error) {
    console.error("[subscriptionCheckout]", error);
    return res.status(200).json({
      status: false,
      message: error.message || "Impossible de changer de plan",
    });
  }
};

/**
 * Stripe Customer Portal to manage/cancel subscription / invoices.
 */
exports.createBillingPortal = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable" });
    }
    const customerId = String(salon.subscription?.stripeCustomerId || "").trim();
    if (!customerId) {
      return res.status(200).json({
        status: false,
        message: "Aucun client Stripe lié. Souscrivez d'abord à un plan.",
      });
    }

    const stripe = await billing.getStripeClient();
    const base = String(process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/salonpanel/profile?tab=subscription&billing=portal`,
    });

    return res.status(200).json({
      status: true,
      data: { url: session.url },
    });
  } catch (error) {
    console.error("[billingPortal]", error);
    return res.status(200).json({
      status: false,
      message: error.message || "Portail de facturation indisponible",
    });
  }
};
