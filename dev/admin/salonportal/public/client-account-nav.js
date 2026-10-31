/**
 * Header compte client — Réservations + Notifications + Profil (si connecté).
 */
(function () {
  const STORAGE_KEY = "skedisy_web_user";

  function readUser() {
    try {
      const raw =
        sessionStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const u = JSON.parse(raw);
      if (!u || !(u.id || u._id)) return null;
      return {
        id: String(u.id || u._id),
        fname: u.fname || "",
        lname: u.lname || "",
        email: u.email || "",
        mobile: u.mobile || "",
        image: u.image || "",
        amount: Number(u.amount) || 0,
      };
    } catch (_) {
      return null;
    }
  }

  function clearUser() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  function loginHref() {
    try {
      const u = new URL("/compte/connexion", window.location.origin);
      const ret = window.location.pathname + window.location.search;
      if (ret && ret !== "/") u.searchParams.set("return", ret);
      return u.pathname + u.search;
    } catch (_) {
      return "/compte/connexion";
    }
  }

  function t(fr, en) {
    const lang =
      (localStorage.getItem("skedisy-language") || document.documentElement.lang || "fr")
        .toLowerCase()
        .slice(0, 2);
    return lang === "en" ? en : fr;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loggedInCtaHtml(user) {
    const name = [user.fname, user.lname].filter(Boolean).join(" ") || "Compte";
    return `
      <div class="sq-account-nav" data-account-nav>
        <a href="/compte/reservations" class="sq-account-nav__btn" title="${escapeHtml(
          t("Réservations", "Bookings")
        )}" aria-label="${escapeHtml(t("Réservations", "Bookings"))}">
          <i class="fas fa-calendar-check" aria-hidden="true"></i>
          <span class="sq-account-nav__label desktop-only">${escapeHtml(
            t("Réservations", "Bookings")
          )}</span>
        </a>
        <div class="sq-account-nav__notif-wrap">
          <a href="/compte/notifications" class="sq-account-nav__btn" id="sqNotifBtn" title="${escapeHtml(
            t("Notifications", "Notifications")
          )}" aria-label="${escapeHtml(t("Notifications", "Notifications"))}">
            <i class="fas fa-bell" aria-hidden="true"></i>
            <span class="sq-account-nav__badge" id="sqNotifBadge" hidden>0</span>
          </a>
          <div class="sq-account-notif-panel" id="sqNotifPanel" hidden>
            <div class="sq-account-notif-panel__head">
              <strong>${escapeHtml(t("Notifications", "Notifications"))}</strong>
              <a href="/compte/notifications">${escapeHtml(t("Tout voir", "See all"))}</a>
            </div>
            <div class="sq-account-notif-panel__list" id="sqNotifPreview">
              <p class="sq-account-muted">${escapeHtml(t("Chargement…", "Loading…"))}</p>
            </div>
          </div>
        </div>
        <div class="sq-account-nav__profile-wrap">
          <a href="/compte/profil" class="sq-account-nav__btn sq-account-nav__btn--profile" title="${escapeHtml(
            name
          )}">
            <i class="fas fa-user-circle" aria-hidden="true"></i>
            <span class="sq-account-nav__label desktop-only">${escapeHtml(
              user.fname || t("Profil", "Profile")
            )}</span>
          </a>
        </div>
      </div>`;
  }

  function loggedInMobileHtml() {
    return `
      <a href="/compte/reservations" class="btn-login-mobile-menu">${escapeHtml(
        t("Réservations", "Bookings")
      )}</a>
      <a href="/compte/notifications" class="btn-login-mobile-menu">${escapeHtml(
        t("Notifications", "Notifications")
      )}</a>
      <a href="/compte/profil" class="btn-login-mobile-menu">${escapeHtml(
        t("Mon profil", "My profile")
      )}</a>
      <a href="/compte/profil#signaler" class="btn-login-mobile-menu">${escapeHtml(
        t("Signaler", "Report")
      )}</a>
      <button type="button" class="btn-login-mobile-menu" data-account-logout>${escapeHtml(
        t("Déconnexion", "Log out")
      )}</button>`;
  }

  async function refreshNotifBadge(userId) {
    const badge = document.getElementById("sqNotifBadge");
    if (!badge) return;
    try {
      const res = await fetch(
        `/api/public/client/notifications?userId=${encodeURIComponent(userId)}`
      );
      const data = await res.json();
      const list = data?.notification || [];
      const n = list.length;
      if (n > 0) {
        badge.hidden = false;
        badge.textContent = n > 99 ? "99+" : String(n);
      } else {
        badge.hidden = true;
      }
      window.__skedisyNotifs = list;
    } catch (_) {
      badge.hidden = true;
    }
  }

  function renderNotifPreview() {
    const box = document.getElementById("sqNotifPreview");
    if (!box) return;
    const list = window.__skedisyNotifs || [];
    if (!list.length) {
      box.innerHTML = `<p class="sq-account-muted">${escapeHtml(
        t("Aucune notification.", "No notifications.")
      )}</p>`;
      return;
    }
    box.innerHTML = list
      .slice(0, 5)
      .map(
        (n) => `<article class="sq-account-notif-preview">
          <strong>${escapeHtml(n.title || t("Notification", "Notification"))}</strong>
          <p>${escapeHtml(n.message || "")}</p>
          <time>${escapeHtml(n.date || "")}</time>
        </article>`
      )
      .join("");
  }

  function wireNotifPanel(user) {
    const btn = document.getElementById("sqNotifBtn");
    const panel = document.getElementById("sqNotifPanel");
    if (!btn || !panel) return;

    btn.addEventListener("click", async (e) => {
      // Desktop: toggle preview; mobile / middle-click: follow link
      if (window.matchMedia("(max-width: 900px)").matches) return;
      e.preventDefault();
      const open = panel.hidden;
      panel.hidden = !open;
      if (open) {
        if (!window.__skedisyNotifs) await refreshNotifBadge(user.id);
        renderNotifPreview();
      }
    });

    document.addEventListener("click", (e) => {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.hidden = true;
      }
    });
  }

  function wireLogout() {
    document.querySelectorAll("[data-account-logout]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        clearUser();
        window.location.href = "/";
      });
    });
  }

  function upgradeHeader(user) {
    document.querySelectorAll("[data-account-cta], .sq-adencer-header__cta").forEach((cta) => {
      if (cta.dataset.accountReady === "1") return;
      cta.dataset.accountReady = "1";
      cta.innerHTML = loggedInCtaHtml(user);
    });

    const mobile = document.querySelector("[data-account-mobile], .mobile-menu-content--client");
    if (mobile && mobile.dataset.accountReady !== "1") {
      mobile.dataset.accountReady = "1";
      const keep = Array.from(mobile.children).filter((el) => {
        const href = (el.getAttribute("href") || "").toLowerCase();
        const isAuth =
          href.includes("/compte/connexion") || href.includes("/compte/inscription");
        return !isAuth;
      });
      mobile.innerHTML = loggedInMobileHtml() + keep.map((el) => el.outerHTML).join("");
    }

    wireNotifPanel(user);
    wireLogout();
    refreshNotifBadge(user.id);
  }

  function init() {
    const user = readUser();
    window.SkedisyAccount = {
      getUser: readUser,
      clearUser,
      loginHref,
      requireUser() {
        const u = readUser();
        if (!u) {
          window.location.href = loginHref();
          return null;
        }
        return u;
      },
    };
    if (user) upgradeHeader(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
