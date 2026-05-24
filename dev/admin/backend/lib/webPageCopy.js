/**
 * Copy for public web pages (salon + category) — aligné authenticité Skedisy IDF.
 */
const WEB_WHATSAPP_URL = "https://wa.me/33766160394";
const WEB_WHATSAPP_DISPLAY = "+33 7 66 16 03 94";

const COPY = {
  fr: {
    bookOnApp: "Réserver sur l'app",
    bookAppointment: "Réserver sur l'app",
    stickyBook: "Réserver sur l'app",
    downloadAndroid: "Télécharger sur Android",
    downloadIos: "Télécharger sur iPhone",
    noAppTitle: "Pas encore l'app ?",
    noAppDesc: "Téléchargez Skedisy gratuitement pour choisir votre créneau.",
    idfBanner:
      "Île-de-France · Beauté afro — la réservation des créneaux se fait sur l'app Skedisy (gratuite).",
    openingHours: "Horaires",
    services: "Prestations",
    products: "Produits",
    staff: "L'équipe",
    reviews: "Avis",
    closed: "Fermé",
    otherServices: "Autres prestations",
    noServices: "Aucune prestation listée pour le moment.",
    noProducts: "Aucun produit pour le moment.",
    noStaff: "Informations équipe non disponibles.",
    noReviews: "Pas encore d'avis.",
    anonymous: "Cliente",
    withExpert: "Avec",
    reviewsCount: "avis",
    moreInCategory: (n) => `+ ${n} autre(s) dans cette catégorie`,
    moreServicesApp: (n) => `+ ${n} prestation(s) supplémentaires sur l'app`,
    aboutSalon: (name) => `À propos de ${name}`,
    defaultSalonDesc: (name) =>
      `Salon de beauté afro en Île-de-France. Découvrez les prestations sur cette page, réservez sur l'app Skedisy.`,
    defaultHeroTitle: (name) => name,
    bookingCardTitle: "Réserver",
    metaSalonTitle: (name) => `${name} — Salon afro en Île-de-France | Skedisy`,
    metaSalonDesc: (name) =>
      `Découvrez ${name}, salon de beauté afro en Île-de-France. Prestations, équipe et avis — réservez sur l'app Skedisy.`,
    metaKeywords: "salon afro, beauté afro, île-de-france, tresses, locks, réservation",
    footerTagline: "La réservation pour la communauté afro en Île-de-France.",
    footerAbout: "À propos",
    footerHome: "Accueil",
    footerPro: "Espace pro",
    footerLegal: "Mentions",
    footerTerms: "CGU",
    footerPrivacy: "Confidentialité",
    footerCookies: "Cookies",
    qrCustomer: "App cliente",
    valuePropAfro1Title: "Salon afro en IDF",
    valuePropAfro1Desc: "Prestations pensées pour les cheveux texturés et la communauté.",
    valuePropAfro2Title: "Expertes qualifiées",
    valuePropAfro2Desc: "Tresses, locks, tissages, soins — une équipe qui connaît vos besoins.",
    valuePropAfro3Title: "Réservez sur l'app",
    valuePropAfro3Desc: "Créneaux en temps réel, confirmation et rappels sur Skedisy.",
    topRated: "Bien noté",
    topRatedDesc: (r, n) => `Note ${r} — ${n} avis`,
    viewBook: "Voir & réserver sur l'app",
    categoryMetaTitle: (cat) => `${cat} — Salons afro en Île-de-France | Skedisy`,
    categoryMetaDesc: (cat) =>
      `Trouvez un salon afro en Île-de-France pour ${cat}. Consultez les prestations sur le web, réservez sur l'app Skedisy.`,
    categoryMetaKeywords: (cat) =>
      `${cat}, salon afro, beauté afro, île-de-france, réservation`,
    categorySalons: "Salons",
    categoryRated: "Avec avis",
    discoverSalons: (cat) => `Salons afro — ${cat}`,
    categoryPageLead: (cat) =>
      `Trouvez un salon afro en Île-de-France pour ${cat}. Consultez les prestations sur le web, réservez sur l'app Skedisy.`,
    searchPlaceholder: "Rechercher par ville ou nom de salon…",
    mapView: "Vue carte",
    listView: "Vue liste",
    resultsCount: (salons, reviews) => `${salons} salon${salons > 1 ? "s" : ""} · ${reviews} avis`,
    resultsInCity: (city) => `Salons trouvés dans la ville de ${city}`,
    resultsInCityTpl: "Salons trouvés dans la ville de __CITY__",
    expertAtSalonTpl: "Chez __SALON__",
    categoryExpertsTitle: "Nos expertes & experts",
    noExpertsCategory: "Aucun expert listé pour cette catégorie pour le moment.",
    expertAtSalon: (name) => `Chez ${name}`,
    noSalonsCategory: "Aucun salon trouvé pour cette recherche.",
    noSalonsSearch: "Aucun salon trouvé. Essayez une autre recherche.",
    kmAway: (km) => `à ${km} km`,
    noImage: "Pas d'image",
    appBannerTitle: "Réserver sur l'app Skedisy",
    appBannerDesc: "Découvrez les salons ici, choisissez votre créneau sur l'app (gratuite).",
    bookNow: "Réserver",
    allCategoriesTab: "Tous",
    salonExpertsTitle: "Notre équipe",
    selectServices: "Choisir les prestations",
    selectExpert: "Choisir votre experte",
    selectDateTime: "Date et heure",
    yourDetails: "Vos coordonnées",
    confirmBooking: "Confirmer la réservation",
    payAtSalon: "Paiement au salon",
    bookingSuccess: "Réservation enregistrée. Un email de confirmation vous a été envoyé.",
    min: "min",
  },
  en: {
    bookOnApp: "Book on the app",
    bookAppointment: "Book on the app",
    stickyBook: "Book on the app",
    downloadAndroid: "Download on Android",
    downloadIos: "Download on iPhone",
    noAppTitle: "Don't have the app yet?",
    noAppDesc: "Download Skedisy for free to pick your time slot.",
    idfBanner:
      "Île-de-France · Afro beauty — booking is on the free Skedisy app.",
    openingHours: "Opening hours",
    services: "Services",
    products: "Products",
    staff: "Team",
    reviews: "Reviews",
    closed: "Closed",
    otherServices: "Other services",
    noServices: "No services listed yet.",
    noProducts: "No products yet.",
    noStaff: "Team information not available.",
    noReviews: "No reviews yet.",
    anonymous: "Client",
    withExpert: "With",
    reviewsCount: "reviews",
    moreInCategory: (n) => `+ ${n} more in this category`,
    moreServicesApp: (n) => `+ ${n} more services on the app`,
    aboutSalon: (name) => `About ${name}`,
    defaultSalonDesc: (name) =>
      `Afro beauty salon in Île-de-France. Browse services here, book on the Skedisy app.`,
    defaultHeroTitle: (name) => name,
    bookingCardTitle: "Book",
    metaSalonTitle: (name) => `${name} — Afro salon in Île-de-France | Skedisy`,
    metaSalonDesc: (name) =>
      `Discover ${name}, an Afro beauty salon in Île-de-France. Services, team and reviews — book on the Skedisy app.`,
    metaKeywords: "afro salon, afro beauty, ile-de-france, braids, locs, booking",
    footerTagline: "Booking for the Afro community in Île-de-France.",
    footerAbout: "About",
    footerHome: "Home",
    footerPro: "For professionals",
    footerLegal: "Legal",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    footerCookies: "Cookies",
    qrCustomer: "Customer app",
    valuePropAfro1Title: "Afro salon in IDF",
    valuePropAfro1Desc: "Services for textured hair and our community.",
    valuePropAfro2Title: "Skilled stylists",
    valuePropAfro2Desc: "Braids, locs, weaves, treatments — experts who understand your hair.",
    valuePropAfro3Title: "Book on the app",
    valuePropAfro3Desc: "Real-time slots, confirmation and reminders on Skedisy.",
    topRated: "Top rated",
    topRatedDesc: (r, n) => `Rated ${r} by ${n} clients`,
    viewBook: "View & book on the app",
    categoryMetaTitle: (cat) => `${cat} — Afro salons in Île-de-France | Skedisy`,
    categoryMetaDesc: (cat) =>
      `Find an Afro salon in Île-de-France for ${cat}. Browse on the web, book on the Skedisy app.`,
    categoryMetaKeywords: (cat) =>
      `${cat}, afro salon, afro beauty, ile-de-france, booking`,
    categorySalons: "Salons",
    categoryRated: "Rated",
    discoverSalons: (cat) => `Afro salons — ${cat}`,
    categoryPageLead: (cat) =>
      `Find an Afro salon in Île-de-France for ${cat}. Browse services on the web, book on the Skedisy app.`,
    searchPlaceholder: "Search by city or salon name…",
    mapView: "Map view",
    listView: "List view",
    resultsCount: (salons, reviews) => `${salons} salon${salons !== 1 ? "s" : ""} · ${reviews} reviews`,
    resultsInCity: (city) => `Salons found in ${city}`,
    resultsInCityTpl: "Salons found in __CITY__",
    expertAtSalonTpl: "At __SALON__",
    categoryExpertsTitle: "Our stylists & experts",
    noExpertsCategory: "No experts listed for this category yet.",
    expertAtSalon: (name) => `At ${name}`,
    noSalonsCategory: "No salons found for this search.",
    noSalonsSearch: "No salons found. Try a different search.",
    kmAway: (km) => `${km} km away`,
    noImage: "No image",
    appBannerTitle: "Book on the Skedisy app",
    appBannerDesc: "Discover salons here, choose your slot on the app (free).",
    bookNow: "Book",
    allCategoriesTab: "All",
    salonExpertsTitle: "Our team",
    selectServices: "Choose services",
    selectExpert: "Choose your stylist",
    selectDateTime: "Date & time",
    yourDetails: "Your details",
    confirmBooking: "Confirm booking",
    payAtSalon: "Pay at the salon",
    bookingSuccess: "Booking saved. A confirmation email has been sent.",
    min: "min",
  },
};

