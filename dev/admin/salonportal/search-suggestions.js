/**
 * Barre de recherche — suggestions (top catégories + prestations) au focus.
 */
(function () {
    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function t(key) {
        if (typeof getTranslation === "function") return getTranslation(key);
        return key;
    }

    function getLang() {
        return localStorage.getItem("skedisy-language") || "fr";
    }

    function filterByQuery(items, query) {
        const q = (query || "").trim().toLowerCase();
        if (!q) return items;
        return items.filter((item) =>
            String(item.name || "")
                .toLowerCase()
                .includes(q)
        );
    }

    function initSearchSuggestions(form) {
        const queryInput = form.querySelector("[data-search-query]");
        const panel = form.querySelector(".sq-search-suggestions");
        const categoriesList = form.querySelector("[data-suggest-categories]");
        const servicesList = form.querySelector("[data-suggest-services]");
        if (!queryInput || !panel || !categoriesList || !servicesList) return;

        let categories = [];
        let services = [];
        let loaded = false;
        let loading = false;
        let savedScrollY = 0;
        let pageLocked = false;

        function lockPagePosition() {
            if (pageLocked || document.body.classList.contains("menu-open")) return;
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            document.body.classList.add("sq-search-focus-active");
            document.body.style.top = `-${savedScrollY}px`;
            pageLocked = true;
        }

        function unlockPagePosition() {
            if (!pageLocked || document.body.classList.contains("menu-open")) return;
            document.body.classList.remove("sq-search-focus-active");
            document.body.style.top = "";
            pageLocked = false;
            window.scrollTo(0, savedScrollY);
        }

        function restoreScrollPosition() {
            window.scrollTo(0, savedScrollY);
            requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
        }

        function renderLists() {
            const query = queryInput.value;
            const visibleCategories = filterByQuery(categories, query).slice(0, 5);
            const visibleServices = filterByQuery(services, query).slice(0, 10);

            categoriesList.innerHTML = visibleCategories.length
                ? visibleCategories
                      .map(
                          (cat) =>
                              `<li><a href="${escapeHtml(cat.url)}" class="sq-search-suggestions__item sq-search-suggestions__item--category" data-suggest-type="category">` +
                              `<span class="sq-search-suggestions__item-icon" aria-hidden="true"><i class="fas fa-layer-group"></i></span>` +
                              `<span class="sq-search-suggestions__item-label">${escapeHtml(cat.name)}</span>` +
                              `</a></li>`
                      )
                      .join("")
                : `<li class="sq-search-suggestions__empty">${escapeHtml(t("intentHub.suggestNoCategories"))}</li>`;

            servicesList.innerHTML = visibleServices.length
                ? visibleServices
                      .map(
                          (svc) =>
                              `<li><button type="button" class="sq-search-suggestions__item sq-search-suggestions__item--service" data-suggest-type="service" data-suggest-name="${escapeHtml(svc.name)}">` +
                              `<span class="sq-search-suggestions__item-icon" aria-hidden="true"><i class="fas fa-scissors"></i></span>` +
                              `<span class="sq-search-suggestions__item-label">${escapeHtml(svc.name)}</span>` +
                              `</button></li>`
                      )
                      .join("")
                : `<li class="sq-search-suggestions__empty">${escapeHtml(t("intentHub.suggestNoServices"))}</li>`;

            panel.hidden = !visibleCategories.length && !visibleServices.length;
        }

        async function ensureLoaded() {
            if (loaded || loading) return;
            loading = true;
            panel.hidden = false;
            categoriesList.innerHTML = `<li class="sq-search-suggestions__empty">${escapeHtml(t("intentHub.suggestLoading"))}</li>`;
            servicesList.innerHTML = "";

            try {
                const res = await fetch(
                    `/api/public/search-suggestions?language=${encodeURIComponent(getLang())}`
                );
                const data = await res.json();
                if (data.status) {
                    categories = data.categories || [];
                    services = data.services || [];
                    loaded = true;
                }
            } catch (e) {
                console.error("search suggestions:", e);
            } finally {
                loading = false;
                renderLists();
            }
        }

        function openPanel() {
            lockPagePosition();
            ensureLoaded().then(() => {
                panel.hidden = false;
                renderLists();
                restoreScrollPosition();
            });
        }

        function closePanel() {
            panel.hidden = true;
        }

        function closePanelAndUnlock() {
            closePanel();
            unlockPagePosition();
        }

        queryInput.addEventListener("focus", () => {
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            openPanel();
        });
        queryInput.addEventListener("click", () => {
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            openPanel();
        });
        queryInput.addEventListener("input", () => {
            if (!panel.hidden || loaded) renderLists();
        });

        panel.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-suggest-type='service']");
            if (!btn) return;
            e.preventDefault();
            queryInput.value = btn.getAttribute("data-suggest-name") || "";
            closePanel();
            queryInput.focus();
        });

        queryInput.addEventListener("blur", () => {
            window.setTimeout(() => {
                if (!form.contains(document.activeElement)) {
                    closePanelAndUnlock();
                }
            }, 120);
        });

        document.addEventListener("click", (e) => {
            if (!form.contains(e.target)) closePanelAndUnlock();
        });

        form.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closePanelAndUnlock();
        });
    }

    function initAll() {
        document.querySelectorAll("form[data-search-unified]").forEach(initSearchSuggestions);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAll);
    } else {
        initAll();
    }
})();
