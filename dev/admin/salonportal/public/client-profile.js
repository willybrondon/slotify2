/**
 * Page /compte/profil — infos du compte uniquement + déconnexion.
 */
(function () {
  const cfg = window.SKEDISY_ACCOUNT || {};
  const copy = cfg.copy || {};

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(user) {
    const a = String(user.fname || "").trim().charAt(0);
    const b = String(user.lname || "").trim().charAt(0);
    const raw = (a + b || String(user.email || "S").charAt(0)).toUpperCase();
    return raw.slice(0, 2);
  }

  function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;

    const name =
      [user.fname, user.lname].filter(Boolean).join(" ") ||
      user.email ||
      "Compte";

    content.innerHTML = `
      <section class="sq-account-panel sq-account-identity sq-account-panel--focus">
        <div class="sq-account-avatar" aria-hidden="true">${esc(initials(user))}</div>
        <div class="sq-account-identity__text">
          <p class="sq-account-identity__hello">${esc(copy.profileHello || "Bonjour")}</p>
          <h2 class="sq-account-identity__name">${esc(name)}</h2>
          <p class="sq-account-identity__tagline">${esc(
            copy.profileTagline ||
              "Votre espace Skedisy pour réserver la beauté afro en Île-de-France."
          )}</p>
        </div>
      </section>

      <section class="sq-account-panel">
        <h3 class="sq-account-panel__title">${esc(copy.details || "Coordonnées")}</h3>
        <ul class="sq-account-meta-list">
          ${
            user.email
              ? `<li><span class="sq-account-meta-list__icon"><i class="far fa-envelope" aria-hidden="true"></i></span><div><span class="sq-account-meta-list__label">Email</span><strong>${esc(
                  user.email
                )}</strong></div></li>`
              : ""
          }
          ${
            user.mobile
              ? `<li><span class="sq-account-meta-list__icon"><i class="fas fa-phone" aria-hidden="true"></i></span><div><span class="sq-account-meta-list__label">Mobile</span><strong>${esc(
                  user.mobile
                )}</strong></div></li>`
              : ""
          }
          ${
            !user.email && !user.mobile
              ? `<li><div><span class="sq-account-muted">${esc(
                  copy.noDetails || "Aucune coordonnée enregistrée."
                )}</span></div></li>`
              : ""
          }
        </ul>
      </section>

      <section class="sq-account-panel sq-account-panel--actions">
        <button type="button" class="sq-btn sq-btn-ghost sq-account-logout" data-account-logout>${esc(
          copy.logout || "Déconnexion"
        )}</button>
        <a class="sq-btn sq-btn-fill" href="/recherche">${esc(
          copy.browseSalons || "Trouver un salon"
        )}</a>
      </section>`;

    document.querySelectorAll("[data-account-logout]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.SkedisyAccount?.clearUser?.();
        window.location.href = "/";
      });
    });
  }

  function init() {
    const user = window.SkedisyAccount?.getUser?.();
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (!user) {
      if (gate) gate.hidden = false;
      if (content) content.hidden = true;
      return;
    }
    mount(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
