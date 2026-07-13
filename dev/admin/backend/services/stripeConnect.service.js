const stripe = require("stripe");
const Salon = require("../models/salon.model");

function getPlatformStripe() {
  const secretKey = (global.settingJSON?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) {
    throw new Error("Stripe platform is not configured.");
  }
  return stripe(secretKey);
}

function getCurrency() {
  return (global.settingJSON?.currencyName || "eur").toLowerCase();
}

function toStripeAmount(amount) {
  const currency = getCurrency();
  const value = Math.round(parseFloat(amount) * 100);
  if (value < 50) {
    throw new Error("Amount too low for card payment.");
  }
  return { amount: value, currency };
}

function computeApplicationFeeCents(withoutTax, salon) {
  const base = parseFloat(withoutTax) || 0;
  const { resolveSalonCommissionPercent } = require("./salonBookingWallet.service");
  const salonCommissionPercent = salon
    ? resolveSalonCommissionPercent(salon, global.settingJSON || {})
    : parseFloat(global.settingJSON?.salonCommissionCharges) || 0;
  const customerCommissionPercent = parseFloat(global.settingJSON?.customerCommissionCharges) || 0;
  const platformFee = (salonCommissionPercent * base) / 100;
  const customerCommission = (customerCommissionPercent * base) / 100;
  return Math.max(0, Math.round((platformFee + customerCommission) * 100));
}

function salonStripeReady(salon) {
  return (
    salon?.paymentMethods?.acceptStripe === true &&
    !!salon?.stripeConnect?.accountId &&
    salon?.stripeConnect?.chargesEnabled === true
  );
}

function salonPaymentOptions(salon) {
  const globalStripe = !!global.settingJSON?.isStripePay;
  const acceptCash = salon?.paymentMethods?.acceptCash !== false;
  const stripePreference = salon?.paymentMethods?.acceptStripe === true;
  const connectReady = salonStripeReady(salon);
  const acceptStripe = globalStripe && connectReady;
  return {
    acceptCash,
    /** Visible to customers — only when Connect onboarding is complete */
    acceptStripe,
    /** Salon opted in to card payments (may still need Stripe onboarding) */
    stripePreference,
    stripeConnectReady: connectReady,
    stripeOnboardingComplete: !!salon?.stripeConnect?.onboardingComplete,
    stripeChargesEnabled: !!salon?.stripeConnect?.chargesEnabled,
    salonName: salon?.name || "",
  };
}

async function syncConnectAccountStatus(salon) {
  if (!salon?.stripeConnect?.accountId) return salon;
  const stripeClient = getPlatformStripe();
  const account = await stripeClient.accounts.retrieve(salon.stripeConnect.accountId);
  salon.stripeConnect = {
    ...salon.stripeConnect,
    onboardingComplete: account.details_submitted === true,
    chargesEnabled: account.charges_enabled === true,
    payoutsEnabled: account.payouts_enabled === true,
    detailsSubmitted: account.details_submitted === true,
  };
  await salon.save();
  return salon;
}

function resolveStripeCountry(salon) {
  const raw = (salon?.addressDetails?.country || "FR").trim();
  const key = raw.toLowerCase();
  const map = {
    fr: "FR",
    france: "FR",
    cm: "CM",
    cameroon: "CM",
    cameroun: "CM",
    be: "BE",
    belgium: "BE",
    belgique: "BE",
    ch: "CH",
    switzerland: "CH",
    suisse: "CH",
    de: "DE",
    germany: "DE",
    allemagne: "DE",
    gb: "GB",
    uk: "GB",
    "united kingdom": "GB",
    "royaume-uni": "GB",
    us: "US",
    usa: "US",
    "united states": "US",
    "états-unis": "US",
  };
  if (key.length === 2 && /^[a-z]{2}$/i.test(key)) {
    return key.toUpperCase();
  }
  return map[key] || "FR";
}

