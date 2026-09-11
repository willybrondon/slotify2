/**
 * Fusionne fiches site-only + preuves publiques collectées (Planity, pages RDV, annuaires).
 * Sépare strictement FAIT vs HYPOTHESE.
 */
const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const fiches = JSON.parse(fs.readFileSync(path.join(OUT, "DEEP_FICHES_parcours_cliente.json"), "utf8"));

/** Preuves additionnelles vérifiées manuellement (URLs publiques) — hors scrape IG/TikTok privé */
const EXTRA = {
  "NOUCHE PARIS meilleur salon Afro Antillais": {
    A: ["Google (volume d'avis public élevé cité par annuaires)", "Planity", "Site"],
    B: ["Planity (https://www.planity.com/nouche-paris-75008)", "Téléphone public"],
    C: ["Choix de prestation + durée affichées sur Planity", "Suppléments longueur/masse/volume listés"],
    D: [
      {
        type: "fait",
        detail:
          "Prix affichés sur Planity (ex. tissage 130–400€, twists 200–400€, box braids longs 350€/4h). Politique d'acompte spécifique non extraite clairement sur la fiche Planity consultée.",
      },
    ],
    E: ["Twists sénégalaises 2h–4h20", "Box braids 4h", "Extensions kératine 3–4h", "Lissages 2–3h", "Perruques/lace"],
    G: ["Planity", "Téléphone"],
    problems: [
      {
        probleme: "Écart / hausse de prix perçue entre deux visites",
        preuve:
          "Avis Planity 4,0 (06/09/2026): « prix très élevés : un mois après, même prestation payée 20€ de plus »",
        source: "https://www.planity.com/nouche-paris-75008",
        frequence: "au moins 1 avis public explicite",
        gravite: "moyenne",
        impact: "Perte de confiance prix / abandon (hypothèse d'impact)",
        solution_actuelle: "Tarifs Planity + réponses salon sur avis",
        opportunite_skedisy: "Prix verrouillé à la réservation + transparence suppléments",
      },
      {
        probleme: "Complexité catalogue + durée longue difficile à self-serve sans diagnostic",
        preuve:
          "Catalogue Planity: dizaines de prestations afro (tresses, locks, tissage, lace) avec durées 30min–4h20 et suppléments masse/longueur",
        source: "https://www.planity.com/nouche-paris-75008",
        frequence: "structurelle",
        gravite: "haute",
        impact: "Mauvaise estimation durée/prix → retards chaîne + mécontentement (hypothèse)",
        solution_actuelle: "Planity + téléphone",
        opportunite_skedisy: "Parcours guidé texture/longueur/photo avant créneau",
      },
      {
        probleme: "Risque de dommages capillaires / résultat non conforme aux attentes",
        preuve:
          "Avis agrégés sur annuaire public (meilleur-coiffeur.fr) mentionnant cheveux brûlés / déception après soin (verbatim partiels publics)",
        source: "https://salon-de-coiffure.meilleur-coiffeur.fr/nouche-paris-meilleur-salon-afro-antillais-1077124.html",
        frequence: "avis négatifs présents parmi un volume majoritairement positif (non quantifié exhaustivement ici)",
        gravite: "haute",
        impact: "Litiges / perte de confiance / coût de reprise",
        solution_actuelle: "Réponses ponctuelles / expertise affichée",
        opportunite_skedisy: "Briefing pré-RDV + photos + consentement prestation à risque",
      },
      {
        probleme: "Tarifs non publiés hors Planity selon certains annuaires",
        preuve: "MCB: « Ce salon ne publie pas ses tarifs. Appelle-le pour connaître le prix »",
        source: "https://www.mon-coiffeur-boucles.fr/paris/nouche-paris-meilleur-salon-afro-antillais-paris",
        frequence: "signal d'annuaire",
        gravite: "moyenne",
        impact: "Friction acquisition / appels de qualification",
        solution_actuelle: "Planity publie des prix; site/annuaires inconsistants",
        opportunite_skedisy: "Une source de vérité prix + devis",
      },
    ],
  },
  "CindyFashion Paris- Meilleur coiffeur Afro Antillais": {
    A: ["Site web", "Google/annuaires", "Bouche-à-oreille (non mesuré)"],
    B: [
      "Formulaire site « nous vous contacterons pour confirmer » (pas de confirmation instantanée)",
      "Téléphone 01 71 97 65 95 / 06 59 12 85 45",
      "Walk-in possible: site indique « Avec ou sans rendez-vous »",
    ],
    C: ["Date souhaitée", "Heure souhaitée", "Confirmation manuelle par le salon"],
    D: [
      {
        type: "fait",
        detail: "Acompte non trouvé sur pages RDV/contact consultées. Témoignage site: prestation jugée « onéreuse ».",
      },
    ],
    E: ["Tresses", "Tissage/closure", "Locks/twist", "Lissage tanin", "Défrisage", "Curly", "Homme/enfant"],
    G: ["Formulaire propriétaire site", "Téléphone", "Instagram/Facebook (liens site)"],
    problems: [
      {
        probleme: "Réservation non instantanée — file d'attente de confirmation humaine",
        preuve:
          "Page RDV: « Remplissez le formulaire… nous vous contacterons pour confirmer votre rendez vous »",
        source: "https://cindyfashion-coiffure-afro.fr/rendez-vous-coiffeur/",
        frequence: "structurelle (design du funnel)",
        gravite: "haute",
        impact: "Abandon entre demande et confirmation; charge téléphone",
        solution_actuelle: "Formulaire + rappel salon",
        opportunite_skedisy: "Confirmation auto + créneaux réels + file d'attente intelligente",
      },
      {
        probleme: "Mix RDV / sans RDV → risque d'attente au salon",
        preuve: "Homepage: « Avec ou sans rendez-vous » + horaires non-stop",
        source: "https://cindyfashion-coiffure-afro.fr/",
        frequence: "politique affichée",
        gravite: "moyenne",
        impact: "Attente client / surcharge journée (hypothèse opérationnelle)",
        solution_actuelle: "Walk-in accepté",
        opportunite_skedisy: "File d'attente digitale + ETA",
      },
      {
        probleme: "Durée longue perçue (tresses)",
        preuve: "Livre d'or site: cliente « 3h30 » pour tresses longues",
        source: "https://cindyfashion-coiffure-afro.fr/avis-coiffeur-cindyfashion-paris-75010/",
        frequence: "au moins 1 témoignage public",
        gravite: "moyenne",
        impact: "Sous-estimation durée à la réservation",
        solution_actuelle: "Non visible clairement sur formulaire RDV",
        opportunite_skedisy: "Estimateur durée selon style/longueur/mèches",
      },
      {
        probleme: "Perception prix élevé",
        preuve: "Témoignage site: « bonne prestation mais reste tout de même onéreux »",
        source: "https://cindyfashion-coiffure-afro.fr/",
        frequence: "au moins 1 témoignage",
        gravite: "basse-moyenne",
        impact: "Friction conversion",
        solution_actuelle: "Non identifiable",
        opportunite_skedisy: "Devis clair avant confirmation",
      },
      {
        probleme: "Dommages capillaires allégués dans avis agrégés",
        preuve: "Avis agrégés mentionnant cheveux brûlés après prestation (annuaire public)",
        source: "https://salon-de-coiffure.meilleur-coiffeur.fr/cindyfashion-paris-meilleur-coiffeur-afro-antillais-1034315.html",
        frequence: "avis négatifs présents (volume total non audité exhaustivement)",
        gravite: "haute",
        impact: "Litige / reprise / e-réputation",
        solution_actuelle: "Non identifiable",
        opportunite_skedisy: "Checklist contre-indications + consentement + photos avant/après",
      },
    ],
  },
  "Salon de coiffure Afro Queen Lace Paris": {
    A: ["Planity", "Treatwell", "Google", "Site", "TikTok/IG (liens site)"],
    B: ["Planity", "Treatwell", "Téléphone", "Email"],
    C: ["Diagnostic affiché comme étape 1 du parcours (site)", "Réservation en ligne via plateformes"],
    D: [{ type: "fait", detail: "Prix « dès X€ » affichés sur site (ex. lissages dès 210€ / 2h). Acompte: non extrait explicitement sur homepage." }],
    E: ["Lissages sans formol", "Soins/Silk Press/Head Spa", "Balayages texturés", "Parcours Queen Signature"],
    G: ["Planity", "Treatwell", "Téléphone", "Email", "Instagram", "TikTok"],
    problems: [
      {
        probleme: "Parcours multi-plateformes (Planity + Treatwell) → complexité ops & pricing",
        preuve: "Site affiche notes Planity 4,9 / Treatwell 4,7 / Google 4,4 et CTA réservation",
        source: "https://queenlaceparis.com/",
        frequence: "structurelle",
        gravite: "moyenne",
        impact: "Double gestion agenda / commissions (hypothèse coût)",
        solution_actuelle: "Planity + Treatwell",
        opportunite_skedisy: "Agenda unique vertical afro + moins de fragmentation",
      },
    ],
  },
  "Salon Nixya Paris - Coiffeur afro - Braids, Tresses, Lissage, Coloration": {
    A: ["Site", "Google (« 90+ avis » affiché)", "Réseaux sociaux"],
    B: ["Formulaire / email / téléphone / réseaux / WhatsApp (lien public site) — pas de Planity détecté"],
    C: [
      "Contact pour « tout renseignement supplémentaire » sur prestations marquées ***",
      "Diagnostic capillaire mis en avant",
    ],
    D: [{ type: "non_verifie", detail: "Tarifs non listés clairement sur homepage; orientation contact manuel" }],
    E: ["Locks", "Braids/vanille/crochets", "Tissage", "Lissages", "Coloration/ombre", "Chignons"],
    G: ["WhatsApp", "Instagram", "Facebook", "Email", "Téléphone"],
    problems: [
      {
        probleme: "Prestations complexes hors self-serve (*** = contacter)",
        preuve: "Site: reprises plaques / réparation locks / extensions locks marquées *** + « contactez-nous… pour tout renseignement »",
        source: "https://nixya.fr/",
        frequence: "structurelle",
        gravite: "haute",
        impact: "Réservation impossible sans qualification humaine",
        solution_actuelle: "WhatsApp / DM / téléphone / formulaire",
        opportunite_skedisy: "Qualification structurée (photos, historique locks) avant créneau",
      },
      {
        probleme: "Canal WhatsApp comme couche de réservation",
        preuve: "Lien/outil WhatsApp détecté sur le site public",
        source: "https://nixya.fr/ (+ détection HTML)",
        frequence: "structurelle",
        gravite: "haute",
        impact: "Charge opérationnelle + perte de tracking no-show",
        solution_actuelle: "WhatsApp",
        opportunite_skedisy: "Remplacer le fil WhatsApp par un tunnel de réservation qualifiant",
      },
    ],
  },
};

