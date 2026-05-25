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
    downloadAppCta: "Télécharger l'app",
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
    footerFollowUs: "Suivez-nous",
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
    selectDate: "Date",
    availableSlots: "Créneaux disponibles",
    monthPrev: "Mois précédent",
    monthNext: "Mois suivant",
    yourDetails: "Vos coordonnées",
    confirmBooking: "Confirmer la réservation",
    payAtSalon: "Paiement au salon",
    payWithStripe: "Payer par carte (Stripe)",
    paymentTitle: "Paiement",
    couponCode: "Code promo",
    applyCoupon: "Appliquer",
    removeCoupon: "Retirer",
    couponApplied: "Code appliqué",
    subtotal: "Sous-total",
    taxLabel: "TVA",
    discount: "Réduction",
    totalLabel: "Total",
    selectPayment: "Mode de paiement",
    stripeSecure: "Paiement sécurisé par Stripe",
    bookingSuccess: "Réservation enregistrée. Un email de confirmation vous a été envoyé.",
    min: "min",
    continue: "Continuer",
    back: "Retour",
    enterCouponCode: "Saisissez un code promo.",
    couponInvalid: "Code invalide",
    couponPlaceholder: "Ex. SKEDISY10",
    missingFields: "Informations manquantes : __LIST__.",
    stripeUnavailable: "Paiement Stripe indisponible",
    stripeNotLoaded: "Stripe non disponible.",
    stripeEnterCard: "Saisissez vos informations de carte, puis confirmez à nouveau.",
    paymentCancelled: "Paiement annulé",
    selectOneService: "Choisissez une prestation.",
    noExpertForService: "Aucun expert pour cette prestation.",
    dateLabel: "Date",
    loading: "Chargement…",
    slotsClosed: "Fermé ou indisponible ce jour.",
    slotMorning: "Matin",
    slotAfternoon: "Après-midi",
    emailLabel: "Email",
    phoneLabel: "Téléphone",
    otpLabel: "Code reçu par email",
    otpPlaceholder: "6 chiffres",
    sendOtp: "Envoyer le code",
    otpSent: "Code envoyé",
    genericError: "Erreur",
    emailPhoneRequired: "Email et téléphone sont requis.",
    enterOtp: "Saisissez le code reçu par email.",
    verifyFailed: "Vérification échouée",
    sessionExpired: "Session expirée. Recommencez la vérification email.",
    bookingFailed: "Réservation impossible",
    missingFieldAccount: "compte",
    missingFieldExpert: "experte",
    missingFieldSalon: "salon",
    missingFieldService: "prestation",
    missingFieldDate: "date",
    missingFieldSlot: "créneau",
    missingFieldAmount: "montant",
    missingFieldAmountTtc: "montant TTC",
    missingFieldPlace: "lieu",
    slotBusy: "Un ou plusieurs créneaux de cette plage ne sont plus disponibles.",
    slotInvalid: "Impossible de réserver ce créneau pour la durée de la prestation.",
    slotSelectedRange: "Créneau",
    noticeContinue: "Continuer",
    bookAsGuest: "Réserver en tant qu'invité",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    authSignInLink: "Se connecter",
    authOr: "ou",
    authSignUpLink: "S'inscrire",
    connectedAs: "Connecté en tant que",
    authUseOtherAccount: "Utiliser un autre compte",
    authLoginTitle: "Connexion",
    authSignupTitle: "Créer un compte",
    authLoginLead: "Connectez-vous pour finaliser votre réservation sur Skedisy.",
    authSignupLead: "Quelques informations pour réserver — comme sur l'app Skedisy.",
    authPassword: "Mot de passe",
    authFirstName: "Prénom",
    authLastName: "Nom",
    authSignIn: "Se connecter",
    authCreateAccount: "Créer mon compte",
    authNoAccount: "Pas encore de compte ?",
    authHasAccount: "Déjà un compte ?",
    authBackToBooking: "← Retour à la réservation",
    authSalonPro: "Vous êtes un professionnel ? Espace pro",
    authSigningIn: "Connexion…",
    authCreatingAccount: "Création…",
    authSuccessLogin: "Connexion réussie. Reprise de votre réservation…",
    authSuccessSignup: "Compte créé. Reprise de votre réservation…",
    headerLogin: "Connexion",
  },
  en: {
    bookOnApp: "Book on the app",
    bookAppointment: "Book on the app",
    stickyBook: "Book on the app",
    downloadAndroid: "Download on Android",
    downloadIos: "Download on iPhone",
    downloadAppCta: "Download the app",
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
    footerFollowUs: "Follow us",
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
    selectDate: "Date",
    availableSlots: "Available slots",
    monthPrev: "Previous month",
    monthNext: "Next month",
    yourDetails: "Your details",
    confirmBooking: "Confirm booking",
    payAtSalon: "Pay at the salon",
    payWithStripe: "Pay by card (Stripe)",
    paymentTitle: "Payment",
    couponCode: "Promo code",
    applyCoupon: "Apply",
    removeCoupon: "Remove",
    couponApplied: "Code applied",
    subtotal: "Subtotal",
    taxLabel: "Tax",
    discount: "Discount",
    totalLabel: "Total",
    selectPayment: "Payment method",
    stripeSecure: "Secure payment by Stripe",
    bookingSuccess: "Booking saved. A confirmation email has been sent.",
    min: "min",
    continue: "Continue",
    back: "Back",
    enterCouponCode: "Enter a promo code.",
    couponInvalid: "Invalid code",
    couponPlaceholder: "e.g. SKEDISY10",
    missingFields: "Missing information: __LIST__.",
    stripeUnavailable: "Stripe payment unavailable",
    stripeNotLoaded: "Stripe is not available.",
    stripeEnterCard: "Enter your card details, then confirm again.",
    paymentCancelled: "Payment cancelled",
    selectOneService: "Please choose a service.",
    noExpertForService: "No stylist available for this service.",
    dateLabel: "Date",
    loading: "Loading…",
    slotsClosed: "Closed or unavailable on this day.",
    slotMorning: "Morning",
    slotAfternoon: "Afternoon",
    emailLabel: "Email",
    phoneLabel: "Phone",
    otpLabel: "Code from email",
    otpPlaceholder: "6 digits",
    sendOtp: "Send code",
    otpSent: "Code sent",
    genericError: "Error",
    emailPhoneRequired: "Email and phone are required.",
    enterOtp: "Enter the code from your email.",
    verifyFailed: "Verification failed",
    sessionExpired: "Session expired. Please verify your email again.",
    bookingFailed: "Unable to complete booking",
    missingFieldAccount: "account",
    missingFieldExpert: "stylist",
    missingFieldSalon: "salon",
    missingFieldService: "service",
    missingFieldDate: "date",
    missingFieldSlot: "time slot",
    missingFieldAmount: "amount",
    missingFieldAmountTtc: "total amount",
    missingFieldPlace: "location",
    slotBusy: "One or more time slots in this range are no longer available.",
    slotInvalid: "This time cannot be booked for the selected service duration.",
    slotSelectedRange: "Time slot",
    noticeContinue: "Continue",
    bookAsGuest: "Book as a guest",
    alreadyHaveAccount: "Already have an account?",
    authSignInLink: "Sign in",
    authOr: "or",
    authSignUpLink: "Sign up",
    connectedAs: "Signed in as",
    authUseOtherAccount: "Use another account",
    authLoginTitle: "Sign in",
    authSignupTitle: "Create an account",
    authLoginLead: "Sign in to complete your booking on Skedisy.",
    authSignupLead: "A few details to book — same as on the Skedisy app.",
    authPassword: "Password",
    authFirstName: "First name",
    authLastName: "Last name",
    authSignIn: "Sign in",
    authCreateAccount: "Create my account",
    authNoAccount: "No account yet?",
    authHasAccount: "Already have an account?",
    authBackToBooking: "← Back to booking",
    authSalonPro: "Salon professional? Pro area",
    authSigningIn: "Signing in…",
    authCreatingAccount: "Creating account…",
    authSuccessLogin: "Signed in. Resuming your booking…",
    authSuccessSignup: "Account created. Resuming your booking…",
    headerLogin: "Sign in",
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

const WEEKDAY_FR = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

function parseSalonTimeString(timeStr) {
  const s = (timeStr || "").trim();
  if (!s) return null;
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return { h: parseInt(m24[1], 10), m: parseInt(m24[2], 10) };
  }
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = parseInt(m12[2], 10);
    const ampm = m12[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, m };
  }
  return null;
}

