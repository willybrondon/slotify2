const { salonStripeReady } = require("./stripeConnect.service");

/** Commission % — per-salon `platformFee` first, then global setting */
function resolveSalonCommissionPercent(salon, setting) {
  if (salon?.platformFee != null && salon.platformFee !== "") {
    const salonFee = parseFloat(salon.platformFee);
    if (!Number.isNaN(salonFee)) return salonFee;
  }
  const globalFee =
    parseFloat(setting?.salonCommissionCharges) ||
    parseFloat(global.settingJSON?.salonCommissionCharges) ||
    0;
  return Number.isNaN(globalFee) ? 0 : globalFee;
}

/** Minimum wallet floor — per-salon override, else global admin default */
function resolveMinWalletBalance(salon, setting) {
  if (salon?.minWalletBalance != null && salon.minWalletBalance !== "") {
    const salonMin = parseFloat(salon.minWalletBalance);
    if (!Number.isNaN(salonMin)) return Math.max(0, salonMin);
  }
  const globalMin =
    parseFloat(setting?.minSalonWalletBalance) ||
    parseFloat(global.settingJSON?.minSalonWalletBalance) ||
    0;
  return Number.isNaN(globalMin) ? 0 : Math.max(0, globalMin);
}

function commissionCollectedViaStripeConnect(paymentType, salon) {
  return paymentType === "Stripe" && salonStripeReady(salon);
}

/** Stripe Connect collects Skedisy fee on the card flow — no prepaid salon wallet */
function shouldCheckSalonWalletPrepay(paymentType, salon) {
  return !commissionCollectedViaStripeConnect(paymentType, salon);
}

function computeExpectedPlatformFee(salon, setting, servicePriceWithoutTax) {
  const commissionPercent = resolveSalonCommissionPercent(salon, setting);
  const base = parseFloat(servicePriceWithoutTax) || 0;
  return (commissionPercent * base) / 100;
}

function computeRequiredSalonWalletBalance({ salon, setting, servicePriceWithoutTax, paymentType }) {
  if (!shouldCheckSalonWalletPrepay(paymentType, salon)) {
    return 0;
  }
  const minBalance = resolveMinWalletBalance(salon, setting);
  const expectedPlatformFee = computeExpectedPlatformFee(salon, setting, servicePriceWithoutTax);
  return minBalance + expectedPlatformFee;
}

function shouldDebitSalonWalletForCommission(paymentType, salon) {
  return !commissionCollectedViaStripeConnect(paymentType, salon);
}

module.exports = {
  resolveSalonCommissionPercent,
  resolveMinWalletBalance,
  commissionCollectedViaStripeConnect,
  shouldCheckSalonWalletPrepay,
  computeExpectedPlatformFee,
  computeRequiredSalonWalletBalance,
  shouldDebitSalonWalletForCommission,
};
