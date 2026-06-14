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
            ensureLoaded().then(() => {
                panel.hidden = false;
                renderLists();
            });
        }

        function closePanel() {
            panel.hidden = true;
        }

        queryInput.addEventListener("focus", openPanel);
        queryInput.addEventListener("click", openPanel);
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

        document.addEventListener("click", (e) => {
            if (!form.contains(e.target)) closePanel();
        });

        form.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closePanel();
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