function formatSalonTimeForDisplay(timeStr, lang) {
  const parsed = parseSalonTimeString(timeStr);
  if (!parsed) return (timeStr || "").trim() || "—";
  if (lang === "fr") {
    return `${String(parsed.h).padStart(2, "0")}h${String(parsed.m).padStart(2, "0")}`;
  }
  const ampm = parsed.h >= 12 ? "PM" : "AM";
  let h12 = parsed.h % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(parsed.m).padStart(2, "0")} ${ampm}`;
}

function formatSalonDayName(day, lang) {
  if (!day) return "—";
  if (lang === "fr") return WEEKDAY_FR[day] || day;
  return day;
}

function formatSalonHoursItemHtml(time, lang, copy) {
  const dayLabel = formatSalonDayName(time.day, lang);
  const isClosed =
    !time.isActive || (time.openTime === "" && time.closedTime === "");
  if (isClosed) {
    return `<div class="hours-item"><span class="hours-day">${dayLabel}</span><span class="hours-time hours-closed">${copy.closed}</span></div>`;
  }
  const open = formatSalonTimeForDisplay(time.openTime, lang);
  const close = formatSalonTimeForDisplay(time.closedTime, lang);
  const range = `${open} - ${close}`;
  return `<div class="hours-item"><span class="hours-day">${dayLabel}</span><span class="hours-time">${range}</span></div>`;
}

function idfBannerHtml(copy) {
  return `<div class="skedisy-idf-banner" role="note"><p>${copy.idfBanner}</p></div>`;
}

function skedisyFooterHtml(baseURL, copy) {
  return `
    <footer class="footer sq-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Skedisy</h3>
                    <p>${copy.footerTagline}</p>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> support@skedisy.com</p>
                        <p><a href="${WEB_WHATSAPP_URL}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> WhatsApp · ${WEB_WHATSAPP_DISPLAY}</a></p>
                    </div>
                    <div class="footer-social">
                        <h4>${copy.footerFollowUs}</h4>
                        <div class="footer-social-links">
                            <a href="https://www.facebook.com/profile.php?id=61586655939283" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                            <a href="https://www.instagram.com/skedisy/" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                            <a href="https://www.tiktok.com/@skedisy" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur TikTok"><i class="fab fa-tiktok" aria-hidden="true"></i></a>
                        </div>
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
  formatSalonHoursItemHtml,
};
