/**
 * Page /compte/notifications
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

  async function load(userId) {
    const res = await fetch(
      `/api/public/client/notifications?userId=${encodeURIComponent(userId)}`
    );
    const data = await res.json();
    if (!data?.status) throw new Error(data?.message || "Erreur");
    return data.notification || [];
  }

  async function removeNotif(userId, notificationId) {
    const qs = new URLSearchParams({ userId, notificationId });
    const res = await fetch(`/api/public/client/notifications?${qs.toString()}`, {
      method: "DELETE",
    });
    return res.json();
  }

  function renderList(list, userId) {
    if (!list.length) {
      return `<p class="sq-account-empty">${esc(
        copy.emptyNotifications || "Aucune notification."
      )}</p>`;
    }
    return list
      .map(
        (n) => `<article class="sq-account-notif-card" data-id="${esc(n._id)}">
        <div class="sq-account-notif-card__body">
          <h3>${esc(n.title || "Notification")}</h3>
          <p>${esc(n.message || "")}</p>
          <time>${esc(n.date || "")}</time>
        </div>
        <button type="button" class="sq-account-notif-card__del" data-del="${esc(
          n._id
        )}">${esc(copy.deleteNotif || "Supprimer")}</button>
      </article>`
      )
      .join("");
  }

  async function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;
    content.innerHTML = `
      <header class="sq-account-head">
        <h1>${esc(copy.notificationsTitle || "Notifications")}</h1>
      </header>
      <div class="sq-account-notif-list" id="notifList">
        <p class="sq-account-muted">${esc(copy.loading || "Chargement…")}</p>
      </div>`;

    const box = document.getElementById("notifList");
    try {
      const list = await load(user.id);
      box.innerHTML = renderList(list, user.id);
      box.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-del]");
        if (!btn) return;
        const id = btn.getAttribute("data-del");
        btn.disabled = true;
        const res = await removeNotif(user.id, id);
        if (res?.status) {
          const card = box.querySelector(`[data-id="${CSS.escape(id)}"]`);
          card?.remove();
          if (!box.querySelector(".sq-account-notif-card")) {
            box.innerHTML = `<p class="sq-account-empty">${esc(
              copy.emptyNotifications || "Aucune notification."
            )}</p>`;
          }
        } else {
          btn.disabled = false;
        }
      });
    } catch (e) {
      box.innerHTML = `<p class="sq-account-empty">${esc(e.message || "Erreur")}</p>`;
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
