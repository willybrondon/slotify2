/**
 * Puce date — même UX que la position :
 * clic → panneau qui se déroule → choix → OK (ferme).
 * Par défaut : aujourd'hui.
 */
(function () {
  const STORAGE_ISO = "skedisy-search-date";
  const STORAGE_LABEL = "skedisy-search-date-label";

  function t(key) {
    if (typeof getTranslation === "function") return getTranslation(key);
    return key;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toIso(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseIso(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const d = new Date(iso + "T12:00:00");
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatDisplay(iso) {
    const d = parseIso(iso);
    if (!d) return t("homeProduct.dateAny") || "Toutes";
    const lang = localStorage.getItem("skedisy-language") || "fr";
    try {
      return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch (_) {
      return iso;
    }
  }

  function todayIso() {
    return toIso(new Date());
  }

  function tomorrowIso() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toIso(d);
  }

  function getChip() {
    return document.getElementById("homeDateChip");
  }

  function getPopover() {
    return document.getElementById("homeDatePopover");
  }

  function getValueEl() {
    return document.getElementById("homeDateChipValue");
  }

  function getPicker() {
    return document.getElementById("homeDatePicker");
  }

  function setDate(iso, labelOverride) {
    const valueEl = getValueEl();
    const picker = getPicker();
    if (!iso) {
      localStorage.removeItem(STORAGE_ISO);
      localStorage.removeItem(STORAGE_LABEL);
      if (valueEl) valueEl.textContent = t("homeProduct.dateAny") || "Toutes";
      if (picker) picker.value = "";
      syncPresetActive("any");
      return;
    }
    const label = labelOverride || formatDisplay(iso);
    localStorage.setItem(STORAGE_ISO, iso);
    localStorage.setItem(STORAGE_LABEL, label);
    if (valueEl) valueEl.textContent = label;
    if (picker) picker.value = iso;
    const today = todayIso();
    const tomorrow = tomorrowIso();
    if (iso === today) syncPresetActive("today");
    else if (iso === tomorrow) syncPresetActive("tomorrow");
    else syncPresetActive("custom");
  }

  function getDateIso() {
    return localStorage.getItem(STORAGE_ISO) || "";
  }

  function getDateLabel() {
    const iso = getDateIso();
    if (!iso) return "";
    return localStorage.getItem(STORAGE_LABEL) || formatDisplay(iso);
  }

  function syncPresetActive(preset) {
    document.querySelectorAll("[data-date-preset]").forEach((btn) => {
      const key = btn.getAttribute("data-date-preset");
      btn.classList.toggle("sq-date-popover__btn--active", key === preset);
    });
  }

  function closePopover() {
    const chip = getChip();
    const popover = getPopover();
    if (popover) popover.hidden = true;
    if (chip) chip.setAttribute("aria-expanded", "false");
    document.querySelector(".sq-date-chip-wrap")?.classList.remove("is-open");
  }

  function openPopover() {
    const chip = getChip();
    const popover = getPopover();
    if (!popover) return;

    // Fermer la position si ouverte
    const locPop = document.getElementById("homeLocationPopover");
    if (locPop) locPop.hidden = true;
    document.getElementById("homeLocationChip")?.setAttribute("aria-expanded", "false");
    document.querySelector(".sq-location-chip-wrap")?.classList.remove("is-open");

    const picker = getPicker();
    const iso = getDateIso() || todayIso();
    if (picker) {
      picker.min = todayIso();
      picker.value = iso;
    }

    popover.hidden = false;
    if (chip) chip.setAttribute("aria-expanded", "true");
    document.querySelector(".sq-date-chip-wrap")?.classList.add("is-open");
  }

  /** Applique comme « OK » sur la position : valide + ferme le panneau. */
  function applyAndClose(iso, label) {
    if (!iso) setDate("");
    else setDate(iso, label);
    closePopover();
  }

  function applyFromPicker() {
    const val = (getPicker()?.value || "").trim();
    if (!val) {
      applyAndClose(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui");
      return;
    }
    applyAndClose(val);
  }

  function initDateChip() {
    const chip = getChip();
    if (!chip) return;

    // Par défaut : aujourd'hui (sauf date déjà choisie)
    const saved = localStorage.getItem(STORAGE_ISO);
    if (saved && parseIso(saved)) {
      const label = localStorage.getItem(STORAGE_LABEL) || "";
      if (saved === todayIso()) {
        setDate(saved, t("homeProduct.dateToday") || "Aujourd'hui");
      } else if (saved === tomorrowIso()) {
        setDate(saved, t("homeProduct.dateTomorrow") || "Demain");
      } else {
        setDate(saved, label || undefined);
      }
    } else {
      setDate(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui");
    }

    chip.addEventListener("click", function (e) {
      e.stopPropagation();
      const popover = getPopover();
      if (popover && popover.hidden) openPopover();
      else closePopover();
    });

    document.querySelectorAll("[data-date-preset]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const preset = btn.getAttribute("data-date-preset");
        if (preset === "any") {
          applyAndClose("");
          return;
        }
        if (preset === "today") {
          applyAndClose(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui");
          return;
        }
        if (preset === "tomorrow") {
          applyAndClose(
            tomorrowIso(),
            t("homeProduct.dateTomorrow") || "Demain"
          );
          return;
        }
      });
    });

    document.getElementById("homeDateApply")?.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      applyFromPicker();
    });

    getPicker()?.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFromPicker();
      }
      if (e.key === "Escape") closePopover();
    });

    document.addEventListener("click", function (e) {
      const wrap = document.querySelector(".sq-date-chip-wrap");
      if (wrap && !wrap.contains(e.target)) closePopover();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopover();
    });

    document.addEventListener("skedisy:language-changed", function () {
      const iso = getDateIso();
      if (!iso) {
        setDate("");
        return;
      }
      if (iso === todayIso()) {
        setDate(iso, t("homeProduct.dateToday") || "Aujourd'hui");
      } else if (iso === tomorrowIso()) {
        setDate(iso, t("homeProduct.dateTomorrow") || "Demain");
      } else {
        setDate(iso);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initDateChip);

  window.skedisyGetSearchDate = getDateIso;
  window.skedisyGetSearchDateLabel = getDateLabel;
  window.skedisySetSearchDate = setDate;
})();
