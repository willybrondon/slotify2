/**
 * Page /recherche — salons (liste + carte + filtres + pagination + favoris).
 */
(function () {
    const params = new URLSearchParams(window.location.search);
    const lang = localStorage.getItem("skedisy-language") || "fr";
    const PAGE_SIZE = 10;

    function t(key) {
        if (typeof getTranslation === "function") return getTranslation(key);
        return key;
    }

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    const salonsGrid = document.getElementById("salonsGrid");
    const categoryStats = document.getElementById("categoryStats");
    const categorySearchMessage = document.getElementById("categorySearchMessage");
    const mapEl = document.getElementById("categoryMap");
    const filterBtn = document.getElementById("btnFilter");
    const filterPanel = document.getElementById("filterPanel");
    const queryInput = document.getElementById("searchQueryInput");
    const searchForm = document.getElementById("searchResultsForm");

    function getLocationLabel() {
        if (typeof window.skedisyGetLocationLabel === "function") {
            return window.skedisyGetLocationLabel().trim();
        }
        return params.get("location") || localStorage.getItem("skedisy-location-label") || "";
    }

    let salons = [];
    let currentPage = 1;
    let mapInstance = null;
    let markersLayer = null;
    let clientCoords = { lat: 48.8566, lng: 2.3522 };
    const IDF_CENTER = [48.8566, 2.3522];
    const currency = "€";
    const priceFromLabel = lang === "fr" ? "À partir de" : "From";
    const noImageLabel = lang === "fr" ? "Pas d'image" : "No image";
    const likeLabel = lang === "fr" ? "J'aime" : "Like";
    const pagePrev = lang === "fr" ? "Précédent" : "Previous";
    const pageNext = lang === "fr" ? "Suivant" : "Next";
    const pageOfTpl = lang === "fr" ? "Page {n} / {total}" : "Page {n} / {total}";

    let filters = { minRating: 0, sort: "best", minPrice: 0, maxPrice: 0 };
    const mapUi = () => window.skedisySalonMapUi;

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

    function sumReviews(list) {
        return list.reduce((acc, s) => acc + (s.reviewCount || 0), 0);
    }

    function formatStats(salonCount, reviewCount) {
        const isFr = lang === "fr";
        const salonWord = isFr
            ? salonCount > 1
                ? "salons"
                : "salon"
            : salonCount === 1
              ? "salon"
              : "salons";
        const reviewWord = isFr ? "avis" : reviewCount === 1 ? "review" : "reviews";
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
        const likeImage =
            (realizations && realizations[0]) || salon.mainImage || avatar || "";

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
                          ? `${salonUrl}?serviceId=${encodeURIComponent(svc.id)}&book=1`
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
            likeLabel
        )}">
            <i class="far fa-heart" aria-hidden="true"></i>
        </button>
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
        const label = pageOfTpl
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
          }>${escapeHtml(pagePrev)}</button>
          <div class="sq-page-nums">${pagesHtml}</div>
          <span class="sq-page-label">${escapeHtml(label)}</span>
          <button type="button" class="sq-page-btn" data-page-next ${
              currentPage >= totalPages ? "disabled" : ""
          }>${escapeHtml(pageNext)}</button>`;
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
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(t("searchResults.noSalons"))}</p></div>`;
            renderPagination();
            return;
        }
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = salons.slice(start, start + PAGE_SIZE);
        salonsGrid.innerHTML = pageItems.map(renderSalonCard).join("");
        bindCarousels();
        bindLikes();
        renderPagination();
    }

    function refreshMapMarkers() {
        if (!mapInstance || !markersLayer) return;
        markersLayer.clearLayers();
        const bounds = [];
        salons.forEach((salon) => {
            if (salon.latitude == null || salon.longitude == null) return;
            const marker = L.marker([salon.latitude, salon.longitude]);
            const popupHtml = mapUi()
                ? mapUi().renderSalonMapPopup(salon, t("homeProduct.viewSalon"))
                : `<strong>${escapeHtml(salon.name)}</strong>`;
            marker.bindPopup(popupHtml, { maxWidth: 300, className: "sq-leaflet-popup" });
            marker.on("click", () => {
                const card = document.querySelector(`[data-salon-id="${salon._id}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    card.classList.add("sq-salon-card-v2--highlight");
                    setTimeout(() => card.classList.remove("sq-salon-card-v2--highlight"), 2000);
                }
            });
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

    async function fetchResults() {
        const legacySalon = params.get("salon") || "";
        const legacyService = params.get("service") || "";
        const query =
            queryInput?.value.trim() ||
            params.get("q") ||
            [legacySalon, legacyService].filter(Boolean).join(" ").trim();
        const location = getLocationLabel() || params.get("location") || "";

        if (queryInput) queryInput.value = query;

        const qs = new URLSearchParams({ language: lang });
        if (query) qs.set("q", query);
        if (location) qs.set("location", location);
        if (clientCoords.lat) qs.set("latitude", String(clientCoords.lat));
        if (clientCoords.lng) qs.set("longitude", String(clientCoords.lng));
        if (filters.minRating) qs.set("minRating", String(filters.minRating));
        if (filters.sort) qs.set("sort", filters.sort);
        if (filters.minPrice) qs.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice) qs.set("maxPrice", String(filters.maxPrice));

        salonsGrid.innerHTML = `<p class="sq-home-discovery-loading">${escapeHtml(t("homeProduct.salonsLoading"))}</p>`;

        try {
            const res = await fetch(`/api/public/search-salons?${qs}`);
            const data = await res.json();
            if (data.status && data.salons) {
                salons = data.salons;
                currentPage = 1;
                updateStats();
                if (categorySearchMessage && data.searchCity) {
                    categorySearchMessage.innerHTML = `<p class="sq-category-discover__city-msg">${escapeHtml(
                        t("searchResults.inCityTpl").replace("__CITY__", data.searchCity)
                    )}</p>`;
                } else if (categorySearchMessage) {
                    categorySearchMessage.innerHTML = "";
                }
                renderSalons();
                refreshMapMarkers();
            } else {
                salons = [];
                currentPage = 1;
                renderSalons();
                updateStats();
            }
        } catch (e) {
            salons = [];
            currentPage = 1;
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(t("searchResults.error"))}</p></div>`;
            renderPagination();
        }

        const url = new URL(window.location.href);
        if (query) url.searchParams.set("q", query);
        else url.searchParams.delete("q");
        url.searchParams.delete("salon");
        url.searchParams.delete("service");
        if (location) url.searchParams.set("location", location);
        else url.searchParams.delete("location");
        window.history.replaceState({}, "", url);
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            fetchResults();
        });
    }

    filterBtn?.addEventListener("click", () => {
        if (filterPanel) filterPanel.hidden = !filterPanel.hidden;
    });

    filterPanel?.querySelectorAll("[data-filter]").forEach((el) => {
        el.addEventListener("click", () => {
            const key = el.dataset.filter;
            const val = el.dataset.value;
            if (key === "minRating") filters.minRating = parseFloat(val) || 0;
            if (key === "sort") filters.sort = val || "best";
            if (key === "price") {
                filters.minPrice = parseFloat(el.dataset.min) || 0;
                filters.maxPrice = parseFloat(el.dataset.max) || 0;
            }
            filterPanel
                .querySelectorAll(`[data-filter="${key}"]`)
                .forEach((b) => b.classList.remove("sq-filter-chip--active"));
            el.classList.add("sq-filter-chip--active");
            fetchResults();
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
        bindFavDrawer();
        const legacySalon = params.get("salon") || "";
        const legacyService = params.get("service") || "";
        if (queryInput) {
            queryInput.value =
                params.get("q") ||
                [legacySalon, legacyService].filter(Boolean).join(" ").trim();
        }
        const urlLocation = params.get("location");
        if (urlLocation && typeof window.skedisySetLocationLabel === "function") {
            window.skedisySetLocationLabel(urlLocation);
        }
        initMap();
        if (mapEl) mapEl.setAttribute("aria-hidden", "false");
        requestLocation().then(fetchResults);
    });
})();
