/**
 * Page /compte/profil — infos + Signaler (comme l'app).
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

  async function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;

    const name = [user.fname, user.lname].filter(Boolean).join(" ") || user.email;
    content.innerHTML = `
      <header class="sq-account-head">
        <h1>${esc(copy.profileTitle || "Mon profil")}</h1>
      </header>
      <section class="sq-account-profile-card">
        <p class="sq-account-profile-hello">${esc(copy.profileHello || "Bonjour")} <strong>${esc(
      name
    )}</strong></p>
        <ul class="sq-account-profile-meta">
          ${user.email ? `<li><i class="far fa-envelope" aria-hidden="true"></i> ${esc(user.email)}</li>` : ""}
          ${user.mobile ? `<li><i class="fas fa-phone" aria-hidden="true"></i> ${esc(user.mobile)}</li>` : ""}
        </ul>
        <div class="sq-account-profile-links">
          <a class="sq-btn sq-btn-ghost" href="/compte/reservations">${esc(
            copy.profileReservations || "Réservations"
          )}</a>
          <a class="sq-btn sq-btn-ghost" href="/compte/notifications">${esc(
            copy.profileNotifications || "Notifications"
          )}</a>
          <button type="button" class="sq-btn sq-btn-ghost" data-account-logout>${esc(
            copy.logout || "Déconnexion"
          )}</button>
        </div>
      </section>

      <section class="sq-account-report" id="signaler">
        <h2>${esc(copy.reportTitle || "Signaler")}</h2>
        <p class="sq-account-muted">${esc(
          copy.reportLead || "Décrivez le problème lié à une réservation."
        )}</p>
        <form id="reportForm" class="sq-account-report-form" novalidate>
          <label class="sq-account-field">${esc(copy.reportBooking || "N° de réservation")}
            <input type="text" id="reportBookingId" name="bookingId" required placeholder="ex. 1234567" />
          </label>
          <label class="sq-account-field">${esc(copy.reportDetails || "Détails")}
            <textarea id="reportDetails" name="details" rows="5" required minlength="10"></textarea>
          </label>
          <div id="reportNotice" class="sq-auth-notice sq-auth-notice--hidden" role="alert"></div>
          <button type="submit" class="sq-btn sq-btn-fill" id="reportSubmit">${esc(
            copy.reportSubmit || "Envoyer le signalement"
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
