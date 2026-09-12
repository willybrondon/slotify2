/**
 * Afro quote engine (SQUIRE wedge V1) — règles salon, pas de ML.
 *
 * afroConfig on salon.serviceIds[]:
 * {
 *   complexityTier: 'S0'|'S1'|'S2'|'S3',
 *   requirePhoto: boolean,
 *   baseDurationMinutes?: number,
 *   configSchema: [{ id, label, type, options?, required?, affectsPrice?, affectsDuration? }],
 *   pricingRules: [{ when: { variableId, equals }, addPrice, label? }],
 *   durationRules: [{ when: { variableId, equals }, addMinutes, label? }],
 *   depositPolicy: { enabled, type: 'percent'|'fixed', value }
 * }
 */

function getSalonServiceEntry(salon, serviceId) {
  if (!salon || !salon.serviceIds) return null;
  const sid = String(serviceId);
  return salon.serviceIds.find((s) => String(s.id) === sid) || null;
}

function getAfroConfig(entry) {
  return (entry && entry.afroConfig) || null;
}

function ruleMatches(when, answers) {
  if (!when || !when.variableId) return false;
  const val = answers[when.variableId];
  if (when.equals === undefined || when.equals === null) {
    return val !== undefined && val !== null && val !== "";
  }
  return String(val) === String(when.equals);
}

/**
 * @returns {{ ok: boolean, error?: string, needsSalonReview?: boolean, quote?: object }}
 */
function computeQuote({ salon, service, serviceId, answers = {}, photoUrls = [] }) {
  const entry = getSalonServiceEntry(salon, serviceId);
  if (!entry) {
    return { ok: false, error: "Service not offered by this salon" };
  }

  const afro = getAfroConfig(entry) || {
    complexityTier: "S0",
    requirePhoto: false,
    configSchema: [],
    pricingRules: [],
    durationRules: [],
    depositPolicy: { enabled: false, type: "percent", value: 0 },
  };

  const tier = afro.complexityTier || "S0";
  const schema = Array.isArray(afro.configSchema) ? afro.configSchema : [];

  for (const field of schema) {
    if (!field.required) continue;
    const v = answers[field.id];
    if (v === undefined || v === null || v === "") {
      return { ok: false, error: `Missing required field: ${field.id}` };
    }
  }

  if (afro.requirePhoto && (!photoUrls || photoUrls.length === 0)) {
    // Soft: do not block reservation — salon can ask for photo via 1 question.
  }

  const basePrice = Number(entry.price);
  if (Number.isNaN(basePrice) || basePrice < 0) {
    return { ok: false, error: "Salon service price not configured" };
  }

  const baseDuration =
    Number(afro.baseDurationMinutes) > 0
      ? Number(afro.baseDurationMinutes)
      : Number(service?.duration) || 0;

  const priceBreakdown = [{ label: "Prix de base", amount: basePrice }];
  const durationBreakdown = [{ label: "Durée de base", minutes: baseDuration }];

  let price = basePrice;
  let duration = baseDuration;

  for (const rule of afro.pricingRules || []) {
    if (ruleMatches(rule.when, answers)) {
      const add = Number(rule.addPrice) || 0;
      price += add;
      priceBreakdown.push({
        label: rule.label || `Supplément ${rule.when?.variableId || ""}`,
        amount: add,
      });
    }
  }

  for (const rule of afro.durationRules || []) {
    if (ruleMatches(rule.when, answers)) {
      const add = Number(rule.addMinutes) || 0;
      duration += add;
      durationBreakdown.push({
        label: rule.label || `Temps + ${rule.when?.variableId || ""}`,
        minutes: add,
      });
    }
  }

  const depositPolicy = afro.depositPolicy || { enabled: false, type: "percent", value: 0 };
  let depositAmount = 0;
  let depositStatus = "not_required";
  if (depositPolicy.enabled && Number(depositPolicy.value) > 0) {
    if (depositPolicy.type === "fixed") {
      depositAmount = Math.min(Number(depositPolicy.value), price);
    } else {
      depositAmount = Math.round((price * Number(depositPolicy.value)) / 100);
    }
    depositStatus = "unpaid";
  }

  const needsSalonReview =
    tier === "S3" || Boolean(afro.requirePhoto && (!photoUrls || !photoUrls.length));

  return {
    ok: true,
    needsSalonReview,
    quote: {
      complexityTier: tier,
      estimatedPrice: price,
      estimatedDurationMinutes: duration,
      priceBreakdown,
      durationBreakdown,
      depositAmount,
      depositStatus,
      balanceDue: Math.max(0, price - depositAmount),
      configSnapshot: {
        afroConfig: afro,
        basePrice,
        serviceName: service?.name || "",
      },
    },
  };
}

/** Example Knotless S2 config for seeds / docs */
const KNOTLESS_S2_DEMO_CONFIG = {
  complexityTier: "S2",
  requirePhoto: false,
  baseDurationMinutes: 240,
  configSchema: [
    {
      id: "longueur",
      label: "Longueur",
      type: "select",
      options: ["épaule", "mi-dos", "taille", "fesses"],
      required: true,
      affectsPrice: true,
      affectsDuration: true,
    },
    {
      id: "taille",
      label: "Taille des nattes",
      type: "select",
      options: ["S", "M", "L"],
      required: true,
      affectsPrice: true,
      affectsDuration: true,
    },
    {
      id: "meches_qui",
      label: "Qui apporte les mèches ?",
      type: "select",
      options: ["cliente", "salon"],
      required: true,
      affectsPrice: true,
      affectsDuration: false,
    },
    {
      id: "couleur",
      label: "Couleur",
      type: "select",
      options: ["1B", "autre"],
      required: false,
      affectsPrice: true,
      affectsDuration: false,
    },
  ],
  pricingRules: [
    { when: { variableId: "longueur", equals: "taille" }, addPrice: 20, label: "Longueur taille" },
    { when: { variableId: "longueur", equals: "fesses" }, addPrice: 40, label: "Longueur fesses" },
    { when: { variableId: "taille", equals: "S" }, addPrice: 30, label: "Nattes S" },
    { when: { variableId: "meches_qui", equals: "salon" }, addPrice: 50, label: "Mèches salon" },
    { when: { variableId: "couleur", equals: "autre" }, addPrice: 15, label: "Couleur spéciale" },
  ],
  durationRules: [
    { when: { variableId: "longueur", equals: "taille" }, addMinutes: 30, label: "+ longueur" },
    { when: { variableId: "longueur", equals: "fesses" }, addMinutes: 60, label: "+ longueur" },
    { when: { variableId: "taille", equals: "S" }, addMinutes: 45, label: "+ nattes fines" },
  ],
  depositPolicy: { enabled: true, type: "percent", value: 30 },
};

module.exports = {
  getSalonServiceEntry,
  getAfroConfig,
  computeQuote,
  KNOTLESS_S2_DEMO_CONFIG,
};
