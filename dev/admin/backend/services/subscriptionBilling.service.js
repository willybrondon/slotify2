/**
 * SaaS subscription billing (Stripe Checkout) — Price IDs come from admin SubscriptionPlan.
 * Affiliation: after paid invoice, Skedisy calls Partnero transactions API (not Partnero↔Stripe app).
 */

const stripeLib = require("stripe");
const Setting = require("../models/setting.model");
const Salon = require("../models/salon.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const partnero = require("./partnero.service");
const { assignPlanToSalon } = require("./subscription.service");
const {
  SUBSCRIPTION_BILLING_PACKS,
  getBillingPack,
} = require("../constants/subscriptionBillingPacks");

async function getStripeClient() {
  const setting = await Setting.findOne().sort({ createdAt: -1 }).lean();
  const secret =
    global.settingJSON?.stripeSecretKey ||
    (setting && setting.stripeSecretKey) ||
    process.env.STRIPE_SECRET_KEY ||
    "";
  if (!String(secret).trim()) {
    throw new Error("Stripe n'est pas configuré (clé secrète manquante).");
  }
  return stripeLib(String(secret).trim());
}

function baseUrl() {
  return String(process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
}

function pickPriceId(plan, interval) {
  if (!plan) return "";
  if (interval === "year") {
    return String(plan.stripePriceIdYearly || "").trim();
  }
  return String(plan.stripePriceIdMonthly || "").trim();
}

function planAmountForInterval(plan, interval) {
  if (interval === "year") return Number(plan.priceYearly) || 0;
  return Number(plan.priceMonthly) || 0;
}

/**
 * Ensure a Stripe Price exists for the plan/interval (create + persist if missing).
 * Allows salons to pay without waiting for admin to paste Price IDs.
 */
async function ensureStripePrice(plan, interval) {
  const billingInterval = interval === "year" ? "year" : "month";
  const existing = pickPriceId(plan, billingInterval);
  if (existing) return existing;

  const amount = planAmountForInterval(plan, billingInterval);
  if (!(amount > 0)) {
    throw new Error("Montant du plan invalide pour ce cycle de facturation.");
  }

  const stripe = await getStripeClient();
  const currency = String(plan.currency || "EUR").toLowerCase();

  const product = await stripe.products.create({
    name: `Skedisy — ${plan.name}`,
    description: plan.tagline || undefined,
    metadata: {
      skedisyPlanId: plan.planId,
      skedisyTier: plan.tier || "",
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency,
    recurring: { interval: billingInterval },
    metadata: {
      skedisyPlanId: plan.planId,
      skedisyInterval: billingInterval,
    },
  });

  if (billingInterval === "year") {
    plan.stripePriceIdYearly = price.id;
  } else {
    plan.stripePriceIdMonthly = price.id;
  }
  await plan.save();
  return price.id;
}

/**
 * Blow Up–style pack: recurring every N months at the intro pack amount.
 */
async function ensureStripePriceForPack(plan, pack) {
  if (!plan || !pack) {
    throw new Error("Plan ou pack manquant");
  }
  const byPack =
    plan.stripePriceIdsByPack && typeof plan.stripePriceIdsByPack === "object"
      ? plan.stripePriceIdsByPack
      : {};
  const existing = String(byPack[pack.packId] || "").trim();
  if (existing) return existing;

  const amount = Number(pack.price) || 0;
  if (!(amount > 0)) {
    throw new Error("Montant du pack invalide");
  }

  const stripe = await getStripeClient();
  const currency = String(plan.currency || "EUR").toLowerCase();
  const months = Math.max(1, Number(pack.months) || 1);

  const product = await stripe.products.create({
    name: `Skedisy — ${plan.name} (${pack.label})`,
    description: plan.tagline || undefined,
    metadata: {
      skedisyPlanId: plan.planId,
      skedisyPackId: pack.packId,
      skedisyTier: plan.tier || "",
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency,
    recurring: { interval: "month", interval_count: months },
    metadata: {
      skedisyPlanId: plan.planId,
      skedisyPackId: pack.packId,
      skedisyMonths: String(months),
    },
  });

  plan.stripePriceIdsByPack = { ...byPack, [pack.packId]: price.id };
  plan.markModified("stripePriceIdsByPack");
  await plan.save();
  return price.id;
}

async function ensureStripeCustomer(salon, stripe) {
  const partnerKey = String(salon.partnero?.partnerKey || "").trim();
  const customerKey = String(salon.partnero?.customerKey || salon._id);

  let customerId = String(salon.subscription?.stripeCustomerId || "").trim();
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (_) {
      customerId = "";
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: salon.email || undefined,
      name: salon.name || undefined,
      metadata: {
        salonId: String(salon._id),
        partneroCustomerKey: customerKey,
        partneroPartnerKey: partnerKey || "",
      },
    });
    customerId = customer.id;
    salon.subscription = salon.subscription || {};
    salon.subscription.stripeCustomerId = customerId;
    salon.markModified("subscription");
    await salon.save();
  }
  return { customerId, partnerKey, customerKey };
}

/**
 * Start Stripe Checkout for a paid plan (auto-creates Price IDs when missing).
 * Prefer Blow Up–style packId (1m / 3m / 12m); falls back to month|year.
 */
async function createSubscriptionCheckout(salon, { planId, interval, packId }) {
  const id = String(planId || "").toLowerCase().trim();
  const pack = getBillingPack(packId);
  const billingInterval = interval === "year" ? "year" : "month";
  const plan = await SubscriptionPlan.findOne({ planId: id, isActive: true });
  if (!plan) throw new Error("Plan introuvable ou inactif");
  if (
    plan.tier === "free" ||
    (!(Number(plan.priceMonthly) > 0 || Number(plan.priceYearly) > 0) && !pack)
  ) {
    throw new Error("Ce plan ne nécessite pas de paiement.");
  }

  const priceId = pack
    ? await ensureStripePriceForPack(plan, pack)
    : await ensureStripePrice(plan, billingInterval);
  const stripe = await getStripeClient();
  const { customerId, partnerKey, customerKey } = await ensureStripeCustomer(
    salon,
    stripe
  );

  const successUrl = `${baseUrl()}/salonpanel/profile?tab=subscription&billing=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl()}/salonpanel/profile?tab=subscription&billing=cancelled`;

  const metaInterval = pack ? `pack_${pack.packId}` : billingInterval;
  const subscriptionData = {
    metadata: {
      salonId: String(salon._id),
      planId: plan.planId,
      interval: metaInterval,
      packId: pack?.packId || "",
      partneroCustomerKey: customerKey,
      partneroPartnerKey: partnerKey || "",
    },
  };
  const trialDays = Number(plan.trialDays) || 0;
  const neverPaid =
    !salon.subscription?.stripeSubscriptionId &&
    !["active", "trialing", "past_due"].includes(
      String(salon.subscription?.status || "")
    );
  // Packs already include intro pricing — skip trial stacking.
  if (trialDays > 0 && neverPaid && !pack) {
    subscriptionData.trial_period_days = trialDays;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: String(salon._id),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      type: "saas_subscription",
      salonId: String(salon._id),
      planId: plan.planId,
      interval: metaInterval,
      packId: pack?.packId || "",
      partneroCustomerKey: customerKey,
      partneroPartnerKey: partnerKey || "",
    },
    subscription_data: subscriptionData,
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    planId: plan.planId,
    interval: metaInterval,
    packId: pack?.packId || "",
    mode: "checkout",
  };
}

/**
 * Choose / change plan: Checkout for new sub, or in-place Stripe update if already subscribed.
 */
async function chooseOrChangePlan(salon, { planId, interval, packId }) {
  const id = String(planId || "").toLowerCase().trim();
  const pack = getBillingPack(packId);
  const billingInterval = interval === "year" ? "year" : "month";
  const plan = await SubscriptionPlan.findOne({ planId: id, isActive: true });
  if (!plan) throw new Error("Plan introuvable ou inactif");

  const currentId = String(salon.subscription?.planId || "free").toLowerCase();
  const currentPack = String(salon.subscription?.packId || "").toLowerCase();
  const existingSubId = String(salon.subscription?.stripeSubscriptionId || "").trim();

  // Free plan: no Stripe payment — assign directly (or cancel via portal if paid)
  if (
    !pack &&
    (plan.tier === "free" || !(planAmountForInterval(plan, billingInterval) > 0))
  ) {
    if (existingSubId) {
      throw new Error(
        "Pour passer au plan gratuit, utilisez « Gérer / factures » et annulez l'abonnement Stripe."
      );
    }
    await assignPlanToSalon(salon._id, { planId: plan.planId, status: "active" });
    return {
      mode: "assigned",
      planId: plan.planId,
      interval: billingInterval,
      message: "Plan gratuit activé.",
    };
  }

  // Already on this paid plan (+ same pack when provided) with active Stripe sub
  if (
    existingSubId &&
    currentId === plan.planId &&
    (!pack || currentPack === pack.packId) &&
    ["active", "trialing"].includes(String(salon.subscription?.status || ""))
  ) {
    return {
      mode: "unchanged",
      planId: plan.planId,
      packId: pack?.packId || "",
      message: "Ce plan est déjà actif.",
    };
  }

  // Existing Stripe subscription → switch price in place (proration)
  if (existingSubId) {
    const priceId = pack
      ? await ensureStripePriceForPack(plan, pack)
      : await ensureStripePrice(plan, billingInterval);
    const stripe = await getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(existingSubId);
    const itemId = subscription.items?.data?.[0]?.id;
    if (!itemId) {
      return createSubscriptionCheckout(salon, {
        planId: plan.planId,
        interval: billingInterval,
        packId: pack?.packId,
      });
    }

    const metaInterval = pack ? `pack_${pack.packId}` : billingInterval;
    const updated = await stripe.subscriptions.update(existingSubId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
      metadata: {
        ...(subscription.metadata || {}),
        salonId: String(salon._id),
        planId: plan.planId,
        interval: metaInterval,
        packId: pack?.packId || "",
      },
    });

    await applySubscriptionToSalon(salon, updated, plan.planId, pack?.packId);
    return {
      mode: "updated",
      planId: plan.planId,
      interval: metaInterval,
      packId: pack?.packId || "",
      message: "Plan mis à jour. La facturation Stripe a été ajustée (prorata).",
    };
  }

  return createSubscriptionCheckout(salon, {
    planId: plan.planId,
    interval: billingInterval,
    packId: pack?.packId,
  });
}

