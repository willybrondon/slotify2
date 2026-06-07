/**
 * Aligne les chaînes « marque » des apps Flutter cliente & expert
 * sur AUTHENTICITE_SKEDISY.md (FR IDF + EN fallback pour les autres langues).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const CUSTOMER_LANG = path.join(ROOT, "flutter/multi_salon_customer/lib/language");
const EXPERT_LANG = path.join(ROOT, "flutter/multi_salon_expert/lib/language");

const CUSTOMER_FR = {
  txtWelcomeService: "Ta beauté afro en Île-de-France — tresses, locks, naturel.",
  txtWelcomeBack: "Skedisy",
  txtWelcomeTagline: "Les salons de la communauté, une app à nous.",
  txtSearchServices: "Rechercher une prestation",
  txtQuickBookAppointment: "Réserver une prestation",
  txtNearbyBranches: "Salons afro à proximité",
  txtNearBranches: "Salons afro près de toi",
  txtOurCategory: "Nos univers beauté afro",
  txtTopExperts: "L'équipe du salon",
  txtNotSalon: "Aucun salon afro trouvé près de toi en IDF.",
  txtSalonJourney: "Ton salon afro en Île-de-France ?",
  txtAboutAppDescription:
    "Skedisy, c'est la réservation pensée pour la communauté afro en Île-de-France — ses salons, ses cheveux, ses quartiers. Trouve un salon afro près de toi, choisis ta prestation (tresses, locks, tissage, naturel…) et réserve en quelques clics.",
  txtFeature1: "• Salons afro en Île-de-France — par quartier et par prestation",
  txtFeature2: "• Prestations nommées : tresses, locks, tissages, cheveux naturels",
  txtFeature3: "• Concierge IA : selfie → reco adaptée à tes cheveux texturés",
  txtFeature4: "• Durée et tarif indicatif avant de réserver",
  txtFeature5: "• Historique et prochains rendez-vous",
  txtFeature6: "• Avis sur les salons et l'équipe",
  txtFeature7: "• Paiement sécurisé (carte, portefeuille, au salon)",
  txtFeature8: "• Rappels SMS avant ton rendez-vous",
  txtCopyright: "© 2026 Skedisy. Tous droits réservés.",
  txtShareAppMessage:
    "Découvre Skedisy — la réservation beauté afro en Île-de-France : https://skedisy.com",
  txtAiConciergeTitle: "Concierge beauté IA",
  txtAiConciergeSubtitle:
    "Un selfie, une reco adaptée à tes cheveux texturés — tresses, locks, naturel en IDF.",
  txtAiConciergeCta: "Essayer →",
  txtAiConciergeHeroTitle: "Recommandations personnalisées",
  txtAiConciergeHeroBody:
    "Envoie un selfie : l'IA analyse tes cheveux texturés et te propose les prestations et salons afro adaptés en Île-de-France.",
  txtAiConciergeUploadTitle: "Ajoute ton selfie",
  txtAiConciergeUploadHint: "Appuie sur le bouton ci-dessous",
  txtAiConciergeAnalyze: "Analyser mes cheveux",
  txtAiConciergeAnalyzing: "Analyse en cours…",
  txtAiConciergeRecommendedServices: "Prestations recommandées",
  txtAiConciergeRecommendedSalons: "Salons recommandés",
  txtAiConciergeSelectImage: "Choisir une photo",
  txtAiConciergeChangeImage: "Changer la photo",
};

const CUSTOMER_EN = {
  txtWelcomeService: "Afro beauty in Île-de-France — braids, locks, natural hair.",
  txtWelcomeBack: "Skedisy",
  txtWelcomeTagline: "Salons for our community — an app that's ours.",
  txtSearchServices: "Search for a service",
  txtQuickBookAppointment: "Book a service",
  txtNearbyBranches: "Afro salons nearby",
  txtNearBranches: "Afro salons near you",
  txtOurCategory: "Afro beauty categories",
  txtTopExperts: "Salon team",
  txtNotSalon: "No afro salon found near you in Île-de-France.",
  txtSalonJourney: "Your afro salon in Île-de-France?",
  txtAboutAppDescription:
    "Skedisy is booking built for the afro community in Île-de-France — its salons, its hair, its neighbourhoods. Find an afro salon near you, pick your service (braids, locks, weave, natural hair…) and book in a few taps.",
  txtFeature1: "• Afro salons in Île-de-France — by area and service",
  txtFeature2: "• Named services: braids, locks, weaves, natural hair",
  txtFeature3: "• AI Concierge: selfie → recommendations for textured hair",
  txtFeature4: "• Clear duration and indicative price before booking",
  txtFeature5: "• Appointment history and upcoming bookings",
  txtFeature6: "• Reviews for salons and stylists",
  txtFeature7: "• Secure payment (card, wallet, pay at salon)",
  txtFeature8: "• SMS reminders before your appointment",
  txtCopyright: "© 2026 Skedisy. All rights reserved.",
  txtShareAppMessage:
    "Discover Skedisy — afro beauty booking in Île-de-France: https://skedisy.com",
  txtAiConciergeTitle: "AI Beauty Concierge",
  txtAiConciergeSubtitle:
    "One selfie, recommendations for your textured hair — braids, locks, natural styles in IDF.",
  txtAiConciergeCta: "Try now →",
  txtAiConciergeHeroTitle: "Personalized recommendations",
  txtAiConciergeHeroBody:
    "Send a selfie: AI analyzes your textured hair and suggests afro salons and services in Île-de-France.",
  txtAiConciergeUploadTitle: "Add your selfie",
  txtAiConciergeUploadHint: "Tap the button below",
  txtAiConciergeAnalyze: "Analyze my hair",
  txtAiConciergeAnalyzing: "Analyzing…",
  txtAiConciergeRecommendedServices: "Recommended services",
  txtAiConciergeRecommendedSalons: "Recommended salons",
  txtAiConciergeSelectImage: "Select photo",
  txtAiConciergeChangeImage: "Change photo",
};

const EXPERT_FR = {
  txtAppName: "Skedisy Pro",
  txtVersion: "Version",
  txtLegalInformation: "Informations légales",
  txtRateShare: "Noter et partager",
  txtWelcomeService: "Skedisy Pro — l'outil des pros afro en Île-de-France",
  txtWelcomeExpertGreeting: "Bonjour, @name",
  txtWelcomeExpertSubtitle: "Ton agenda, tes clientes — salon afro IDF",
  txtAboutAppDescription:
    "Skedisy Pro accompagne les experts et gérants des salons afro en Île-de-France : agenda en ligne, réservations, créneaux, revenus et visibilité auprès d'une clientèle qui te comprend.",
  txtAppFeatures: "Fonctionnalités",
  txtFeature1: "• Agenda et créneaux — moins de no-shows",
  txtFeature2: "• Réservations clientes en temps réel",
  txtFeature3: "• Suivi des revenus et des prestations",
  txtFeature4: "• Gestion des indisponibilités et congés",
  txtFeature5: "• Visibilité sur Skedisy — salons afro IDF",
  txtCopyright: "© 2026 Skedisy. Tous droits réservés.",
  txtShareAppMessage:
    "Skedisy Pro — l'app des experts des salons afro en IDF : https://skedisy.com/professionnel/",
  txtWebsite: "skedisy.com/professionnel",
};

const EXPERT_EN = {
  txtAppName: "Skedisy Pro",
  txtVersion: "Version",
  txtLegalInformation: "Legal information",
  txtRateShare: "Rate & share",
  txtWelcomeService: "Skedisy Pro — for afro salon pros in Île-de-France",
  txtWelcomeExpertGreeting: "Hello, @name",
  txtWelcomeExpertSubtitle: "Your schedule, your clients — afro salon IDF",
  txtAboutAppDescription:
    "Skedisy Pro supports stylists and managers at afro salons in Île-de-France: online calendar, bookings, slots, earnings and visibility with clients who understand your craft.",
  txtAppFeatures: "Features",
  txtFeature1: "• Calendar and slots — fewer no-shows",
  txtFeature2: "• Real-time client bookings",
  txtFeature3: "• Earnings and service tracking",
  txtFeature4: "• Manage busy time and days off",
  txtFeature5: "• Visibility on Skedisy — afro salons IDF",
  txtCopyright: "© 2026 Skedisy. All rights reserved.",
  txtShareAppMessage:
    "Skedisy Pro — the app for afro salon experts in IDF: https://skedisy.com/professionnel/",
  txtWebsite: "skedisy.com/professionnel",
};

function escapeDart(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function upsertKey(content, key, value) {
  const escaped = escapeDart(value);
  const singleLine = `  "${key}": "${escaped}",`;
  const multiLine = `  "${key}":\n      "${escaped}",`;
  const replacement = value.length > 72 ? multiLine : singleLine;

  const re = new RegExp(
    `  "${key}":\\s*(?:"(?:[^"\\\\]|\\\\.)*"|\\n\\s*"(?:[^"\\\\]|\\\\.)*"),`,
    "m"
  );
  if (re.test(content)) {
    return content.replace(re, replacement);
  }
  return content.replace(/\n\};\s*$/, `\n${replacement}\n};\n`);
}

function patchLangDir(dir, keysByFile) {
  let count = 0;
  for (const [file, keys] of Object.entries(keysByFile)) {
    const fp = path.join(dir, file);
    if (!fs.existsSync(fp)) {
      console.warn("skip missing", fp);
      continue;
    }
    let content = fs.readFileSync(fp, "utf8");
    for (const [k, v] of Object.entries(keys)) {
      content = upsertKey(content, k, v);
    }
    fs.writeFileSync(fp, content, "utf8");
    count++;
    console.log("patched", fp);
  }
  return count;
}

function allLangFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith("_language.dart"));
}

function buildCustomerPatches() {
  const patches = {};
  for (const f of allLangFiles(CUSTOMER_LANG)) {
    const isFr = f === "french_language.dart";
    const isEn = f === "english_language.dart";
    patches[f] = isFr ? CUSTOMER_FR : isEn ? CUSTOMER_EN : CUSTOMER_EN;
  }
  return patches;
}

function buildExpertPatches() {
  const patches = {};
  for (const f of allLangFiles(EXPERT_LANG)) {
    const isFr = f === "french_language.dart";
    const isEn = f === "english_language.dart";
    patches[f] = isFr ? EXPERT_FR : isEn ? EXPERT_EN : EXPERT_EN;
  }
  return patches;
}

patchLangDir(CUSTOMER_LANG, buildCustomerPatches());
patchLangDir(EXPERT_LANG, buildExpertPatches());
console.log("Done — Flutter brand copy aligned.");
