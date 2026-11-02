const { getWebCopy, resolveLang } = require("./webPageCopy");
const { authUrls } = require("./publicAuthPage");

function renderClientAccountPage(req, res, page) {
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const lang = resolveLang(req.query.lang);
  const copy = getWebCopy(lang);
  const pathByPage = {
    profile: "profil",
    report: "signaler",
    messages: "messages",
    notifications: "notifications",
    reservations: "reservations",
  };
  const urls = authUrls(baseURL, `/compte/${pathByPage[page] || page}`, lang);

  const titles = {
    reservations: copy.accountReservationsTitle || "Réservations",
    notifications: copy.accountNotificationsTitle || "Notifications",
    messages: copy.accountMessagesTitle || "Messages",
    report: copy.accountReportTitle || "Signaler un problème",
    profile: copy.accountProfileTitle || "Infos du compte",
  };
  const leads = {
    reservations:
      copy.accountReservationsLead ||
      "Vos rendez-vous chez les salons afro d’Île-de-France — à venir, annulés et passés.",
    notifications:
      copy.accountNotificationsLead ||
      "Confirmations, rappels et mises à jour de vos rendez-vous.",
    messages:
      copy.accountMessagesLead ||
      "Toutes vos conversations avec les salons — questions, photos d’inspiration, précisions.",
    report:
      copy.accountReportLead ||
      "Un souci sur un RDV ? Décrivez-le avec le numéro de réservation — l’équipe Skedisy s’en occupe.",
    profile:
      copy.accountProfileLead ||
      "Vos coordonnées Skedisy et la déconnexion.",
  };
  const eyebrows = {
    reservations: lang === "en" ? "Your bookings" : "Vos rendez-vous",
    notifications: lang === "en" ? "Updates" : "Vos alertes",
    messages: lang === "en" ? "Skedisy messaging" : "Messagerie Skedisy",
    report: lang === "en" ? "Support" : "Assistance Skedisy",
    profile: lang === "en" ? "Your account" : "Votre compte Skedisy",
  };
  const title = titles[page] || "Compte";
  const lead = leads[page] || "";
  const eyebrow = eyebrows[page] || copy.accountEyebrow || "Skedisy";
  const canonical = `/compte/${pathByPage[page] || "reservations"}`;

  const bodyClass = `sq-account-page--${page === "profile" ? "profile" : page}`;

  const pageScript =
    page === "reservations"
      ? "client-reservations.js"
      : page === "notifications"
        ? "client-notifications.js"
        : page === "messages"
          ? "client-messages.js"
          : page === "report"
            ? "client-report.js"
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
        <div class="sq-account-shell">
            <header class="sq-account-intro">
                <p class="sq-account-eyebrow">${eyebrow}</p>
                <h1>${title}</h1>
                <p class="sq-account-lead">${lead}</p>
            </header>
            <div class="sq-account-gate" id="accountGate" hidden>
                <div class="sq-account-gate__card">
                    <p class="sq-account-eyebrow">${lang === "en" ? "Skedisy account" : "Compte Skedisy"}</p>
                    <h2>${title}</h2>
                    <p>${copy.accountLoginRequired || "Connectez-vous pour accéder à votre espace Skedisy."}</p>
                    <div class="sq-account-gate__actions">
                        <a class="sq-btn sq-btn-fill" href="${urls.login}${urls.login.includes("?") ? "&" : "?"}return=${encodeURIComponent(canonical)}">${copy.authSignIn || "Connexion"}</a>
                        <a class="sq-btn sq-btn-ghost" href="${urls.signup}${urls.signup.includes("?") ? "&" : "?"}return=${encodeURIComponent(canonical)}">${copy.authCreateAccount || "Créer un compte"}</a>
                    </div>
                </div>
            </div>
            <div class="sq-account-content" id="accountContent" hidden></div>
        </div>
    </main>

    <footer class="sq-account-footer">
        <a href="/">${lang === "en" ? "Home" : "Accueil"}</a>
        <span aria-hidden="true">·</span>
        <a href="/aide/">${copy.navHelp || "Aide"}</a>
        <span aria-hidden="true">·</span>
        <a href="/recherche">${copy.accountBrowseSalons || (lang === "en" ? "Find a salon" : "Trouver un salon")}</a>
    </footer>

    <script>
      window.SKEDISY_ACCOUNT = {
        page: ${JSON.stringify(page)},
        lang: ${JSON.stringify(lang)},
        loginUrl: ${JSON.stringify(urls.login)},
        signupUrl: ${JSON.stringify(urls.signup)},
        copy: {
          reservationsTitle: ${JSON.stringify(titles.reservations)},
          notificationsTitle: ${JSON.stringify(titles.notifications)},
          messagesTitle: ${JSON.stringify(titles.messages)},
          profileTitle: ${JSON.stringify(titles.profile)},
          reportTitle: ${JSON.stringify(titles.report)},
          emptyMessages: ${JSON.stringify(
            copy.accountEmptyMessages ||
              (lang === "en"
                ? "No conversations yet. Message a salon from its Skedisy page."
                : "Aucune conversation pour l’instant. Écrivez à un salon depuis sa fiche Skedisy.")
          )},
          messagesSelect: ${JSON.stringify(
            lang === "en"
              ? "Select a salon conversation."
              : "Sélectionnez une conversation avec un salon."
          )},
          messagesReply: ${JSON.stringify(
            lang === "en" ? "Write your reply…" : "Écrivez votre réponse…"
          )},
          messagesSend: ${JSON.stringify(lang === "en" ? "Send" : "Envoyer")},
          messagesOpenSalon: ${JSON.stringify(
            lang === "en" ? "View salon page" : "Voir la fiche salon"
          )},
          messagesBack: ${JSON.stringify(lang === "en" ? "Back" : "Retour")},
          messagesYou: ${JSON.stringify(lang === "en" ? "You" : "Vous")},
          messagesSalon: ${JSON.stringify(lang === "en" ? "Salon" : "Salon")},
          messagesAuto: ${JSON.stringify(
            lang === "en" ? "Salon auto-reply" : "Réponse auto du salon"
          )},
          tabUpcoming: ${JSON.stringify(copy.accountTabUpcoming || "À venir")},
          tabCancelled: ${JSON.stringify(copy.accountTabCancelled || "Annulé")},
          tabCompleted: ${JSON.stringify(copy.accountTabCompleted || "Complété")},
          emptyUpcoming: ${JSON.stringify(copy.accountEmptyUpcoming || "Aucune réservation à venir.")},
          emptyCancelled: ${JSON.stringify(copy.accountEmptyCancelled || "Aucune réservation annulée.")},
          emptyCompleted: ${JSON.stringify(copy.accountEmptyCompleted || "Aucune réservation complétée.")},
          emptyNotifications: ${JSON.stringify(copy.accountEmptyNotifications || "Aucune notification.")},
          loginRequired: ${JSON.stringify(copy.accountLoginRequired || "Connectez-vous pour accéder à cet espace.")},
          logout: ${JSON.stringify(copy.accountLogout || "Déconnexion")},
          reportLead: ${JSON.stringify(leads.report)},
          reportBooking: ${JSON.stringify(copy.accountReportBooking || "N° de réservation")},
          reportDetails: ${JSON.stringify(copy.accountReportDetails || "Détails")},
          reportSubmit: ${JSON.stringify(copy.accountReportSubmit || "Envoyer")},
          reportSuccess: ${JSON.stringify(copy.accountReportSuccess || "Signalement envoyé.")},
          reportError: ${JSON.stringify(copy.accountReportError || "Impossible d'envoyer le signalement.")},
          reportHint: ${JSON.stringify(
            lang === "en"
              ? "Mention the salon, the service (braids, locks, wig…) and what went wrong."
              : "Précisez le salon, la presta (tresses, locks, perruque…) et ce qui s’est passé."
          )},
          deleteNotif: ${JSON.stringify(copy.accountDeleteNotif || "Supprimer")},
          searchPlaceholder: ${JSON.stringify(copy.accountSearchBooking || "Rechercher une réservation")},
          expert: ${JSON.stringify(copy.withExpert || "avec")},
          amount: ${JSON.stringify(copy.accountAmount || "Montant")},
          statusLabel: ${JSON.stringify(copy.accountStatus || "Statut")},
          loading: ${JSON.stringify(copy.accountLoading || "Chargement…")},
          profileHello: ${JSON.stringify(copy.accountProfileHello || "Bonjour")},
          profileTagline: ${JSON.stringify(
            lang === "en"
              ? "Your Skedisy space for afro beauty bookings in Île-de-France."
              : "Votre espace Skedisy pour réserver la beauté afro en Île-de-France."
          )},
          browseSalons: ${JSON.stringify(copy.accountBrowseSalons || "Trouver un salon")},
          details: ${JSON.stringify(copy.accountDetails || "Coordonnées")},
          noDetails: ${JSON.stringify(
            lang === "en" ? "No contact details on file." : "Aucune coordonnée enregistrée."
          )},
          emptyBrowseHint: ${JSON.stringify(
            lang === "en"
              ? "Find a salon that understands your hair — Île-de-France."
              : "Trouvez un salon qui comprend vos cheveux — Île-de-France."
          )},
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
