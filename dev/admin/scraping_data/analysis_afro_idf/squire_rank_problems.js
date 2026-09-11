/**
 * Analyse type SQUIRE — ranking problèmes structurels salons afro IDF
 * Sample: 26 salons afro-pertinents + preuves publiques.
 * Scores: privilégier "je paierais pour ça" côté pro, pas le sexy tech.
 * Confiance basse = problème plausible mais peu prouvé dans le sample → pénalisé au rang.
 */

const fs = require("fs");
const path = require("path");
const OUT = __dirname;
const N = 26;

/**
 * Scoring guide (0-10):
 * gravite: douleur ops / perte $ / risque réputation si non résolu
 * frequence: combien de fois ça arrive / structurel vs ponctuel
 * impact_eco: perte directe (no-show, reprise, temps staff) — estimatif
 * difficulte_actuelle: effort manuel actuel
 * potentiel_skedisy: willingness-to-pay × différenciation vs Planity/WA
 * confiance: solidité des preuves dans NOTRE sample (pas intuition marché)
 */

const CATEGORIES = {
  1: "Acquisition",
  2: "Réservation",
  3: "Qualification de la cliente",
  4: "WhatsApp / Instagram / DM",
  5: "Gestion des prestations",
  6: "Gestion du planning",
  7: "Durée réelle des prestations",
  8: "Prix et devis",
  9: "Acompte",
  10: "Annulation",
  11: "No-show",
  12: "Retard",
  13: "Gestion des clientes",
  14: "Fidélisation",
  15: "Réactivation",
  16: "Paiement",
  17: "Organisation des employés",
  18: "Gestion des coiffeuses indépendantes",
  19: "Gestion des mèches/produits",
  20: "Avis/réputation",
  21: "Communication avec la cliente",
  22: "Autres problèmes spécifiques à la coiffure afro",
};