const matrix = [];
const fichesEnrichies = [];

for (const f of fiches) {
  const extra = EXTRA[f.salon];
  const merged = { ...f };
  if (extra) {
    merged.A_acquisition = {
      canaux_apparents_faits: extra.A,
      principal_apparent: extra.A[0],
      note: f.A_acquisition?.note,
    };
    merged.B_reservation = {
      modes_detectes_faits: extra.B,
      details_outils: extra.G,
      booking_hrefs: f.B_reservation?.booking_hrefs || [],
    };
    merged.C_qualification = {
      infos_demandees_detectees: extra.C,
      extraits_photo: f.C_qualification?.extraits_photo || [],
    };
    merged.D_paiement = extra.D;
    merged.E_complexite_prestations = extra.E;
    merged.G_outils = extra.G;
    const existing = f.F_problemes || [];
    merged.F_problemes = [...existing, ...extra.problems];
  }
  fichesEnrichies.push(merged);

  for (const p of merged.F_problemes || []) {
    matrix.push({
      Salon: merged.salon,
      Ville: merged.ville || "",
      Probleme: p.probleme,
      Preuve: p.preuve,
      Source: p.source,
      Type: p.type || "fait",
      Frequence_apparente: p.frequence,
      Gravite: p.gravite,
      Impact_financier_potentiel: p.impact,
      Solution_actuelle_utilisee: p.solution_actuelle,
      Opportunite_pour_Skedisy: p.opportunite_skedisy,
    });
  }
}

