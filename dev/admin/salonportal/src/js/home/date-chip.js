/**
 * Puce date (aujourd’hui / demain / calendrier) — accueil + recherche.
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
        return (
            d.getFullYear() +
            "-" +
            pad(d.getMonth() + 1) +
            "-" +
            pad(d.getDate())
        );
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
            if (valueEl) {
                valueEl.textContent = t("homeProduct.dateAny") || "Toutes";
            }
            if (picker) picker.value = "";
            syncPresetActive("");
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
            btn.classList.toggle(
                "sq-date-popover__btn--active",
                (preset === "" && key === "any") ||
                    (preset && key === preset) ||
                    (preset === "custom" && key === "custom")
            );
        });
    }

    function closePopover() {
        const chip = getChip();
        const popover = getPopover();
        if (popover) popover.hidden = true;
        if (chip) chip.setAttribute("aria-expanded", "false");
    }

    function openPopover() {
        const chip = getChip();
        const popover = getPopover();
        if (!popover) return;
        const locPop = document.getElementById("homeLocationPopover");
        if (locPop) locPop.hidden = true;
        document
            .getElementById("homeLocationChip")
            ?.setAttribute("aria-expanded", "false");
        popover.hidden = false;
        if (chip) chip.setAttribute("aria-expanded", "true");
        const picker = getPicker();
        const iso = getDateIso();
        if (picker) {
            picker.min = todayIso();
            picker.value = iso || "";
        }
    }

    function initDateChip() {
        const chip = getChip();
        if (!chip) return;

        const saved = localStorage.getItem(STORAGE_ISO);
        setDate(saved || "", saved ? localStorage.getItem(STORAGE_LABEL) : "");

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
                    setDate("");
                    closePopover();
                    return;
                }
                if (preset === "today") {
                    setDate(todayIso(), t("homeProduct.dateToday") || "Aujourd'hui");
                    closePopover();
                    return;
                }
                if (preset === "tomorrow") {
                    setDate(
                        tomorrowIso(),
                        t("homeProduct.dateTomorrow") || "Demain"
                    );
                    closePopover();
                    return;
                }
            });
        });

        getPicker()?.addEventListener("change", function () {
            const val = (getPicker().value || "").trim();
            if (val) setDate(val);
        });

        document.getElementById("homeDateApply")?.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            const val = (getPicker()?.value || "").trim();
            if (val) setDate(val);
            else setDate("");
            closePopover();
        });

        document.addEventListener("click", function (e) {
            const wrap = document.querySelector(".sq-date-chip-wrap");
            if (wrap && !wrap.contains(e.target)) closePopover();
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
