/**
 * Salon SaaS subscription checkout + status (Price IDs from admin SubscriptionPlan).
 */

const Salon = require("../../models/salon.model");
const SubscriptionPlan = require("../../models/subscriptionPlan.model");
const billing = require("../../services/subscriptionBilling.service");
const {
  ensureDefaultPlans,
  resolveSalonSubscription,
} = require("../../services/subscription.service");

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
        plans: plans.map((p) => ({
          planId: p.planId,
          name: p.name,
          tagline: p.tagline || "",
          tier: p.tier,
          priceMonthly: p.priceMonthly || 0,
          priceYearly: p.priceYearly || 0,
          trialDays: p.trialDays || 0,
          isHighlighted: !!p.isHighlighted,
          hasCheckoutMonthly: Boolean(String(p.stripePriceIdMonthly || "").trim()),
          hasCheckoutYearly: Boolean(String(p.stripePriceIdYearly || "").trim()),
          featureCount: Array.isArray(p.features) ? p.features.length : 0,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.createCheckout = async (req, res) => {
  try {
    const planId = String(req.body?.planId || req.query?.planId || "")
      .toLowerCase()
      .trim();
    const interval =
      String(req.body?.interval || req.query?.interval || "month").toLowerCase() ===
      "year"
        ? "year"
        : "month";

    if (!planId) {
      return res.status(200).json({ status: false, message: "planId requis" });
    }

    const salon = await Salon.findById(req.salon._id);
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon introuvable" });
    }

    const result = await billing.createSubscriptionCheckout(salon, {
      planId,
      interval,
    });

    return res.status(200).json({
      status: true,
      message: "Checkout créé",
      data: result,
    });
  } catch (error) {
    console.error("[subscriptionCheckout]", error);
    return res.status(200).json({
      status: false,
      message: error.message || "Impossible de créer le checkout",
    });
  }
};

/**
 * Optional: Stripe Customer Portal to manage/cancel subscription.
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
      return_url: `${base}/salonpanel/profile?billing=portal`,
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