async function findSalonFromStripeObject(obj) {
  const meta = obj?.metadata || {};
  if (meta.salonId) {
    const s = await Salon.findById(meta.salonId);
    if (s) return s;
  }
  const customerId =
    typeof obj?.customer === "string"
      ? obj.customer
      : obj?.customer?.id || "";
  if (customerId) {
    const s = await Salon.findOne({
      "subscription.stripeCustomerId": customerId,
    });
    if (s) return s;
  }
  const subId =
    typeof obj?.subscription === "string"
      ? obj.subscription
      : obj?.id?.startsWith?.("sub_")
        ? obj.id
        : "";
  if (subId) {
    const s = await Salon.findOne({
      "subscription.stripeSubscriptionId": subId,
    });
    if (s) return s;
  }
  return null;
}

function alreadyLoggedSale(salon, txnKey) {
  const sales = Array.isArray(salon.partnero?.sales) ? salon.partnero.sales : [];
  return sales.some((s) => s && s.key === txnKey && s.status === "recorded");
}

async function markSale(salon, entry) {
  salon.partnero = salon.partnero || {};
  if (!Array.isArray(salon.partnero.sales)) salon.partnero.sales = [];
  const idx = salon.partnero.sales.findIndex((s) => s && s.key === entry.key);
  if (idx >= 0) salon.partnero.sales[idx] = { ...salon.partnero.sales[idx], ...entry };
  else salon.partnero.sales.push(entry);
  // keep last 40
  if (salon.partnero.sales.length > 40) {
    salon.partnero.sales = salon.partnero.sales.slice(-40);
  }
  salon.markModified("partnero");
  await salon.save();
}

