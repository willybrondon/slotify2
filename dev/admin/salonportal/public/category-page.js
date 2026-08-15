/**
 * Page catégorie publique — recherche AJAX, carte Leaflet, bascule liste/carte.
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
    const btnListView = document.getElementById("btnListView");
    const btnMapView = document.getElementById("btnMapView");
    const mapEl = document.getElementById("categoryMap");

    let salons = cfg.initialSalons || [];
    let experts = cfg.initialExperts || [];
    let searchTimeout;
    let mapInstance = null;
    let markersLayer = null;
    const mapUi = () => window.skedisySalonMapUi;

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
        const imageHtml = salon.mainImage
            ? `<div class="sq-salon-card-v2__media"><img src="${escapeHtml(salon.mainImage)}" alt="${escapeHtml(salon.name)}" class="salon-card-image" loading="lazy" onerror="this.closest('.sq-salon-card-v2__media')?.classList.add('sq-salon-card-v2__media--fallback')"></div>`
            : `<div class="sq-salon-card-v2__media sq-salon-card-v2__media--fallback"><div class="salon-card-image-placeholder">${escapeHtml(noImageLabel)}</div></div>`;

        const pricePart =
            salon.minPrice !== null && salon.minPrice !== undefined
                ? `<span class="salon-card-price">${escapeHtml(priceFromLabel)} ${escapeHtml(currency)}${salon.minPrice}</span>`
                : "";
        const ratingPart =
            salon.review > 0
                ? `<span class="salon-card-rating"><span class="rating-stars" aria-hidden="true">★</span> ${salon.review.toFixed(1)} (${salon.reviewCount})</span>`
                : "";
        const metaRow =
            pricePart || ratingPart
                ? `<div class="salon-card-meta">${pricePart}${ratingPart}</div>`
                : "";
        const addressHtml = salon.address
            ? `<p class="salon-card-address">${escapeHtml(salon.address)}</p>`
            : "";

        return `
      <a href="${escapeHtml(salon.shareUrl)}" class="salon-card sq-salon-card-v2" data-salon-id="${escapeHtml(salon._id)}">
        ${imageHtml}
        <div class="salon-card-content">
          <h3 class="salon-card-name">${escapeHtml(salon.name)}</h3>
          ${metaRow}
          ${addressHtml}
        </div>
      </a>`;
    }

    function renderExpertCard(expert) {
        const imageHtml = expert.image
            ? `<img src="${escapeHtml(expert.image)}" alt="${escapeHtml(expert.name)}" class="sq-expert-card__img" loading="lazy">`
            : `<div class="sq-expert-card__placeholder">${escapeHtml((expert.name || "?").charAt(0))}</div>`;
        const ratingHtml =
            expert.review > 0
                ? `<span class="sq-expert-card__rating">★ ${expert.review.toFixed(1)} (${expert.reviewCount})</span>`
                : "";
        const salonLine = expert.salonName
            ? `<span class="sq-expert-card__salon">${escapeHtml(copy.expertAtSalonTpl.replace("__SALON__", expert.salonName))}</span>`
            : "";

        return `
      <a href="${escapeHtml(expert.shareUrl)}" class="sq-expert-card">
        <div class="sq-expert-card__avatar">${imageHtml}</div>
        <div class="sq-expert-card__body">
          <span class="sq-expert-card__name">${escapeHtml(expert.name)}</span>
          ${ratingHtml}
          ${salonLine}
        </div>
      </a>`;
    }

    function updateSearchMessage(city) {
        if (!categorySearchMessage) return;
        if (city) {
            categorySearchMessage.innerHTML = `<p class="sq-category-discover__city-msg">${escapeHtml(copy.resultsInCityTpl.replace("__CITY__", city))}</p>`;
        } else {
            categorySearchMessage.innerHTML = "";
        }
    }

    function updateStats() {
        if (categoryStats) {
            categoryStats.textContent = formatStats(salons.length, sumReviews(salons));
        }
    }

    function renderSalons() {
        if (!salonsGrid) return;
        if (!salons.length) {
            salonsGrid.innerHTML = `<div class="no-results"><p>${escapeHtml(copy.noSalonsSearch)}</p></div>`;
            return;
        }
        salonsGrid.innerHTML = salons.map(renderSalonCard).join("");
    }

    function renderExperts() {
        if (!expertsRow) return;
        if (!experts.length) {
            expertsRow.innerHTML = `<p class="sq-category-discover__empty">${escapeHtml(copy.noExpertsCategory)}</p>`;
            return;
        }
        expertsRow.innerHTML = experts.map(renderExpertCard).join("");
    }

    function refreshMapMarkers() {
        if (!mapInstance || !markersLayer) return;
        markersLayer.clearLayers();
        const bounds = [];
        salons.forEach((salon) => {
            if (salon.latitude == null || salon.longitude == null) return;
            const marker = L.marker([salon.latitude, salon.longitude]);
            const popupHtml = mapUi()
                ? mapUi().renderSalonMapPopup(salon, "Voir le salon")
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
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

    function inferCity(searchTerm, salonList) {
        const term = (searchTerm || "").trim();
        if (!term || !salonList.length) return null;
        const lower = term.toLowerCase();
        const cities = [...new Set(salonList.map((s) => (s.city || "").trim()).filter(Boolean))];
        const cityMatch = cities.find((c) => c.toLowerCase().includes(lower));
        if (cityMatch) return cityMatch;
        if (cities.length === 1) return cities[0];
        if (cities.length > 1) {
            const uniqueLower = new Set(cities.map((c) => c.toLowerCase()));
            if (uniqueLower.size === 1) return cities[0];
        }
        return salonList[0]?.city?.trim() || null;
    }

    async function fetchResults(searchTerm) {
        const params = new URLSearchParams({
            categoryId: cfg.categoryId,
            language: cfg.language,
            limit: "50",
        });
        if (searchTerm) params.set("search", searchTerm);

        const [salonsRes, expertsRes] = await Promise.all([
            fetch(`/api/public/salons-by-category?${params}`),
            fetch(`/api/public/experts-by-category?${params}`),
        ]);

        const salonsData = await salonsRes.json();
        const expertsData = await expertsRes.json();

        if (salonsData.status && salonsData.salons) {
            salons = salonsData.salons;
            updateStats();
            updateSearchMessage(salonsData.searchCity || inferCity(searchTerm, salons));
            renderSalons();
            refreshMapMarkers();
        }

        if (expertsData.status && expertsData.experts) {
            experts = expertsData.experts;
            renderExperts();
        }

        const url = new URL(window.location.href);
        if (searchTerm) url.searchParams.set("search", searchTerm);
        else url.searchParams.delete("search");
        window.history.replaceState({}, "", url);
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            const term = this.value.trim();
            searchTimeout = setTimeout(() => {
                if (term.length >= 2 || term.length === 0) {
                    fetchResults(term);
                }
            }, 450);
        });
    }

    btnListView?.addEventListener("click", () => setViewMode("list"));
    btnMapView?.addEventListener("click", () => setViewMode("map"));

    updateStats();
    updateSearchMessage(cfg.initialSearchCity);
    renderSalons();
    renderExperts();
})();
