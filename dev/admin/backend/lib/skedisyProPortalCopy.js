/**
 * Copy authentique Skedisy — portails salon (salonpanel) et admin.
 * Référence : dev/admin/scraping_data/authenticite/AUTHENTICITE_SKEDISY.md
 *
 * Dupliquer dans salon/src/constants et frontend/src/constants si modifié.
 */
const COPY = {
  salon: {
    kicker: "Île-de-France · Beauté afro",
    welcome: "Espace salon Skedisy",
    loginTitle: "Connexion",
    loginSubtitle:
      "Agenda et prestations nommées (tresses, locks, perruques, homme, esthétique) — pensé pour les salons afro en IDF.",
    loginHint: "Email et mot de passe de votre compte salon.",
    signUpTitle: "Créer l'accès",
    signUpSubtitle: "Code d'invitation requis pour activer votre salon.",
    signUpHint: "Email, mot de passe et code fourni par Skedisy.",
    submitLogin: "Se connecter",
    submitSignUp: "Créer le compte",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    code: "Code d'invitation",
    errEmail: "L'email est requis.",
    errPassword: "Le mot de passe est requis.",
    errConfirmPassword: "La confirmation est requise.",
    errPasswordMismatch: "Les mots de passe ne correspondent pas.",
    errCode: "Le code est requis.",
    footerLink: "Découvrir skedisy.com",
    footerPro: "Espace pro · claim salon",
    profileValueTitlePlaceholder:
      "ex. Salon afro en IDF — tresses, locks, perruques",
    profileValueDescPlaceholder:
      "Ce qui rend votre salon unique (prestations afro, quartier, expertise…)",
    profileHeroHint:
      "Image en tête de votre fiche publique (clientes découvrent sur skedisy.com, réservent sur l'app).",
    profileValueTitleLabel: "Accroche fiche publique",
    profileValueDescLabel: "Description",
    profileValueFeaturesLabel: "Points forts (séparés par des virgules)",
    profileValueFeaturesPlaceholder:
      "ex. Tresses sans tension, locks, perruques, homme, esthétique",
    profileValueFeaturesHint:
      "Affichés sur skedisy.com — prestations afro nommées, pas de formules génériques.",
    updateCodeTitle: "Mettre à jour le code",
    updateCodeSubtitle: "Nouveau code d'invitation pour votre compte salon.",
    updateCodeHint: "Email, mot de passe actuel et nouveau code.",
    submitUpdateCode: "Enregistrer",
  },
  admin: {
    kicker: "Skedisy · Administration",
    welcome: "Console admin",
    loginTitle: "Connexion",
    loginSubtitle:
      "Gestion de la plateforme — salons afro en Île-de-France uniquement.",
    loginHint: "Accès réservé à l'équipe Skedisy.",
    signUpTitle: "Créer l'accès",
    signUpSubtitle: "Inscription administrateur avec code.",
    signUpHint: "Email, mot de passe et code.",
    submitLogin: "Se connecter",
    submitSignUp: "Créer le compte",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    code: "Code",
    errEmail: "L'email est requis.",
    errPassword: "Le mot de passe est requis.",
    errConfirmPassword: "La confirmation est requise.",
    errPasswordMismatch: "Les mots de passe ne correspondent pas.",
    errCode: "Le code est requis.",
    footerLink: "skedisy.com",
    footerPro: null,
    updateCodeTitle: "Mettre à jour le code",
    updateCodeSubtitle: "Nouveau code administrateur.",
    updateCodeHint: "Email, mot de passe et nouveau code.",
    submitUpdateCode: "Enregistrer",
    profileValueTitlePlaceholder: null,
    profileValueDescPlaceholder: null,
    profileHeroHint: null,
  },
};

function getSkedisyPortalCopy(portal) {
  return COPY[portal === "admin" ? "admin" : "salon"];
}

module.exports = { COPY, getSkedisyPortalCopy };