/** @type {Array<object>} */
const PROBLEMS = [
  {
    id: "P01",
    categories: [3, 5, 22],
    probleme: "Impossible de confirmer automatiquement une prestation afro complexe sans qualification (texture, longueur, mèches fournies?, style exact, photo)",
    preuves: [
      "Nixya: prestations *** exigent contact manuel (nixya.fr)",
      "Nouche Planity: catalogue très granulaire + suppléments masse/longueur/volume",
      "CindyFashion: formulaire date/heure puis confirmation humaine",
    ],
    salons_concernes: 20,
    note_comptage: "Proxy: salons sans self-serve complet OU catalogue complexe OU confirm-later — ~20/26 (téléphone/CTA/form/WA dominant). Confiance moyenne.",
    gravite: 9,
    frequence: 9,
    impact_eco: 8,
    difficulte_actuelle: 9,
    outils: "Planity (menus plats), WhatsApp, téléphone, formulaire site",
    pourquoi_pas_resolu:
      "Planity/Fresha/Booksy vendent des créneaux sur une liste de services; ils ne modélisent pas le diagnostic afro (photo, mèches, état du cheveu). WhatsApp résout au prix du chaos ops.",
    confiance: "élevé",
    confiance_score: 8,
    wtp: 10,
  },
  {
    id: "P02",
    categories: [7, 6, 5],
    probleme: "La durée réelle des prestations (tresses/locks/extensions) déborde le créneau théorique → planning en accordéon",
    preuves: [
      "Planity Nouche: box braids 4h, twists jusqu'à 4h20, extensions 3–4h",
      "CindyFashion livre d'or: 3h30 pour tresses longues",
      "Suppléments durée liés à masse/longueur listés chez Nouche",
    ],
    salons_concernes: 18,
    note_comptage: "Proxy structurel pour tout salon proposant tresses/locks/extensions (majorité du sample afro). Preuves directes sur 2–3 salons leaders.",
    gravite: 9,
    frequence: 8,
    impact_eco: 9,
    difficulte_actuelle: 8,
    outils: "Planity durées fixes, WhatsApp négociations, walk-in",
    pourquoi_pas_resolu:
      "Les SaaS généralistes fixent une durée catalogue. En afro, la durée dépend de variables cliente non capturées à la réservation → retards en chaîne toute la journée.",
    confiance: "élevé",
    confiance_score: 8,
    wtp: 10,
  },
  {
    id: "P03",
    categories: [8, 16, 21],
    probleme: "Prix final imprévisible (suppléments, devis, écart vs prix annoncé)",
    preuves: [
      "Avis Planity Nouche: +20€ pour la même prestation un mois après",
      "Planity: nombreuses lignes « sur devis » / « à partir de » / mèches non fournies",
      "CindyFashion: témoignage « onéreux »; tarifs peu visibles hors appel",
    ],
    salons_concernes: 15,
    note_comptage: "Preuves fortes sur leaders; proxy large car catalogues afro souvent variables.",
    gravite: 8,
    frequence: 7,
    impact_eco: 8,
    difficulte_actuelle: 7,
    outils: "Planity prix catalogue, téléphone, devis oral",
    pourquoi_pas_resolu:
      "Afficher un prix Planity ne verrouille pas le devis réel (longueur, mèches, état). Les surprises tarifaires restent un litige classique.",
    confiance: "élevé",
    confiance_score: 8,
    wtp: 9,
  },
  {
    id: "P04",
    categories: [2, 21],
    probleme: "Réservation non instantanée / confirmation manuelle (file d'attente humaine)",
    preuves: [
      "CindyFashion: « nous vous contacterons pour confirmer »",
      "~15–20/26 sans widget booking détecté → téléphone/CTA opaque",
      "Nixya: orientation contact pour cas complexes",
    ],
    salons_concernes: 18,
    note_comptage: "Crawl: majorité sans Planity/Fresha/Calendly; 1 formulaire confirm-later explicite.",
    gravite: 8,
    frequence: 8,
    impact_eco: 7,
    difficulte_actuelle: 8,
    outils: "Formulaire, téléphone, DM, WhatsApp",
    pourquoi_pas_resolu:
      "Planity résout pour les salons qui l'adoptent ET dont les prestations sont bookables. Beaucoup n'y mettent pas les prestations afro complexes → le tunnel reste manuel.",
    confiance: "élevé",
    confiance_score: 9,
    wtp: 8,
  },
  {
    id: "P05",
    categories: [4, 2, 21],
    probleme: "WhatsApp / DM comme couche ops de réservation (inbox non structurée)",
    preuves: [
      "WhatsApp public détecté: Nixya, Jenny & Paola",
      "Instagram links fréquents sur sites (6+)",
      "Secteur: CGU hors-sample (Shine Hair, Basch) montrent réservation via IG/mail + acompte — pattern marché",
    ],
    salons_concernes: 12,
    note_comptage: "Preuve directe WA: 2. Proxy IG/téléphone comme canal principal: plus large. Confiance moyenne sur le volume exact.",
    gravite: 8,
    frequence: 8,
    impact_eco: 8,
    difficulte_actuelle: 9,
    outils: "WhatsApp, Instagram DM, téléphone",
    pourquoi_pas_resolu:
      "WhatsApp n'est pas un PMS: pas d'état RDV, pas d'acompte natif, pas de durée, pas de no-show analytics. Planity n'absorbe pas les salons qui restent sur DM pour qualifier.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 9,
  },
  {
    id: "P06",
    categories: [9, 11, 10],
    probleme: "Politique d'acompte absente ou non visible → exposition no-show / annulation tardive",
    preuves: [
      "0/26 avec extrait acompte clair sur HTML crawlé du sample",
      "Hors sample (contexte marché): Namani 50%, Shine Hair 20€ Stripe — prouve que les leaders afro formalisent l'acompte quand ils structurent",
      "Planity support: prépaiement optionnel — pas universel",
    ],
    salons_concernes: 22,
    note_comptage: "Absence sur page ≠ absence en salon. Compte les salons sans politique publique claire. Confiance moyenne.",
    gravite: 8,
    frequence: 7,
    impact_eco: 9,
    difficulte_actuelle: 6,
    outils: "Virement/WA (non vérifié), Planity prépaiement (si activé), rien de visible",
    pourquoi_pas_resolu:
      "Planity peut prépayer mais beaucoup de salons afro ne l'activent pas ou ne bookent pas les prestations chères en ligne. WA ne sécurise pas l'acompte de façon standard.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 9,
  },
  {
    id: "P07",
    categories: [22, 20, 3],
    probleme: "Risque technique élevé (dommages capillaires / résultat ≠ attente) faute de briefing pré-RDV",
    preuves: [
      "Avis négatifs publics Nouche & CindyFashion (annuaires) sur cheveux brûlés / déception",
      "Queen Lace insiste sur diagnostic — signal que le risque est central au positionnement",
    ],
    salons_concernes: 10,
    note_comptage: "Preuves d'incidents sur 2 salons; risque structurel pour lissages/défrisages/colorations afro. Confiance moyenne.",
    gravite: 9,
    frequence: 5,
    impact_eco: 8,
    difficulte_actuelle: 7,
    outils: "Conseil oral, avis Google, diagnostic marketing",
    pourquoi_pas_resolu:
      "Aucun booking généraliste n'impose un consentement/checklist contre-indications + photos avant un lissage/défrisage.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 8,
  },
  {
    id: "P08",
    categories: [6, 12, 2],
    probleme: "Walk-in + RDV mélangés → files d'attente et retards en cascade",
    preuves: ["CindyFashion: « Avec ou sans rendez-vous » affiché"],
    salons_concernes: 4,
    note_comptage: "1 preuve explicite; pratique courante secteur mais peu documentée ici → confiance faible sur le %.",
    gravite: 6,
    frequence: 6,
    impact_eco: 6,
    difficulte_actuelle: 7,
    outils: "Accueil physique, téléphone",
    pourquoi_pas_resolu: "Planity ne gère pas une file walk-in afro parallèle au RDV long.",
    confiance: "faible",
    confiance_score: 4,
    wtp: 6,
  },
  {
    id: "P09",
    categories: [2, 6],
    probleme: "Fragmentation multi-outils (Planity + Treatwell + site + téléphone)",
    preuves: ["Queen Lace: Planity + Treatwell + Google notes affichées ensemble"],
    salons_concernes: 3,
    note_comptage: "Preuve claire sur 1–3 salons digitalisés. Plus rare chez les petits.",
    gravite: 5,
    frequence: 4,
    impact_eco: 5,
    difficulte_actuelle: 6,
    outils: "Planity, Treatwell",
    pourquoi_pas_resolu: "Chaque marketplace pousse son inventaire; pas d'agenda unique vertical.",
    confiance: "élevé",
    confiance_score: 7,
    wtp: 5,
  },
  {
    id: "P10",
    categories: [19, 8, 5],
    probleme: "Mèches / extensions « non fournies » — logistique cliente + devis flou",
    preuves: [
      "Planity Nouche: extensions « mèches non fournies » vs « avec mèches fournies » (écarts 400→700€)",
      "Pattern prestation afro: la cliente apporte souvent les mèches",
    ],
    salons_concernes: 12,
    note_comptage: "Preuve catalogue Nouche; extrapolé aux salons tissage/extensions. Confiance moyenne.",
    gravite: 7,
    frequence: 7,
    impact_eco: 7,
    difficulte_actuelle: 7,
    outils: "Mention catalogue, WhatsApp « apporte tes mèches »",
    pourquoi_pas_resolu: "Booking généraliste ne gère pas stock mèches / validation photo des mèches cliente.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 8,
  },
  {
    id: "P11",
    categories: [20, 1],
    probleme: "Réputation dépend d'avis extrêmes (très volume + quelques avis catastrophes)",
    preuves: [
      "Nouche: notes élevées + avis dommages/prix",
      "Queen Lace affiche multi-scores Planity/Treatwell/Google",
    ],
    salons_concernes: 8,
    note_comptage: "Observable sur leaders digitaux; pas audit exhaustif des 26.",
    gravite: 7,
    frequence: 5,
    impact_eco: 7,
    difficulte_actuelle: 5,
    outils: "Google, Planity reviews",
    pourquoi_pas_resolu: "Les plateformes collectent des avis mais ne réduisent pas la cause (qualification/prestation à risque).",
    confiance: "moyen",
    confiance_score: 5,
    wtp: 6,
  },
  {
    id: "P12",
    categories: [1, 21],
    probleme: "Incohérence canaux d'acquisition (site vs Planity vs annuaire vs téléphone)",
    preuves: [
      "Nouche: site crawl ≠ Planity (booking ailleurs)",
      "MCB: « ne publie pas ses tarifs, appelle » alors que Planity a des prix",
    ],
    salons_concernes: 10,
    note_comptage: "Plusieurs salons avec site partiel / URL morte / annuaire.",
    gravite: 5,
    frequence: 6,
    impact_eco: 5,
    difficulte_actuelle: 5,
    outils: "Site, GMB, Planity, annuaires",
    pourquoi_pas_resolu: "Chaque outil est un silo; pas de source de vérité salon.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 5,
  },
  {
    id: "P13",
    categories: [11],
    probleme: "No-show sur créneaux longs (2–4h+) — coût d'opportunité élevé",
    preuves: [
      "Pas de mesure no-show dans le sample",
      "Acompte souvent invisible → proxy de vulnérabilité",
      "Durées longues documentées → coût théorique élevé si no-show",
    ],
    salons_concernes: 20,
    note_comptage: "HYPOTHÈSE structurelle forte mais NON MESURÉE dans nos données. Confiance faible sur le volume.",
    gravite: 9,
    frequence: 6,
    impact_eco: 10,
    difficulte_actuelle: 7,
    outils: "Acompte informel?, Planity prépaiement optionnel, rappel SMS?",
    pourquoi_pas_resolu: "Sans acompte + qualification, le no-show sur 4h de box braids est ruinously costly; WA ne tracke pas.",
    confiance: "faible",
    confiance_score: 3,
    wtp: 10,
  },
  {
    id: "P14",
    categories: [10, 12],
    probleme: "Annulation / retard: règles peu formalisées publiquement",
    preuves: [
      "1 seul signal annulation visible dans crawl sample",
      "Hors sample Namani: règles retard 10/20 min + confirmation SMS — montre le besoin",
    ],
    salons_concernes: 20,
    note_comptage: "Absence de policy publique dominante. Confiance moyenne.",
    gravite: 6,
    frequence: 6,
    impact_eco: 6,
    difficulte_actuelle: 6,
    outils: "Oral, WhatsApp, Planity policy si activée",
    pourquoi_pas_resolu: "Policies Planity existent mais adoption/visibilité faible sur salons afro du sample.",
    confiance: "moyen",
    confiance_score: 5,
    wtp: 6,
  },
  {
    id: "P15",
    categories: [13, 14, 15],
    probleme: "Pas de CRM cliente visible (historique textures, styles, mèches, allergies)",
    preuves: ["Aucune fiche publique n'expose un espace cliente / historique"],
    salons_concernes: 24,
    note_comptage: "Inféré par absence d'outil — confiance faible (peut exister en back-office).",
    gravite: 6,
    frequence: 5,
    impact_eco: 5,
    difficulte_actuelle: 6,
    outils: "Mémoire staff, WhatsApp threads, Planity clients basique",
    pourquoi_pas_resolu: "CRM générique ne capture pas les champs afro (porosité, historique lissage, locks stage).",
    confiance: "faible",
    confiance_score: 3,
    wtp: 7,
  },
  {
    id: "P16",
    categories: [17, 18],
    probleme: "Organisation multi-coiffeuses / indépendantes sur prestations longues",
    preuves: ["Planity Nouche liste plusieurs collaborateurs", "Pas de preuve de modèle indépendant dans sample"],
    salons_concernes: 8,
    note_comptage: "Peu de preuves. Confiance faible.",
    gravite: 6,
    frequence: 5,
    impact_eco: 6,
    difficulte_actuelle: 7,
    outils: "Planity staff, WhatsApp groupe",
    pourquoi_pas_resolu: "Scheduling générique ignore le couplage coiffeuse↔spécialité (locks vs lace).",
    confiance: "faible",
    confiance_score: 3,
    wtp: 7,
  },
  {
    id: "P17",
    categories: [22, 5],
    probleme: "Taxonomie de prestations afro non standardisée (mêmes styles, noms différents)",
    preuves: [
      "Nouche: twists, cornrows, box braids, nattes, locks crochet…",
      "Nixya: vanille, crochets braids, nattes collées…",
      "CindyFashion: crochet braid, tissage, dreadlocks…",
    ],
    salons_concernes: 20,
    note_comptage: "Observable dès qu'un catalogue existe.",
    gravite: 6,
    frequence: 8,
    impact_eco: 5,
    difficulte_actuelle: 7,
    outils: "Menus maison, Planity free-text",
    pourquoi_pas_resolu: "Les marketplaces n'imposent pas une ontologie afro → mauvaise matching cliente/service.",
    confiance: "élevé",
    confiance_score: 8,
    wtp: 7,
  },
  {
    id: "P18",
    categories: [1],
    probleme: "Dépendance Google/annuaires sans conversion digitale contrôlée",
    preuves: ["Beaucoup de fiches téléphone-only", "Sites down / frmaps / Pinterest comme « website »"],
    salons_concernes: 14,
    note_comptage: "Crawl: sites KO ou non bookables fréquents.",
    gravite: 6,
    frequence: 7,
    impact_eco: 6,
    difficulte_actuelle: 5,
    outils: "Google Business, téléphone",
    pourquoi_pas_resolu: "GMB amène l'appel; n'optimise pas la conversion ni la qualification.",
    confiance: "moyen",
    confiance_score: 6,
    wtp: 6,
  },
  {
    id: "P19",
    categories: [16],
    probleme: "Paiement final en salon sans lien avec le devis digital",
    preuves: ["Pas de preuve de caisse connectée dans sample", "Écarts prix documentés"],
    salons_concernes: 15,
    note_comptage: "Surtout inféré. Confiance faible.",
    gravite: 5,
    frequence: 6,
    impact_eco: 5,
    difficulte_actuelle: 5,
    outils: "Espèces/CB salon, Planity pay-in-store",
    pourquoi_pas_resolu: "Sans devis verrouillé amont, le paiement aval hérite du flou.",
    confiance: "faible",
    confiance_score: 3,
    wtp: 5,
  },
  {
    id: "P20",
    categories: [22, 7, 3],
    probleme: "Spécificité afro: la prestation est un projet (devis + supply mèches + 3–6h) pas une coupe 30 min",
    preuves: [
      "Durées et prix Planity Nouche (jusqu'à 700€ extensions)",
      "Parcours Queen Lace en 4 étapes (échange→diagnostic→rituel→routine)",
      "Formulaires/contact obligatoires pour cas complexes",
    ],
    salons_concernes: 22,
    note_comptage: "Problème méta structurel du vertical — haute confiance conceptuelle.",
    gravite: 10,
    frequence: 9,
    impact_eco: 9,
    difficulte_actuelle: 9,
    outils: "Adaptation bricolée de tools coupe-europeenne",
    pourquoi_pas_resolu:
      "SQUIRE a gagné en verticalisant le barbershop. Planity/Fresha restent des agendas beauté généralistes: ils underfit le workflow « projet capillaire afro ».",
    confiance: "élevé",
    confiance_score: 9,
    wtp: 10,
  },
  {
    id: "P21",
    categories: [14, 15],
    probleme: "Fidélisation / réactivation peu outillées (entretien locks, reprise tissage, retouches)",
    preuves: ["Aucune preuve d'automation reprise/entretien dans sample"],
    salons_concernes: 20,
    note_comptage: "Absence d'évidence ≠ absence totale. Confiance faible.",
    gravite: 5,
    frequence: 5,
    impact_eco: 6,
    difficulte_actuelle: 5,
    outils: "WhatsApp manuel, Google",
    pourquoi_pas_resolu: "Les CRM beauté génériques ne connaissent pas les cycles d'entretien afro.",
    confiance: "faible",
    confiance_score: 3,
    wtp: 6,
  },
];

