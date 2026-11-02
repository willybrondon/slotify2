/**
 * Puce date — panneau ancré sous le chip + calendrier moderne.
 * Sync localStorage → résultats salons + réservation.
 */
(function () {
  const STORAGE_ISO = "skedisy-search-date";
  const STORAGE_LABEL = "skedisy-search-date-label";

  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth();
  let draftIso = "";

  const DATE_I18N = {
    "homeProduct.dateLabel": { fr: "Date", en: "Date" },
    "homeProduct.dateToday": { fr: "Aujourd'hui", en: "Today" },
    "homeProduct.dateTomorrow": { fr: "Demain", en: "Tomorrow" },
    "homeProduct.dateAny": { fr: "Toutes", en: "Any" },
    "homeProduct.datePick": { fr: "Choisir une date", en: "Pick a date" },
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
    const row = DATE_I18N[key];
    if (row) return row[lang] || row.fr;
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

  function emitDateChanged(iso) {
    try {
      document.dispatchEvent(
        new CustomEvent("skedisy:search-date-changed", { detail: { iso: iso || "" } })
      );
    } catch (_) {
      /* ignore */
    }
  }

  function setDate(iso, labelOverride, opts) {
    const valueEl = getValueEl();
    const picker = getPicker();
    const silent = opts && opts.silent;
    if (!iso) {
      localStorage.removeItem(STORAGE_ISO);
      localStorage.removeItem(STORAGE_LABEL);
      if (valueEl) valueEl.textContent = t("homeProduct.dateAny") || "Toutes";
      if (picker) picker.value = "";
      draftIso = "";
      syncPresetActive("any");
      if (!silent) emitDateChanged("");
      return;
    }
    const label = labelOverride || formatDisplay(iso);
    localStorage.setItem(STORAGE_ISO, iso);
    localStorage.setItem(STORAGE_LABEL, label);
    if (valueEl) valueEl.textContent = label;
    if (picker) picker.value = iso;
    draftIso = iso;
    const today = todayIso();
    const tomorrow = tomorrowIso();
    if (iso === today) syncPresetActive("today");
    else if (iso === tomorrow) syncPresetActive("tomorrow");
    else syncPresetActive("custom");
    if (!silent) emitDateChanged(iso);
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

  function monthLabel(y, m) {
    const lang = localStorage.getItem("skedisy-language") || "fr";
    try {
      return new Date(y, m, 1).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return y + "-" + (m + 1);
    }
  }

  function weekdayHeaders() {
    const lang = (localStorage.getItem("skedisy-language") || "fr").slice(0, 2);
    if (lang === "en") return ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    return ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
  }

  function renderMiniCalendar() {
    const root = document.getElementById("homeDateCalendar");
    if (!root) return;
    const today = todayIso();
    const selected = draftIso || getDateIso() || today;
    const first = new Date(calYear, calMonth, 1);
    // Monday-first
    let startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    const heads = weekdayHeaders()
      .map((h) => `<span class="sq-mini-cal__dow">${h}</span>`)
      .join("");

    let cells = "";
    for (let i = 0; i < startPad; i++) {
      cells += `<span class="sq-mini-cal__day sq-mini-cal__day--empty"></span>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = calYear + "-" + pad(calMonth + 1) + "-" + pad(day);
      const disabled = iso < today;
      const isSel = iso === selected;
      const isToday = iso === today;
      cells += `<button type="button" class="sq-mini-cal__day${isSel ? " is-selected" : ""}${
        isToday ? " is-today" : ""
      }" data-cal-day="${iso}" ${disabled ? "disabled" : ""}>${day}</button>`;
    }

    root.innerHTML = `
      <div class="sq-mini-cal__nav">
        <button type="button" class="sq-mini-cal__nav-btn" id="homeDateCalPrev" aria-label="Mois précédent">‹</button>
        <span class="sq-mini-cal__month">${monthLabel(calYear, calMonth)}</span>
        <button type="button" class="sq-mini-cal__nav-btn" id="homeDateCalNext" aria-label="Mois suivant">›</button>
      </div>
      <div class="sq-mini-cal__grid">
        ${heads}
        ${cells}
      </div>`;

    document.getElementById("homeDateCalPrev")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      calMonth -= 1;
      if (calMonth < 0) {
        calMonth = 11;
        calYear -= 1;
      }
      renderMiniCalendar();
    });
    document.getElementById("homeDateCalNext")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      calMonth += 1;
      if (calMonth > 11) {
        calMonth = 0;
        calYear += 1;
      }
      renderMiniCalendar();
    });
    root.querySelectorAll("[data-cal-day]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        draftIso = btn.getAttribute("data-cal-day") || "";
        const picker = getPicker();
        if (picker) picker.value = draftIso;
        if (draftIso === todayIso()) syncPresetActive("today");
        else if (draftIso === tomorrowIso()) syncPresetActive("tomorrow");
        else syncPresetActive("custom");
        renderMiniCalendar();
      });
    });
  }

  function closePopover() {
    const chip = getChip();
    const popover = getPopover();
    const wasOpen = document.querySelector(".sq-date-chip-wrap")?.classList.contains("is-open");
    window.SkedisyChipPanel?.unbindReposition?.();
    if (popover) {
      popover.hidden = true;
      window.SkedisyChipPanel?.restorePanel?.(popover);
    }
    if (chip) chip.setAttribute("aria-expanded", "false");
    document.querySelector(".sq-date-chip-wrap")?.classList.remove("is-open");
    if (wasOpen) {
      window.SkedisyChipPanel?.unlockPage?.();
      if (!document.querySelector(".sq-location-chip-wrap.is-open")) {
        window.SkedisyChipPanel?.hideBackdrop?.();
      }
    }
  }

  function openPopover() {
    const chip = getChip();
    const popover = getPopover();
    if (!popover || !chip) return;

    const locWrap = document.querySelector(".sq-location-chip-wrap");
    if (locWrap?.classList.contains("is-open")) {
      const locPop = document.getElementById("homeLocationPopover");
      if (locPop) {
        locPop.hidden = true;
        window.SkedisyChipPanel?.restorePanel?.(locPop);
      }
      document.getElementById("homeLocationChip")?.setAttribute("aria-expanded", "false");
      locWrap.classList.remove("is-open");
      window.SkedisyChipPanel?.unlockPage?.();
      window.SkedisyChipPanel?.unbindReposition?.();
    }

    window.SkedisyChipPanel?.lockPage?.();
    window.SkedisyChipPanel?.showBackdrop?.();
    window.SkedisyChipPanel?.mountPanel?.(popover);

    draftIso = getDateIso() || todayIso();
    const d = parseIso(draftIso) || new Date();
    calYear = d.getFullYear();
    calMonth = d.getMonth();
    const picker = getPicker();
    if (picker) {
      picker.min = todayIso();
      picker.value = draftIso;
    }
    renderMiniCalendar();

    window.SkedisyChipPanel?.positionUnder?.(popover, chip, { minWidth: 300 });
    window.SkedisyChipPanel?.bindReposition?.(popover, chip, { minWidth: 300 });

    popover.hidden = false;
    chip.setAttribute("aria-expanded", "true");
    document.querySelector(".sq-date-chip-wrap")?.classList.add("is-open");
  }

  function applyAndClose(iso, label) {
    if (!iso) setDate("");
    else setDate(iso, label);
    closePopover();
  }

  function applyFromCalendar() {
    const val = (draftIso || getPicker()?.value || "").trim();
    if (!val) {
      applyAndClose(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui");
      return;
    }
    if (val === todayIso()) {
      applyAndClose(val, t("homeProduct.dateToday") || "Aujourd'hui");
      return;
    }
    if (val === tomorrowIso()) {
      applyAndClose(val, t("homeProduct.dateTomorrow") || "Demain");
      return;
    }
    applyAndClose(val);
  }

  function initDateChip() {
    const chip = getChip();
    if (!chip) return;

    const saved = localStorage.getItem(STORAGE_ISO);
    if (saved && parseIso(saved)) {
      const label = localStorage.getItem(STORAGE_LABEL) || "";
      if (saved === todayIso()) {
        setDate(saved, t("homeProduct.dateToday") || "Aujourd'hui", { silent: true });
      } else if (saved === tomorrowIso()) {
        setDate(saved, t("homeProduct.dateTomorrow") || "Demain", { silent: true });
      } else {
        setDate(saved, label || undefined, { silent: true });
      }
    } else {
      setDate(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui", { silent: true });
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
          applyAndClose(tomorrowIso(), t("homeProduct.dateTomorrow") || "Demain");
          return;
        }
      });
    });

    document.getElementById("homeDateApply")?.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      applyFromCalendar();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopover();
    });

    document.addEventListener("skedisy:language-changed", function () {
      const iso = getDateIso();
      if (!iso) {
        setDate("", null, { silent: true });
        return;
      }
      if (iso === todayIso()) {
        setDate(iso, t("homeProduct.dateToday") || "Aujourd'hui", { silent: true });
      } else if (iso === tomorrowIso()) {
        setDate(iso, t("homeProduct.dateTomorrow") || "Demain", { silent: true });
      } else {
        setDate(iso, null, { silent: true });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initDateChip);

  window.skedisyGetSearchDate = getDateIso;
  window.skedisyGetSearchDateLabel = getDateLabel;
  window.skedisySetSearchDate = setDate;
})();
