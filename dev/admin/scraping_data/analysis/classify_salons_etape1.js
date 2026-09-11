/**
 * Étape 1 — Classification salons IDF (coiffure afro marketplace research)
 *
 * Rules:
 * - Facts only from public fields present in source JSON (name, about, website, city, dept, phone).
 * - Never infer "afro" from an ambiguous ethnic-sounding name alone.
 * - Generic "Salon trouvé via Google Places" is NOT a classification signal.
 * - Ignore password, claimToken, credentials.
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILES = [
  "salons_ile_de_france_20251207_175108.json",
  "salons_ile_de_france_20251207_180758.json",
  "salons_ile_de_france_20251210_230107.json",
  "salons_ile_de_france_20251211_200234.json",
];

const ROOT = path.join(__dirname, "..");
const OUT_DIR = __dirname;

const GENERIC_ABOUT = /^(salon trouvé via google places|salon afro\/black trouvé via google places)$/i;

/** Explicit lexical signals — ordered by specificity */
const RULES = [
  {
    type: "braids / tresses",
    confidence: "élevé",
    patterns: [
      /\b(box\s*braids?|knotless|fulani|cornrows?|vanilles?|tresses?\s+africaines?|tresseuse|afro[\s-]*tresses?|braids?\b|tresses?\b)/i,
    ],
  },
  {
    type: "locks / cheveux naturels",
    confidence: "élevé",
    patterns: [
      /\b(locks?|dreadlocks?|loc(s)?\b|cheveux\s+naturels?|nappy|kinky|twist(s)?\s+naturels?|sisterlocks?)/i,
    ],
  },
  {
    type: "perruques / lace",
    confidence: "élevé",
    patterns: [/\b(lace\s*(wig|frontal|closure)?|perruques?|wig(s)?|closure|frontal)\b/i],
  },
  {
    type: "extensions",
    confidence: "moyen",
    patterns: [/\b(extensions?\s+(de\s+)?cheveux|tissage|weave|keratin\s*bond)\b/i],
  },
  {
    type: "barber afro",
    confidence: "élevé",
    // Requires BOTH afro-family signal AND barber/homme signal in same blob
    requireAll: true,
    patternGroups: [
      [/\b(afro|antillais|africain|black\s*hair|textur)/i],
      [/\b(barb(ier|er)|barbershop|coiffeur\s+homme|fade|dégradé|degrade)\b/i],
    ],
  },
  {
    type: "salon mixte",
    confidence: "élevé",
    patterns: [/\b(coiffure\s+mixte|salon\s+mixte|afro[\s-]*europ|afro\s*&\s*europ|mixte\s+afro)\b/i],
  },
  {
    type: "coiffure afro",
    confidence: "élevé",
    patterns: [
      /\b(coiffure\s+afro|coiffeur(se)?\s+afro|salon\s+afro|afro\s+antillais|afro[\s-]*am[eé]ricain|hair\s*afro|afro\s+beauty|sp[ée]cialiste\s+afro)\b/i,
      /\bafro\b/i,
    ],
  },
  {
    type: "esthétique",
    confidence: "élevé",
    patterns: [
      /\b(institut\s+de\s+beaut[ée]|esth[ée]tique|onglerie|extension\s+de\s+cils|manucure|nails?\b|microblading)\b/i,
    ],
  },
  {
    type: "spa",
    confidence: "élevé",
    patterns: [/\b(\bspa\b|hammam|sauna|head\s*spa|massage)\b/i],
  },
  {
    type: "coiffure européenne",
    confidence: "moyen",
    // Only if EXPLICIT — never default generic salons here
    patterns: [/\b(coiffure\s+europ[eé]enne|cheveux\s+caucasiens|lissage\s+br[eé]silien\s+europ)\b/i],
  },
];

const BOOKING_PATTERNS = [
  { id: "planity", re: /planity\.com/i },
  { id: "treatwell", re: /treatwell\./i },
  { id: "booksy", re: /booksy\./i },
  { id: "fresha", re: /fresha\./i },
  { id: "simplybook", re: /simplybook\./i },
  { id: "reservationcoiffeur", re: /reservationcoiffeur\.fr/i },
  { id: "whatsapp", re: /wa\.me|api\.whatsapp|whatsapp\.com/i },
  { id: "calendly", re: /calendly\./i },
  { id: "widget_externe", re: /widget\./i },
];