// Sector patterns (facts only about observed sample)
const patterns = {
  sample_size: fiches.length,
  booking_stack_observed: {
    planity_on_site_or_verified: ["Queen Lace", "BOOBEAUTY", "NOUCHE (Planity page verified)"],
    whatsapp_public: ["Nixya", "Jenny & Paola"],
    calendly: ["Coiffeuse Afro domicile Conflans", "MabyPro (Pinterest URL edge case / calendly detect)"],
    formulaire_manuel: ["CindyFashion"],
    telephone_only_or_unknown: "Majorité des fiches sans widget booking détecté",
  },
  journey_hypothesis_forbidden_note:
    "Les frictions Instagram DM / TikTok / no-show ne sont PAS affirmées comme faits pour chaque salon faute d'accès commentaires publics exhaustifs dans ce run.",
  skedisy_opportunity_clusters: [
    {
      cluster: "Qualification avant créneau",
      why_fact_based: "Catalogues longs (Nouche Planity) + prestations *** contact required (Nixya) + formulaire confirm-later (CindyFashion)",
    },
    {
      cluster: "Transparence prix & suppléments",
      why_fact_based: "Avis hausse +20€ (Nouche Planity) + suppléments longueur/masse listés + tarifs « sur devis »",
    },
    {
      cluster: "Remplacement WhatsApp ops",
      why_fact_based: "WhatsApp public détecté (Nixya, Jenny & Paola) comme canal de contact/réservation",
    },
    {
      cluster: "Gestion durée réelle",
      why_fact_based: "Durées Planity jusqu'à 4h20; témoignage 3h30 tresses (CindyFashion)",
    },
  ],
};

