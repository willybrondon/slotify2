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

/**
 * Start Stripe Checkout for a paid plan (admin must have set stripePriceId*).
 */
async function createSubscriptionCheckout(salon, { planId, interval }) {
  const id = String(planId || "").toLowerCase().trim();
  const billingInterval = interval === "year" ? "year" : "month";
  const plan = await SubscriptionPlan.findOne({ planId: id, isActive: true });
  if (!plan) throw new Error("Plan introuvable ou inactif");
  if (plan.tier === "free" || !(Number(plan.priceMonthly) > 0 || Number(plan.priceYearly) > 0)) {
    throw new Error("Ce plan ne nécessite pas de paiement.");
  }

  const priceId = pickPriceId(plan, billingInterval);
  if (!priceId) {
    throw new Error(
      "Price ID Stripe manquant pour ce plan. Ajoutez-le dans l'admin (Abonnements SaaS)."
    );
  }

  const stripe = await getStripeClient();
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

  const successUrl = `${baseUrl()}/salonpanel/profile?billing=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl()}/salonpanel/profile?billing=cancelled`;

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
      interval: billingInterval,
      partneroCustomerKey: customerKey,
      partneroPartnerKey: partnerKey || "",
    },
    subscription_data: {
      metadata: {
        salonId: String(salon._id),
        planId: plan.planId,
        interval: billingInterval,
        partneroCustomerKey: customerKey,
        partneroPartnerKey: partnerKey || "",
      },
    },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    planId: plan.planId,
    interval: billingInterval,
  };
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

async function applySubscriptionToSalon(salon, subscription, planIdHint) {
  const planId =
    String(
      planIdHint ||
        subscription?.metadata?.planId ||
        salon.subscription?.planId ||
        ""
    )
      .toLowerCase()
      .trim() || "basic";

  salon.subscription = salon.subscription || {};
  salon.subscription.stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || salon.subscription.stripeCustomerId || "";
  salon.subscription.stripeSubscriptionId = subscription.id || "";
  salon.subscription.cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);

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

async function handleCheckoutSessionCompleted(session) {
  if (session.mode !== "subscription") return { ignored: true };
  if (session.metadata?.type && session.metadata.type !== "saas_subscription") {
    return { ignored: true };
  }

  const salon =
    (await findSalonFromStripeObject(session)) ||
    (session.client_reference_id
      ? await Salon.findById(session.client_reference_id)
      : null);
  if (!salon) {
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
      session.metadata?.planId
    );
  } else {
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
  pickPriceId,
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoiceRefundedOrChargeRefunded,
  recordAffiliateSale,
  getStripeClient,
};