/**
 * Notify Partnero of a paid invoice (commission). Soft-fail.
 */
async function recordAffiliateSale(salon, {
  transactionKey,
  amount,
  currency,
  planId,
  interval,
}) {
  const txnKey = String(transactionKey || "").trim();
  if (!txnKey || !(Number(amount) > 0)) {
    return { ok: false, skipped: true };
  }
  if (alreadyLoggedSale(salon, txnKey)) {
    return { ok: true, duplicate: true };
  }

  const customerKey = String(
    salon.partnero?.customerKey || salon._id
  );
  const partnerKey = String(salon.partnero?.partnerKey || "").trim();

  // Ensure customer exists in Partnero when we have a partner (phase 1 may have missed)
  if (partnerKey && !salon.partnero?.signupSynced) {
    const sync = await partnero.createReferredCustomer({
      partnerKey,
      customerKey,
      email: salon.email,
      name: salon.name,
    });
    if (sync.ok) {
      salon.partnero.signupSynced = true;
      salon.partnero.customerKey = customerKey;
      salon.partnero.partnerKey = partnerKey;
      salon.markModified("partnero");
      await salon.save();
    }
  }

  const result = await partnero.createSaleTransaction({
    customerKey,
    customerEmail: salon.email,
    partnerKey,
    transactionKey: txnKey,
    amount: Number(amount),
    currency: currency || "EUR",
    productId: planId || salon.subscription?.planId || "",
    productType: interval === "year" ? "yearly" : "monthly",
  });

  await markSale(salon, {
    key: txnKey,
    amount: Number(amount),
    planId: planId || salon.subscription?.planId || "",
    interval: interval || "month",
    syncedAt: new Date(),
    status: result.ok ? "recorded" : "failed",
    error: result.ok ? "" : String(result.data?.message || result.reason || ""),
  });

  return result;
}

