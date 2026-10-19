const { getWebCopy, resolveLang } = require("./webPageCopy");

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
  const badge = lang === "en" ? "Client space" : "Espace cliente";
  const switchHtml = isLogin
    ? `<p class="sq-auth-switch">${copy.authNoAccount} <a href="${urls.signup}">${copy.authCreateAccount}</a></p>`
    : `<p class="sq-auth-switch">${copy.authHasAccount} <a href="${urls.login}">${copy.authSignIn}</a></p>`;

  const signupFields = isLogin
    ? ""
    : `
      <label class="sq-auth-field">${copy.authFirstName}
        <input type="text" id="authFname" name="fname" autocomplete="given-name" required>
      </label>
      <label class="sq-auth-field">${copy.authLastName}
        <input type="text" id="authLname" name="lname" autocomplete="family-name">
      </label>`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Skedisy</title>
    <meta name="robots" content="noindex">
    <link rel="icon" href="${baseURL}/favicon.ico" type="image/x-icon">
    <link rel="icon" href="${baseURL}/favicon-32.png" type="image/png" sizes="32x32">
    <link rel="apple-touch-icon" href="${baseURL}/apple-touch-icon.png">
    <meta name="theme-color" content="#c45c26">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sq-auth-page sq-auth-page--portal">
    <main class="sq-auth-portal">
        <div class="sq-auth-portal-card">
            <div class="sq-auth-portal-logo">
                <a href="${baseURL}/">
                    <img src="${baseURL}/images/skedisy-logo-auth.png" alt="Skedisy" width="72" height="72">
                </a>
            </div>
            <h1 class="sq-auth-portal-title">${title}</h1>
            <p class="sq-auth-portal-badge">${badge}</p>
            <p class="sq-auth-portal-lead">${lead}</p>
            <div id="authNotice" class="sq-auth-notice sq-auth-notice--hidden" role="alert"></div>
            <form id="authForm" class="sq-auth-form" novalidate>
                ${signupFields}
                <label class="sq-auth-field">${copy.emailLabel}
                    <input type="email" id="authEmail" name="email" autocomplete="email" required>
                </label>
                <label class="sq-auth-field">${copy.phoneLabel}
                    <input type="tel" id="authMobile" name="mobile" autocomplete="tel" ${isLogin ? "" : "required"}>
                </label>
                <label class="sq-auth-field">${copy.authPassword}
                    <input type="password" id="authPassword" name="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required minlength="6">
                </label>
                <button type="submit" class="sq-auth-submit" id="authSubmit">${isLogin ? copy.authSignIn : copy.authCreateAccount}</button>
            </form>
            ${switchHtml}
            <p class="sq-auth-portal-footer">
                <a href="${returnPath}">${copy.authBackToBooking}</a>
                ·
                <a href="${baseURL}/salonpanel/">${copy.authSalonPro}</a>
            </p>
        </div>
    </main>
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
