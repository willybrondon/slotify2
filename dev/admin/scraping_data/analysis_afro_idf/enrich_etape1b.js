/**
 * Étape 1b — Enrichissement public via URL website déjà présente dans le JSON.
 * - Ne scrape PAS Google Places.
 * - Fetch HTTP(S) des sites / pages socials listés dans metadata.website.
 * - Extrait: Instagram/Facebook/TikTok, outil de réservation, mots-clés métier dans le HTML.
 * - Recalcule catégorie/confiance en séparant faits (extrait HTML) vs hypothèses.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const OUT_DIR = __dirname;
const CONCURRENCY = 4;
const TIMEOUT_MS = 10000;
const MAX_BYTES = 500_000;

const BOOKING = [
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
  ["widget.planity", "Planity"],
  ["book.salonized", "Salonized"],
];

const CATEGORY_PATTERNS = {
  "coiffure afro": [
    /\bafro\b/i,
    /\bantillais(?:e|es)?\b/i,
    /\bafricain(?:e|es)?\b/i,
    /\bcheveux\s+cr[eé]pus\b/i,
    /\btexturis[eé]s?\b/i,
    /\bnappy\b/i,
    /\bblack\s+hair\b/i,
  ],
  "barber afro": [/\bbarber\s+afro\b/i, /\bbarbier\s+afro\b/i, /\bafro\s+barber\b/i],
  "braids / tresses": [
    /\btresses?\b/i,
    /\bbraids?\b/i,
    /\bknotless\b/i,
    /\bbox\s*braids?\b/i,
    /\bcornrows?\b/i,
    /\bnattes?\b/i,
    /\bs[eé]n[eé]galais(?:e|es)?\b/i,
  ],
  "locks / cheveux naturels": [/\blocks?\b/i, /\bdreadlocks?\b/i, /\bcheveux\s+naturels?\b/i, /\btwist(?:s|out)?\b/i],
  "perruques / lace": [/\bperruques?\b/i, /\bwigs?\b/i, /\blace\s*(?:front|wig)?\b/i, /\bclosure\b/i, /\bfrontal\b/i],
  extensions: [/\bextensions?\b/i, /\btissage\b/i, /\bweave\b/i],
  "coiffure européenne": [/\bcoloriste\b/i, /\bbalayage\b/i, /\bbrushing\b/i],
  esthétique: [/\besth[eé]tique\b/i, /\binstitut\b/i, /\bongles?\b/i, /\bmanucure\b/i],
  spa: [/\bspa\b/i, /\bmassage\b/i, /\bhead\s*spa\b/i],
};

const AFRO_FAMILY = new Set([
  "coiffure afro",
  "barber afro",
  "braids / tresses",
  "locks / cheveux naturels",
  "perruques / lace",
  "extensions",
  "salon mixte",
]);

function escapeCsv(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map((r) => columns.map((c) => escapeCsv(r[c])).join(","))].join("\n");
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findHits(text, patterns) {
  const hits = [];
  for (const re of patterns) {
    const m = String(text || "").match(re);
    if (m) hits.push(m[0].toLowerCase());
  }
  return [...new Set(hits)];
}

function detectBooking(text) {
  const t = String(text || "").toLowerCase();
  const found = [];
  for (const [needle, label] of BOOKING) {
    if (t.includes(needle) && !found.includes(label)) found.push(label);
  }
  return found;
}

function extractLinks(html) {
  const out = { instagram: [], facebook: [], tiktok: [], other: [] };
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const low = href.toLowerCase();
    if (low.includes("instagram.com/")) out.instagram.push(href.split("?")[0]);
    else if (low.includes("facebook.com/") || low.includes("fb.com/")) out.facebook.push(href.split("?")[0]);
    else if (low.includes("tiktok.com/")) out.tiktok.push(href.split("?")[0]);
  }
  const uniq = (arr) => [...new Set(arr)].slice(0, 5);
  return {
    instagram: uniq(out.instagram),
    facebook: uniq(out.facebook),
    tiktok: uniq(out.tiktok),
  };
}

function isEchoUrl(u) {
  const low = String(u || "").toLowerCase();
  return (
    low.includes("frmaps.") ||
    low.includes("google.com/maps") ||
    low.includes("g.page/") ||
    low.includes("goo.gl/maps") ||
    low.includes("maps.app.goo.gl")
  );
}

function fetchUrl(rawUrl, redirectCount = 0) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return resolve({ ok: false, error: "invalid_url", status: 0, html: "", finalUrl: rawUrl });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return resolve({ ok: false, error: "bad_protocol", status: 0, html: "", finalUrl: rawUrl });
    }
    if (redirectCount > 4) {
      return resolve({ ok: false, error: "too_many_redirects", status: 0, html: "", finalUrl: rawUrl });
    }

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(
      parsed,
      {
        method: "GET",
        timeout: TIMEOUT_MS,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SkedisyResearchBot/1.0; +https://skedisy.com; marketplace-research)",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
          res.resume();
          const next = new URL(res.headers.location, parsed).toString();
          return fetchUrl(next, redirectCount + 1).then(resolve);
        }
        const chunks = [];
        let size = 0;
        res.on("data", (c) => {
          size += c.length;
          if (size <= MAX_BYTES) chunks.push(c);
          else {
            try {
              res.destroy();
            } catch (_) {}
          }
        });
        res.on("end", () => {
          const html = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: status >= 200 && status < 400,
            status,
            html,
            finalUrl: parsed.toString(),
            error: status >= 400 ? `http_${status}` : size > MAX_BYTES ? "truncated" : "",
          });
        });
        res.on("error", (e) => {
          resolve({
            ok: false,
            error: e.message || "response_error",
            status,
            html: Buffer.concat(chunks).toString("utf8"),
            finalUrl: parsed.toString(),
          });
        });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, error: "timeout", status: 0, html: "", finalUrl: rawUrl });
    });
    req.on("error", (e) => {
      resolve({ ok: false, error: e.message || "network_error", status: 0, html: "", finalUrl: rawUrl });
    });
    req.end();
  });
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

function pickFetchUrl(row) {
  return row.url_site || row.instagram || row.facebook || row.tiktok || "";
}

function reclassify(row, enrichment) {
  const name = row.name || "";
  const baseText = [name, row.ville, row.url_site].filter(Boolean).join(" | ");
  const htmlText = enrichment.text || "";
  const combined = `${baseText} | ${htmlText}`.slice(0, 200000);

  const score = {};
  const evidence = {};
  for (const [cat, pats] of Object.entries(CATEGORY_PATTERNS)) {
    const hitsName = findHits(name, pats);
    const hitsHtml = findHits(htmlText, pats);
    const all = [...new Set([...hitsName, ...hitsHtml])];
    if (all.length) {
      score[cat] = hitsName.length * 2 + hitsHtml.length;
      evidence[cat] = { nom: hitsName, page: hitsHtml.slice(0, 12) };
    }
  }

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  let categorie = ranked[0]?.[0] || row.categorie || "inconnu";
  let confiance = "faible";
  const faits = [];
  const hypotheses = [];
  const raisons = [];

  const hasAfro = ranked.some(([c]) => AFRO_FAMILY.has(c) && c !== "extensions");
  const hasEuro = ranked.some(([c]) => c === "coiffure européenne");
  if (hasAfro && hasEuro) {
    categorie = "salon mixte";
    faits.push("Signaux afro-family et coiffure européenne présents dans nom et/ou page.");
  }

  const ev = evidence[categorie] || evidence[ranked[0]?.[0]] || { nom: [], page: [] };
  if ((ev.nom || []).length) faits.push(`Nom: ${(ev.nom || []).join(", ")}`);
  if ((ev.page || []).length) faits.push(`Page web (texte public): ${(ev.page || []).slice(0, 8).join(", ")}`);

  const sources = new Set();
  if ((ev.nom || []).length) sources.add("nom");
  if ((ev.page || []).length) sources.add("contenu_page");
  if (enrichment.bookings?.length) sources.add("widget_reservation");
  if (enrichment.socials?.instagram?.length || enrichment.socials?.facebook?.length) sources.add("liens_sociaux");

  if (sources.has("nom") && sources.has("contenu_page")) {
    confiance = "élevé";
    raisons.push("Concordance nom + contenu de page.");
  } else if (sources.has("contenu_page")) {
    confiance = "moyen";
    raisons.push("Signaux trouvés dans le contenu HTML public (pas seulement le nom).");
  } else if (sources.has("nom")) {
    confiance = "moyen";
    raisons.push("Signal surtout dans le nom; page sans confirmation lexicale forte ou non récupérée.");
    hypotheses.push("Le positionnement réel peut différer du nom.");
  } else {
    categorie = ranked[0]?.[0] || "inconnu";
    confiance = "faible";
    raisons.push(enrichment.fetch_ok ? "Page récupérée mais peu de signaux métier." : "Page non récupérée / absente.");
    hypotheses.push("Classification non fiable sans enrichissement supplémentaire (Google types, avis, prestations).");
  }

  // Rule: afro-family never élevé on name alone
  if (AFRO_FAMILY.has(categorie) && sources.size === 1 && sources.has("nom")) {
    confiance = "moyen";
    raisons.push("Règle: pas de confiance élevée afro-family sur le seul nom.");
  }

  if (!enrichment.fetch_ok && pickFetchUrl(row) && !isEchoUrl(pickFetchUrl(row))) {
    hypotheses.push(`Fetch échoué (${enrichment.fetch_error || "unknown"}) — signaux page non vérifiés.`);
  }

  let bucket = "hors_perimetre";
  if (AFRO_FAMILY.has(categorie) || categorie === "salon mixte") {
    bucket = confiance === "faible" ? "uncertain" : "afro_pertinent";
  } else if (categorie === "inconnu") {
    bucket = "uncertain";
  }

  // Priority for manual deep dive
  let priorite = 5;
  if (bucket === "afro_pertinent" && confiance === "élevé") priorite = 1;
  else if (bucket === "afro_pertinent") priorite = 2;
  else if (bucket === "uncertain" && enrichment.fetch_ok && (ev.page || []).length) priorite = 3;
  else if (bucket === "uncertain" && pickFetchUrl(row)) priorite = 4;
  else priorite = 5;

  return {
    ...row,
    categorie,
    niveau_confiance: confiance,
    raisons_classification: raisons.join(" | "),
    faits: faits.join(" | "),
    hypotheses: hypotheses.join(" | "),
    signaux_utilises: [...sources].join(" | ") || row.signaux_utilises || "",
    instagram: enrichment.socials?.instagram?.[0] || row.instagram || "",
    facebook: enrichment.socials?.facebook?.[0] || row.facebook || "",
    tiktok: enrichment.socials?.tiktok?.[0] || row.tiktok || "",
    systeme_reservation:
      (enrichment.bookings && enrichment.bookings[0]) || row.systeme_reservation || "",
    systemes_reservation_detectes: (enrichment.bookings || []).join(" | "),
    enrichment_fetch_ok: !!enrichment.fetch_ok,
    enrichment_http_status: enrichment.status || 0,
    enrichment_error: enrichment.fetch_error || "",
    enrichment_final_url: enrichment.finalUrl || "",
    keywords_page: (ev.page || []).join(" | "),
    bucket,
    deep_dive: bucket !== "hors_perimetre",
    priorite_deep_dive: priorite,
  };
}

async function main() {
  const afro = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "AFRO_pertinents.json"), "utf8"));
  const uncertain = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "UNCERTAIN_a_verifier.json"), "utf8"));

  // Enrich: all afro + uncertain that have a non-echo URL (cap uncertain to those with URL)
  const uncertainWithUrl = uncertain.filter((r) => {
    const u = pickFetchUrl(r);
    return u && !isEchoUrl(u);
  });
  const queue = [];
  const seen = new Set();
  for (const r of [...afro, ...uncertainWithUrl]) {
    const k = `${r.name}||${r.telephone}||${r.adresse}`;
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(r);
  }

  console.log(`Enrichment queue: ${queue.length} (afro ${afro.length} + uncertain w/ url ${uncertainWithUrl.length})`);

  const enrichedBase = await mapPool(queue, CONCURRENCY, async (row, idx) => {
    try {
      const url = pickFetchUrl(row);
      if ((idx + 1) % 10 === 0 || idx === 0) {
        console.log(`[${idx + 1}/${queue.length}] ${String(row.name || "").slice(0, 50)}`);
      }
      if (!url || isEchoUrl(url)) {
        return reclassify(row, {
          fetch_ok: false,
          fetch_error: !url ? "no_url" : "echo_url_skipped",
          status: 0,
          text: "",
          socials: {},
          bookings: row.systeme_reservation ? [row.systeme_reservation] : [],
          finalUrl: url,
        });
      }

      const low = url.toLowerCase();
      if (low.includes("instagram.com") || low.includes("facebook.com") || low.includes("tiktok.com")) {
        const socials = {
          instagram: low.includes("instagram.com") ? [url.split("?")[0]] : [],
          facebook: low.includes("facebook.com") || low.includes("fb.com") ? [url.split("?")[0]] : [],
          tiktok: low.includes("tiktok.com") ? [url.split("?")[0]] : [],
        };
        return reclassify(row, {
          fetch_ok: true,
          fetch_error: "",
          status: 200,
          text: "",
          socials,
          bookings: detectBooking(url),
          finalUrl: url,
        });
      }

      const res = await fetchUrl(url);
      const links = extractLinks(res.html || "");
      const text = stripHtml(res.html || "").slice(0, 100000);
      const bookings = detectBooking(`${url} ${res.html || ""}`);
      return reclassify(row, {
        fetch_ok: res.ok,
        fetch_error: res.error || "",
        status: res.status,
        text,
        socials: links,
        bookings,
        finalUrl: res.finalUrl,
      });
    } catch (e) {
      console.error(`ERR ${row.name}:`, e.message);
      return reclassify(row, {
        fetch_ok: false,
        fetch_error: e.message || "exception",
        status: 0,
        text: "",
        socials: {},
        bookings: [],
        finalUrl: pickFetchUrl(row) || "",
      });
    }
  });

  console.log("\nEnrichment done.");

  // Also keep uncertain without URL (no fetch) in separate list for manual queue
  const uncertainNoUrl = uncertain
    .filter((r) => !pickFetchUrl(r) || isEchoUrl(pickFetchUrl(r)))
    .map((r) =>
      reclassify(r, {
        fetch_ok: false,
        fetch_error: !pickFetchUrl(r) ? "no_url" : "echo_url_skipped",
        status: 0,
        text: "",
        socials: {},
        bookings: [],
        finalUrl: pickFetchUrl(r) || "",
      })
    );

  const allEnriched = [...enrichedBase, ...uncertainNoUrl];
  // dedupe again
  const uniqMap = new Map();
  for (const r of allEnriched) {
    uniqMap.set(`${r.name}||${r.telephone}||${r.adresse}`, r);
  }
  const finalRows = [...uniqMap.values()].sort((a, b) => a.priorite_deep_dive - b.priorite_deep_dive);

  const afro2 = finalRows.filter((r) => r.bucket === "afro_pertinent");
  const unc2 = finalRows.filter((r) => r.bucket === "uncertain");
  const deep = finalRows.filter((r) => r.deep_dive);

  const cols = [
    "priorite_deep_dive",
    "name",
    "ville",
    "departement",
    "categorie",
    "niveau_confiance",
    "raisons_classification",
    "faits",
    "hypotheses",
    "signaux_utilises",
    "url_site",
    "telephone",
    "instagram",
    "facebook",
    "tiktok",
    "systeme_reservation",
    "systemes_reservation_detectes",
    "keywords_page",
    "enrichment_fetch_ok",
    "enrichment_http_status",
    "enrichment_error",
    "bucket",
  ];

  const summary = {
    generated_at: new Date().toISOString(),
    method: {
      fact: "Enrichissement limité aux URLs déjà présentes dans metadata.website. Pas de scrape Google Places. Pages Instagram/Facebook/TikTok: URL enregistrée comme fait, contenu non extrait (murs de connexion).",
      rule: "Confiance élevée afro-family uniquement si nom + contenu page concordent.",
    },
    counts: {
      queue_fetched: queue.length,
      fetch_ok: enrichedBase.filter((r) => r.enrichment_fetch_ok).length,
      afro_pertinent_after: afro2.length,
      uncertain_after: unc2.length,
      deep_dive: deep.length,
      priorite_1: deep.filter((r) => r.priorite_deep_dive === 1).length,
      priorite_2: deep.filter((r) => r.priorite_deep_dive === 2).length,
      priorite_3: deep.filter((r) => r.priorite_deep_dive === 3).length,
    },
    by_category_afro: {},
    by_confidence_afro: {},
    booking_afro: {},
    booking_all_enriched: {},
  };

  for (const r of afro2) {
    summary.by_category_afro[r.categorie] = (summary.by_category_afro[r.categorie] || 0) + 1;
    summary.by_confidence_afro[r.niveau_confiance] = (summary.by_confidence_afro[r.niveau_confiance] || 0) + 1;
    if (r.systeme_reservation) summary.booking_afro[r.systeme_reservation] = (summary.booking_afro[r.systeme_reservation] || 0) + 1;
  }
  for (const r of finalRows) {
    if (r.systeme_reservation) {
      summary.booking_all_enriched[r.systeme_reservation] =
        (summary.booking_all_enriched[r.systeme_reservation] || 0) + 1;
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "SUMMARY_etape1b_enrichment.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents_enriched.json"), JSON.stringify(afro2, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents_enriched.csv"), toCsv(afro2, cols));
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_enriched.json"), JSON.stringify(unc2, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_enriched.csv"), toCsv(unc2, cols));
  fs.writeFileSync(path.join(OUT_DIR, "DEEP_DIVE_priorise.json"), JSON.stringify(deep, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "DEEP_DIVE_priorise.csv"), toCsv(deep, cols));

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
