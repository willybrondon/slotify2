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
  const acceptStripe = globalStripe && salonStripeReady(salon);
  return {
    acceptCash,
    acceptStripe,
    stripeConnectReady: acceptStripe,
    stripeOnboardingComplete: !!salon?.stripeConnect?.onboardingComplete,
    stripeChargesEnabled: !!salon?.stripeConnect?.chargesEnabled,
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

async function ensureConnectAccount(salon) {
  const stripeClient = getPlatformStripe();
  if (salon.stripeConnect?.accountId) {
    return syncConnectAccountStatus(salon);
  }

  const account = await stripeClient.accounts.create({
    type: "express",
    country: (salon.addressDetails?.country || "FR").slice(0, 2).toUpperCase() || "FR",
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
  const applicationFeeAmount = computeApplicationFeeCents(withoutTax, salon);

  if (applicationFeeAmount >= stripeAmount) {
    throw new Error("Commission amount exceeds payment total.");
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: stripeAmount,
    currency,
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: salon.stripeConnect.accountId,
    },
    automatic_payment_methods: { enabled: true },
    metadata: {
      source: "skedisy_booking",
      salonId: salon._id.toString(),
      ...metadata,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    applicationFeeAmount,
    publishableKey: (global.settingJSON?.stripePublishableKey || "").trim(),
  };
}

module.exports = {
  getPlatformStripe,
  getCurrency,
  computeApplicationFeeCents,
  salonStripeReady,
  salonPaymentOptions,
  syncConnectAccountStatus,
  ensureConnectAccount,
  createConnectAccountLink,
  createBookingPaymentIntent,
};