async function applySubscriptionToSalon(
  salon,
  subscription,
  planIdHint,
  packIdHint
) {
  const planId =
    String(
      planIdHint ||
        subscription?.metadata?.planId ||
        salon.subscription?.planId ||
        ""
    )
      .toLowerCase()
      .trim() || "basic";
  const packId = String(
    packIdHint ||
      subscription?.metadata?.packId ||
      salon.subscription?.packId ||
      ""
  )
    .toLowerCase()
    .trim();

  salon.subscription = salon.subscription || {};
  salon.subscription.stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || salon.subscription.stripeCustomerId || "";
  salon.subscription.stripeSubscriptionId = subscription.id || "";
  salon.subscription.cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  if (packId) {
    salon.subscription.packId = packId;
  }

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;
  salon.subscription.currentPeriodEnd = periodEnd;

  const statusMap = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    unpaid: "unpaid",
    canceled: "canceled",
    incomplete: "past_due",
    incomplete_expired: "canceled",
  };
  const mapped = statusMap[subscription.status] || "active";

  salon.markModified("subscription");
  await salon.save();
  await assignPlanToSalon(salon._id, { planId, status: mapped });
  return Salon.findById(salon._id);
}

async function resolveCheckoutPlanId() {
  const { ensureDefaultPlans } = require("./subscription.service");
  await ensureDefaultPlans();
  const highlighted = await SubscriptionPlan.findOne({
    isActive: true,
    isHighlighted: true,
    tier: { $ne: "free" },
  });
  const premium = await SubscriptionPlan.findOne({
    planId: "premium",
    isActive: true,
  });
  return highlighted || premium || null;
}

/**
 * Public onboarding: Stripe Checkout before salon account exists.
 */
async function createOnboardingCheckout({ packId, email }) {
  const pack = getBillingPack(packId);
  if (!pack) throw new Error("Pack d'abonnement invalide.");
  const plan = await resolveCheckoutPlanId();
  if (!plan) throw new Error("Aucun plan Premium actif pour le checkout.");

  const priceId = await ensureStripePriceForPack(plan, pack);
  const stripe = await getStripeClient();
  const emailNorm = String(email || "")
    .trim()
    .toLowerCase();
  const metaInterval = `pack_${pack.packId}`;
  const sessionParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl()}/salon/rejoindre?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/salon/rejoindre?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      type: "onboarding_saas_subscription",
      packId: pack.packId,
      planId: plan.planId,
      interval: metaInterval,
    },
    subscription_data: {
      metadata: {
        type: "onboarding_saas_subscription",
        packId: pack.packId,
        planId: plan.planId,
        interval: metaInterval,
      },
    },
  };
  if (emailNorm && emailNorm.includes("@")) {
    sessionParams.customer_email = emailNorm;
  }
  const session = await stripe.checkout.sessions.create(sessionParams);
  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    packId: pack.packId,
    planId: plan.planId,
  };
}

