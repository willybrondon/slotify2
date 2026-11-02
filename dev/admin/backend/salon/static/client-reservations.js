/**
 * Page /compte/reservations — onglets À venir / Annulé / Complété.
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

  function money(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return `${v.toFixed(2)} €`;
  }

  function statusMeta(status) {
    const s = String(status || "").toLowerCase();
    if (s === "cancel") {
      return { label: copy.tabCancelled || "Annulé", mod: "is-cancel" };
    }
    if (s === "completed") {
      return { label: copy.tabCompleted || "Complété", mod: "is-done" };
    }
    if (s === "confirm" || s === "pending") {
      return { label: copy.tabUpcoming || "À venir", mod: "is-upcoming" };
    }
    return { label: status || "—", mod: "" };
  }

  function renderCard(b) {
    const services = (b.services || []).map((s) => s.name).filter(Boolean).join(", ");
    const salon = b.salon?.name || "Salon";
    const place = [b.salon?.address, b.salon?.city].filter(Boolean).join(", ");
    const expert = b.expert
      ? `${copy.expert || "avec"} ${[b.expert.fname, b.expert.lname].filter(Boolean).join(" ")}`
      : "";
    const time = b.startTime || (Array.isArray(b.time) ? b.time[0] : "") || "";
    const duration =
      b.duration != null && Number(b.duration) > 0
        ? `${Number(b.duration)} min`
        : "";
    const st = statusMeta(b.status);
    return `<article class="sq-account-booking-card">
      <div class="sq-account-booking-card__top">
        <span class="sq-account-booking-card__id">#${esc(b.bookingId)}</span>
        <span class="sq-account-status ${esc(st.mod)}">${esc(st.label)}</span>
      </div>
      <h3 class="sq-account-booking-card__salon">${esc(salon)}</h3>
      ${place ? `<p class="sq-account-muted"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(place)}</p>` : ""}
      <p class="sq-account-booking-card__svc">${esc(services || "—")}</p>
      ${expert ? `<p class="sq-account-muted">${esc(expert)}</p>` : ""}
      <div class="sq-account-booking-card__meta">
        <span><i class="far fa-calendar" aria-hidden="true"></i> ${esc(b.date || "")}${
      time ? ` · ${esc(time)}` : ""
    }${duration ? ` · ${esc(duration)}` : ""}</span>
        <span class="sq-account-booking-card__amount">${esc(copy.amount || "Montant")} · ${esc(
      money(b.amount)
    )}</span>
      </div>
      ${
        b.cancel?.reason
          ? `<p class="sq-account-booking-card__cancel">${esc(b.cancel.reason)}</p>`
          : ""
      }
    </article>`;
  }

  async function loadTab(userId, status, search) {
    const qs = new URLSearchParams({
      userId,
      status,
      start: "0",
      limit: "40",
    });
    if (search) qs.set("search", search);
    const res = await fetch(`/api/public/client/bookings?${qs.toString()}`);
    const data = await res.json();
    if (!data?.status) throw new Error(data?.message || "Erreur");
    return data.data || [];
  }

  function emptyMsg(status) {
    if (status === "cancel") return copy.emptyCancelled;
    if (status === "completed") return copy.emptyCompleted;
    return copy.emptyUpcoming;
  }

  async function showList(root, userId, status, search) {
    const listEl = root.querySelector("[data-booking-list]");
    listEl.innerHTML = `<p class="sq-account-muted sq-account-loading">${esc(
      copy.loading || "Chargement…"
    )}</p>`;
    try {
      const items = await loadTab(userId, status, search);
      if (!items.length) {
        listEl.innerHTML = `<div class="sq-account-empty-state">
          <div class="sq-account-empty-state__icon" aria-hidden="true"><i class="fas fa-calendar-check"></i></div>
          <p>${esc(emptyMsg(status))}</p>
          <p class="sq-account-empty-state__hint">${esc(
            copy.emptyBrowseHint ||
              "Trouvez un salon qui comprend vos cheveux — Île-de-France."
          )}</p>
          <a class="sq-btn sq-btn-fill" href="/recherche">${esc(
            copy.browseSalons || "Trouver un salon"
          )}</a>
        </div>`;
        return;
      }
      listEl.innerHTML = items.map(renderCard).join("");
    } catch (e) {
      listEl.innerHTML = `<p class="sq-account-empty">${esc(e.message || "Erreur")}</p>`;
    }
  }

  function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;
    content.innerHTML = `
      <div class="sq-account-toolbar">
        <div class="sq-account-tabs" role="tablist">
          <button type="button" class="sq-account-tab is-active" data-status="pending" role="tab">${esc(
            copy.tabUpcoming || "À venir"
          )}</button>
          <button type="button" class="sq-account-tab" data-status="cancel" role="tab">${esc(
            copy.tabCancelled || "Annulé"
          )}</button>
          <button type="button" class="sq-account-tab" data-status="completed" role="tab">${esc(
            copy.tabCompleted || "Complété"
          )}</button>
        </div>
        <label class="sq-account-search-wrap">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input type="search" class="sq-account-search" id="bookingSearch"
            placeholder="${esc(copy.searchPlaceholder || "Rechercher")}" />
        </label>
      </div>
      <div class="sq-account-booking-list" data-booking-list></div>`;

    let status = "pending";
    let searchTimer;

    const refresh = () =>
      showList(content, user.id, status, document.getElementById("bookingSearch")?.value || "");

    content.querySelectorAll(".sq-account-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        content.querySelectorAll(".sq-account-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        status = btn.getAttribute("data-status") || "pending";
        refresh();
      });
    });

    document.getElementById("bookingSearch")?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(refresh, 280);
    });

    refresh();
  }

  function init() {
    const getUser = window.SkedisyAccount?.getUser;
    const user = typeof getUser === "function" ? getUser() : null;
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
