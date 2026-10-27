/**
 * Page catégorie publique — recherche AJAX, filtres StyleSeat, carte Leaflet.
 */
(function () {
    const cfg = window.SKEDISY_CATEGORY_PAGE;
    if (!cfg) return;

    const searchInput = document.getElementById("searchInput");
    const salonsGrid = document.getElementById("salonsGrid");
    const expertsRow = document.getElementById("expertsRow");
    const categoryStats = document.getElementById("categoryStats");
    const categorySearchMessage = document.getElementById("categorySearchMessage");
    const categoryMain = document.getElementById("categoryMain");
    const mapEl = document.getElementById("categoryMap");
    const filterBtn = document.getElementById("btnFilter");
    const filterPanel = document.getElementById("filterPanel");
    const serviceChips = document.getElementById("serviceChips");
    const availableTodayEl = document.getElementById("filterAvailableToday");

    let salons = cfg.initialSalons || [];
    let experts = cfg.initialExperts || [];
    let searchTimeout;
    let mapInstance = null;
    let markersLayer = null;
    const mapUi = () => window.skedisySalonMapUi;
    let clientCoords = { lat: null, lng: null };
    let locationActive = Boolean(
        new URLSearchParams(window.location.search).get("location")
    );

    const initF = cfg.initialFilters || {};
    const filters = {
        minRating: Number(initF.minRating) || 0,
        minPrice: Number(initF.minPrice) || 0,
        maxPrice: Number(initF.maxPrice) || 0,
        sort: initF.sort || "best",
        availableToday: Boolean(initF.availableToday),
        serviceId: initF.serviceId || "",
    };

    const IDF_CENTER = [48.8566, 2.3522];
    const { currency, priceFromLabel, noImageLabel } = cfg.render;
    const copy = cfg.copy;

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function getLocationLabel() {
        if (typeof window.skedisyGetLocationLabel === "function") {
            return window.skedisyGetLocationLabel().trim();
        }
        return (
            document.getElementById("homeLocationChipValue")?.textContent?.trim() ||
            localStorage.getItem("skedisy-location-label") ||
            ""
        );
    }

    function sumReviews(list) {
        return list.reduce((acc, s) => acc + (s.reviewCount || 0), 0);
    }

    function formatStats(salonCount, reviewCount) {
        const isFr = cfg.language === "fr";
        const salonWord = isFr
            ? salonCount > 1
                ? "salons"
                : "salon"
            : salonCount === 1
              ? "salon"
              : "salons";
        const reviewWord = isFr
            ? "avis"
            : reviewCount === 1
              ? "review"
              : "reviews";
        return `${salonCount} ${salonWord} · ${reviewCount} ${reviewWord}`;
    }

    function renderSalonCard(salon) {
        const avatar = salon.avatarImage || salon.mainImage || "";
        const realizations =
            salon.realizations && salon.realizations.length
                ? salon.realizations
                : avatar
                  ? [avatar]
                  : salon.mainImage
                    ? [salon.mainImage]
                    : [];
        const salonUrl = salon.shareUrl || "#";
        const multi = realizations.length > 1;
        const fallbackShot = avatar || salon.mainImage || "";

        const shotsHtml = realizations.length
            ? realizations
                  .map(
                      (url, i) =>
                          `<a href="${escapeHtml(salonUrl)}" class="sq-salon-card-v3__shot-link${
                              i === 0 ? " is-active" : ""
                          }" data-shot-index="${i}" tabindex="${i === 0 ? "0" : "-1"}">
              <img src="${escapeHtml(url)}" alt="" class="sq-salon-card-v3__shot" loading="${
                              i === 0 ? "eager" : "lazy"
                          }" onerror="(function(img){var fb=${JSON.stringify(
                              fallbackShot
                          )};if(fb&&img.src!==fb){img.onerror=null;img.src=fb;}else{img.closest('.sq-salon-card-v3__shot-link')?.remove();}})(this)">
            </a>`
                  )
                  .join("")
            : `<div class="salon-card-image-placeholder">${escapeHtml(noImageLabel)}</div>`;

        const carouselNav = multi
            ? `<button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--prev" aria-label="Previous" data-carousel-prev>‹</button>
       <button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--next" aria-label="Next" data-carousel-next>›</button>
       <div class="sq-salon-card-v3__dots" aria-hidden="true">${realizations
           .map(
               (_, i) =>
                   `<span class="sq-salon-card-v3__dot${
                       i === 0 ? " is-active" : ""
                   }" data-dot="${i}"></span>`
           )
           .join("")}</div>`
            : "";

        const avatarHtml = avatar
            ? `<img src="${escapeHtml(avatar)}" alt="" class="sq-salon-card-v3__avatar-img" loading="lazy" onerror="this.parentElement.classList.add('sq-salon-card-v3__avatar--fallback')">`
            : `<span class="sq-salon-card-v3__avatar-fallback" aria-hidden="true">${escapeHtml(
                  (salon.name || "?").charAt(0)
              )}</span>`;

        const ratingHtml =
            salon.review > 0
                ? `<span class="sq-salon-card-v3__rating"><span aria-hidden="true">★</span> ${salon.review.toFixed(1)}${
                      salon.reviewCount ? ` (${salon.reviewCount})` : ""
                  }</span>`
                : "";

        const services = Array.isArray(salon.topServices) ? salon.topServices : [];
        const servicesHtml = services.length
            ? `<ul class="sq-salon-card-v3__services">${services
                  .map((svc) => {
                      const svcUrl = svc.id
                          ? `${salonUrl}?serviceId=${encodeURIComponent(svc.id)}`
                          : salonUrl;
                      const price =
                          svc.price != null
                              ? `<span class="sq-salon-card-v3__svc-price">${escapeHtml(currency)}${svc.price}</span>`
                              : "";
                      const dur = svc.durationLabel
                          ? `<span class="sq-salon-card-v3__svc-dur">${escapeHtml(svc.durationLabel)}</span>`
                          : "";
                      const next = svc.nextAvailable
                          ? `<span class="sq-salon-card-v3__svc-next">${escapeHtml(svc.nextAvailable)}</span>`
                          : salon.nextAvailable
                            ? `<span class="sq-salon-card-v3__svc-next">${escapeHtml(salon.nextAvailable)}</span>`
                            : "";
                      return `<li>
            <a class="sq-salon-card-v3__svc" href="${escapeHtml(svcUrl)}">
              <span class="sq-salon-card-v3__svc-name">${escapeHtml(svc.name)}</span>
              ${dur}
              ${price}
              ${next}
            </a>
          </li>`;
                  })
                  .join("")}</ul>`
            : salon.minPrice != null
              ? `<p class="sq-salon-card-v3__from">${escapeHtml(priceFromLabel)} ${escapeHtml(
                    currency
                )}${salon.minPrice}</p>`
              : "";

        const badgeResponse = copy.badgeResponse || "Réponse rapide";
        const badgeValue = copy.badgeValue || "Rapport Q/P";
        const likeImage =
            (realizations && realizations[0]) || salon.mainImage || salon.avatarImage || "";
        const badgeKeys = Array.isArray(salon.badges) ? salon.badges : [];
        const badgeParts = [];
        if (badgeKeys.includes("response")) {
            badgeParts.push(`<span class="sq-salon-card-v3__badge sq-salon-card-v3__badge--response">
            <span class="sq-salon-card-v3__badge-emoji">⚡</span>
            <span class="sq-salon-card-v3__badge-label">${escapeHtml(badgeResponse)}</span>
          </span>`);
        }
        if (badgeKeys.includes("value")) {
            badgeParts.push(`<span class="sq-salon-card-v3__badge sq-salon-card-v3__badge--value">
            <span class="sq-salon-card-v3__badge-emoji">💎</span>
            <span class="sq-salon-card-v3__badge-label">${escapeHtml(badgeValue)}</span>
          </span>`);
        }
        const mediaBadges = badgeParts.length
            ? `<div class="sq-salon-card-v3__badges" aria-hidden="true">${badgeParts.join("")}</div>`
            : "";

        return `
    <article class="salon-card sq-salon-card-v2 sq-salon-card-v3 sq-salon-card-v3--split" data-salon-id="${escapeHtml(
        salon._id
    )}">
      <div class="sq-salon-card-v3__media${multi ? " sq-salon-card-v3__media--carousel" : ""}${
            realizations.length ? "" : " sq-salon-card-v2__media--fallback"
        }" data-carousel ${
            multi ? `data-carousel-count="${realizations.length}" data-carousel-index="0"` : ""
        }>
        ${shotsHtml}
        ${carouselNav}
        <button type="button" class="sq-salon-like-btn sq-salon-like-btn--on-media" data-like-salon="${escapeHtml(
            String(salon._id)
        )}" data-like-name="${escapeHtml(salon.name || "")}" data-like-url="${escapeHtml(
            salonUrl
        )}" data-like-image="${escapeHtml(likeImage)}" aria-pressed="false" aria-label="${escapeHtml(
            copy.likeSalon || "J'aime"
        )}">
            <i class="far fa-heart" aria-hidden="true"></i>
        </button>
        ${mediaBadges}
      </div>
      <div class="sq-salon-card-v3__body">
        <div class="sq-salon-card-v3__identity">
          <a href="${escapeHtml(salonUrl)}" class="sq-salon-card-v3__avatar">${avatarHtml}</a>
          <div class="sq-salon-card-v3__identity-text">
            <h3 class="salon-card-name sq-salon-card-v3__name">
              <a href="${escapeHtml(salonUrl)}">${escapeHtml(salon.name)}</a>
            </h3>
            ${
                salon.address
                    ? `<p class="salon-card-address sq-salon-card-v3__address">${escapeHtml(
                          salon.address
                      )}</p>`
                    : ""
            }
            ${ratingHtml}
          </div>
        </div>
        ${servicesHtml}
      </div>
    </article>`;
    }

    const PAGE_SIZE = Number(cfg.pageSize) || 10;
    let currentPage = 1;
    const likesKey = "skedisy_liked_salons";
    const likesMetaKey = "skedisy_liked_salons_meta";

    function getLikedSet() {
        try {
            const raw = JSON.parse(localStorage.getItem(likesKey) || "[]");
            return new Set(Array.isArray(raw) ? raw.map(String) : []);
        } catch (_) {
            return new Set();
        }
    }

    function getLikedMeta() {
        try {
            const raw = JSON.parse(localStorage.getItem(likesMetaKey) || "{}");
            return raw && typeof raw === "object" ? raw : {};
        } catch (_) {
            return {};
        }
    }

    function saveLikedSet(set) {
        try {
            localStorage.setItem(likesKey, JSON.stringify([...set]));
        } catch (_) { /* ignore */ }
    }

    function saveLikedMeta(meta) {
        try {
            localStorage.setItem(likesMetaKey, JSON.stringify(meta || {}));
        } catch (_) { /* ignore */ }
    }

    function updateFavHeaderCount() {
        const count = getLikedSet().size;
        const el = document.getElementById("headerFavCount");
        if (!el) return;
        el.textContent = count > 0 ? String(count) : "";
        el.setAttribute("data-count", String(count));
    }

    function renderFavDrawer() {
        const list = document.getElementById("favDrawerList");
        const empty = document.getElementById("favDrawerEmpty");
        if (!list) return;
        const set = getLikedSet();
        const meta = getLikedMeta();
        const ids = [...set];
        list.innerHTML = ids
            .map((id) => {
                const m = meta[id] || {};
                const name = escapeHtml(m.name || "Salon");
                const url = escapeHtml(m.url || `/salon/${id}`);
                const img = m.image
                    ? `<img src="${escapeHtml(m.image)}" alt="" loading="lazy">`
                    : `<img src="" alt="" aria-hidden="true">`;
                return `<li><a class="sq-fav-drawer__item" href="${url}">${img}<span class="sq-fav-drawer__item-name">${name}</span></a></li>`;
            })
            .join("");
        if (empty) empty.hidden = ids.length > 0;
        updateFavHeaderCount();
    }

    function openFavDrawer() {
        const drawer = document.getElementById("favDrawer");
        if (!drawer) return;
        renderFavDrawer();
        drawer.hidden = false;
        drawer.classList.add("is-open");
        document.getElementById("headerFavBtn")?.setAttribute("aria-expanded", "true");
    }

    function closeFavDrawer() {
        const drawer = document.getElementById("favDrawer");
        if (!drawer) return;
        drawer.classList.remove("is-open");
        drawer.hidden = true;
        document.getElementById("headerFavBtn")?.setAttribute("aria-expanded", "false");
    }

    function bindFavDrawer() {
        document.getElementById("headerFavBtn")?.addEventListener("click", openFavDrawer);
        document.querySelectorAll("[data-close-fav]").forEach((el) => {
            el.addEventListener("click", closeFavDrawer);
        });
        updateFavHeaderCount();
    }

    function bindLikes() {
        const liked = getLikedSet();
        salonsGrid?.querySelectorAll("[data-like-salon]").forEach((btn) => {
            const id = String(btn.getAttribute("data-like-salon") || "");
            const on = liked.has(id);
            btn.classList.toggle("is-liked", on);
            btn.setAttribute("aria-pressed", on ? "true" : "false");
            const icon = btn.querySelector("i");
            if (icon) icon.className = on ? "fas fa-heart" : "far fa-heart";
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const set = getLikedSet();
                const meta = getLikedMeta();
                if (set.has(id)) {
                    set.delete(id);
                    delete meta[id];
                } else {
                    set.add(id);
                    meta[id] = {
                        name: btn.getAttribute("data-like-name") || "Salon",
                        url: btn.getAttribute("data-like-url") || "",
                        image: btn.getAttribute("data-like-image") || "",
                    };
                }
                saveLikedSet(set);
                saveLikedMeta(meta);
                const nowOn = set.has(id);
                btn.classList.toggle("is-liked", nowOn);
                btn.setAttribute("aria-pressed", nowOn ? "true" : "false");
                if (icon) icon.className = nowOn ? "fas fa-heart" : "far fa-heart";
                updateFavHeaderCount();
                if (document.getElementById("favDrawer")?.classList.contains("is-open")) {
                    renderFavDrawer();
                }
            });
        });
    }

    function bindCarousels() {
        salonsGrid?.querySelectorAll(".sq-salon-card-v3").forEach((card) => {
            const links = [...card.querySelectorAll(".sq-salon-card-v3__shot-link")];
            const dots = [...card.querySelectorAll(".sq-salon-card-v3__dot")];
            if (links.length < 2) return;
            let idx = 0;
            const show = (i) => {
                idx = (i + links.length) % links.length;
                links.forEach((l, n) => {
                    l.classList.toggle("is-active", n === idx);
                    l.tabIndex = n === idx ? 0 : -1;
                });
                dots.forEach((d, n) => d.classList.toggle("is-active", n === idx));
            };
            card.querySelector("[data-carousel-prev]")?.addEventListener("click", (e) => {
                e.preventDefault();
                show(idx - 1);
            });
            card.querySelector("[data-carousel-next]")?.addEventListener("click", (e) => {
                e.preventDefault();
                show(idx + 1);
            });
        });
    }

    function updateStats() {
        if (categoryStats) {
            categoryStats.textContent = formatStats(salons.length, sumReviews(salons));
        }
    }

    function updateSearchMessage(city) {
        if (!categorySearchMessage) return;
        if (city) {
            categorySearchMessage.innerHTML = `<p class="sq-category-discover__city-msg">${escapeHtml(
                copy.resultsInCityTpl.replace("__CITY__", city)
            )}</p>`;
        } else {
            categorySearchMessage.innerHTML = "";
        }
    }

    function renderPagination() {
        const nav = document.getElementById("categoryPagination");
        if (!nav) return;
        const totalPages = Math.max(1, Math.ceil(salons.length / PAGE_SIZE));
        if (salons.length <= PAGE_SIZE) {
            nav.hidden = true;
            nav.innerHTML = "";
            return;
        }
        nav.hidden = false;
        if (currentPage > totalPages) currentPage = totalPages;
        const label = (copy.pageOf || "Page {n} / {total}")
            .replace("{n}", String(currentPage))
            .replace("{total}", String(totalPages));
        let pagesHtml = "";
        for (let p = 1; p <= totalPages; p++) {
            pagesHtml += `<button type="button" class="sq-page-num${
                p === currentPage ? " is-active" : ""
            }" data-page="${p}">${p}</button>`;
        }
        nav.innerHTML = `
          <button type="button" class="sq-page-btn" data-page-prev ${
              currentPage <= 1 ? "disabled" : ""
          }>${escapeHtml(copy.pagePrev || "Précédent")}</button>
          <div class="sq-page-nums">${pagesHtml}</div>
          <span class="sq-page-label">${escapeHtml(label)}</span>
          <button type="button" class="sq-page-btn" data-page-next ${
              currentPage >= totalPages ? "disabled" : ""
          }>${escapeHtml(copy.pageNext || "Suivant")}</button>`;
        nav.querySelector("[data-page-prev]")?.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderSalons();
                salonsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
        nav.querySelector("[data-page-next]")?.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage += 1;
                renderSalons();
                salonsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
        nav.querySelectorAll("[data-page]").forEach((btn) => {
            btn.addEventListener("click", () => {
                currentPage = Number(btn.getAttribute("data-page")) || 1;
                renderSalons();
                salonsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    function renderSalons() {
        if (!salonsGrid) return;
        if (!salons.length) {
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(copy.noSalonsSearch)}</p></div>`;
            const nav = document.getElementById("categoryPagination");
            if (nav) {
                nav.hidden = true;
                nav.innerHTML = "";
            }
            return;
        }
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = salons.slice(start, start + PAGE_SIZE);
        salonsGrid.innerHTML = pageItems.map(renderSalonCard).join("");
        bindCarousels();
        bindLikes();
        renderPagination();
    }

    function renderExperts() {
        if (!expertsRow) return;
        if (!experts.length) {
            expertsRow.innerHTML = `<p class="sq-category-discover__empty">${escapeHtml(
                copy.noExpertsCategory
            )}</p>`;
            return;
        }
        expertsRow.innerHTML = experts
            .map((ex) => {
                const name =
                    ex.name ||
                    [ex.fname, ex.lname].filter(Boolean).join(" ") ||
                    "Expert";
                const salonName = ex.salonName || "";
                const img = ex.image
                    ? `<img src="${escapeHtml(ex.image)}" alt="" loading="lazy">`
                    : `<span class="sq-expert-card__fallback">${escapeHtml(name.charAt(0))}</span>`;
                const at = salonName
                    ? `<p class="sq-expert-card__salon">${escapeHtml(
                          (copy.expertAtSalonTpl || "Chez __SALON__").replace("__SALON__", salonName)
                      )}</p>`
                    : "";
                const href = ex.shareUrl || ex.salonShareUrl || "#";
                return `<a class="sq-expert-card" href="${escapeHtml(href)}">
          <div class="sq-expert-card__photo">${img}</div>
          <div class="sq-expert-card__info"><strong>${escapeHtml(name)}</strong>${at}</div>
        </a>`;
            })
            .join("");
    }

    function refreshMapMarkers() {
        if (!mapInstance || !markersLayer) return;
        markersLayer.clearLayers();
        const bounds = [];
        salons.forEach((salon) => {
            if (salon.latitude == null || salon.longitude == null) return;
            const marker = L.marker([salon.latitude, salon.longitude]);
            const popupHtml = mapUi()
                ? mapUi().renderSalonMapPopup(
                      salon,
                      cfg.language === "fr" ? "Voir le salon" : "View salon"
                  )
                : `<strong>${escapeHtml(salon.name)}</strong>`;
            marker.bindPopup(popupHtml, { maxWidth: 300, className: "sq-leaflet-popup" });
            markersLayer.addLayer(marker);
            bounds.push([salon.latitude, salon.longitude]);
        });
        if (bounds.length) {
            mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        } else {
            mapInstance.setView(IDF_CENTER, 11);
        }
    }

    function initMap() {
        if (!mapEl || typeof L === "undefined" || mapInstance) return;
        mapInstance = L.map(mapEl, { scrollWheelZoom: false }).setView(IDF_CENTER, 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
            maxZoom: 18,
        }).addTo(mapInstance);
        markersLayer = L.layerGroup().addTo(mapInstance);
        refreshMapMarkers();
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }

    function setMapVisible(visible) {
        const panel = document.getElementById("categoryMapPanel");
        const btn = document.getElementById("btnToggleMap");
        const label = document.getElementById("btnToggleMapLabel");
        const main = document.getElementById("categoryMain");
        if (panel) {
            if (visible) panel.removeAttribute("hidden");
            else panel.setAttribute("hidden", "");
        }
        if (mapEl) mapEl.setAttribute("aria-hidden", visible ? "false" : "true");
        if (btn) btn.setAttribute("aria-expanded", visible ? "true" : "false");
        if (label) {
            label.textContent = visible
                ? copy.hideMap || "Masquer la carte"
                : copy.showMap || "Voir la carte";
        }
        if (main) {
            main.classList.toggle("sq-category-discover__main--split", visible);
            main.classList.toggle("sq-category-discover__main--list", !visible);
        }
        const discover = document.querySelector(".sq-category-discover");
        if (discover) discover.classList.toggle("sq-category-discover--map", visible);
        if (salonsGrid) {
            salonsGrid.classList.toggle("sq-salons-grid--map-one", visible);
        }
        if (visible) {
            initMap();
            setTimeout(() => mapInstance && mapInstance.invalidateSize(), 80);
            refreshMapMarkers();
        }
    }

    document.getElementById("btnToggleMap")?.addEventListener("click", () => {
        const panel = document.getElementById("categoryMapPanel");
        const open = panel?.hasAttribute("hidden");
        setMapVisible(Boolean(open));
    });

    function requestLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve();
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clientCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    resolve();
                },
                () => resolve(),
                { enableHighAccuracy: false, timeout: 8000 }
            );
        });
    }

    async function fetchResults(searchTerm) {
        const term =
            searchTerm !== undefined ? searchTerm : (searchInput?.value || "").trim();
        const location = getLocationLabel();

        const params = new URLSearchParams({
            categoryId: cfg.categoryId,
            language: cfg.language,
            limit: "50",
            sort: filters.sort || "best",
        });
        if (term) params.set("search", term);
        if (locationActive && location) params.set("location", location);
        if (clientCoords.lat != null) params.set("latitude", String(clientCoords.lat));
        if (clientCoords.lng != null) params.set("longitude", String(clientCoords.lng));
        if (filters.minRating) params.set("minRating", String(filters.minRating));
        if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
        if (filters.availableToday) params.set("availableToday", "1");
        if (filters.serviceId) params.set("serviceId", filters.serviceId);

        if (salonsGrid) {
            salonsGrid.innerHTML = `<p class="sq-home-discovery-loading">${escapeHtml(
                copy.salonsLoading || "…"
            )}</p>`;
        }

        try {
            const [salonsRes, expertsRes] = await Promise.all([
                fetch(`/api/public/salons-by-category?${params}`),
                fetch(`/api/public/experts-by-category?${params}`),
            ]);

            const salonsData = await salonsRes.json();
            const expertsData = await expertsRes.json();

            if (salonsData.status && salonsData.salons) {
                salons = salonsData.salons;
                currentPage = 1;
                updateStats();
                updateSearchMessage(salonsData.searchCity || null);
                renderSalons();
                refreshMapMarkers();
            } else {
                salons = [];
                currentPage = 1;
                renderSalons();
                updateStats();
            }

            if (expertsData.status && expertsData.experts) {
                experts = expertsData.experts;
                renderExperts();
            }
        } catch (e) {
            salons = [];
            renderSalons();
        }

        const url = new URL(window.location.href);
        if (term) url.searchParams.set("search", term);
        else url.searchParams.delete("search");
        if (locationActive && location) url.searchParams.set("location", location);
        else url.searchParams.delete("location");
        if (filters.minRating) url.searchParams.set("minRating", String(filters.minRating));
        else url.searchParams.delete("minRating");
        if (filters.minPrice) url.searchParams.set("minPrice", String(filters.minPrice));
        else url.searchParams.delete("minPrice");
        if (filters.maxPrice) url.searchParams.set("maxPrice", String(filters.maxPrice));
        else url.searchParams.delete("maxPrice");
        if (filters.sort && filters.sort !== "best") url.searchParams.set("sort", filters.sort);
        else url.searchParams.delete("sort");
        if (filters.availableToday) url.searchParams.set("availableToday", "1");
        else url.searchParams.delete("availableToday");
        if (filters.serviceId) url.searchParams.set("serviceId", filters.serviceId);
        else url.searchParams.delete("serviceId");
        window.history.replaceState({}, "", url);
    }

    document.getElementById("categorySearchForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        clearTimeout(searchTimeout);
        fetchResults(searchInput?.value.trim() || "");
    });

    if (searchInput) {
        let savedScrollY = 0;
        const lockSearchFocus = () => {
            if (document.body.classList.contains("sq-search-focus-active")) return;
            savedScrollY = window.scrollY || window.pageYOffset || 0;
            document.body.classList.add("sq-search-focus-active");
            document.body.style.top = `-${savedScrollY}px`;
            searchInput.scrollIntoView({ block: "nearest", behavior: "smooth" });
        };
        const unlockSearchFocus = () => {
            if (!document.body.classList.contains("sq-search-focus-active")) return;
            document.body.classList.remove("sq-search-focus-active");
            document.body.style.top = "";
            window.scrollTo(0, savedScrollY);
        };
        searchInput.addEventListener("focus", lockSearchFocus);
        searchInput.addEventListener("blur", () => {
            window.setTimeout(unlockSearchFocus, 150);
        });
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            const term = this.value.trim();
            searchTimeout = setTimeout(() => {
                if (term.length >= 2 || term.length === 0) {
                    fetchResults(term);
                }
            }, 450);
        });
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(searchTimeout);
                unlockSearchFocus();
                fetchResults(searchInput.value.trim());
            }
        });
    }

    document.getElementById("categoryDetailBack")?.addEventListener("click", (e) => {
        try {
            const ref = document.referrer || "";
            if (ref && ref.indexOf(location.host) !== -1 && window.history.length > 1) {
                e.preventDefault();
                window.history.back();
            }
        } catch (_) { /* fall through to href */ }
    });

    bindFavDrawer();

    filterBtn?.addEventListener("click", () => {
        if (!filterPanel) return;
        filterPanel.hidden = !filterPanel.hidden;
        filterBtn.setAttribute("aria-expanded", filterPanel.hidden ? "false" : "true");
    });

    filterPanel?.querySelectorAll("[data-filter]").forEach((el) => {
        el.addEventListener("click", () => {
            const key = el.dataset.filter;
            if (key === "minRating") {
                filters.minRating = parseFloat(el.dataset.value) || 0;
                filterPanel
                    .querySelectorAll('[data-filter="minRating"]')
                    .forEach((b) => b.classList.remove("sq-filter-chip--active"));
                el.classList.add("sq-filter-chip--active");
            } else if (key === "sort") {
                filters.sort = el.dataset.value || "best";
                filterPanel
                    .querySelectorAll('[data-filter="sort"]')
                    .forEach((b) => b.classList.remove("sq-filter-chip--active"));
                el.classList.add("sq-filter-chip--active");
            } else if (key === "price") {
                filters.minPrice = parseFloat(el.dataset.min) || 0;
                filters.maxPrice = parseFloat(el.dataset.max) || 0;
                filterPanel
                    .querySelectorAll('[data-filter="price"]')
                    .forEach((b) => b.classList.remove("sq-filter-chip--active"));
                el.classList.add("sq-filter-chip--active");
            }
            fetchResults();
        });
    });

    availableTodayEl?.addEventListener("change", () => {
        filters.availableToday = Boolean(availableTodayEl.checked);
        fetchResults();
    });

    serviceChips?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-service-id]");
        if (!btn) return;
        filters.serviceId = btn.getAttribute("data-service-id") || "";
        serviceChips
            .querySelectorAll(".sq-service-chip")
            .forEach((b) => b.classList.remove("sq-service-chip--active"));
        btn.classList.add("sq-service-chip--active");
        fetchResults();
    });

    document.getElementById("homeLocationApply")?.addEventListener("click", () => {
        setTimeout(() => fetchResults(), 50);
    });

    updateStats();
    updateSearchMessage(cfg.initialSearchCity);
    renderSalons();
    renderExperts();
    setMapVisible(false);
    requestLocation().then(() => {
        if (clientCoords.lat != null) fetchResults();
    });
})();
