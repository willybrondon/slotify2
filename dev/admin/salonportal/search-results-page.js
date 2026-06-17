/**
 * Page /recherche — salons (liste + carte + filtres), style catégorie.
 */
(function () {
    const params = new URLSearchParams(window.location.search);
    const lang = localStorage.getItem("skedisy-language") || "fr";

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
    const categoryMain = document.getElementById("categoryMain");
    const btnListView = document.getElementById("btnListView");
    const btnMapView = document.getElementById("btnMapView");
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
    let mapInstance = null;
    let markersLayer = null;
    let clientCoords = { lat: 48.8566, lng: 2.3522 };
    const IDF_CENTER = [48.8566, 2.3522];
    const currency = "€";
    const priceFromLabel = lang === "fr" ? "À partir de" : "From";
    const noImageLabel = lang === "fr" ? "Pas d'image" : "No image";

    let filters = { minRating: 0, sort: "distance" };

    function sumReviews(list) {
        return list.reduce((acc, s) => acc + (s.reviewCount || 0), 0);
    }

    function formatStats(salonCount, reviewCount) {
        const isFr = lang === "fr";
        const salonWord = isFr
            ? salonCount > 1 ? "salons" : "salon"
            : salonCount === 1 ? "salon" : "salons";
        const reviewWord = isFr ? "avis" : reviewCount === 1 ? "review" : "reviews";
        return `${salonCount} ${salonWord} · ${reviewCount} ${reviewWord}`;
    }

    function renderSalonCard(salon) {
        const imageHtml = salon.mainImage
            ? `<div class="sq-salon-card-v2__media"><img src="${escapeHtml(salon.mainImage)}" alt="${escapeHtml(salon.name)}" class="salon-card-image" loading="lazy" onerror="this.closest('.sq-salon-card-v2__media')?.classList.add('sq-salon-card-v2__media--fallback')"></div>`
            : `<div class="sq-salon-card-v2__media sq-salon-card-v2__media--fallback"><div class="salon-card-image-placeholder">${escapeHtml(noImageLabel)}</div></div>`;
        const pricePart =
            salon.minPrice != null
                ? `<span class="salon-card-price">${escapeHtml(priceFromLabel)} ${escapeHtml(currency)}${salon.minPrice}</span>`
                : "";
        const ratingPart =
            salon.review > 0
                ? `<span class="salon-card-rating"><span class="rating-stars" aria-hidden="true">★</span> ${salon.review.toFixed(1)} (${salon.reviewCount})</span>`
                : "";
        const metaRow = pricePart || ratingPart ? `<div class="salon-card-meta">${pricePart}${ratingPart}</div>` : "";
        const addressHtml = salon.address ? `<p class="salon-card-address">${escapeHtml(salon.address)}</p>` : "";
        const distHtml =
            salon.distance != null
                ? `<p class="salon-card-distance">${salon.distance.toFixed(1)} km</p>`
                : "";

        return `
      <a href="${escapeHtml(salon.shareUrl)}" class="salon-card sq-salon-card-v2" data-salon-id="${escapeHtml(salon._id)}">
        ${imageHtml}
        <div class="salon-card-content">
          <h3 class="salon-card-name">${escapeHtml(salon.name)}</h3>
          ${metaRow}
          ${addressHtml}
          ${distHtml}
        </div>
      </a>`;
    }

    function updateStats() {
        if (categoryStats) {
            categoryStats.textContent = formatStats(salons.length, sumReviews(salons));
        }
    }

    function renderSalons() {
        if (!salonsGrid) return;
        if (!salons.length) {
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(t("searchResults.noSalons"))}</p></div>`;
            return;
        }
        salonsGrid.innerHTML = salons.map(renderSalonCard).join("");
    }

    function refreshMapMarkers() {
        if (!mapInstance || !markersLayer) return;
        markersLayer.clearLayers();
        const bounds = [];
        salons.forEach((salon) => {
            if (salon.latitude == null || salon.longitude == null) return;
            const marker = L.marker([salon.latitude, salon.longitude]);
            marker.bindPopup(`<strong>${escapeHtml(salon.name)}</strong><br><a href="${escapeHtml(salon.shareUrl)}">${escapeHtml(t("homeProduct.viewSalon"))}</a>`);
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
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18,
        }).addTo(mapInstance);
        markersLayer = L.layerGroup().addTo(mapInstance);
        refreshMapMarkers();
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }

    function setViewMode(mode) {
        if (!categoryMain) return;
        const isMap = mode === "map";
        categoryMain.classList.toggle("sq-category-discover__main--map", isMap);
        categoryMain.classList.toggle("sq-category-discover__main--list", !isMap);
        if (mapEl) mapEl.setAttribute("aria-hidden", isMap ? "false" : "true");
        btnListView?.classList.toggle("sq-view-btn--active", !isMap);
        btnMapView?.classList.toggle("sq-view-btn--active", isMap);
        if (isMap) {
            initMap();
            refreshMapMarkers();
            setTimeout(() => mapInstance?.invalidateSize(), 300);
        }
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

        salonsGrid.innerHTML = `<p class="sq-home-discovery-loading">${escapeHtml(t("homeProduct.salonsLoading"))}</p>`;

        try {
            const res = await fetch(`/api/public/search-salons?${qs}`);
            const data = await res.json();
            if (data.status && data.salons) {
                salons = data.salons;
                updateStats();
                if (categorySearchMessage && data.searchCity) {
                    categorySearchMessage.innerHTML = `<p class="sq-category-discover__city-msg">${escapeHtml(t("searchResults.inCityTpl").replace("__CITY__", data.searchCity))}</p>`;
                } else if (categorySearchMessage) {
                    categorySearchMessage.innerHTML = "";
                }
                renderSalons();
                refreshMapMarkers();
            } else {
                salons = [];
                renderSalons();
                updateStats();
            }
        } catch (e) {
            salons = [];
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(t("searchResults.error"))}</p></div>`;
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
            if (key === "sort") filters.sort = val || "distance";
            filterPanel.querySelectorAll(`[data-filter="${key}"]`).forEach((b) => b.classList.remove("sq-filter-chip--active"));
            el.classList.add("sq-filter-chip--active");
            fetchResults();
        });
    });

    btnListView?.addEventListener("click", () => setViewMode("list"));
    btnMapView?.addEventListener("click", () => setViewMode("map"));

    document.addEventListener("DOMContentLoaded", () => {
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
        if (params.get("view") === "map") setViewMode("map");
        requestLocation().then(fetchResults);
    });
})();