function toCsv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  return [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
}

fs.writeFileSync(path.join(OUT, "DEEP_FICHES_enrichies.json"), JSON.stringify(fichesEnrichies, null, 2));
fs.writeFileSync(path.join(OUT, "DEEP_MATRICE_problemes_finale.json"), JSON.stringify(matrix, null, 2));
fs.writeFileSync(path.join(OUT, "DEEP_MATRICE_problemes_finale.csv"), toCsv(matrix));
fs.writeFileSync(path.join(OUT, "DEEP_PATTERNS_opportunite.json"), JSON.stringify(patterns, null, 2));

const md = `# Analyse approfondie — parcours cliente salons afro IDF

Généré: ${new Date().toISOString()}

## Périmètre & limites (FAITS)

- Base: **26 salons** classés afro-pertinents (étape 1).
- Sources utilisées: sites publics, Planity, pages RDV, annuaires publics.
- **Non fait**: scrape des commentaires Instagram/TikTok, conversations WhatsApp privées, API Google Reviews complète.
- Toute conclusion non sourcée est marquée **hypothèse** et n'est pas dans la matrice comme fait.

## Parcours type observé (synthèse factuelle)

1. **Découverte**: Google / site / annuaire (volume d'avis parfois très élevé, ex. Nouche cité ~1000 avis Google par annuaires).
2. **Intention**: catalogue complexe (tresses, locks, tissage, lace, lissage…) avec durées 30 min → 4h+.
3. **Réservation**:
   - **Self-serve plateforme**: Planity/Treatwell (Queen Lace, Nouche via Planity, Boobeauty).
   - **Demande puis rappel**: formulaire CindyFashion (« nous vous contacterons »).
   - **Messagerie**: WhatsApp public (Nixya, Jenny & Paola).
   - **Téléphone / opaque**: nombreux salons sans widget détecté.
4. **Qualification**: souvent absente du funnel digital (sauf diagnostic marketing Queen Lace / contact manuel Nixya pour cas ***).
5. **Paiement**: prix parfois affichés (Planity); acompte rarement explicite sur pages scrapées de *ce* sample (alors que des salons afro hors sample — Namani, Shine Hair — documentent acompte 20€–50% en public).
6. **Exécution**: durée longue + risque technique (avis dommages capillaires publics sur annuaires).
7. **Après**: avis Planity/Google; friction prix (exemple +20€ Nouche).

## Matrice

Voir \`DEEP_MATRICE_problemes_finale.csv\` (${matrix.length} lignes).

## Opportunité Skedisy (ancrée dans les faits du sample)

1. Tunnel de réservation **qualifiant** (texture, longueur, mèches fournies?, photo) avant créneau.
2. **Prix verrouillé** + suppléments explicites (contre surprise tarifaire).
3. Remplacement du **WhatsApp ops** par un état de réservation trackable (no-show, acompte, confirmation).
4. Estimateur de **durée réelle** pour tresses/locks/extensions.
`;

fs.writeFileSync(path.join(OUT, "DEEP_RAPPORT_parcours_cliente.md"), md);
console.log("matrix rows", matrix.length);
console.log("written finale files");