function resolveLang(queryLang) {
  const raw = (queryLang || "fr").toString().toLowerCase();
  return raw.startsWith("en") ? "en" : "fr";
}

function getWebCopy(lang) {
  const code = lang === "en" ? "en" : "fr";
  return COPY[code];
}

function idfBannerHtml(copy) {
  return `<div class="skedisy-idf-banner" role="note"><p>${copy.idfBanner}</p></div>`;
}

function skedisyFooterHtml(baseURL, copy) {
  return `
    <footer class="footer sq-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Skedisy</h3>
                    <p>${copy.footerTagline}</p>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> support@skedisy.com</p>
                        <p><a href="${WEB_WHATSAPP_URL}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> WhatsApp · ${WEB_WHATSAPP_DISPLAY}</a></p>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>${copy.footerAbout}</h4>
                    <ul>
                        <li><a href="${baseURL}/">${copy.footerHome}</a></li>
                        <li><a href="${baseURL}/professionnel/">${copy.footerPro}</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>${copy.footerLegal}</h4>
                    <ul>
                        <li><a href="${baseURL}/terms/">${copy.footerTerms}</a></li>
                        <li><a href="${baseURL}/privacy/">${copy.footerPrivacy}</a></li>
                        <li><a href="${baseURL}/cookies/">${copy.footerCookies}</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Skedisy. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
}

module.exports = {
  WEB_WHATSAPP_URL,
  WEB_WHATSAPP_DISPLAY,
  getWebCopy,
  resolveLang,
  idfBannerHtml,
  skedisyFooterHtml,
};
