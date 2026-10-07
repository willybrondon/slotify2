/**
 * Barre de recherche — suggestions au focus.
 * - Vide : catégories / prestations populaires
 * - Texte saisi : uniquement salons correspondants (plus de populaires)
 * Mobile accueil : sheet plein écran scrollable.
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

    function isMobileViewport() {
        return window.matchMedia("(max-width: 768px)").matches;
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

    function slugify(name) {
        return String(name || "salon")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function salonHref(salon) {
        if (salon.shareUrl) return salon.shareUrl;
        const id = salon._id || salon.id;
        if (!id) return "#";
        const shortId = salon.shortId || String(id).substring(0, 6);
        return (
            window.location.origin.replace(/\/+$/, "") +
            "/salon/" +
            slugify(salon.name) +
            "-" +
            shortId
        );
    }

    function initSearchSuggestions(form) {
        const queryInput = form.querySelector("[data-search-query]");
        const panel = form.querySelector(".sq-search-suggestions");
        const categoriesList = form.querySelector("[data-suggest-categories]");
        const servicesList = form.querySelector("[data-suggest-services]");
        const salonsList = form.querySelector("[data-suggest-salons]");
        const popularSections = form.querySelectorAll("[data-suggest-popular]");
        const salonsSection = form.querySelector("[data-suggest-salons-section]");
        if (!queryInput || !panel || !categoriesList || !servicesList || !salonsList) {
            return;
        }

        const hero =
            form.closest(".sq-search-hero") ||
            form.closest(".sq-search-hero-wrap");
        const heroWrap =
            form.closest(".sq-search-hero-wrap") ||
            (hero && hero.closest(".sq-search-hero-wrap")) ||
            hero;

        let categories = [];
        let services = [];
        let loaded = false;
        let loading = false;
        let savedScrollY = 0;
        let pageLocked = false;
        let sheetOpen = false;
        let ignoreNextDocClick = false;
        let salonFetchTimer = null;
        let salonFetchSeq = 0;
        let lastSalonQuery = "";

        function ensureSheetBackBtn() {
            if (!hero) return null;
            let btn = hero.querySelector("[data-search-sheet-back]");
            if (!btn) {
                btn = document.createElement("button");
                btn.type = "button";
                btn.className = "sq-search-sheet__back";
                btn.setAttribute("data-search-sheet-back", "");
                btn.setAttribute(
                    "aria-label",
                    t("intentHub.searchBack") || "Retour"
                );
                btn.innerHTML = "‹";
                const toolbar = hero.querySelector(".sq-search-hero-toolbar");
                if (toolbar) {
                    toolbar.classList.add("sq-search-hero-toolbar--sheet");
                    toolbar.insertBefore(btn, toolbar.firstChild);
                } else {
                    hero.insertBefore(btn, hero.firstChild);
                }
            }
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                closePanelAndUnlock();
                queryInput.blur();
            };
            return btn;
        }

        function openMobileSheet() {
            if (!heroWrap || !isMobileViewport()) return false;
            ensureSheetBackBtn();
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            sheetOpen = true;
            pageLocked = true;
            document.body.classList.add(
                "sq-search-sheet-open",
                "sq-search-focus-active"
            );
            document.body.style.overflow = "hidden";
            document.body.style.top = "";
            heroWrap.classList.add("is-search-sheet");
            if (hero) hero.classList.add("is-search-sheet-hero");
            if (panel && hero && panel.parentElement !== hero) {
                panel.dataset.suggestHost = "moved";
                hero.appendChild(panel);
            }
            if (panel) panel.classList.add("sq-search-sheet-suggestions");
            requestAnimationFrame(() => {
                try {
                    heroWrap.scrollTop = 0;
                    queryInput.focus({ preventScroll: true });
                } catch (_) {
                    queryInput.focus();
                }
            });
            return true;
        }

        function closeMobileSheet() {
            if (!sheetOpen) return;
            sheetOpen = false;
            document.body.classList.remove(
                "sq-search-sheet-open",
                "sq-search-focus-active"
            );
            document.body.style.overflow = "";
            if (heroWrap) heroWrap.classList.remove("is-search-sheet");
            if (hero) hero.classList.remove("is-search-sheet-hero");
            if (panel) {
                panel.classList.remove("sq-search-sheet-suggestions");
                if (panel.dataset.suggestHost === "moved") {
                    const wrap = form.querySelector(
                        ".sq-search-bar-unified__query-wrap"
                    );
                    if (wrap) wrap.appendChild(panel);
                    delete panel.dataset.suggestHost;
                }
            }
            window.scrollTo(0, savedScrollY);
        }

        function lockPagePosition() {
            if (pageLocked || document.body.classList.contains("menu-open"))
                return;
            if (openMobileSheet()) return;
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            document.body.classList.add("sq-search-focus-active");
            document.body.style.top = `-${savedScrollY}px`;
            pageLocked = true;
        }

        function unlockPagePosition() {
            if (!pageLocked || document.body.classList.contains("menu-open"))
                return;
            if (sheetOpen) {
                closeMobileSheet();
                pageLocked = false;
                return;
            }
            document.body.classList.remove("sq-search-focus-active");
            document.body.style.top = "";
            pageLocked = false;
            window.scrollTo(0, savedScrollY);
        }

        function restoreScrollPosition() {
            if (sheetOpen) return;
            window.scrollTo(0, savedScrollY);
            requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
        }

        function setMode(hasQuery) {
            popularSections.forEach((el) => {
                el.hidden = !!hasQuery;
            });
            if (salonsSection) salonsSection.hidden = !hasQuery;
        }

        function renderPopularLists() {
            const visibleCategories = filterByQuery(categories, "").slice(0, 8);
            const visibleServices = filterByQuery(services, "").slice(0, 12);

            categoriesList.innerHTML = visibleCategories.length
                ? visibleCategories
                      .map(
                          (cat) =>
                              `<li><a href="${escapeHtml(
                                  cat.url
                              )}" class="sq-search-suggestions__item sq-search-suggestions__item--category" data-suggest-type="category">` +
                              `<span class="sq-search-suggestions__item-icon" aria-hidden="true"><i class="fas fa-layer-group"></i></span>` +
                              `<span class="sq-search-suggestions__item-label">${escapeHtml(
                                  cat.name
                              )}</span>` +
                              `</a></li>`
                      )
                      .join("")
                : `<li class="sq-search-suggestions__empty">${escapeHtml(
                      t("intentHub.suggestNoCategories")
                  )}</li>`;

            servicesList.innerHTML = visibleServices.length
                ? visibleServices
                      .map(
                          (svc) =>
                              `<li><button type="button" class="sq-search-suggestions__item sq-search-suggestions__item--service" data-suggest-type="service" data-suggest-name="${escapeHtml(
                                  svc.name
                              )}">` +
                              `<span class="sq-search-suggestions__item-icon" aria-hidden="true"><i class="fas fa-scissors"></i></span>` +
                              `<span class="sq-search-suggestions__item-label">${escapeHtml(
                                  svc.name
                              )}</span>` +
                              `</button></li>`
                      )
                      .join("")
                : `<li class="sq-search-suggestions__empty">${escapeHtml(
                      t("intentHub.suggestNoServices")
                  )}</li>`;
        }

        function renderSalonList(salons, query) {
            if (!salons.length) {
                salonsList.innerHTML = `<li class="sq-search-suggestions__empty">${escapeHtml(
                    t("intentHub.suggestNoSalons")
                )} « ${escapeHtml(query)} »</li>`;
                return;
            }
            salonsList.innerHTML = salons
                .map((salon) => {
                    const city = salon.city || "";
                    const meta = city
                        ? `<span class="sq-search-suggestions__item-meta">${escapeHtml(
                              city
                          )}</span>`
                        : "";
                    return (
                        `<li><a href="${escapeHtml(
                            salonHref(salon)
                        )}" class="sq-search-suggestions__item sq-search-suggestions__item--salon" data-suggest-type="salon">` +
                        `<span class="sq-search-suggestions__item-icon" aria-hidden="true"><i class="fas fa-store"></i></span>` +
                        `<span class="sq-search-suggestions__item-text">` +
                        `<span class="sq-search-suggestions__item-label">${escapeHtml(
                            salon.name
                        )}</span>` +
                        meta +
                        `</span></a></li>`
                    );
                })
                .join("");
        }

        async function fetchSalons(query) {
            const q = (query || "").trim();
            if (!q) return;
            if (q === lastSalonQuery && salonsList.children.length) return;
            const seq = ++salonFetchSeq;
            salonsList.innerHTML = `<li class="sq-search-suggestions__empty">${escapeHtml(
                t("intentHub.suggestLoading")
            )}</li>`;
            try {
                const params = new URLSearchParams({
                    q,
                    language: getLang(),
                });
                const res = await fetch(
                    "/api/public/search-salons?" + params.toString()
                );
                const data = await res.json();
                if (seq !== salonFetchSeq) return;
                lastSalonQuery = q;
                const salons = (data.status && data.salons) || [];
                renderSalonList(salons.slice(0, 10), q);
            } catch (e) {
                if (seq !== salonFetchSeq) return;
                console.error("search salon suggestions:", e);
                salonsList.innerHTML = `<li class="sq-search-suggestions__empty">${escapeHtml(
                    t("intentHub.suggestNoSalons")
                )}</li>`;
            }
        }

        function scheduleSalonFetch(query) {
            clearTimeout(salonFetchTimer);
            salonFetchTimer = setTimeout(() => fetchSalons(query), 220);
        }

        function renderLists() {
            const query = (queryInput.value || "").trim();
            const hasQuery = query.length > 0;
            setMode(hasQuery);
            panel.hidden = false;

            if (!hasQuery) {
                lastSalonQuery = "";
                clearTimeout(salonFetchTimer);
                renderPopularLists();
                salonsList.innerHTML = "";
                return;
            }

            scheduleSalonFetch(query);
        }

        async function ensureLoaded() {
            if (loaded || loading) return;
            loading = true;
            panel.hidden = false;
            const query = (queryInput.value || "").trim();
            if (!query) {
                setMode(false);
                categoriesList.innerHTML = `<li class="sq-search-suggestions__empty">${escapeHtml(
                    t("intentHub.suggestLoading")
                )}</li>`;
                servicesList.innerHTML = "";
            }

            try {
                const res = await fetch(
                    `/api/public/search-suggestions?language=${encodeURIComponent(
                        getLang()
                    )}`
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
            ignoreNextDocClick = true;
            lockPagePosition();
            ensureLoaded().then(() => {
                panel.hidden = false;
                renderLists();
                restoreScrollPosition();
                window.setTimeout(() => {
                    ignoreNextDocClick = false;
                }, 0);
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
            renderLists();
        });

        panel.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-suggest-type='service']");
            if (!btn) return;
            e.preventDefault();
            queryInput.value = btn.getAttribute("data-suggest-name") || "";
            closePanel();
            queryInput.focus();
            renderLists();
        });

        queryInput.addEventListener("blur", () => {
            window.setTimeout(() => {
                if (sheetOpen) {
                    if (
                        heroWrap &&
                        heroWrap.contains(document.activeElement)
                    ) {
                        return;
                    }
                    if (panel.contains(document.activeElement)) return;
                    return;
                }
                if (!form.contains(document.activeElement)) {
                    closePanelAndUnlock();
                }
            }, 120);
        });

        document.addEventListener("click", (e) => {
            if (ignoreNextDocClick) return;
            if (sheetOpen) {
                if (heroWrap && !heroWrap.contains(e.target)) {
                    closePanelAndUnlock();
                }
                return;
            }
            if (!form.contains(e.target)) closePanelAndUnlock();
        });

        form.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closePanelAndUnlock();
        });

        window.addEventListener("resize", () => {
            if (sheetOpen && !isMobileViewport()) {
                closePanelAndUnlock();
            }
        });
    }

    function initAll() {
        document
            .querySelectorAll("form[data-search-unified]")
            .forEach(initSearchSuggestions);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAll);
    } else {
        initAll();
    }
})();
