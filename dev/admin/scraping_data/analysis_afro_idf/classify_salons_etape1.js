/**
 * Étape 1 — Classification salons IDF (Skedisy)
 * Règles:
 * - Ne jamais classer "afro" avec confiance élevée sur le seul nom.
 * - Séparer faits / hypothèses.
 * - Ignorer password, claimToken, credentials.
 * - Ne déduire aucune info absente du fichier.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = __dirname;

const INPUT_FILES = [
  "salons_ile_de_france_20251211_200234.json",
  "salons_ile_de_france_20251210_230107.json",
  "salons_ile_de_france_20251207_180758.json",
  "salons_ile_de_france_20251207_175108.json",
];

function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeCsv(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function deptFromCity(city, metaDept) {
  if (metaDept) return String(metaDept);
  const m = String(city || "").match(/\b(75|77|78|91|92|93|94|95)\d{3}\b/);
  if (m) return m[1];
  const m2 = String(city || "").match(/\b(75|77|78|91|92|93|94|95)\b/);
  return m2 ? m2[1] : "";
}

function cityClean(city) {
  return String(city || "").trim();
}

function detectBookingSystem(website) {
  const w = String(website || "").toLowerCase();
  if (!w) return "";
  const map = [
    ["planity.com", "Planity"],
    ["fresha.com", "Fresha"],
    ["treatwell.", "Treatwell"],
    ["booksy.com", "Booksy"],
    ["simplybook", "SimplyBook"],
    ["calendly.com", "Calendly"],
    ["appointfix.com", "Appointfix"],
    ["salonized.com", "Salonized"],
    ["shedul.com", "Shedul"],
    ["setmore.com", "Setmore"],
    ["resalib.fr", "Resalib"],
    ["doctolib.fr", "Doctolib"],
    ["skedisy.com", "Skedisy"],
  ];
  for (const [needle, label] of map) {
    if (w.includes(needle)) return label;
  }
  return "";
}

function extractSocials(website) {
  const w = String(website || "").trim();
  const out = { instagram: "", facebook: "", tiktok: "", site: "", isEchoSite: false };
  if (!w) return out;
  const low = w.toLowerCase();
  if (low.includes("instagram.com")) out.instagram = w;
  else if (low.includes("facebook.com") || low.includes("fb.com")) out.facebook = w;
  else if (low.includes("tiktok.com")) out.tiktok = w;
  else {
    out.site = w;
    // URL annuaire / proxy GMB qui reprend souvent le nom → pas une 2e source indépendante
    if (
      low.includes("frmaps.") ||
      low.includes("google.com/maps") ||
      low.includes("g.page/") ||
      low.includes("goo.gl/maps") ||
      low.includes("maps.app.goo.gl")
    ) {
      out.isEchoSite = true;
    }
  }
  return out;
}

/** Lexical patterns — FAITS sur le texte public disponible uniquement */
const PATTERNS = {
  "coiffure afro": [
    /\bafro\b/i,
    /\bantillais(?:e|es)?\b/i,
    /\bafricain(?:e|es)?\b/i,
    /\bcheveux\s+cr[eé]pus\b/i,
    /\btexturis[eé]s?\b/i,
    /\bnappy\b/i,
    /\bblack\s+hair\b/i,
    /\bethnic\s+hair\b/i,
  ],
  "barber afro": [
    /\bbarber\s+afro\b/i,
    /\bbarbier\s+afro\b/i,
    /\bafro\s+barber\b/i,
    /\bfade\s+afro\b/i,
  ],
  "braids / tresses": [
    /\btresses?\b/i,
    /\bbraids?\b/i,
    /\bknotless\b/i,
    /\bbox\s*braids?\b/i,
    /\bcornrows?\b/i,
    /\bnattes?\b/i,
    /\bsenegalais(?:e|es)?\b/i,
    /\bghana\s*braids?\b/i,
  ],
  "locks / cheveux naturels": [
    /\blocks?\b/i,
    /\bdreadlocks?\b/i,
    /\bloc[s]?\s*maintenance\b/i,
    /\bcheveux\s+naturels?\b/i,
    /\bnaturels?\s+afro\b/i,
    /\btwist(?:s|out)?\b/i,
  ],
  "perruques / lace": [
    /\bperruques?\b/i,
    /\bwigs?\b/i,
    /\blace\s*(?:front|wig)?\b/i,
    /\bclosure\b/i,
    /\bfrontal\b/i,
    /\bunit[eé]s?\b/i,
  ],
  extensions: [/\bextensions?\b/i, /\btissage\b/i, /\bweave\b/i, /\bk[eé]ratin(?:e)?\s*bond\b/i],
  "coiffure européenne": [
    /\bcoloriste\b/i,
    /\bbalayage\b/i,
    /\bm[eé]ch(?:es|é)\b/i,
    /\bbrushing\b/i,
    /\bcoupe\s+femme\b/i,
    /\bcoiffeur\s+(?:homme\s+)?femme\b/i,
  ],
  esthétique: [/\besth[eé]tique\b/i, /\binstitut\b/i, /\bongles?\b/i, /\bnails?\b/i, /\bmanucure\b/i],
  spa: [/\bspa\b/i, /\bmassage\b/i, /\bhead\s*spa\b/i],
  barber_general: [/\bbarbier\b/i, /\bbarber\b/i, /\bbarbershop\b/i, /\bfade\b/i],
};

