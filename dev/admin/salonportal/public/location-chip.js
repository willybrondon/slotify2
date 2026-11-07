/**
 * Puce « Votre position » — vide par défaut (comme la barre de recherche).
 */
(function () {
  const STORAGE_KEY = "skedisy-location-label";

  const LOC_I18N = {
    "homeProduct.nearYou": { fr: "Près de vous", en: "Near you" },
    "homeProduct.yourLocation": { fr: "Votre position", en: "Your location" },
    "homeProduct.applyLocation": { fr: "OK", en: "OK" },
    "homeProduct.locationPlaceholder": {
      fr: "Ville, quartier…",
      en: "City, area…",
    },
  };

  function t(key) {
    const lang = String(
      localStorage.getItem("skedisy-language") || document.documentElement.lang || "fr"
    )
      .toLowerCase()
      .slice(0, 2);
    if (typeof getTranslation === "function") {
      const v = getTranslation(key);
      if (v && v !== key) return v;
    }
    const row = LOC_I18N[key];
    if (row) return row[lang] || row.fr;
    return key;
  }

  function placeholder() {
    return t("homeProduct.locationPlaceholder") || "Ville, quartier…";
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

  function setLabel(label, opts) {
    const silent = Boolean(opts && opts.silent);
    const text = String(label || "").trim();
    if (text) {
      localStorage.setItem(STORAGE_KEY, text);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {
        /* ignore */
      }
    }

    const valueEl = getValueEl();
    if (valueEl) {
      if (text) {
        valueEl.textContent = text;
        valueEl.classList.remove("is-placeholder");
      } else {
        valueEl.textContent = placeholder();
        valueEl.classList.add("is-placeholder");
      }
    }

    const input = getInput();
    if (input && document.activeElement !== input) {
      input.value = text;
      input.placeholder = placeholder();
    }

    updateViewMapLink(text);

    if (!silent) {
      try {
        document.dispatchEvent(
          new CustomEvent("skedisy:location-changed", { detail: { location: text } })
        );
      } catch (_) {
        /* ignore */
      }
    }
  }

  function getLabel() {
    const input = getInput();
    const fromInput = input && input.value.trim();
    if (fromInput) return fromInput;
    const valueEl = getValueEl();
    if (valueEl && !valueEl.classList.contains("is-placeholder")) {
      const shown = (valueEl.textContent || "").trim();
      if (shown && shown !== placeholder()) return shown;
    }
    return (localStorage.getItem(STORAGE_KEY) || "").trim();
  }

  function updateViewMapLink(location) {
    const params = new URLSearchParams();
    params.set("view", "map");
    if (location) params.set("location", location);
    const date =
      typeof window.skedisyGetSearchDate === "function"
        ? window.skedisyGetSearchDate()
        : localStorage.getItem("skedisy-search-date") || "";
    if (date) params.set("date", date);
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
    window.SkedisyChipPanel?.unbindReposition?.();
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
    if (!popover || !chip) return;

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
      window.SkedisyChipPanel?.unbindReposition?.();
    }

    window.SkedisyChipPanel?.lockPage?.();
    window.SkedisyChipPanel?.showBackdrop?.();
    window.SkedisyChipPanel?.mountPanel?.(popover);
    window.SkedisyChipPanel?.positionUnder?.(popover, chip, { minWidth: 300 });
    window.SkedisyChipPanel?.bindReposition?.(popover, chip, { minWidth: 300 });

    popover.hidden = false;
    chip.setAttribute("aria-expanded", "true");
    document.querySelector(".sq-location-chip-wrap")?.classList.add("is-open");

    if (input) {
      input.placeholder = placeholder();
      input.value = getLabel();
      try {
        input.focus({ preventScroll: true });
        if (input.value) input.select();
      } catch (_) {
        input.focus();
      }
    }
  }

  function applyLocation() {
    const input = getInput();
    const label = input ? input.value.trim() : "";
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
        /* laisser vide — comme la barre de recherche */
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  function initLocationChip() {
    const chip = getChip();
    if (!chip) return;

    const urlLoc = (
      new URLSearchParams(window.location.search).get("location") || ""
    ).trim();
    const inputSeed = (getInput()?.value || "").trim();
    const saved = (localStorage.getItem(STORAGE_KEY) || "").trim();
    const initial = urlLoc || inputSeed || saved || "";
    setLabel(initial, { silent: true });

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

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopover();
    });

    if (!urlLoc && !inputSeed && !saved) {
      requestGpsLabel();
    }
  }

  document.addEventListener("DOMContentLoaded", initLocationChip);

  window.skedisyGetLocationLabel = getLabel;
  window.skedisySetLocationLabel = setLabel;
})();
