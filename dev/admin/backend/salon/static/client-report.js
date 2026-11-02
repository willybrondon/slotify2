/**
 * Page /compte/signaler — uniquement le signalement.
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

  function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;

    content.innerHTML = `
      <section class="sq-account-panel sq-account-panel--focus">
        <div class="sq-account-panel__badge" aria-hidden="true">
          <i class="fas fa-flag"></i>
        </div>
        <p class="sq-account-panel__hint">${esc(
          copy.reportHint ||
            "Précisez le salon, la presta (tresses, locks, perruque…) et ce qui s’est passé."
        )}</p>
        <form id="reportForm" class="sq-account-report-form" novalidate>
          <label class="sq-account-field">${esc(copy.reportBooking || "N° de réservation")}
            <input type="text" id="reportBookingId" name="bookingId" required placeholder="ex. 1234567" autocomplete="off" />
          </label>
          <label class="sq-account-field">${esc(copy.reportDetails || "Que s’est-il passé ?")}
            <textarea id="reportDetails" name="details" rows="5" required minlength="10"
              placeholder="${esc(
                copy.reportPlaceholder ||
                  "Ex. : RDV tresses annulé sans prévenir, montant incorrect…"
              )}"></textarea>
          </label>
          <div id="reportNotice" class="sq-auth-notice sq-auth-notice--hidden" role="alert"></div>
          <button type="submit" class="sq-btn sq-btn-fill" id="reportSubmit">${esc(
            copy.reportSubmit || "Envoyer le signalement"
          )}</button>
        </form>
      </section>`;

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
