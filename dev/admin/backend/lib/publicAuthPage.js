const { getWebCopy, resolveLang, idfBannerHtml, skedisyFooterHtml } = require("./webPageCopy");

function safeReturnPath(raw) {
  const path = String(raw || "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.includes("..")) return "/";
  return path;
}

function authUrls(baseURL, returnPath, lang) {
  const q = new URLSearchParams();
  if (returnPath && returnPath !== "/") q.set("return", returnPath);
  if (lang && lang !== "fr") q.set("lang", lang);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return {
    login: `${baseURL}/compte/connexion${qs}`,
    signup: `${baseURL}/compte/inscription${qs}`,
  };
}

function renderAuthPage(req, res, mode) {
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
  const lang = resolveLang(req.query.lang);
  const copy = getWebCopy(lang);
  const returnPath = safeReturnPath(req.query.return);
  const urls = authUrls(baseURL, returnPath, lang);
  const isLogin = mode === "login";

  const title = isLogin ? copy.authLoginTitle : copy.authSignupTitle;
  const lead = isLogin ? copy.authLoginLead : copy.authSignupLead;
  const switchHtml = isLogin
    ? `<p class="sq-auth-switch">${copy.authNoAccount} <a href="${urls.signup}">${copy.authCreateAccount}</a></p>`
    : `<p class="sq-auth-switch">${copy.authHasAccount} <a href="${urls.login}">${copy.authSignIn}</a></p>`;

  const signupFields = isLogin
    ? ""
    : `
      <label class="sq-booking-field">${copy.authFirstName}
        <input type="text" id="authFname" name="fname" autocomplete="given-name" required>
      </label>
      <label class="sq-booking-field">${copy.authLastName}
        <input type="text" id="authLname" name="lname" autocomplete="family-name">
      </label>`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Skedisy</title>
    <meta name="robots" content="noindex">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sk-public-page sq-page sq-auth-page">
    <nav class="navbar sq-navbar sq-auth-nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="${baseURL}/"><h2>Skedisy</h2></a>
            </div>
            <a href="${returnPath}" class="sq-auth-back">${copy.authBackToBooking}</a>
        </div>
    </nav>
    ${idfBannerHtml(copy)}
    <main class="sq-auth-main">
        <div class="sq-auth-card">
            <h1 class="sq-auth-card__title">${title}</h1>
            <p class="sq-auth-card__lead">${lead}</p>
            <div id="authNotice" class="sq-auth-notice sq-auth-notice--hidden" role="alert"></div>
            <form id="authForm" class="sq-auth-form" novalidate>
                ${signupFields}
                <label class="sq-booking-field">${copy.emailLabel}
                    <input type="email" id="authEmail" name="email" autocomplete="email" required>
                </label>
                <label class="sq-booking-field">${copy.phoneLabel}
                    <input type="tel" id="authMobile" name="mobile" autocomplete="tel" ${isLogin ? "" : "required"}>
                </label>
                <label class="sq-booking-field">${copy.authPassword}
                    <input type="password" id="authPassword" name="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required minlength="6">
                </label>
                <button type="submit" class="sq-booking-btn" id="authSubmit">${isLogin ? copy.authSignIn : copy.authCreateAccount}</button>
            </form>
            ${switchHtml}
            <p class="sq-auth-pro"><a href="${baseURL}/salonpanel/">${copy.authSalonPro}</a></p>
        </div>
    </main>
    ${skedisyFooterHtml(baseURL, copy)}
    <script>
        window.SKEDISY_CLIENT_AUTH = {
            mode: ${JSON.stringify(mode)},
            returnPath: ${JSON.stringify(returnPath)},
            loginUrl: ${JSON.stringify(urls.login)},
            signupUrl: ${JSON.stringify(urls.signup)},
            copy: {
                signingIn: ${JSON.stringify(copy.authSigningIn)},
                creatingAccount: ${JSON.stringify(copy.authCreatingAccount)},
                successLogin: ${JSON.stringify(copy.authSuccessLogin)},
                successSignup: ${JSON.stringify(copy.authSuccessSignup)},
                successLoginProduct: ${JSON.stringify(copy.authSuccessLoginProduct)},
                successSignupProduct: ${JSON.stringify(copy.authSuccessSignupProduct)},
                genericError: ${JSON.stringify(copy.genericError)}
            }
        };
    </script>
    <script src="${baseURL}/client-auth.js"></script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}

module.exports = {
  renderAuthPage,
  authUrls,
  safeReturnPath,
};