function findHits(text, patterns) {
  const hits = [];
  for (const re of patterns) {
    const m = String(text || "").match(re);
    if (m) hits.push(m[0]);
  }
  return [...new Set(hits.map((h) => h.toLowerCase()))];
}

function classifySalon(salon) {
  const name = salon.name || "";
  const about = salon.about || "";
  const website = salon.metadata?.website || "";
  const socials = extractSocials(website);

  // Texte public utilisable (FAITS présents dans le JSON)
  const publicText = [name, about, website].filter(Boolean).join(" | ");
  const aboutIsGeneric = /^salon trouv[eé] via google places$/i.test(String(about).trim());

  const signalsUsed = [];
  if (name) signalsUsed.push("nom");
  if (about && !aboutIsGeneric) signalsUsed.push("description");
  // description générique Google = non discriminative
  if (website) {
    if (socials.instagram) signalsUsed.push("réseaux sociaux (URL Instagram dans website)");
    else if (socials.facebook) signalsUsed.push("réseaux sociaux (URL Facebook dans website)");
    else if (socials.tiktok) signalsUsed.push("réseaux sociaux (URL TikTok dans website)");
    else if (socials.isEchoSite) signalsUsed.push("site (URL annuaire/GMB — non indépendante du nom)");
    else signalsUsed.push("site");
  }

  const score = {};
  const evidence = {};

  for (const [cat, pats] of Object.entries(PATTERNS)) {
    if (cat === "barber_general") continue;
    const hitsName = findHits(name, pats);
    const hitsAbout = aboutIsGeneric ? [] : findHits(about, pats);
    const hitsWeb = socials.isEchoSite ? [] : findHits(website, pats);
    const all = [...new Set([...hitsName, ...hitsAbout, ...hitsWeb])];
    if (all.length) {
      score[cat] = all.length + (hitsName.length ? 1.5 : 0) + (hitsWeb.length ? 1 : 0) + (hitsAbout.length ? 1 : 0);
      evidence[cat] = {
        nom: hitsName,
        description: hitsAbout,
        site: hitsWeb,
      };
    }
  }

  // Barber afro needs afro + barber signals together
  const barberHits = findHits(publicText, PATTERNS.barber_general);
  const afroHits = findHits(publicText, PATTERNS["coiffure afro"]);
  if (barberHits.length && afroHits.length) {
    score["barber afro"] = (score["barber afro"] || 0) + 3;
    evidence["barber afro"] = {
      nom: findHits(name, [...PATTERNS.barber_general, ...PATTERNS["coiffure afro"]]),
      description: [],
      site: findHits(website, [...PATTERNS.barber_general, ...PATTERNS["coiffure afro"]]),
    };
  }

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);

  let categorie = "inconnu";
  let confiance = "faible";
  let raisons = [];
  let facts = [];
  let hypotheses = [];
  let deepDive = false;
  let bucket = "hors_perimetre"; // afro_pertinent | uncertain | hors_perimetre

  const afroFamily = new Set([
    "coiffure afro",
    "barber afro",
    "braids / tresses",
    "locks / cheveux naturels",
    "perruques / lace",
    "extensions",
    "salon mixte",
  ]);

  if (!ranked.length) {
    // Heuristique barber / spa / esthétique sans afro
    if (barberHits.length) {
      categorie = "autre";
      confiance = "moyen";
      facts.push(`Le nom/site contient un signal barbier/barber: ${barberHits.join(", ")}`);
      hypotheses.push("Établissement possiblement barbier généraliste (non afro vérifié).");
      raisons.push("Signal barbier sans signal afro explicite → classé 'autre' (pas afro).");
      bucket = "hors_perimetre";
    } else if (findHits(publicText, PATTERNS.spa).length && !findHits(name, PATTERNS["coiffure afro"]).length) {
      categorie = "spa";
      confiance = "moyen";
      facts.push(`Signal spa dans le texte public: ${findHits(publicText, PATTERNS.spa).join(", ")}`);
      raisons.push("Mot-clé spa/massage dans nom ou site.");
      bucket = "hors_perimetre";
    } else if (findHits(publicText, PATTERNS.esthétique).length) {
      categorie = "esthétique";
      confiance = "moyen";
      facts.push(`Signal esthétique: ${findHits(publicText, PATTERNS.esthétique).join(", ")}`);
      raisons.push("Mot-clé esthétique/institut/ongles dans texte public.");
      bucket = "hors_perimetre";
    } else {
      categorie = "inconnu";
      confiance = "faible";
      facts.push("Aucun mot-clé métier discriminant trouvé dans nom/description/site du JSON.");
      hypotheses.push("Pourrait être coiffure générale, afro, ou autre — non déterminable avec les champs disponibles.");
      raisons.push("Information publique insuffisante dans le fichier (pas de prestations, pas de catégories Google, description générique).");
      bucket = "uncertain";
      deepDive = true;
    }
  } else {
    const [topCat, topScore] = ranked[0];
    const second = ranked[1];
    categorie = topCat;

    const sourcesWithHits = new Set();
    const ev = evidence[topCat] || { nom: [], description: [], site: [] };
    if (ev.nom?.length) sourcesWithHits.add("nom");
    if (ev.description?.length) sourcesWithHits.add("description");
    if (ev.site?.length) sourcesWithHits.add("site");

    facts.push(
      `Correspondances lexicales pour '${topCat}': nom=[${(ev.nom || []).join("; ")}], description=[${(ev.description || []).join("; ")}], site=[${(ev.site || []).join("; ")}]`
    );

    // Mixte si afro-family + européenne proches
    const hasAfro = ranked.some(([c]) => afroFamily.has(c) && c !== "salon mixte" && c !== "extensions");
    const hasEuro = ranked.some(([c]) => c === "coiffure européenne");
    if (hasAfro && hasEuro) {
      categorie = "salon mixte";
      facts.push("Présence simultanée de signaux afro-family et coiffure européenne dans le texte public.");
    }

    // Confiance: JAMAIS élevé si seule source = nom
    if (sourcesWithHits.size >= 2) {
      confiance = "élevé";
      raisons.push(`Au moins 2 sources publiques distinctes (${[...sourcesWithHits].join(", ")}).`);
    } else if (sourcesWithHits.has("nom") && (ev.nom || []).length >= 1) {
      confiance = "moyen";
      raisons.push("Signal uniquement dans le nom commercial (auto-désignation lexicale). Pas de prestations/catégories Google dans le JSON pour confirmer.");
      hypotheses.push("Le positionnement réel peut différer du nom (marketing vs offre).");
    } else if (sourcesWithHits.has("site")) {
      confiance = "moyen";
      raisons.push("Signal trouvé dans l'URL/site uniquement.");
    } else {
      confiance = "faible";
      raisons.push("Signal faible ou ambigu.");
    }

    // Cap: user rule — never assume afro from name alone at high confidence
    if (afroFamily.has(categorie) && sourcesWithHits.size === 1 && sourcesWithHits.has("nom")) {
      confiance = "moyen";
      deepDive = true;
      raisons.push("Règle méthodologique: classification afro-family non 'élevé' sur le seul nom.");
    }

    if (second && second[1] >= topScore * 0.7 && second[0] !== categorie) {
      hypotheses.push(`Catégorie alternative proche: ${second[0]} (score ${second[1].toFixed(1)} vs ${topScore.toFixed(1)}).`);
      if (confiance === "élevé") confiance = "moyen";
    }

    if (afroFamily.has(categorie) || categorie === "salon mixte") {
      bucket = confiance === "faible" ? "uncertain" : "afro_pertinent";
      deepDive = true;
    } else if (categorie === "inconnu") {
      bucket = "uncertain";
      deepDive = true;
    } else {
      bucket = "hors_perimetre";
    }
  }

  // Données manquantes documentées
  const missing = [];
  if (!website) missing.push("website");
  if (aboutIsGeneric || !about) missing.push("description utile");
  missing.push("prestations (serviceIds vides)");
  missing.push("catégories Google");
  if (!socials.instagram && !socials.facebook && !socials.tiktok) {
    // only missing if not in website field
  }

  return {
    name,
    ville: cityClean(salon.addressDetails?.city),
    departement: deptFromCity(salon.addressDetails?.city, salon.metadata?.department),
    adresse: salon.addressDetails?.addressLine1 || "",
    categorie,
    niveau_confiance: confiance,
    raisons_classification: raisons.join(" | "),
    faits: facts.join(" | "),
    hypotheses: hypotheses.join(" | "),
    signaux_utilises: signalsUsed.join(" | "),
    donnees_manquantes: missing.join(" | "),
    url_site: socials.site,
    telephone: salon.mobile || "",
    instagram: socials.instagram,
    facebook: socials.facebook,
    tiktok: socials.tiktok,
    systeme_reservation: detectBookingSystem(website),
    source_fichier: salon._source_file || "",
    source_import: salon.source || "",
    uniqueId: salon.uniqueId ?? "",
    deep_dive: deepDive,
    bucket,
    // never export secrets
  };
}

