/**
 * Puce « Votre position » — panneau fixe au-dessus (taper + OK), sans scroll page.
 */
(function () {
  const STORAGE_KEY = "skedisy-location-label";
  const DEFAULT_LABEL = "Paris";

  function t(key) {
    if (typeof getTranslation === "function") return getTranslation(key);
    return key;
  }

  function getChip() {
    return document.getElementById("homeLocationChip");
  }

  function getPopover() {
    return document.getElementById("homeLocationPopover");
  }

  function getInput() {
    return document.getElementById("homeLocationSearchInput");
  }

  function getValueEl() {
    return document.getElementById("homeLocationChipValue");
  }

  function setLabel(label) {
    const text = String(label || "").trim() || DEFAULT_LABEL;
    localStorage.setItem(STORAGE_KEY, text);
    const valueEl = getValueEl();
    if (valueEl) valueEl.textContent = text;
    const input = getInput();
    if (input && document.activeElement !== input) {
      input.value = text;
    }
    updateViewMapLink(text);
  }

  function getLabel() {
    const input = getInput();
    const fromInput = input && input.value.trim();
    if (fromInput) return fromInput;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LABEL;
  }

  function updateViewMapLink(location) {
    const params = new URLSearchParams();
    params.set("view", "map");
    if (location) params.set("location", location);
    const href = "/recherche?" + params.toString();
    const link = document.getElementById("homeViewMapLink");
    if (link) link.href = href;
    const panelLink = document.getElementById("homeMapPanelLink");
    if (panelLink) panelLink.href = href;
  }

  function closePopover() {
    const chip = getChip();
    const popover = getPopover();
    const wasOpen = document.querySelector(".sq-location-chip-wrap")?.classList.contains("is-open");
    if (popover) {
      popover.hidden = true;
      window.SkedisyChipPanel?.restorePanel?.(popover);
    }
    if (chip) chip.setAttribute("aria-expanded", "false");
    document.querySelector(".sq-location-chip-wrap")?.classList.remove("is-open");
    if (wasOpen) {
      window.SkedisyChipPanel?.unlockPage?.();
      if (!document.querySelector(".sq-date-chip-wrap.is-open")) {
        window.SkedisyChipPanel?.hideBackdrop?.();
      }
    }
  }

  function openPopover() {
    const chip = getChip();
    const popover = getPopover();
    const input = getInput();
    if (!popover) return;

    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const hamburger = document.getElementById("mobileMenuToggle");
    if (mobileMenu?.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      mobileMenuOverlay?.classList.remove("active");
      hamburger?.classList.remove("active");
    }

    const dateWrap = document.querySelector(".sq-date-chip-wrap");
    if (dateWrap?.classList.contains("is-open")) {
      const datePop = document.getElementById("homeDatePopover");
      if (datePop) {
        datePop.hidden = true;
        window.SkedisyChipPanel?.restorePanel?.(datePop);
      }
      document.getElementById("homeDateChip")?.setAttribute("aria-expanded", "false");
      dateWrap.classList.remove("is-open");
      window.SkedisyChipPanel?.unlockPage?.();
    }

    window.SkedisyChipPanel?.lockPage?.();
    window.SkedisyChipPanel?.showBackdrop?.();
    window.SkedisyChipPanel?.mountPanel?.(popover);

    popover.hidden = false;
    if (chip) chip.setAttribute("aria-expanded", "true");
    document.querySelector(".sq-location-chip-wrap")?.classList.add("is-open");

    if (input) {
      input.value = getLabel();
      try {
        input.focus({ preventScroll: true });
        input.select();
      } catch (_) {
        input.focus();
      }
    }
  }

  function applyLocation() {
    const input = getInput();
    const label = input ? input.value.trim() : "";
    if (!label) return;
    setLabel(label);
    closePopover();
  }

  function requestGpsLabel() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function () {
        const near = t("homeProduct.nearYou") || "Near you";
        setLabel(near);
      },
      function () {
        setLabel(DEFAULT_LABEL);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  function initLocationChip() {
    const chip = getChip();
    if (!chip) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    setLabel(saved || DEFAULT_LABEL);

    chip.addEventListener("click", function (e) {
      e.stopPropagation();
      const popover = getPopover();
      if (popover && popover.hidden) openPopover();
      else closePopover();
    });

    document.getElementById("homeLocationApply")?.addEventListener("click", applyLocation);

    getInput()?.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyLocation();
      }
      if (e.key === "Escape") closePopover();
    });

    // Ne pas fermer au clic document : le backdrop gère la fermeture
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopover();
    });

    if (!saved) {
      requestGpsLabel();
    }
  }

  document.addEventListener("DOMContentLoaded", initLocationChip);

  window.skedisyGetLocationLabel = getLabel;
  window.skedisySetLocationLabel = setLabel;
})();