async function verifyOnboardingCheckout(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) return { ok: false, reason: "missing_session" };
  const stripe = await getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ["subscription"],
  });
  const type = String(session.metadata?.type || "");
  const allowed =
    type === "onboarding_saas_subscription" || type === "saas_subscription";
  if (!allowed) return { ok: false, reason: "wrong_type" };
  const paid =
    session.status === "complete" &&
    (session.payment_status === "paid" ||
      session.payment_status === "no_payment_required");
  if (!paid) return { ok: false, reason: "not_paid", status: session.status };
  return {
    ok: true,
    sessionId: session.id,
    packId: String(session.metadata?.packId || "").toLowerCase(),
    planId: String(session.metadata?.planId || "premium").toLowerCase(),
    customerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || "",
    subscriptionId:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || "",
    email: String(session.customer_details?.email || session.customer_email || "")
      .trim()
      .toLowerCase(),
  };
}

async function attachOnboardingCheckoutToSalon(salon, sessionId) {
  const verified = await verifyOnboardingCheckout(sessionId);
  if (!verified.ok) {
    throw new Error("Paiement d'abonnement non confirmé.");
  }
  const stripe = await getStripeClient();
  salon.subscription = salon.subscription || {};
  if (verified.customerId) {
    salon.subscription.stripeCustomerId = verified.customerId;
  }
  if (verified.subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(
      verified.subscriptionId
    );
    await applySubscriptionToSalon(
      salon,
      subscription,
      verified.planId,
      verified.packId
    );
  } else {
    salon.subscription.packId = verified.packId;
    salon.subscription.planId = verified.planId;
    salon.subscription.status = "active";
    salon.markModified("subscription");
    await salon.save();
    await assignPlanToSalon(salon._id, {
      planId: verified.planId,
      status: "active",
    });
  }
  // Link Stripe subscription metadata to salon for future webhooks
  if (verified.subscriptionId) {
    try {
      await stripe.subscriptions.update(verified.subscriptionId, {
        metadata: {
          salonId: String(salon._id),
          planId: verified.planId,
          packId: verified.packId,
          type: "saas_subscription",
        },
      });
    } catch (e) {
      console.warn("[billing] attach metadata:", e.message);
    }
  }
  return verifyOnboardingCheckout(sessionId);
}

async function handleCheckoutSessionCompleted(session) {
  if (session.mode !== "subscription") return { ignored: true };
  const metaType = String(session.metadata?.type || "");
  if (
    metaType &&
    metaType !== "saas_subscription" &&
    metaType !== "onboarding_saas_subscription"
  ) {
    return { ignored: true };
  }

  const salon =
    (await findSalonFromStripeObject(session)) ||
    (session.client_reference_id
      ? await Salon.findById(session.client_reference_id)
      : null);
  if (!salon) {
    if (metaType === "onboarding_saas_subscription") {
      // Salon is created after payment — attach at self-register.
      return { ok: true, pending: true, reason: "awaiting_salon_register" };
    }
    console.warn("[billing] checkout.session.completed: salon not found");
    return { ok: false, reason: "salon_not_found" };
  }

  const stripe = await getStripeClient();
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (subId) {
    const subscription = await stripe.subscriptions.retrieve(subId);
    await applySubscriptionToSalon(
      salon,
      subscription,
      session.metadata?.planId,
      session.metadata?.packId
    );
  } else {
    if (session.metadata?.packId) {
      salon.subscription = salon.subscription || {};
      salon.subscription.packId = String(session.metadata.packId).toLowerCase();
      salon.markModified("subscription");
      await salon.save();
    }
    await assignPlanToSalon(salon._id, {
      planId: session.metadata?.planId || salon.subscription?.planId,
      status: "active",
    });
  }

  // Affiliate sale is recorded on invoice.paid (idempotent key in_*) — avoid double commission.
  return { ok: true, salonId: String(salon._id) };
}

