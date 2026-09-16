/**
 * Prep checklists by service family — from negative-review patterns
 * (mèches/qualité, durée, malentendu résultat, prep insuffisante, retard).
 * Max 5 prepMust / prepAvoid per family.
 */

const PREP_FAMILIES = [
  {
    id: "braids_knotless",
    label: "Knotless / box braids / vanilles / goddess",
    keywords: [
      "knotless",
      "box braid",
      "boxbraid",
      "vanille",
      "goddess",
      "fulani",
      "braids",
      "tresse",
      "nattes",
      "lemonade",
    ],
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
  },
  {
    id: "cornrows",
    label: "Cornrows / nattes collées / feed-in",
    keywords: ["cornrow", "feed-in", "feed in", "nattes collées", "collées", "ghana"],
    prepMust: [
      "Cheveux propres, démêlés, sans croûtes de produit",
      "Longueur / densité réalistes pour le modèle choisi",
      "Photo du rendu souhaité",
      "Pas d’huile lourde la veille",
      "Arriver à l’heure",
    ],
    prepAvoid: [
      "Huile ou leave-in lourd la veille",
      "Cheveux emmêlés",
      "Changer de modèle sans photo le jour J",
    ],
  },
  {
    id: "twists",
    label: "Twists / passion twists / senegalese",
    keywords: [
      "twist",
      "passion",
      "senegalese",
      "sénégalais",
      "marley",
      "spring twist",
    ],
    prepMust: [
      "Cheveux lavés et démêlés",
      "Mèches (si vous apportez) : type et couleur validés",
      "Photo d’inspiration",
      "Prévoir plusieurs heures",
      "Pas de leave-in collant avant le RDV",
    ],
    prepAvoid: [
      "Leave-in ou gel collant juste avant",
      "Huile lourde la veille",
      "Arriver en retard",
    ],
  },
  {
    id: "takedown",
    label: "Takedown / dépose tresses",
    keywords: ["takedown", "take down", "dépose", "depose", "enlèvement", "enlever tresses"],
    prepMust: [
      "Ne pas forcer la dépose seule si nœuds ou douleur",
      "Signaler démangeaisons ou casse déjà présentes",
      "Cheveux secs (sauf consigne contraire du salon)",
      "Prévoir le temps + éventuellement un lavage après",
      "Photo de l’état actuel si nœuds / mèches collées",
    ],
    prepAvoid: [
      "Couper ou tirer agressivement avant le RDV",
      "Huile lourde juste avant (sauf consigne salon)",
    ],
  },
  {
    id: "locks",
    label: "Locks / retwist / entretien",
    keywords: ["lock", "locs", "retwist", "re-twist", "dread", "entretien lock"],
    prepMust: [
      "Locks propres selon consigne salon (souvent lavées X jours avant)",
      "Pas d’huile lourde juste avant (glisse / tenue)",
      "Indiquer l’âge des locks et le dernier entretien",
      "Photo si reprise ou réparation",
      "Arriver à l’heure (créneaux d’entretien serrés)",
    ],
    prepAvoid: [
      "Huile lourde juste avant le RDV",
      "Laver le jour même si le salon l’interdit",
      "Arriver en retard",
    ],
  },
  {
    id: "extensions",
    label: "Extensions / tissage / weave",
    keywords: [
      "extension",
      "tissage",
      "weave",
      "sew-in",
      "sewin",
      "mèches",
      "meches",
      "pose mèches",
    ],
    prepMust: [
      "Clarifier qui fournit les mèches / tissage (vous ou le salon)",
      "Cheveux de base propres et démêlés",
      "Photo du rendu et densité souhaitée",
      "Signaler allergie colle / sensibilité du cuir chevelu",
      "Arriver à l’heure — prep manquante = supplément ou report possible",
    ],
    prepAvoid: [
      "Apporter des mèches non validées par le salon",
      "Huile lourde la veille",
      "Arriver avec cheveux sales ou emmêlés",
    ],
  },
  {
    id: "wig_lace",
    label: "Perruque / lace / closure / frontal",
    keywords: [
      "perruque",
      "wig",
      "lace",
      "closure",
      "frontal",
      "frontale",
      "unit",
      "pose perruque",
    ],
    prepMust: [
      "Apporter la perruque / lace (ou confirmer que le salon la fournit)",
      "Cheveux sous-jacents préparés (tressés / plaqués selon consigne)",
      "Photo du rendu souhaité",
      "Indiquer pose glue ou glue-less",
      "Prévoir la durée réelle (souvent sous-estimée)",
    ],
    prepAvoid: [
      "Oublier la perruque / lace le jour J",
      "Changer de modèle sans photo",
      "Arriver en retard",
    ],
  },
  {
    id: "color",
    label: "Coloration / décoloration / balayage",
    keywords: [
      "coloration",
      "couleur",
      "décoloration",
      "decoloration",
      "balayage",
      "bleach",
      "teinture",
      "highlight",
    ],
    prepMust: [
      "Cheveux non lavés 24–48 h si le salon le demande",
      "Photo de la couleur souhaitée + couleur actuelle",
      "Historique déco / lissage / henna",
      "Signaler allergies / test mèche déjà fait",
      "Prévoir le temps + éventuelle 2e séance",
    ],
    prepAvoid: [
      "Laver juste avant si le salon l’interdit",
      "Cacher un historique de décoloration",
      "Arriver en retard",
    ],
  },
  {
    id: "cut_care",
    label: "Coupe / soin / brushing",
    keywords: [
      "coupe",
      "cut",
      "soin",
      "brushing",
      "shampooing",
      "masque",
      "hydrat",
      "coiffure",
    ],
    prepMust: [
      "Cheveux lavés ou non selon consigne du salon",
      "Photo coupe / longueur cible",
      "Signaler casse ou zones sensibles",
      "Produits perso uniquement si le salon l’accepte",
      "Arriver à l’heure",
    ],
    prepAvoid: [
      "Produits gras non demandés juste avant",
      "Arriver en retard",
    ],
  },
  {
    id: "barber",
    label: "Barber / homme",
    keywords: [
      "barber",
      "fade",
      "barbe",
      "beard",
      "rasage",
      "homme",
      "garçon",
      "kids boy",
      "boys",
    ],
    prepMust: [
      "Cheveux propres (ou selon consigne)",
      "Photo coupe / fade",
      "Indiquer zones à éviter (boutons, cicatrices)",
      "Arriver à l’heure (créneaux courts)",
      "Pas de produit gras juste avant si fade net demandé",
    ],
    prepAvoid: [
      "Produit gras juste avant un fade",
      "Arriver en retard",
    ],
  },
  {
    id: "default",
    label: "Prestation générale",
    keywords: [],
    prepMust: [
      "Suivre les consignes du salon pour cette prestation",
      "Confirmer le rendu (photo si possible)",
      "Arriver à l’heure",
      "Signaler allergies ou sensibilités",
      "Prévoir la durée indiquée sur la fiche",
    ],
    prepAvoid: [
      "Huile ou produits lourds non demandés",
      "Arriver en retard",
      "Changer d’attente sans prévenir",
    ],
  },
];

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function detectPrepFamilyId(serviceName = "", categoryName = "") {
  const hay = `${normalize(serviceName)} ${normalize(categoryName)}`;
  // Prefer more specific families first (order in PREP_FAMILIES after default)
  for (const fam of PREP_FAMILIES) {
    if (fam.id === "default") continue;
    if (fam.keywords.some((kw) => hay.includes(normalize(kw)))) {
      return fam.id;
    }
  }
  return "default";
}

