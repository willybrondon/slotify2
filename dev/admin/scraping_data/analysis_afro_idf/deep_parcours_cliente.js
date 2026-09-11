/**
 * Deep-dive parcours cliente — sources publiques sites/plateformes uniquement.
 * Ne scrape pas Instagram/WhatsApp privés. Sépare faits / non_verifie.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const OUT = __dirname;
const TIMEOUT_MS = 10000;
const MAX_BYTES = 500000;

function fetchUrl(rawUrl, redirects = 0) {
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
    if (redirects > 4) return resolve({ ok: false, error: "too_many_redirects", status: 0, html: "", finalUrl: rawUrl });
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
          return fetchUrl(new URL(res.headers.location, parsed).toString(), redirects + 1).then(resolve);
        }
        const chunks = [];
        let size = 0;
        let done = false;
        const finish = (extra = {}) => {
          if (done) return;
          done = true;
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
        res.on("error", (e) => finish({ ok: false, error: e.message }));
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, error: "timeout", status: 0, html: "", finalUrl: rawUrl });
    });
    req.on("error", (e) => resolve({ ok: false, error: e.message, status: 0, html: "", finalUrl: rawUrl }));
    req.end();
  });
}

function textOf(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function linksOf(html) {
  const hrefs = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html || ""))) hrefs.push(m[1]);
  return hrefs;
}

function detectTools(html, url) {
  const blob = `${url} ${html}`.toLowerCase();
  const tools = [];
  const map = [
    ["planity.com", "Planity"],
    ["widget.planity", "Planity"],
    ["fresha.com", "Fresha"],
    ["treatwell.", "Treatwell"],
    ["booksy.com", "Booksy"],
    ["calendly.com", "Calendly"],
    ["resalib.fr", "Resalib"],
    ["simplybook", "SimplyBook"],
    ["skedisy.com", "Skedisy"],
    ["wa.me/", "WhatsApp"],
    ["api.whatsapp.com", "WhatsApp"],
    ["whatsapp.com/send", "WhatsApp"],
    ["instagram.com/", "Instagram link"],
    ["facebook.com/", "Facebook link"],
    ["tiktok.com/", "TikTok link"],
    ["mailto:", "Email"],
    ["tel:", "Téléphone (lien)"],
  ];
  for (const [n, l] of map) if (blob.includes(n) && !tools.includes(l)) tools.push(l);
  return tools;
}

function extractSignals(html, url) {
  const text = textOf(html);
  const low = text.toLowerCase();
  const hrefs = linksOf(html);
  const tools = detectTools(html, url);

  const findSnippets = (re, max = 3) => {
    const out = [];
    let m;
    const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    while ((m = r.exec(text)) && out.length < max) {
      const start = Math.max(0, m.index - 60);
      const end = Math.min(text.length, m.index + m[0].length + 100);
      out.push(text.slice(start, end).replace(/\s+/g, " ").trim());
    }
    return out;
  };

  const facts = {
    tools,
    has_online_booking_cta: /r[eé]serv/.test(low) || /prendre\s+rendez-vous/.test(low) || /book\s+now/.test(low),
    acompte_mentions: findSnippets(/acompte|arrhes|deposit/i),
    annulation_mentions: findSnippets(/annul/.test(low) ? /annul\w*.{0,80}/i : /$a/),
    retard_mentions: findSnippets(/retard|en retard|15\s*min/i),
    whatsapp_instructions: findSnippets(/whatsapp|wa\.me/i),
    photo_demandee: findSnippets(/envoyez?\s+(une\s+)?photo|photo\s+de\s+vos\s+cheveux|envoyer\s+une\s+photo/i),
    prix_mentions: findSnippets(/à\s+partir\s+de|tarif|€|euros?/i, 5),
    duree_mentions: findSnippets(/\d+\s*h(?:eures?)?|\d+\s*min/i, 5),
    faq_present: /faq|questions?\s+fr[eé]quentes/i.test(low),
    prestations_keywords: [
      ...new Set(
        [
          ...((low.match(/\btresses?\b/g) || []).length ? ["tresses"] : []),
          ...((low.match(/\bbraids?\b/g) || []).length ? ["braids"] : []),
          ...((low.match(/\btissage\b/g) || []).length ? ["tissage"] : []),
          ...((low.match(/\blocks?\b/g) || []).length ? ["locks"] : []),
          ...((low.match(/\bperruque|lace\b/g) || []).length ? ["perruque/lace"] : []),
          ...((low.match(/\blissage\b/g) || []).length ? ["lissage"] : []),
          ...((low.match(/\bvanille|twist|knotless|cornrow|nattes?\b/g) || []).length ? ["styles_afro_specifiques"] : []),
          ...((low.match(/\bextensions?\b/g) || []).length ? ["extensions"] : []),
        ]
      ),
    ],
    contact_channels_on_site: {
      whatsapp: tools.includes("WhatsApp"),
      planity: tools.includes("Planity"),
      fresha: tools.includes("Fresha"),
      treatwell: tools.includes("Treatwell"),
      booksy: tools.includes("Booksy"),
      calendly: tools.includes("Calendly"),
      phone_link: tools.includes("Téléphone (lien)"),
      email: tools.includes("Email"),
      instagram: tools.includes("Instagram link"),
      facebook: tools.includes("Facebook link"),
    },
    social_hrefs: {
      instagram: hrefs.filter((h) => /instagram\.com/i.test(h)).slice(0, 3),
      facebook: hrefs.filter((h) => /facebook\.com|fb\.com/i.test(h)).slice(0, 3),
      tiktok: hrefs.filter((h) => /tiktok\.com/i.test(h)).slice(0, 3),
      whatsapp: hrefs.filter((h) => /wa\.me|whatsapp\.com/i.test(h)).slice(0, 3),
      booking: hrefs
        .filter((h) => /planity|fresha|treatwell|booksy|calendly|resalib|rendez-vous|reservation|booking/i.test(h))
        .slice(0, 8),
    },
  };

  // Clean empty annulation if regex failed oddly
  if (!/annul/i.test(low)) facts.annulation_mentions = [];

  return { textPreview: text.slice(0, 1500), facts };
}

function buildFiche(salon, siteAnalysis) {
  const f = siteAnalysis?.facts || {};
  const channels = [];
  if (f.contact_channels_on_site?.instagram) channels.push("Instagram (lien site)");
  if (f.contact_channels_on_site?.facebook) channels.push("Facebook (lien site)");
  if (f.contact_channels_on_site?.planity) channels.push("Planity");
  if (f.contact_channels_on_site?.whatsapp) channels.push("WhatsApp");
  if (f.contact_channels_on_site?.calendly) channels.push("Calendly");
  if (f.contact_channels_on_site?.fresha) channels.push("Fresha");
  if (f.contact_channels_on_site?.treatwell) channels.push("Treatwell");
  if (f.contact_channels_on_site?.booksy) channels.push("Booksy");
  if (salon.telephone) channels.push("Téléphone (présent dans fiche Google importée)");
  if (salon.url_site) channels.push("Site web");

  const reservation = [];
  if (f.contact_channels_on_site?.planity) reservation.push("Planity (détecté sur site)");
  if (f.contact_channels_on_site?.calendly) reservation.push("Calendly (détecté)");
  if (f.contact_channels_on_site?.fresha) reservation.push("Fresha (détecté)");
  if (f.contact_channels_on_site?.treatwell) reservation.push("Treatwell (détecté)");
  if (f.contact_channels_on_site?.booksy) reservation.push("Booksy (détecté)");
  if (f.contact_channels_on_site?.whatsapp) reservation.push("WhatsApp (bouton/lien public sur site)");
  if (f.has_online_booking_cta && reservation.length === 0) reservation.push("CTA réservation sur site (outil non identifiable clairement)");
  if (salon.telephone) reservation.push("Téléphone possible (numéro public)");
  if (!reservation.length) reservation.push("Non identifiable depuis les sources collectées");

  const qualification = [];
  if ((f.photo_demandee || []).length) qualification.push("Demande de photo mentionnée sur le site (fait)");
  if ((f.acompte_mentions || []).length) qualification.push("Acompte/arrhes mentionnés sur le site (fait)");
  if (!(f.photo_demandee || []).length && !(f.acompte_mentions || []).length) {
    qualification.push("Non vérifié sur le site (pas d'extrait trouvé) — ne pas conclure à l'absence");
  }

  const paiement = [];
  if ((f.acompte_mentions || []).length) paiement.push({ type: "fait", detail: f.acompte_mentions[0] });
  else paiement.push({ type: "non_verifie", detail: "Politique d'acompte non trouvée sur le HTML récupéré" });

  const complexite = (f.prestations_keywords || []).length
    ? f.prestations_keywords
    : ["Non listées clairement dans le HTML récupéré"];

  const problemes = [];
  // Only add problems with evidence from THIS collection pass (site). Google reviews added later if found.
  if (!siteAnalysis?.fetch_ok && salon.url_site) {
    problemes.push({
      probleme: "Site web non accessible ou non récupérable au moment de l'analyse",
      preuve: siteAnalysis?.error || "fetch failed",
      source: salon.url_site,
      type: "fait_technique",
      frequence: "n/a",
      gravite: "moyenne",
      impact: "Parcours digitale cassé → cliente bascule téléphone/DM (hypothèse)",
      solution_actuelle: "Canaux alternatifs éventuels non vérifiés",
      opportunite_skedisy: "Landing réservation fiable + fiche salon",
    });
  }
  if (siteAnalysis?.fetch_ok && !f.contact_channels_on_site?.planity && !f.contact_channels_on_site?.fresha && !f.contact_channels_on_site?.calendly && !f.contact_channels_on_site?.booksy && !f.contact_channels_on_site?.treatwell) {
    if (f.contact_channels_on_site?.whatsapp || salon.telephone) {
      problemes.push({
        probleme: "Réservation principalement manuelle (pas d'outil Planity/Fresha/Booksy/Calendly détecté sur le site)",
        preuve: `Outils détectés: ${(f.tools || []).join(", ") || "aucun widget booking classique"}`,
        source: salon.url_site || "fiche import",
        type: "fait",
        frequence: "structurelle",
        gravite: "haute",
        impact: "Friction + no-show + charge WhatsApp/téléphone (hypothèse d'impact)",
        solution_actuelle: f.contact_channels_on_site?.whatsapp ? "WhatsApp public" : "Téléphone / autre non identifié",
        opportunite_skedisy: "Réservation guidée prestations afro + qualification photo + acompte",
      });
    }
  }
  if ((f.acompte_mentions || []).length === 0 && siteAnalysis?.fetch_ok) {
    problemes.push({
      probleme: "Politique d'acompte non visible clairement sur le site",
      preuve: "Aucun extrait 'acompte/arrhes/deposit' trouvé dans le HTML analysé",
      source: salon.url_site,
      type: "fait_absence_sur_page",
      frequence: "n/a",
      gravite: "moyenne",
      impact: "Hypothèse: risque no-show / malentendu prix — non prouvé sans avis",
      solution_actuelle: "Non identifiable",
      opportunite_skedisy: "Acompte intégré au funnel de réservation",
    });
  }

  return {
    salon: salon.name,
    ville: salon.ville,
    departement: salon.departement,
    telephone_public: salon.telephone || "",
    url_site: salon.url_site || "",
    fetch: {
      ok: !!siteAnalysis?.fetch_ok,
      status: siteAnalysis?.status || 0,
      error: siteAnalysis?.error || "",
      finalUrl: siteAnalysis?.finalUrl || "",
    },
    A_acquisition: {
      canaux_apparents_faits: channels,
      principal_apparent: channels[0] || "Non identifiable",
      note: "Sans Google/Instagram scrape, le canal d'acquisition principal reste non prouvé (hypothèse interdite).",
    },
    B_reservation: {
      modes_detectes_faits: reservation,
      details_outils: f.tools || [],
      booking_hrefs: f.social_hrefs?.booking || [],
    },
    C_qualification: {
      infos_demandees_detectees: qualification,
      extraits_photo: f.photo_demandee || [],
    },
    D_paiement: paiement,
    E_complexite_prestations: complexite,
    F_problemes: problemes,
    G_outils: f.tools?.length ? f.tools : ["Aucun système identifiable sur les sources collectées"],
    H_extraits: {
      acompte: f.acompte_mentions || [],
      annulation: f.annulation_mentions || [],
      retard: f.retard_mentions || [],
      whatsapp: f.whatsapp_instructions || [],
      duree: (f.duree_mentions || []).slice(0, 5),
      prix: (f.prix_mentions || []).slice(0, 5),
      faq: !!f.faq_present,
      socials: f.social_hrefs || {},
    },
    limites: [
      "Avis Google non collectés dans ce passage automatisé site-only",
      "Commentaires Instagram/TikTok non accessibles sans API/login — non inventés",
      "Conversations WhatsApp privées non consultées",
    ],
  };
}

async function main() {
  const salons = JSON.parse(fs.readFileSync(path.join(OUT, "AFRO_pertinents.json"), "utf8"));
  const fiches = [];
  const matrix = [];

  for (let i = 0; i < salons.length; i++) {
    const s = salons[i];
    console.log(`[${i + 1}/${salons.length}] ${s.name}`);
    let siteAnalysis = { fetch_ok: false, error: "no_url", status: 0, facts: {}, finalUrl: "" };
    const url = s.url_site;
    if (url && !/frmaps\.|maps\.app\.goo|google\.com\/maps/i.test(url)) {
      const res = await fetchUrl(url);
      if (res.ok || res.html) {
        const extracted = extractSignals(res.html, res.finalUrl || url);
        siteAnalysis = {
          fetch_ok: res.ok,
          status: res.status,
          error: res.error || "",
          finalUrl: res.finalUrl,
          ...extracted,
        };
      } else {
        siteAnalysis = { fetch_ok: false, status: res.status, error: res.error, finalUrl: url, facts: {} };
      }
    } else if (s.systeme_reservation === "Calendly" || /calendly\.com/i.test(url || "")) {
      const calUrl = url || "";
      const res = calUrl ? await fetchUrl(calUrl) : { ok: false, html: "", error: "no_url", status: 0, finalUrl: "" };
      const extracted = extractSignals(res.html || "", calUrl);
      extracted.facts.tools = [...new Set([...(extracted.facts.tools || []), "Calendly"])];
      extracted.facts.contact_channels_on_site.calendly = true;
      siteAnalysis = { fetch_ok: res.ok, status: res.status, error: res.error || "", finalUrl: res.finalUrl || calUrl, ...extracted };
    }

    const fiche = buildFiche(s, siteAnalysis);
    fiches.push(fiche);
    for (const p of fiche.F_problemes) {
      matrix.push({
        Salon: fiche.salon,
        Ville: fiche.ville,
        Problema: p.probleme,
        Preuve: p.preuve,
        Source: p.source,
        Type: p.type,
        Frequence_apparente: p.frequence,
        Gravite: p.gravite,
        Impact_financier_potentiel: p.impact,
        Solution_actuelle: p.solution_actuelle,
        Opportunite_Skedisy: p.opportunite_skedisy,
      });
    }
  }

  // Aggregate opportunities
  const summary = {
    generated_at: new Date().toISOString(),
    n_salons: fiches.length,
    sites_ok: fiches.filter((f) => f.fetch.ok).length,
    with_planity: fiches.filter((f) => (f.G_outils || []).includes("Planity")).length,
    with_whatsapp_public: fiches.filter((f) => (f.G_outils || []).includes("WhatsApp")).length,
    with_calendly: fiches.filter((f) => (f.G_outils || []).includes("Calendly")).length,
    with_acompte_visible: fiches.filter((f) => (f.H_extraits?.acompte || []).length > 0).length,
    with_annulation_visible: fiches.filter((f) => (f.H_extraits?.annulation || []).length > 0).length,
    problems_rows: matrix.length,
    method_limits: [
      "FAIT: analyse basée sur HTML des sites listés + champs du JSON d'import.",
      "NON FAIT dans ce run: scrape Google Reviews, Instagram comments, TikTok, Facebook posts.",
      "Les problèmes liés aux avis clients doivent être ajoutés via recherche manuelle/API Maps autorisée.",
    ],
  };

  fs.writeFileSync(path.join(OUT, "DEEP_FICHES_parcours_cliente.json"), JSON.stringify(fiches, null, 2));
  fs.writeFileSync(path.join(OUT, "DEEP_MATRICE_problemes.json"), JSON.stringify(matrix, null, 2));

  const cols = Object.keys(matrix[0] || { Salon: "", Problema: "" });
  const csv = [cols.join(","), ...matrix.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  fs.writeFileSync(path.join(OUT, "DEEP_MATRICE_problemes.csv"), csv);
  fs.writeFileSync(path.join(OUT, "DEEP_SUMMARY.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
