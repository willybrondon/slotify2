/**
 * Header compte client — Favoris + Notifications (+ suppression) + menu Compte.
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
    const name = [user.fname, user.lname].filter(Boolean).join(" ") || t("Compte", "Account");
    return `
      <div class="sq-account-nav" data-account-nav>
        <button type="button" class="sq-header-fav-btn sq-account-nav__fav" id="headerFavBtn" title="${escapeHtml(
          t("Mes salons aimés", "Liked salons")
        )}" aria-label="${escapeHtml(
          t("Mes salons aimés", "Liked salons")
        )}" aria-expanded="false" aria-controls="favDrawer">
          <i class="far fa-heart" aria-hidden="true"></i>
          <span class="sq-header-fav-btn__count" id="headerFavCount" data-count="0"></span>
        </button>
        <div class="sq-account-nav__notif-wrap">
          <button type="button" class="sq-account-nav__btn" id="sqNotifBtn" title="${escapeHtml(
            t("Notifications", "Notifications")
          )}" aria-label="${escapeHtml(t("Notifications", "Notifications"))}" aria-expanded="false" aria-controls="sqNotifPanel">
            <i class="fas fa-bell" aria-hidden="true"></i>
            <span class="sq-account-nav__badge" id="sqNotifBadge" hidden>0</span>
          </button>
          <div class="sq-account-notif-panel" id="sqNotifPanel" hidden>
            <div class="sq-account-notif-panel__head">
              <h2 class="sq-account-notif-panel__title">${escapeHtml(
                t("Notifications", "Notifications")
              )}</h2>
              <a href="/compte/notifications">${escapeHtml(t("Tout voir", "See all"))}</a>
            </div>
            <div class="sq-account-notif-panel__list" id="sqNotifPreview">
              <p class="sq-account-muted">${escapeHtml(t("Chargement…", "Loading…"))}</p>
            </div>
          </div>
        </div>
        <div class="sq-account-nav__profile-wrap">
          <button type="button" class="sq-account-nav__btn sq-account-nav__btn--profile" id="sqAccountMenuBtn" title="${escapeHtml(
            name
          )}" aria-label="${escapeHtml(t("Compte", "Account"))}" aria-expanded="false" aria-controls="sqAccountMenu">
            <i class="fas fa-user" aria-hidden="true"></i>
            <span class="sq-account-nav__label desktop-only">${escapeHtml(
              t("Compte", "Account")
            )}</span>
          </button>
          <div class="sq-account-menu-panel" id="sqAccountMenu" hidden>
            <a href="/compte/reservations" class="sq-account-menu-panel__link">
              <i class="fas fa-calendar-check" aria-hidden="true"></i>
              ${escapeHtml(t("Réservations", "Bookings"))}
            </a>
            <a href="/compte/messages" class="sq-account-menu-panel__link">
              <i class="fas fa-comments" aria-hidden="true"></i>
              ${escapeHtml(t("Messages", "Messages"))}
            </a>
            <a href="/compte/signaler" class="sq-account-menu-panel__link">
              <i class="fas fa-flag" aria-hidden="true"></i>
              ${escapeHtml(t("Signaler", "Report"))}
            </a>
            <a href="/compte/profil" class="sq-account-menu-panel__link">
              <i class="fas fa-id-card" aria-hidden="true"></i>
              ${escapeHtml(t("Infos du compte", "Account details"))}
            </a>
            <button type="button" class="sq-account-menu-panel__link sq-account-menu-panel__link--danger" data-account-logout>
              <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
              ${escapeHtml(t("Déconnexion", "Log out"))}
            </button>
          </div>
        </div>
      </div>`;
  }

  function loggedInMobileHtml() {
    return `
      <button type="button" class="btn-login-mobile-menu" id="headerFavBtnMobile" data-open-fav>${escapeHtml(
        t("Mes salons aimés", "Liked salons")
      )}</button>
      <a href="/compte/notifications" class="btn-login-mobile-menu">${escapeHtml(
        t("Notifications", "Notifications")
      )}</a>
      <a href="/compte/reservations" class="btn-login-mobile-menu">${escapeHtml(
        t("Réservations", "Bookings")
      )}</a>
      <a href="/compte/messages" class="btn-login-mobile-menu">${escapeHtml(
        t("Messages", "Messages")
      )}</a>
      <a href="/compte/signaler" class="btn-login-mobile-menu">${escapeHtml(
        t("Signaler", "Report")
      )}</a>
      <a href="/compte/profil" class="btn-login-mobile-menu">${escapeHtml(
        t("Infos du compte", "Account details")
      )}</a>
      <button type="button" class="btn-login-mobile-menu" data-account-logout>${escapeHtml(
        t("Déconnexion", "Log out")
      )}</button>`;
  }

  async function refreshNotifBadge(userId) {
    const badge = document.getElementById("sqNotifBadge");
    if (!badge) return [];
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
      return list;
    } catch (_) {
      badge.hidden = true;
      return [];
    }
  }

  async function deleteNotification(userId, notificationId) {
    const qs = new URLSearchParams({ userId, notificationId });
    const res = await fetch(`/api/public/client/notifications?${qs.toString()}`, {
      method: "DELETE",
    });
    return res.json();
  }

  function renderNotifPreview(userId) {
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
      .slice(0, 30)
      .map(
        (n) => `<article class="sq-account-notif-preview" data-id="${escapeHtml(n._id)}">
          <div class="sq-account-notif-preview__body">
            <strong>${escapeHtml(n.title || t("Notification", "Notification"))}</strong>
            <p>${escapeHtml(n.message || "")}</p>
            <time>${escapeHtml(n.date || "")}</time>
          </div>
          <button type="button" class="sq-account-notif-preview__del" data-del-notif="${escapeHtml(
            n._id
          )}" aria-label="${escapeHtml(t("Supprimer", "Delete"))}" title="${escapeHtml(
          t("Supprimer", "Delete")
        )}">
            <i class="fas fa-trash-alt" aria-hidden="true"></i>
          </button>
        </article>`
      )
      .join("");

    box.querySelectorAll("[data-del-notif]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute("data-del-notif");
        if (!id) return;
        btn.disabled = true;
        try {
          const res = await deleteNotification(userId, id);
          if (res?.status) {
            window.__skedisyNotifs = (window.__skedisyNotifs || []).filter(
              (n) => String(n._id) !== String(id)
            );
            const badge = document.getElementById("sqNotifBadge");
            const n = (window.__skedisyNotifs || []).length;
            if (badge) {
              if (n > 0) {
                badge.hidden = false;
                badge.textContent = n > 99 ? "99+" : String(n);
              } else {
                badge.hidden = true;
              }
            }
            renderNotifPreview(userId);
          } else {
            btn.disabled = false;
          }
        } catch (_) {
          btn.disabled = false;
        }
      });
    });
  }

  function closePanels(except) {
    const notif = document.getElementById("sqNotifPanel");
    const menu = document.getElementById("sqAccountMenu");
    const notifBtn = document.getElementById("sqNotifBtn");
    const menuBtn = document.getElementById("sqAccountMenuBtn");
    if (notif && except !== "notif") {
      notif.hidden = true;
      notifBtn?.setAttribute("aria-expanded", "false");
    }
    if (menu && except !== "menu") {
      menu.hidden = true;
      menuBtn?.setAttribute("aria-expanded", "false");
    }
  }

  function wireNotifPanel(user) {
    const btn = document.getElementById("sqNotifBtn");
    const panel = document.getElementById("sqNotifPanel");
    if (!btn || !panel) return;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.matchMedia("(max-width: 900px)").matches) {
        window.location.href = "/compte/notifications";
        return;
      }
      const open = panel.hidden;
      closePanels("notif");
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        await refreshNotifBadge(user.id);
        renderNotifPreview(user.id);
      }
    });
  }

  function wireAccountMenu() {
    const btn = document.getElementById("sqAccountMenuBtn");
    const panel = document.getElementById("sqAccountMenu");
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.matchMedia("(max-width: 900px)").matches) {
        window.location.href = "/compte/profil";
        return;
      }
      const open = panel.hidden;
      closePanels("menu");
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function wireOutsideClose() {
    document.addEventListener("click", (e) => {
      const notif = document.getElementById("sqNotifPanel");
      const menu = document.getElementById("sqAccountMenu");
      const notifBtn = document.getElementById("sqNotifBtn");
      const menuBtn = document.getElementById("sqAccountMenuBtn");
      if (
        notif &&
        !notif.hidden &&
        !notif.contains(e.target) &&
        !notifBtn?.contains(e.target)
      ) {
        notif.hidden = true;
        notifBtn?.setAttribute("aria-expanded", "false");
      }
      if (
        menu &&
        !menu.hidden &&
        !menu.contains(e.target) &&
        !menuBtn?.contains(e.target)
      ) {
        menu.hidden = true;
        menuBtn?.setAttribute("aria-expanded", "false");
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

  function syncLoggedInClass(user) {
    document.documentElement.classList.toggle("is-client-logged-in", Boolean(user));
    document.body.classList.toggle("is-client-logged-in", Boolean(user));
  }

  function hideGuestFavoritesUi() {
    document.querySelectorAll(".sq-adencer-header__cta > .sq-header-fav-btn").forEach((btn) => {
      btn.hidden = true;
      btn.setAttribute("hidden", "");
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
    wireAccountMenu();
    wireOutsideClose();
    wireLogout();
    refreshNotifBadge(user.id);
  }

  function publishAccountState(user) {
    syncLoggedInClass(user);
    try {
      document.dispatchEvent(
        new CustomEvent("skedisy:account-ready", { detail: { user: user || null } })
      );
    } catch (_) {
      /* ignore */
    }
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
    if (user) {
      upgradeHeader(user);
      publishAccountState(user);
    } else {
      hideGuestFavoritesUi();
      publishAccountState(null);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
