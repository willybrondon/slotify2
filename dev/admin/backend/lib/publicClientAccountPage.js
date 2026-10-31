const { getWebCopy, resolveLang } = require("./webPageCopy");
const { authUrls } = require("./publicAuthPage");

function renderClientAccountPage(req, res, page) {
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const lang = resolveLang(req.query.lang);
  const copy = getWebCopy(lang);
  const urls = authUrls(baseURL, `/compte/${page === "profile" ? "profil" : page}`, lang);

  const titles = {
    reservations: copy.accountReservationsTitle || "Réservations",
    notifications: copy.accountNotificationsTitle || "Notifications",
    profile: copy.accountProfileTitle || "Mon profil",
  };
  const title = titles[page] || "Compte";
  const canonical =
    page === "profile"
      ? "/compte/profil"
      : page === "notifications"
        ? "/compte/notifications"
        : "/compte/reservations";

  const bodyClass =
    page === "reservations"
      ? "sq-account-page--reservations"
      : page === "notifications"
        ? "sq-account-page--notifications"
        : "sq-account-page--profile";

  const pageScript =
    page === "reservations"
      ? "client-reservations.js"
      : page === "notifications"
        ? "client-notifications.js"
        : "client-profile.js";

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Skedisy</title>
    <meta name="robots" content="noindex, nofollow, noarchive">
    <link rel="canonical" href="${baseURL}${canonical}">
    <link rel="icon" href="${baseURL}/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="${baseURL}/apple-touch-icon.png">
    <meta name="theme-color" content="#c45c26">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sk-public-page sq-account-page ${bodyClass}" data-account-page="${page}">
    <nav class="navbar">
        <div class="nav-container sq-adencer-header">
            <div class="nav-logo">
                <a href="/" style="text-decoration: none; color: inherit; display:inline-flex; align-items:center; gap:8px;">
                    <img class="sq-nav-logo-img" src="${baseURL}/images/logo.png" alt="Skedisy" onerror="this.style.display='none'">
                    <h2 style="margin:0;">Skedisy</h2>
                </a>
            </div>
            <div class="sq-adencer-header__links desktop-only">
                <a href="/blog/">${copy.navBlog || "Blog"}</a>
                <a href="/aide/">${copy.navHelp || "Aide"}</a>
                <a href="/professionnel/">${copy.navPro || "Pro"}</a>
            </div>
            <div class="sq-adencer-header__cta desktop-only" data-account-cta>
                <a href="${urls.login}" class="sq-btn sq-btn-ghost">${copy.authSignIn || "Connexion"}</a>
                <a href="${urls.signup}" class="sq-btn sq-btn-fill">${copy.authCreateAccount || "Créer un compte"}</a>
            </div>
            <div class="mobile-menu-wrapper">
                <div class="hamburger mobile-only" id="mobileMenuToggle"><span></span><span></span><span></span></div>
            </div>
        </div>
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>${copy.navForClients || "Pour les clientes"}</h3>
                <button class="mobile-menu-close" id="mobileMenuClose" type="button" aria-label="Fermer">&times;</button>
            </div>
            <div class="mobile-menu-content mobile-menu-content--client" data-account-mobile>
                <a href="${urls.login}" class="btn-login-mobile-menu">${copy.authSignIn || "Connexion"}</a>
                <a href="${urls.signup}" class="btn-login-mobile-menu">${copy.authCreateAccount || "Créer un compte"}</a>
            </div>
        </div>
    </nav>

    <main class="sq-account-main" id="accountMain">
        <div class="sq-account-gate" id="accountGate" hidden>
            <h1>${title}</h1>
            <p>${copy.accountLoginRequired || "Connectez-vous pour accéder à cet espace."}</p>
            <div class="sq-account-gate__actions">
                <a class="sq-btn sq-btn-fill" href="${urls.login}${urls.login.includes("?") ? "&" : "?"}return=${encodeURIComponent(canonical)}">${copy.authSignIn || "Connexion"}</a>
                <a class="sq-btn sq-btn-ghost" href="${urls.signup}${urls.signup.includes("?") ? "&" : "?"}return=${encodeURIComponent(canonical)}">${copy.authCreateAccount || "Créer un compte"}</a>
            </div>
        </div>
        <div class="sq-account-content" id="accountContent" hidden></div>
    </main>

    <script>
      window.SKEDISY_ACCOUNT = {
        page: ${JSON.stringify(page)},
        lang: ${JSON.stringify(lang)},
        loginUrl: ${JSON.stringify(urls.login)},
        signupUrl: ${JSON.stringify(urls.signup)},
        copy: {
          reservationsTitle: ${JSON.stringify(titles.reservations)},
          notificationsTitle: ${JSON.stringify(titles.notifications)},
          profileTitle: ${JSON.stringify(titles.profile)},
          tabUpcoming: ${JSON.stringify(copy.accountTabUpcoming || "À venir")},
          tabCancelled: ${JSON.stringify(copy.accountTabCancelled || "Annulé")},
          tabCompleted: ${JSON.stringify(copy.accountTabCompleted || "Complété")},
          emptyUpcoming: ${JSON.stringify(copy.accountEmptyUpcoming || "Aucune réservation à venir.")},
          emptyCancelled: ${JSON.stringify(copy.accountEmptyCancelled || "Aucune réservation annulée.")},
          emptyCompleted: ${JSON.stringify(copy.accountEmptyCompleted || "Aucune réservation complétée.")},
          emptyNotifications: ${JSON.stringify(copy.accountEmptyNotifications || "Aucune notification.")},
          loginRequired: ${JSON.stringify(copy.accountLoginRequired || "Connectez-vous pour accéder à cet espace.")},
          logout: ${JSON.stringify(copy.accountLogout || "Déconnexion")},
          reportTitle: ${JSON.stringify(copy.accountReportTitle || "Signaler")},
          reportLead: ${JSON.stringify(copy.accountReportLead || "Décrivez le problème lié à une réservation.")},
          reportBooking: ${JSON.stringify(copy.accountReportBooking || "N° de réservation")},
          reportDetails: ${JSON.stringify(copy.accountReportDetails || "Détails")},
          reportSubmit: ${JSON.stringify(copy.accountReportSubmit || "Envoyer le signalement")},
          reportSuccess: ${JSON.stringify(copy.accountReportSuccess || "Signalement envoyé.")},
          reportError: ${JSON.stringify(copy.accountReportError || "Impossible d'envoyer le signalement.")},
          deleteNotif: ${JSON.stringify(copy.accountDeleteNotif || "Supprimer")},
          searchPlaceholder: ${JSON.stringify(copy.accountSearchBooking || "Rechercher une réservation")},
          expert: ${JSON.stringify(copy.withExpert || "avec")},
          amount: ${JSON.stringify(copy.accountAmount || "Montant")},
          statusLabel: ${JSON.stringify(copy.accountStatus || "Statut")},
          loading: ${JSON.stringify(copy.accountLoading || "Chargement…")},
          profileHello: ${JSON.stringify(copy.accountProfileHello || "Bonjour")},
          profileReservations: ${JSON.stringify(copy.accountReservationsTitle || "Réservations")},
          profileNotifications: ${JSON.stringify(copy.accountNotificationsTitle || "Notifications")},
        }
      };
    </script>
    <script src="${baseURL}/script.js"></script>
    <script src="${baseURL}/client-account-nav.js"></script>
    <script src="${baseURL}/${pageScript}"></script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  return res.status(200).send(html);
}

module.exports = { renderClientAccountPage };