function dedupeKey(s) {
  return [norm(s.name), norm(s.mobile), norm(s.addressDetails?.addressLine1)].join("||");
}

function loadAll() {
  const all = [];
  const fileStats = [];
  for (const f of INPUT_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) {
      fileStats.push({ file: f, status: "missing", count: 0 });
      continue;
    }
    const raw = fs.readFileSync(p, "utf8").trim();
    if (!raw || raw === "[]") {
      fileStats.push({ file: f, status: "empty", count: 0 });
      continue;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      fileStats.push({ file: f, status: "invalid_json", count: 0, error: e.message });
      continue;
    }
    if (!Array.isArray(data)) {
      fileStats.push({ file: f, status: "not_array", count: 0 });
      continue;
    }
    fileStats.push({ file: f, status: "ok", count: data.length });
    for (const row of data) {
      all.push({ ...row, _source_file: f });
    }
  }
  return { all, fileStats };
}

function toCsv(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((r) => columns.map((c) => escapeCsv(r[c])).join(","));
  return [header, ...lines].join("\n");
}

function main() {
  const { all, fileStats } = loadAll();
  const seen = new Map();
  for (const s of all) {
    const k = dedupeKey(s);
    if (!seen.has(k)) seen.set(k, s);
  }
  const unique = [...seen.values()];
  const classified = unique.map(classifySalon);

  const afro = classified.filter((c) => c.bucket === "afro_pertinent");
  const uncertain = classified.filter((c) => c.bucket === "uncertain");
  const hors = classified.filter((c) => c.bucket === "hors_perimetre");
  const deep = classified.filter((c) => c.deep_dive);

  const cols = [
    "name",
    "ville",
    "departement",
    "adresse",
    "categorie",
    "niveau_confiance",
    "raisons_classification",
    "faits",
    "hypotheses",
    "signaux_utilises",
    "donnees_manquantes",
    "url_site",
    "telephone",
    "instagram",
    "facebook",
    "tiktok",
    "systeme_reservation",
    "source_fichier",
    "uniqueId",
    "deep_dive",
    "bucket",
  ];

  const summary = {
    generated_at: new Date().toISOString(),
    method_limits: {
      fact: "Les JSON fournis ne contiennent quasiment aucune description métier utile (about générique), aucune prestation, aucune catégorie Google Places. Classification basée surtout sur le nom commercial et l'URL website/metadata.",
      rule: "Aucun salon afro-family n'est classé 'élevé' sur le seul nom.",
      ignored_fields: ["password", "claimToken", "email credentials", "images paths non analysées"],
    },
    inputs: fileStats,
    counts: {
      raw_rows: all.length,
      unique_salons: unique.length,
      afro_pertinent: afro.length,
      uncertain: uncertain.length,
      hors_perimetre: hors.length,
      deep_dive_recommended: deep.length,
    },
    by_category_afro_pertinent: {},
    by_confidence_afro_pertinent: {},
    by_category_uncertain: {},
    booking_systems_detected: {},
  };

  for (const row of afro) {
    summary.by_category_afro_pertinent[row.categorie] = (summary.by_category_afro_pertinent[row.categorie] || 0) + 1;
    summary.by_confidence_afro_pertinent[row.niveau_confiance] =
      (summary.by_confidence_afro_pertinent[row.niveau_confiance] || 0) + 1;
    if (row.systeme_reservation) {
      summary.booking_systems_detected[row.systeme_reservation] =
        (summary.booking_systems_detected[row.systeme_reservation] || 0) + 1;
    }
  }
  for (const row of uncertain) {
    summary.by_category_uncertain[row.categorie] = (summary.by_category_uncertain[row.categorie] || 0) + 1;
  }
  // booking on all
  summary.booking_systems_all = {};
  for (const row of classified) {
    if (row.systeme_reservation) {
      summary.booking_systems_all[row.systeme_reservation] =
        (summary.booking_systems_all[row.systeme_reservation] || 0) + 1;
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "SUMMARY_etape1.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "ALL_classified.json"), JSON.stringify(classified, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents.json"), JSON.stringify(afro, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents.csv"), toCsv(afro, cols), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_a_verifier.json"), JSON.stringify(uncertain, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_a_verifier.csv"), toCsv(uncertain, cols), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "DEEP_DIVE_recommandes.json"), JSON.stringify(deep, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "HORS_perimetre.json"), JSON.stringify(hors, null, 2), "utf8");

  console.log(JSON.stringify(summary, null, 2));
  console.log("\nOutputs written to", OUT_DIR);
}

main();