async function handleInvoicePaid(invoice) {
  // Skip $0 invoices (trials)
  const amountPaid =
    typeof invoice.amount_paid === "number" ? invoice.amount_paid / 100 : 0;
  if (!(amountPaid > 0)) {
    return { ok: true, skipped: true, reason: "zero_amount" };
  }

  const stripe = await getStripeClient();
  let subscription = null;
  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (subId) {
    try {
      subscription = await stripe.subscriptions.retrieve(subId);
    } catch (_) {}
  }

  const salon =
    (subscription && (await findSalonFromStripeObject(subscription))) ||
    (await findSalonFromStripeObject(invoice));
  if (!salon) {
    console.warn("[billing] invoice.paid: salon not found", invoice.id);
    return { ok: false, reason: "salon_not_found" };
  }

  if (subscription) {
    await applySubscriptionToSalon(
      salon,
      subscription,
      subscription.metadata?.planId
    );
  }

  const fresh = await Salon.findById(salon._id);
  const interval =
    subscription?.metadata?.interval ||
    (invoice.lines?.data?.[0]?.price?.recurring?.interval === "year"
      ? "year"
      : "month");

  return recordAffiliateSale(fresh, {
    transactionKey: `in_${invoice.id}`,
    amount: amountPaid,
    currency: String(invoice.currency || "eur").toUpperCase(),
    planId: subscription?.metadata?.planId || fresh.subscription?.planId,
    interval,
  });
}

async function handleSubscriptionUpdated(subscription) {
  const salon = await findSalonFromStripeObject(subscription);
  if (!salon) return { ok: false, reason: "salon_not_found" };
  await applySubscriptionToSalon(
    salon,
    subscription,
    subscription.metadata?.planId
  );
  return { ok: true };
}

async function handleSubscriptionDeleted(subscription) {
  const salon = await findSalonFromStripeObject(subscription);
  if (!salon) return { ok: false, reason: "salon_not_found" };
  salon.subscription = salon.subscription || {};
  salon.subscription.status = "canceled";
  salon.subscription.cancelAtPeriodEnd = false;
  salon.markModified("subscription");
  await salon.save();
  // Downgrade to free entitlements
  try {
    await assignPlanToSalon(salon._id, { planId: "free", status: "active" });
  } catch (_) {}
  return { ok: true };
}

async function handleInvoiceRefundedOrChargeRefunded(obj) {
  // Prefer invoice id when present
  const invoiceId =
    (typeof obj.invoice === "string" && obj.invoice) ||
    (obj.object === "invoice" && obj.id) ||
    "";
  const txnKey = invoiceId
    ? `in_${invoiceId}`
    : obj.id
      ? `rf_${obj.id}`
      : "";
  if (!txnKey) return { skipped: true };

  const salon = await findSalonFromStripeObject(obj);
  if (salon && alreadyLoggedSale(salon, txnKey.replace(/^rf_/, "in_"))) {
    const key = txnKey.startsWith("in_") ? txnKey : `in_${invoiceId}`;
    await partnero.deleteSaleTransaction(key);
    await markSale(salon, {
      key,
      amount: 0,
      planId: salon.subscription?.planId || "",
      interval: "",
      syncedAt: new Date(),
      status: "refunded",
      error: "",
    });
  } else if (txnKey) {
    await partnero.deleteSaleTransaction(
      invoiceId ? `in_${invoiceId}` : txnKey
    );
  }
  return { ok: true };
}

module.exports = {
  createSubscriptionCheckout,
  createOnboardingCheckout,
  verifyOnboardingCheckout,
  attachOnboardingCheckoutToSalon,
  chooseOrChangePlan,
  ensureStripePrice,
  ensureStripePriceForPack,
  pickPriceId,
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoiceRefundedOrChargeRefunded,
  recordAffiliateSale,
  getStripeClient,
  SUBSCRIPTION_BILLING_PACKS,
};