function pct(n) {
  return Math.round((n / N) * 100);
}

function scoreComposite(p) {
  // Willingness-to-pay weighted ranking (SQUIRE lens)
  // Heavy confiance penalty: unproven pain cannot outrank evidenced structural pain
  const conf = p.confiance_score;
  const pot =
    p.wtp * 0.28 +
    p.impact_eco * 0.2 +
    p.gravite * 0.12 +
    p.frequence * 0.1 +
    p.difficulte_actuelle * 0.05 +
    conf * 0.25;
  return Math.round(pot * 10) / 10;
}

const ranked = PROBLEMS.map((p) => {
  const potentiel_skedisy = Math.min(
    10,
    Math.round((p.wtp * 0.6 + p.impact_eco * 0.25 + (10 - (p.confiance_score < 5 ? 3 : 0)) * 0.05) * 10) / 10
  );
  return {
    ...p,
    categories_labels: p.categories.map((c) => CATEGORIES[c]),
    pct: pct(p.salons_concernes),
    potentiel_skedisy: Math.min(10, Math.round(p.wtp * 0.7 + p.impact_eco * 0.3)),
    score_composite: scoreComposite(p),
  };
})
  .sort((a, b) => b.score_composite - a.score_composite || b.confiance_score - a.confiance_score)
  .map((p, i) => ({ rang: i + 1, ...p }));

