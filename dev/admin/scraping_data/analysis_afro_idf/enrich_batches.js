/**
 * Enrichissement par lots avec checkpoints (plus robuste sous Windows/PowerShell).
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const OUT_DIR = __dirname;
const TIMEOUT_MS = 8000;
const MAX_BYTES = 400000;
const BATCH = Number(process.env.BATCH_SIZE || 15);

const BOOKING = [
  ["planity.com", "Planity"],
  ["fresha.com", "Fresha"],
  ["treatwell.", "Treatwell"],
  ["booksy.com", "Booksy"],
  ["simplybook", "SimplyBook"],
  ["calendly.com", "Calendly"],
  ["appointfix.com", "AppointFix"],
  ["salonized.com", "Salonized"],
  ["resalib.fr", "Resalib"],
  ["skedisy.com", "Skedisy"],
  ["widget.planity", "Planity"],
];

const CATEGORY_PATTERNS = {
  "coiffure afro": [/\bafro\b/i, /\bantillais(?:e|es)?\b/i, /\bafricain(?:e|es)?\b/i, /\bcheveux\s+cr[eé]pus\b/i, /\bnappy\b/i, /\bblack\s+hair\b/i],
  "barber afro": [/\bbarber\s+afro\b/i, /\bbarbier\s+afro\b/i],
  "braids / tresses": [/\btresses?\b/i, /\bbraids?\b/i, /\bknotless\b/i, /\bbox\s*braids?\b/i, /\bnattes?\b/i, /\bs[eé]n[eé]galais(?:e|es)?\b/i],
  "locks / cheveux naturels": [/\blocks?\b/i, /\bdreadlocks?\b/i, /\bcheveux\s+naturels?\b/i],
  "perruques / lace": [/\bperruques?\b/i, /\bwigs?\b/i, /\blace\s*(?:front|wig)?\b/i, /\bclosure\b/i],
  extensions: [/\bextensions?\b/i, /\btissage\b/i, /\bweave\b/i],
  "coiffure européenne": [/\bcoloriste\b/i, /\bbalayage\b/i, /\bbrushing\b/i],
  esthétique: [/\besth[eé]tique\b/i, /\bongles?\b/i, /\bmanucure\b/i],
  spa: [/\bspa\b/i, /\bmassage\b/i, /\bhead\s*spa\b/i],
};

const AFRO_FAMILY = new Set(["coiffure afro", "barber afro", "braids / tresses", "locks / cheveux naturels", "perruques / lace", "extensions", "salon mixte"]);

function escapeCsv(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows, cols) {
  return [cols.join(","), ...rows.map((r) => cols.map((c) => escapeCsv(r[c])).join(","))].join("\n");
}
function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
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
  for (const [n, l] of BOOKING) if (t.includes(n) && !found.includes(l)) found.push(l);
  return found;
}
function extractLinks(html) {
  const out = { instagram: [], facebook: [], tiktok: [] };
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html || ""))) {
    const href = m[1];
    const low = href.toLowerCase();
    if (low.includes("instagram.com/")) out.instagram.push(href.split("?")[0]);
    else if (low.includes("facebook.com/") || low.includes("fb.com/")) out.facebook.push(href.split("?")[0]);
    else if (low.includes("tiktok.com/")) out.tiktok.push(href.split("?")[0]);
  }
  const u = (a) => [...new Set(a)].slice(0, 5);
  return { instagram: u(out.instagram), facebook: u(out.facebook), tiktok: u(out.tiktok) };
}
function isEchoUrl(u) {
  const low = String(u || "").toLowerCase();
  return low.includes("frmaps.") || low.includes("google.com/maps") || low.includes("g.page/") || low.includes("maps.app.goo.gl");
}
function pickFetchUrl(row) {
  return row.url_site || row.instagram || row.facebook || row.tiktok || "";
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
    if (redirectCount > 3) return resolve({ ok: false, error: "too_many_redirects", status: 0, html: "", finalUrl: rawUrl });

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(
      parsed,
      {
        method: "GET",
        timeout: TIMEOUT_MS,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SkedisyResearchBot/1.0; +https://skedisy.com)",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
          res.resume();
          return fetchUrl(new URL(res.headers.location, parsed).toString(), redirectCount + 1).then(resolve);
        }
        const chunks = [];
        let size = 0;
        let settled = false;
        const finish = (extra = {}) => {
          if (settled) return;
          settled = true;
          resolve({
            ok: status >= 200 && status < 400,
            status,
            html: Buffer.concat(chunks).toString("utf8"),
            finalUrl: parsed.toString(),
            error: status >= 400 ? `http_${status}` : "",
            ...extra,
          });
        };
        res.on("data", (c) => {
          size += c.length;
          if (size <= MAX_BYTES) chunks.push(c);
          else {
            try {
              res.destroy();
            } catch (_) {}
            finish({ error: "truncated" });
          }
        });
        res.on("end", () => finish());
        res.on("error", (e) => finish({ ok: false, error: e.message || "response_error" }));
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, error: "timeout", status: 0, html: "", finalUrl: rawUrl });
    });
    req.on("error", (e) => resolve({ ok: false, error: e.message || "network_error", status: 0, html: "", finalUrl: rawUrl }));
    req.end();
  });
}

function reclassify(row, enrichment) {
  const name = row.name || "";
  const htmlText = enrichment.text || "";
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
    faits.push("Signaux afro-family et coiffure européenne dans nom et/ou page.");
  }

  const ev = evidence[categorie] || evidence[ranked[0]?.[0]] || { nom: [], page: [] };
  if ((ev.nom || []).length) faits.push(`Nom: ${(ev.nom || []).join(", ")}`);
  if ((ev.page || []).length) faits.push(`Page: ${(ev.page || []).slice(0, 8).join(", ")}`);

  const sources = new Set();
  if ((ev.nom || []).length) sources.add("nom");
  if ((ev.page || []).length) sources.add("contenu_page");
  if (enrichment.bookings?.length) sources.add("widget_reservation");
  if (enrichment.socials?.instagram?.length || enrichment.socials?.facebook?.length) sources.add("liens_sociaux");

  if (sources.has("nom") && sources.has("contenu_page")) {
    confiance = "élevé";
    raisons.push("Concordance nom + contenu page.");
  } else if (sources.has("contenu_page")) {
    confiance = "moyen";
    raisons.push("Signaux dans HTML public.");
  } else if (sources.has("nom")) {
    confiance = "moyen";
    raisons.push("Signal surtout dans le nom.");
    hypotheses.push("Positionnement réel peut différer du nom.");
  } else {
    confiance = "faible";
    raisons.push(enrichment.fetch_ok ? "Page OK mais peu de signaux." : "Page absente/non récupérée.");
    hypotheses.push("Non fiable sans Google types / avis / prestations.");
  }

  if (AFRO_FAMILY.has(categorie) && sources.size === 1 && sources.has("nom")) {
    confiance = "moyen";
    raisons.push("Règle: pas élevé afro-family sur seul nom.");
  }
  if (!enrichment.fetch_ok && pickFetchUrl(row) && !isEchoUrl(pickFetchUrl(row))) {
    hypotheses.push(`Fetch échoué (${enrichment.fetch_error || "unknown"}).`);
  }

  let bucket = "hors_perimetre";
  if (AFRO_FAMILY.has(categorie) || categorie === "salon mixte") bucket = confiance === "faible" ? "uncertain" : "afro_pertinent";
  else if (categorie === "inconnu") bucket = "uncertain";

  let priorite = 5;
  if (bucket === "afro_pertinent" && confiance === "élevé") priorite = 1;
  else if (bucket === "afro_pertinent") priorite = 2;
  else if (bucket === "uncertain" && enrichment.fetch_ok && (ev.page || []).length) priorite = 3;
  else if (bucket === "uncertain" && pickFetchUrl(row)) priorite = 4;

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
    systeme_reservation: (enrichment.bookings && enrichment.bookings[0]) || row.systeme_reservation || "",
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

async function enrichOne(row) {
  const url = pickFetchUrl(row);
  if (!url || isEchoUrl(url)) {
    return reclassify(row, {
      fetch_ok: false,
      fetch_error: !url ? "no_url" : "echo_url_skipped",
      status: 0,
      text: "",
      socials: {},
      bookings: row.systeme_reservation ? [row.systeme_reservation] : [],
      finalUrl: url || "",
    });
  }
  const low = url.toLowerCase();
  if (low.includes("instagram.com") || low.includes("facebook.com") || low.includes("tiktok.com") || low.includes("fb.com")) {
    return reclassify(row, {
      fetch_ok: true,
      fetch_error: "",
      status: 200,
      text: "",
      socials: {
        instagram: low.includes("instagram.com") ? [url.split("?")[0]] : [],
        facebook: low.includes("facebook.com") || low.includes("fb.com") ? [url.split("?")[0]] : [],
        tiktok: low.includes("tiktok.com") ? [url.split("?")[0]] : [],
      },
      bookings: detectBooking(url),
      finalUrl: url,
    });
  }
  const res = await fetchUrl(url);
  return reclassify(row, {
    fetch_ok: res.ok,
    fetch_error: res.error || "",
    status: res.status,
    text: stripHtml(res.html || "").slice(0, 80000),
    socials: extractLinks(res.html || ""),
    bookings: detectBooking(`${url} ${res.html || ""}`),
    finalUrl: res.finalUrl,
  });
}

function writeOutputs(finalRows) {
  const afro2 = finalRows.filter((r) => r.bucket === "afro_pertinent");
  const unc2 = finalRows.filter((r) => r.bucket === "uncertain");
  const deep = finalRows.filter((r) => r.deep_dive).sort((a, b) => a.priorite_deep_dive - b.priorite_deep_dive);
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
      fact: "Enrichissement via URLs déjà dans metadata.website uniquement. Pas de Google Places scrape. Contenu IG/FB/TikTok non extrait.",
      rule: "Confiance élevée afro-family seulement si nom + contenu page.",
    },
    counts: {
      total_enriched_rows: finalRows.length,
      fetch_ok: finalRows.filter((r) => r.enrichment_fetch_ok).length,
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
  };
  for (const r of afro2) {
    summary.by_category_afro[r.categorie] = (summary.by_category_afro[r.categorie] || 0) + 1;
    summary.by_confidence_afro[r.niveau_confiance] = (summary.by_confidence_afro[r.niveau_confiance] || 0) + 1;
    if (r.systeme_reservation) summary.booking_afro[r.systeme_reservation] = (summary.booking_afro[r.systeme_reservation] || 0) + 1;
  }
  fs.writeFileSync(path.join(OUT_DIR, "SUMMARY_etape1b_enrichment.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents_enriched.json"), JSON.stringify(afro2, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "AFRO_pertinents_enriched.csv"), toCsv(afro2, cols));
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_enriched.json"), JSON.stringify(unc2, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "UNCERTAIN_enriched.csv"), toCsv(unc2, cols));
  fs.writeFileSync(path.join(OUT_DIR, "DEEP_DIVE_priorise.json"), JSON.stringify(deep, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "DEEP_DIVE_priorise.csv"), toCsv(deep, cols));
  fs.writeFileSync(path.join(OUT_DIR, "checkpoint_enriched_all.json"), JSON.stringify(finalRows, null, 2));
  return summary;
}

async function main() {
  const afro = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "AFRO_pertinents.json"), "utf8"));
  const uncertain = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "UNCERTAIN_a_verifier.json"), "utf8"));
  const checkpointPath = path.join(OUT_DIR, "checkpoint_enriched_all.json");

  const doneMap = new Map();
  if (fs.existsSync(checkpointPath)) {
    try {
      for (const r of JSON.parse(fs.readFileSync(checkpointPath, "utf8"))) {
        doneMap.set(`${r.name}||${r.telephone}||${r.adresse}`, r);
      }
      console.log("Loaded checkpoint:", doneMap.size);
    } catch (_) {}
  }

  const queue = [];
  const seen = new Set();
  for (const r of [...afro, ...uncertain]) {
    const k = `${r.name}||${r.telephone}||${r.adresse}`;
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(r);
  }

  // Prefer rows with real URLs first
  queue.sort((a, b) => {
    const ua = pickFetchUrl(a) && !isEchoUrl(pickFetchUrl(a)) ? 0 : 1;
    const ub = pickFetchUrl(b) && !isEchoUrl(pickFetchUrl(b)) ? 0 : 1;
    return ua - ub;
  });

  console.log("Queue size:", queue.length, "batch:", BATCH);
  let processed = 0;
  for (let start = 0; start < queue.length; start += BATCH) {
    const slice = queue.slice(start, start + BATCH);
    for (const row of slice) {
      const k = `${row.name}||${row.telephone}||${row.adresse}`;
      if (doneMap.has(k) && doneMap.get(k)._enriched_v) {
        processed++;
        continue;
      }
      try {
        const enriched = await enrichOne(row);
        enriched._enriched_v = 1;
        doneMap.set(k, enriched);
      } catch (e) {
        const failed = reclassify(row, {
          fetch_ok: false,
          fetch_error: e.message || "exception",
          status: 0,
          text: "",
          socials: {},
          bookings: [],
          finalUrl: pickFetchUrl(row) || "",
        });
        failed._enriched_v = 1;
        doneMap.set(k, failed);
      }
      processed++;
    }
    const rows = [...doneMap.values()];
    const summary = writeOutputs(rows);
    console.log(`Checkpoint ${processed}/${queue.length} | afro=${summary.counts.afro_pertinent_after} uncertain=${summary.counts.uncertain_after} fetch_ok=${summary.counts.fetch_ok}`);
  }

  const summary = writeOutputs([...doneMap.values()]);
  console.log("DONE");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