function normalizeText(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dedupeKey(s) {
  const name = normalizeText(s.name).trim();
  const addr = normalizeText(s.addressDetails?.addressLine1 || "").trim();
  const city = normalizeText(s.addressDetails?.city || "").trim();
  return `${name}|${addr}|${city}`;
}

function extractDept(s) {
  if (s.metadata?.department) return String(s.metadata.department);
  const city = s.addressDetails?.city || "";
  const m = String(city).match(/\b(75|77|78|91|92|93|94|95)\d{3}\b/) || String(city).match(/\b(75|77|78|91|92|93|94|95)\b/);
  if (m) return m[1];
  const cp = String(city).match(/\b(75|77|78|91|92|93|94|95)\d{3}\b/);
  return cp ? cp[1] : "";
}

function extractCity(s) {
  const raw = String(s.addressDetails?.city || "").trim();
  return raw.replace(/^\d{5}\s*/, "").trim() || raw;
}

function websiteOf(s) {
  return (s.metadata?.website || s.website || s.site || "").trim();
}

function socialFromUrl(url) {
  const u = String(url || "");
  return {
    instagram: /instagram\.com/i.test(u) ? u : "",
    facebook: /facebook\.com/i.test(u) ? u : "",
    tiktok: /tiktok\.com/i.test(u) ? u : "",
  };
}

function bookingFromUrl(url) {
  const u = String(url || "");
  for (const b of BOOKING_PATTERNS) {
    if (b.re.test(u)) return b.id;
  }
  return "";
}

function publicBlob(s) {
  const about = String(s.about || "").trim();
  const aboutUsable = about && !GENERIC_ABOUT.test(about) ? about : "";
  const website = websiteOf(s);
  return {
    name: String(s.name || ""),
    about: aboutUsable,
    website,
    text: [s.name, aboutUsable, website].filter(Boolean).join(" \n "),
  };
}

function classify(s) {
  const pub = publicBlob(s);
  const text = pub.text;
  const signals = [];
  const matchedTypes = [];

  if (pub.name) signals.push("nom");
  if (pub.about) signals.push("description");
  if (pub.website) signals.push("site");

  // No public signal beyond empty/generic → inconnu
  if (!pub.name && !pub.about && !pub.website) {
    return {
      categorie: "inconnu",
      confiance: "faible",
      signaux: [],
      raisons: ["Aucune information publique exploitable (nom/description/site)."],
      types_secondaires: [],
    };
  }

  for (const rule of RULES) {
    let hit = false;
    let matched = [];
    if (rule.requireAll) {
      hit = rule.patternGroups.every((group) =>
        group.some((re) => {
          const m = text.match(re);
          if (m) matched.push(m[0]);
          return !!m;
        })
      );
    } else {
      for (const re of rule.patterns) {
        const m = text.match(re);
        if (m) {
          hit = true;
          matched.push(m[0]);
        }
      }
    }
    if (hit) {
      matchedTypes.push({
        type: rule.type,
        confidence: rule.confidence,
        matched,
      });
    }
  }

  if (matchedTypes.length === 0) {
    // Explicit non-afro barber without afro signal
    if (/\b(barb(ier|er)|barbershop)\b/i.test(text)) {
      return {
        categorie: "autre",
        confiance: "moyen",
        signaux: signals,
        raisons: [
          "Signal 'barbier/barbershop' dans le nom/site, sans signal afro explicite → classé 'autre' (pas barber afro).",
        ],
        types_secondaires: ["barber_non_afro_signale"],
      };
    }
    if (/\b(coiffure|coiffeur|coiffeuse|hair|salon)\b/i.test(text)) {
      return {
        categorie: "inconnu",
        confiance: "faible",
        signaux: signals,
        raisons: [
          "Établissement de coiffure signalé par le nom, sans mot-clé public permettant d'identifier le type (afro, européen, tresses, etc.).",
        ],
        types_secondaires: ["coiffure_non_specifiee"],
        needs_deep_dive: false,
      };
    }
    return {
      categorie: "inconnu",
      confiance: "faible",
      signaux: signals,
      raisons: ["Aucun motif lexical public permettant une classification métier."],
      types_secondaires: [],
    };
  }

  // Priority: most specific afro-related first
  const priority = [
    "braids / tresses",
    "locks / cheveux naturels",
    "perruques / lace",
    "barber afro",
    "salon mixte",
    "coiffure afro",
    "extensions",
    "esthétique",
    "spa",
    "coiffure européenne",
  ];
  matchedTypes.sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
  const primary = matchedTypes[0];
  const secondary = matchedTypes.slice(1).map((t) => t.type);

  // Downgrade confidence if only website domain matched weakly, or single short token
  let confiance = primary.confidence;
  const onlyAfroToken =
    primary.type === "coiffure afro" &&
    primary.matched.every((m) => /^afro$/i.test(String(m).trim()));
  if (onlyAfroToken && !/\b(coiffure|coiffeur|salon|beauty|tress|braid)/i.test(text)) {
    confiance = "moyen";
  }

  // Extensions alone are not afro-proof
  const afroFamily = new Set([
    "braids / tresses",
    "locks / cheveux naturels",
    "perruques / lace",
    "barber afro",
    "salon mixte",
    "coiffure afro",
  ]);
  const isAfroRelevant =
    afroFamily.has(primary.type) ||
    matchedTypes.some((t) => afroFamily.has(t.type)) ||
    (primary.type === "extensions" && /\b(afro|tress|braid|lace|tissage)\b/i.test(text));

  const raisons = matchedTypes.map(
    (t) => `${t.type}: correspondance(s) littérale(s) « ${t.matched.join(", ")} » dans nom/description/site`
  );

  return {
    categorie: primary.type,
    confiance,
    signaux: [...new Set(signals)],
    raisons,
    types_secondaires: secondary,
    is_afro_relevant: !!isAfroRelevant,
    needs_deep_dive:
      !!isAfroRelevant &&
      (confiance === "élevé" || confiance === "moyen") &&
      (!!pub.website || !!s.mobile),
  };
}

function loadAll() {
  const map = new Map();
  const sources = {};
  for (const file of INPUT_FILES) {
    const fp = path.join(ROOT, file);
    if (!fs.existsSync(fp)) {
      sources[file] = { exists: false, count: 0 };
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
    const arr = Array.isArray(raw) ? raw : raw.salons || raw.data || [];
    sources[file] = { exists: true, count: arr.length };
    for (const s of arr) {
      const k = dedupeKey(s);
      if (!map.has(k)) map.set(k, { ...s, _sources: [file] });
      else map.get(k)._sources.push(file);
    }
  }
  return { salons: [...map.values()], sources };
}

function toRow(s, c) {
  const website = websiteOf(s);
  const social = socialFromUrl(website);
  return {
    nom: s.name || "",
    ville: extractCity(s),
    departement: extractDept(s),
    adresse: s.addressDetails?.addressLine1 || "",
    categorie: c.categorie,
    niveau_confiance: c.confiance,
    raisons_classification: (c.raisons || []).join(" | "),
    signaux_utilises: (c.signaux || []).join(", "),
    types_secondaires: (c.types_secondaires || []).join(", "),
    url_site: website,
    telephone: s.mobile || "",
    email_public: s.email || "",
    instagram: social.instagram,
    facebook: social.facebook,
    tiktok: social.tiktok,
    systeme_reservation: bookingFromUrl(website),
    source_scraping: (s._sources || [s.source]).join("; "),
    a_approfondir: c.needs_deep_dive ? "oui" : "non",
    latitude: s.locationCoordinates?.latitude || "",
    longitude: s.locationCoordinates?.longitude || "",
  };
}

function toCsv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function main() {
  const { salons, sources } = loadAll();
  const classified = salons.map((s) => {
    const c = classify(s);
    return { salon: s, classification: c, row: toRow(s, c) };
  });

  const afroTypes = new Set([
    "coiffure afro",
    "barber afro",
    "salon mixte",
    "locks / cheveux naturels",
    "braids / tresses",
    "perruques / lace",
  ]);

  const pertinents = classified.filter((x) => {
    const c = x.classification;
    if (c.is_afro_relevant) return c.confiance === "élevé" || c.confiance === "moyen";
    // extensions with afro co-signal already flagged is_afro_relevant
    return afroTypes.has(c.categorie) && (c.confiance === "élevé" || c.confiance === "moyen");
  });

  const incertains = classified.filter((x) => {
    const c = x.classification;
    if (pertinents.includes(x)) return false;
    // Keep uncertain beauty/hair businesses for manual verification
    if (c.categorie === "inconnu") return true;
    if (c.confiance === "faible") return true;
    // Extensions without clear afro context — verify later
    if (c.categorie === "extensions") return true;
    return false;
  });

  const aApprofondir = pertinents.filter((x) => x.classification.needs_deep_dive);

  const counts = {};
  for (const x of classified) {
    const k = `${x.classification.categorie}|${x.classification.confiance}`;
    counts[k] = (counts[k] || 0) + 1;
  }

  const summary = {
    generated_at: new Date().toISOString(),
    method:
      "Classification lexicale conservative sur champs publics (nom, about non générique, metadata.website). Aucune déduction ethnique depuis un nom ambigu. Champs sensibles ignorés.",
    input_files: sources,
    unique_establishments: classified.length,
    counts_by_category_confidence: counts,
    pertinents_afro_count: pertinents.length,
    incertains_count: incertains.length,
    a_approfondir_count: aApprofondir.length,
    data_limitations: [
      "FAIT: aucune description métier réelle dans les fichiers listés (about = placeholder Google Places).",
      "FAIT: aucun catalogue de prestations (serviceIds vide).",
      "FAIT: pas de catégories Google structurées dans le JSON (hors nom/site).",
      "FAIT: Instagram/Facebook/TikTok uniquement si l'URL website pointe déjà vers ces domaines.",
      "HYPOTHÈSE INTERDITE ÉVITÉE: un salon générique n'est PAS classé 'coiffure européenne' par défaut.",
      "LIMITE: la classification afro repose principalement sur des mots-clés explicites dans le nom commercial.",
    ],
  };

  fs.writeFileSync(path.join(OUT_DIR, "etape1_summary.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(
    path.join(OUT_DIR, "etape1_classification_complete.json"),
    JSON.stringify(
      classified.map((x) => ({
        ...x.row,
        classification_detail: x.classification,
      })),
      null,
      2
    ),
    "utf8"
  );

  const pertinentsRows = pertinents.map((x) => x.row);
  const incertainsRows = incertains.map((x) => x.row);
  const deepRows = aApprofondir.map((x) => x.row);

  fs.writeFileSync(
    path.join(OUT_DIR, "salons_afro_pertinents.json"),
    JSON.stringify(pertinentsRows, null, 2),
    "utf8"
  );
  fs.writeFileSync(path.join(OUT_DIR, "salons_afro_pertinents.csv"), toCsv(pertinentsRows), "utf8");
  fs.writeFileSync(
    path.join(OUT_DIR, "salons_incertains.json"),
    JSON.stringify(incertainsRows, null, 2),
    "utf8"
  );
  fs.writeFileSync(path.join(OUT_DIR, "salons_incertains.csv"), toCsv(incertainsRows), "utf8");
  fs.writeFileSync(
    path.join(OUT_DIR, "salons_a_approfondir.json"),
    JSON.stringify(deepRows, null, 2),
    "utf8"
  );
  fs.writeFileSync(path.join(OUT_DIR, "salons_a_approfondir.csv"), toCsv(deepRows), "utf8");

  console.log(JSON.stringify(summary, null, 2));
  console.log("\nSample pertinents:", pertinentsRows.slice(0, 8).map((r) => `${r.nom} => ${r.categorie} (${r.niveau_confiance})`));
}

main();
