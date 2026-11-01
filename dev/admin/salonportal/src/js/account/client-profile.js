/**
 * Page /compte/profil — Compte + Signaler.
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

  async function mount(user) {
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
      <section class="sq-account-panel sq-account-identity">
        <div class="sq-account-avatar" aria-hidden="true">${esc(initials(user))}</div>
        <div class="sq-account-identity__text">
          <p class="sq-account-identity__hello">${esc(copy.profileHello || "Bonjour")}</p>
          <h2 class="sq-account-identity__name">${esc(name)}</h2>
        </div>
        <button type="button" class="sq-btn sq-btn-ghost sq-account-logout" data-account-logout>${esc(
          copy.logout || "Déconnexion"
        )}</button>
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
        </ul>
      </section>

      <section class="sq-account-panel">
        <h3 class="sq-account-panel__title">${esc(copy.quickLinks || "Raccourcis")}</h3>
        <div class="sq-account-link-grid">
          <a class="sq-account-link-tile" href="/compte/reservations">
            <i class="fas fa-calendar-check" aria-hidden="true"></i>
            <span>${esc(copy.profileReservations || "Réservations")}</span>
          </a>
          <a class="sq-account-link-tile" href="/compte/notifications">
            <i class="fas fa-bell" aria-hidden="true"></i>
            <span>${esc(copy.profileNotifications || "Notifications")}</span>
          </a>
          <a class="sq-account-link-tile" href="/recherche">
            <i class="fas fa-search" aria-hidden="true"></i>
            <span>${esc(copy.browseSalons || "Trouver un salon")}</span>
          </a>
        </div>
      </section>

      <section class="sq-account-panel" id="signaler">
        <h3 class="sq-account-panel__title">${esc(copy.reportTitle || "Signaler un problème")}</h3>
        <p class="sq-account-muted">${esc(
          copy.reportLead || "Indiquez le numéro de réservation et décrivez la situation."
        )}</p>
        <form id="reportForm" class="sq-account-report-form" novalidate>
          <label class="sq-account-field">${esc(copy.reportBooking || "N° de réservation")}
            <input type="text" id="reportBookingId" name="bookingId" required placeholder="ex. 1234567" autocomplete="off" />
          </label>
          <label class="sq-account-field">${esc(copy.reportDetails || "Détails")}
            <textarea id="reportDetails" name="details" rows="4" required minlength="10" placeholder=""></textarea>
          </label>
          <div id="reportNotice" class="sq-auth-notice sq-auth-notice--hidden" role="alert"></div>
          <button type="submit" class="sq-btn sq-btn-fill" id="reportSubmit">${esc(
            copy.reportSubmit || "Envoyer"
          )}</button>
        </form>
      </section>`;

    document.querySelectorAll("[data-account-logout]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.SkedisyAccount?.clearUser?.();
        window.location.href = "/";
      });
    });

    const form = document.getElementById("reportForm");
    const notice = document.getElementById("reportNotice");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bookingId = document.getElementById("reportBookingId")?.value.trim();
      const details = document.getElementById("reportDetails")?.value.trim();
      const btn = document.getElementById("reportSubmit");
      if (!bookingId || !details) return;
      btn.disabled = true;
      notice.className = "sq-auth-notice sq-auth-notice--hidden";
      try {
        const res = await fetch("/api/public/client/complain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, bookingId, details }),
        });
        const data = await res.json();
        if (!data?.status) throw new Error(data?.message || copy.reportError);
        notice.textContent = data.message || copy.reportSuccess;
        notice.className = "sq-auth-notice sq-auth-notice--success";
        form.reset();
      } catch (err) {
        notice.textContent = err.message || copy.reportError;
        notice.className = "sq-auth-notice sq-auth-notice--error";
      } finally {
        btn.disabled = false;
      }
    });

    if (window.location.hash === "#signaler") {
      document.getElementById("signaler")?.scrollIntoView({ behavior: "smooth" });
    }
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
