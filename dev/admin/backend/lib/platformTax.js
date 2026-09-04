/**
 * Platform VAT/tax from admin settings.
 * Tax may be 0 — never treat 0 as "missing" (`if (!tax)` is wrong).
 */
function getPlatformTax() {
  const raw =
    global.settingJSON != null ? global.settingJSON.tax : undefined;
  const tax = Number(raw);
  return Number.isFinite(tax) && tax >= 0 ? tax : 0;
}

function hasPlatformSettings() {
  return global.settingJSON != null && typeof global.settingJSON === "object";
}

module.exports = { getPlatformTax, hasPlatformSettings };