async function ensureConnectAccount(salon) {
  const stripeClient = getPlatformStripe();
  if (salon.stripeConnect?.accountId) {
    return syncConnectAccountStatus(salon);
  }

  const country = resolveStripeCountry(salon);

  const account = await stripeClient.accounts.create({
    type: "express",
    country,
    email: salon.email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      salonId: salon._id.toString(),
      salonName: salon.name || "",
    },
  });

  salon.stripeConnect = {
    accountId: account.id,
    onboardingComplete: false,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  };
  await salon.save();
  return salon;
}

async function createConnectAccountLink(salon, { refreshUrl, returnUrl }) {
  const stripeClient = getPlatformStripe();
  await ensureConnectAccount(salon);
  const link = await stripeClient.accountLinks.create({
    account: salon.stripeConnect.accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

async function createBookingPaymentIntent({ salon, amount, withoutTax, metadata = {} }) {
  if (!salonStripeReady(salon)) {
    throw new Error("Stripe Connect is not ready for this salon.");
  }

  const stripeClient = getPlatformStripe();
  const { amount: stripeAmount, currency } = toStripeAmount(amount);

  // Full amount to salon — Skedisy commission is debited from salon.wallet after booking
  const paymentIntent = await stripeClient.paymentIntents.create(
    {
      amount: stripeAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      description: salon.name ? `Réservation ${salon.name}` : "Réservation Skedisy",
      metadata: {
        source: "skedisy_booking",
        salonId: salon._id.toString(),
        salonName: salon.name || "",
        withoutTax: String(withoutTax ?? ""),
        ...metadata,
      },
    },
    {
      stripeAccount: salon.stripeConnect.accountId,
    }
  );

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    publishableKey: (global.settingJSON?.stripePublishableKey || "").trim(),
    connectedAccountId: salon.stripeConnect.accountId,
    salonName: salon.name || "",
  };
}

async function createProductPaymentIntent({ salon, amount, subTotal, metadata = {} }) {
  if (!salonStripeReady(salon)) {
    throw new Error("Stripe Connect is not ready for this salon.");
  }

  const stripeClient = getPlatformStripe();
  const { amount: stripeAmount, currency } = toStripeAmount(amount);

  const paymentIntent = await stripeClient.paymentIntents.create(
    {
      amount: stripeAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      description: salon.name ? `Commande ${salon.name}` : "Commande Skedisy",
      metadata: {
        source: "skedisy_product",
        salonId: salon._id.toString(),
        salonName: salon.name || "",
        subTotal: String(subTotal ?? ""),
        ...metadata,
      },
    },
    {
      stripeAccount: salon.stripeConnect.accountId,
    }
  );

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    publishableKey: (global.settingJSON?.stripePublishableKey || "").trim(),
    connectedAccountId: salon.stripeConnect.accountId,
    salonName: salon.name || "",
  };
}

function salonProductPaymentOptions(salon) {
  const globalStripe =
    !!global.settingJSON?.isStripePay &&
    global.settingJSON?.isProductStripePay !== false;
  const acceptCash = salon?.paymentMethods?.acceptCash !== false;
  const stripePreference = salon?.paymentMethods?.acceptStripe === true;
  const connectReady = salonStripeReady(salon);
  const acceptStripe = globalStripe && connectReady;
  return {
    acceptCash,
    acceptStripe,
    stripePreference,
    stripeConnectReady: connectReady,
    stripeOnboardingComplete: !!salon?.stripeConnect?.onboardingComplete,
    stripeChargesEnabled: !!salon?.stripeConnect?.chargesEnabled,
    salonName: salon?.name || "",
  };
}

module.exports = {
  getPlatformStripe,
  getCurrency,
  computeApplicationFeeCents,
  salonStripeReady,
  salonPaymentOptions,
  salonProductPaymentOptions,
  syncConnectAccountStatus,
  ensureConnectAccount,
  createConnectAccountLink,
  createBookingPaymentIntent,
  createProductPaymentIntent,
};
