/**
 * Afro quote engine (SQUIRE wedge V1) — règles salon, pas de ML.
 *
 * answers.addons = ['curly_ends', ...] — selected add-on ids
 * Add-ons from afroConfig.addonDefs or entry.detailCard.addons
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
  const hasVal = val !== undefined && val !== null && val !== "";
  if (when.notEquals !== undefined && when.notEquals !== null) {
    return hasVal && String(val) !== String(when.notEquals);
  }
  if (when.equals === undefined || when.equals === null) {
    return hasVal;
  }
  return String(val) === String(when.equals);
}

function fieldIsVisible(field, answers) {
  if (!field || !field.showWhen) return true;
  return ruleMatches(field.showWhen, answers);
}

function normalizeAddonList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a, i) => ({
      id: String(a.id || a._id || `addon_${i + 1}`),
      label: String(a.label || a.name || a.id || `Option ${i + 1}`),
      addPrice: Number(a.addPrice) || 0,
      addMinutes: Number(a.addMinutes) || 0,
      prepNote: a.prepNote ? String(a.prepNote) : "",
    }))
    .filter((a) => a.id);
}

function resolveAddonCatalog(entry, afro) {
  const fromAfro = normalizeAddonList(afro?.addonDefs);
  if (fromAfro.length) return fromAfro;
  return normalizeAddonList(entry?.detailCard?.addons);
}

function selectedAddonIds(answers) {
  const raw = answers?.addons;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function computeQuote({ salon, service, serviceId, answers = {}, photoUrls = [], skipRequired = false }) {
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
  const softSkip =
    skipRequired ||
    answers?._skipPrecision === true ||
    answers?._skipPrecision === "true";

  for (const field of schema) {
    if (softSkip) break;
    if (!field.required) continue;
    if (!fieldIsVisible(field, answers)) continue;
    const v = answers[field.id];
    if (v === undefined || v === null || v === "") {
      return { ok: false, error: `Missing required field: ${field.id}` };
    }
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

  const catalog = resolveAddonCatalog(entry, afro);
  const chosen = selectedAddonIds(answers);
  const appliedAddons = [];
  for (const id of chosen) {
    const def = catalog.find((a) => a.id === id);
    if (!def) continue;
    if (def.addPrice) {
      price += def.addPrice;
      priceBreakdown.push({ label: def.label, amount: def.addPrice });
    }
    if (def.addMinutes) {
      duration += def.addMinutes;
      durationBreakdown.push({ label: def.label, minutes: def.addMinutes });
    }
    appliedAddons.push(def);
  }

  const prepBuffer = Math.max(0, Number(afro.prepBufferMinutes) || 0);
  if (prepBuffer > 0) {
    duration += prepBuffer;
    durationBreakdown.push({ label: "Buffer préparation", minutes: prepBuffer });
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
    !softSkip &&
    (tier === "S3" || Boolean(afro.requirePhoto && (!photoUrls || !photoUrls.length)));

  const materials = afro.materials || entry?.detailCard?.materials || null;

  return {
    ok: true,
    needsSalonReview,
    quote: {
      complexityTier: tier,
      estimatedPrice: price,
      estimatedDurationMinutes: duration,
      priceBreakdown,
      durationBreakdown,
      appliedAddons,
      availableAddons: catalog,
      materials,
      depositAmount,
      depositStatus,
      balanceDue: Math.max(0, price - depositAmount),
      configSnapshot: {
        afroConfig: afro,
        basePrice,
        serviceName: service?.name || "",
        addons: chosen,
      },
    },
  };
}

const KNOTLESS_S2_DEMO_CONFIG = {
  complexityTier: "S2",
  requirePhoto: false,
  baseDurationMinutes: 240,
  prepBufferMinutes: 0,
  styleLifetimeWeeks: 7,
  rebookRemindersEnabled: true,
  materials: {
    salonProvides: true,
    clientBrings: false,
    packs: "6 paquets (réf. salon)",
    note: "Si cliente apporte les mèches : indiquer couleur / quantité.",
  },
  configSchema: [
    {
      id: "longueur",
      label: "Longueur souhaitée",
      type: "select",
      options: ["épaule", "mi-dos", "taille", "fesses"],
      required: true,
      affectsPrice: true,
      affectsDuration: true,
    },
    {
      id: "finesse_nattes",
      label: "Finesse des nattes",
      type: "select",
      options: ["fines", "moyennes", "grosses"],
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
      id: "meches_couleur",
      label: "Couleur des mèches",
      type: "select",
      options: [
        "Noir naturel",
        "1B",
        "Brun",
        "Blond / 613",
        "Rouge / bordeaux",
        "Orange / cuivré",
        "Bleu",
        "Vert",
        "Rose / violet",
        "Mélange / ombré",
        "Autre",
      ],
      required: false,
      affectsPrice: true,
      affectsDuration: false,
      showWhen: { variableId: "meches_qui", equals: "salon" },
    },
  ],
  addonDefs: [
    { id: "curly_ends", label: "Curly ends", addPrice: 30, addMinutes: 30 },
    { id: "human_hair", label: "Human hair", addPrice: 80, addMinutes: 15 },
    { id: "takedown", label: "Takedown", addPrice: 45, addMinutes: 45 },
    { id: "lavage", label: "Lavage", addPrice: 20, addMinutes: 20 },
  ],
  pricingRules: [
    { when: { variableId: "longueur", equals: "taille" }, addPrice: 20, label: "Longueur taille" },
    { when: { variableId: "longueur", equals: "fesses" }, addPrice: 40, label: "Longueur fesses" },
    { when: { variableId: "finesse_nattes", equals: "fines" }, addPrice: 30, label: "Nattes fines" },
    { when: { variableId: "meches_qui", equals: "salon" }, addPrice: 50, label: "Mèches salon" },
    {
      when: { variableId: "meches_couleur", notEquals: "Noir naturel" },
      addPrice: 15,
      label: "Couleur mèches",
    },
  ],
  durationRules: [
    { when: { variableId: "longueur", equals: "taille" }, addMinutes: 30, label: "+ longueur" },
    { when: { variableId: "longueur", equals: "fesses" }, addMinutes: 60, label: "+ longueur" },
    { when: { variableId: "finesse_nattes", equals: "fines" }, addMinutes: 45, label: "+ nattes fines" },
  ],
  depositPolicy: { enabled: true, type: "percent", value: 30 },
};

/** Public detailCard seeded with Knotless demo (success checklist + addons) */
const KNOTLESS_DETAIL_CARD = {
  shortDescription:
    "Knotless braids — devis selon longueur, finesse et mèches. Options curly ends, human hair, takedown, lavage.",
  includes: ["Nattes knotless", "Finition soignée", "Conseils d’entretien"],
  prepMust: [
    "Cheveux lavés, séchés et démêlés (pas de gel / huile lourde)",
    "Si vous apportez les mèches : quantité et couleur OK (sinon le salon fournit)",
    "Confirmer / envoyer une photo d’inspiration",
    "Prévoir une durée longue (boisson, charge téléphone, repas léger)",
    "Arriver à l’heure (retard = impact créneau / finition)",
  ],
  prepAvoid: [
    "Huile, leave-in ou gel lourds la veille",
    "Arriver avec cheveux sales ou emmêlés",
    "Changer de modèle sans photo le jour J",
  ],
  inspirationPhotoEnabled: true,
  addons: [
    { id: "curly_ends", label: "Curly ends", addPrice: 30, addMinutes: 30 },
    { id: "human_hair", label: "Human hair", addPrice: 80, addMinutes: 15 },
    { id: "takedown", label: "Takedown", addPrice: 45, addMinutes: 45 },
    { id: "lavage", label: "Lavage", addPrice: 20, addMinutes: 20 },
  ],
  materials: KNOTLESS_S2_DEMO_CONFIG.materials,
  prepFamilyId: "braids_knotless",
  depositPercent: 30,
  importantNote: "Créneau long : prévoir 4h+ selon longueur / finesse.",
};

module.exports = {
  getSalonServiceEntry,
  getAfroConfig,
  computeQuote,
  fieldIsVisible,
  ruleMatches,
  resolveAddonCatalog,
  normalizeAddonList,
  KNOTLESS_S2_DEMO_CONFIG,
  KNOTLESS_DETAIL_CARD,
};