const top20 = ranked.slice(0, 20);

const byCategory = {};
for (const [k, label] of Object.entries(CATEGORIES)) {
  byCategory[label] = ranked
    .filter((p) => p.categories.map(String).includes(String(k)))
    .map((p) => ({ id: p.id, rang: p.rang, probleme: p.probleme, score: p.score_composite }));
}

const thesis = {
  generated_at: new Date().toISOString(),
  sample_n: N,
  method: {
    principle:
      "Classement orienté willingness-to-pay du professionnel afro, pas feature wishlist. Confiance faible = pénalité de rang.",
    fact_sources: ["sites", "Planity", "pages RDV", "annuaires", "matrice DEEP_*"],
    not_measured: ["no-show rates", "DM Instagram volume", "WhatsApp private", "staffing indépendantes", "stock mèches"],
  },
  squire_analogy: {
    squire_barber:
      "SQUIRE a verticalisé un workflow simple-répétitif (coupe homme courte durée) + POS + retail.",
    afro_gap:
      "La coiffure afro est un workflow projet (qualification + supply mèches + durée variable 2–6h + risque technique). Les agendas beauté généralistes underfit ce workflow.",
    skedisy_wedge_recommended:
      "Devenir indispensable sur: (1) qualification afro avant créneau, (2) devis/durée/mèches verrouillés, (3) acompte anti-no-show sur créneaux longs — puis étendre planning/CRM.",
  },
  categories: byCategory,
  top20,
  all_problems: ranked,
};

