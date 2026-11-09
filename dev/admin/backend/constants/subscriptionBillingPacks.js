/**
 * Blow Up–style commitment packs for salon SaaS billing.
 * Intro (discounted) price for the first period; compareAt = full renewal reference.
 */
const SUBSCRIPTION_BILLING_PACKS = [
  {
    packId: "1m",
    months: 1,
    label: "1 mois",
    price: 18.99,
    compareAt: 37.97,
    discountPct: 50,
    popular: false,
  },
  {
    packId: "3m",
    months: 3,
    label: "3 mois",
    price: 29.99,
    compareAt: 74.97,
    discountPct: 60,
    popular: true,
  },
  {
    packId: "12m",
    months: 12,
    label: "12 mois",
    price: 69.99,
    compareAt: 149.97,
    discountPct: 53,
    popular: false,
  },
];

function getBillingPack(packId) {
  const id = String(packId || "").toLowerCase().trim();
  return SUBSCRIPTION_BILLING_PACKS.find((p) => p.packId === id) || null;
}

module.exports = {
  SUBSCRIPTION_BILLING_PACKS,
  getBillingPack,
};
