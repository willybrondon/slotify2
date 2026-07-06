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

/** When false, salons can accept bookings without prepaid wallet / commission debit (launch mode). */
function isSalonWalletCommissionEnabled(setting) {
  const s = setting || global.settingJSON || {};
  return s.isSalonWalletRecharge === true;
}

function computeExpectedPlatformFee(salon, setting, servicePriceWithoutTax) {
  const commissionPercent = resolveSalonCommissionPercent(salon, setting);
  const base = parseFloat(servicePriceWithoutTax) || 0;
  return (commissionPercent * base) / 100;
}

/**
 * Skedisy commission is always prepaid from salon.wallet (never deducted from client card payment).
 */
function computeRequiredSalonWalletBalance({ salon, setting, servicePriceWithoutTax }) {
  if (!isSalonWalletCommissionEnabled(setting)) return 0;
  const minBalance = resolveMinWalletBalance(salon, setting);
  const expectedPlatformFee = computeExpectedPlatformFee(salon, setting, servicePriceWithoutTax);
  return minBalance + expectedPlatformFee;
}

function shouldDebitSalonWalletForCommission(setting) {
  return isSalonWalletCommissionEnabled(setting);
}

module.exports = {
  isSalonWalletCommissionEnabled,
  resolveSalonCommissionPercent,
  resolveMinWalletBalance,
  computeExpectedPlatformFee,
  computeRequiredSalonWalletBalance,
  shouldDebitSalonWalletForCommission,
};