fs.writeFileSync(path.join(OUT, "SQUIRE_ANALYSIS.json"), JSON.stringify(thesis, null, 2));

const cols = [
  "rang",
  "id",
  "probleme",
  "categories_labels",
  "salons_concernes",
  "pct",
  "gravite",
  "frequence",
  "impact_eco",
  "difficulte_actuelle",
  "potentiel_skedisy",
  "score_composite",
  "confiance",
  "outils",
  "pourquoi_pas_resolu",
  "preuves",
];

function csvEscape(v) {
  const s = Array.isArray(v) ? v.join(" | ") : String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

const csv = [cols.join(","), ...top20.map((r) => cols.map((c) => csvEscape(r[c])).join(","))].join("\n");
fs.writeFileSync(path.join(OUT, "SQUIRE_TOP20.csv"), csv);

const md = `# Analyse SQUIRE — Salons afro Île-de-France

Sample: **${N} salons** afro-pertinents. Classement = willingness-to-pay pro × impact, pénalisé si confiance faible.

## Thèse (équivalente SQUIRE)

SQUIRE a gagné en verticalisant le **barbershop** (workflow court, répétitif).
La coiffure afro est un **projet**: qualification + mèches + durée 2–6h + risque technique.
Planity/Fresha/Booksy/WhatsApp couvrent des morceaux; **aucun ne possède le workflow projet**.

**Coin d'attaque Skedisy (si un pro doit payer):**
1. Qualification afro avant créneau  
2. Devis / durée / mèches verrouillés  
3. Acompte anti-no-show sur créneaux longs  

## TOP 20

| Rang | Problème | Salons | % | Grav | Fréq | Impact€ | Diff | Pot. Skedisy | Confiance |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---|
${top20
  .map(
    (p) =>
      `| ${p.rang} | ${p.probleme.slice(0, 90)}… | ${p.salons_concernes} | ${p.pct}% | ${p.gravite} | ${p.frequence} | ${p.impact_eco} | ${p.difficulte_actuelle} | ${p.potentiel_skedisy} | ${p.confiance} |`
  )
  .join("\n")}

## Fichiers
- \`SQUIRE_ANALYSIS.json\`
- \`SQUIRE_TOP20.csv\`
`;

fs.writeFileSync(path.join(OUT, "SQUIRE_RAPPORT.md"), md);
console.log(JSON.stringify({ top5: top20.slice(0, 5).map((p) => ({ rang: p.rang, id: p.id, score: p.score_composite, conf: p.confiance, titre: p.probleme.slice(0, 80) })), n: top20.length }, null, 2));