function getPrepFamily(familyId) {
  return (
    PREP_FAMILIES.find((f) => f.id === familyId) ||
    PREP_FAMILIES.find((f) => f.id === "default")
  );
}

function suggestPrep(serviceName, categoryName, familyId = null) {
  const id = familyId || detectPrepFamilyId(serviceName, categoryName);
  const fam = getPrepFamily(id);
  return {
    familyId: fam.id,
    familyLabel: fam.label,
    prepMust: (fam.prepMust || []).slice(0, 5),
    prepAvoid: (fam.prepAvoid || []).slice(0, 5),
  };
}

/**
 * Merge salon detailCard with template fallback when prep lists are empty.
 */
function resolveDetailCardPrep(serviceName, categoryName, detailCard) {
  const card =
    detailCard && typeof detailCard === "object" ? { ...detailCard } : {};
  const hasMust = Array.isArray(card.prepMust) && card.prepMust.length > 0;
  const hasAvoid = Array.isArray(card.prepAvoid) && card.prepAvoid.length > 0;
  if (hasMust && hasAvoid) {
    return {
      ...card,
      prepMust: card.prepMust.slice(0, 5),
      prepAvoid: card.prepAvoid.slice(0, 5),
      prepFromTemplate: false,
    };
  }
  const suggested = suggestPrep(serviceName, categoryName);
  return {
    ...card,
    prepMust: hasMust ? card.prepMust.slice(0, 5) : suggested.prepMust,
    prepAvoid: hasAvoid ? card.prepAvoid.slice(0, 5) : suggested.prepAvoid,
    prepFromTemplate: !hasMust || !hasAvoid,
    prepFamilyId: suggested.familyId,
  };
}

function listPrepFamilies() {
  return PREP_FAMILIES.map((f) => ({
    id: f.id,
    label: f.label,
    prepMust: f.prepMust.slice(0, 5),
    prepAvoid: f.prepAvoid.slice(0, 5),
  }));
}

module.exports = {
  PREP_FAMILIES,
  detectPrepFamilyId,
  getPrepFamily,
  suggestPrep,
  resolveDetailCardPrep,
  listPrepFamilies,
};
