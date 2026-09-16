/**
 * Accueil web — recherche barre → cards StyleSeat horizontales + carte.
 */
(function () {
    const API_KEY = "r8Cs1WcSI9";
    const API_BASE = window.location.origin.replace(/\/+$/, "") + "/";
    const IDF_DEFAULT = { lat: 48.8566, lng: 2.3522 };
    let clientCoords = { ...IDF_DEFAULT, fromGps: false };

    function t(key) {
        if (typeof getTranslation === "function") return getTranslation(key);
        return key;
    }

    function getLang() {
        return localStorage.getItem("skedisy-language") || "fr";
    }

    function escapeHtml(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function slugify(name) {
        return (name || "salon")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function buildSalonUrl(salon) {
        if (salon.shareUrl) return salon.shareUrl;
        const id = salon._id || salon.id;
        if (!id) return "#";
        const shortId = salon.shortId || String(id).substring(0, 6);
        const slug = salon.slug || slugify(salon.name);
        return API_BASE.replace(/\/+$/, "") + "/salon/" + slug + "-" + shortId;
    }

    function currencySymbol() {
        return "€";
    }

    function requestLocation() {
        return new Promise(function (resolve) {
            if (!navigator.geolocation) {
                resolve();
                return;
            }
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    clientCoords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        fromGps: true,
                    };
                    resolve();
                },
                function () {
                    resolve();
                },
                { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            );
        });
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

    /** Card StyleSeat horizontale (réalisations | identité + prestations). */
    function renderSalonCardHorizontal(salon) {
        const avatar = salon.avatarImage || salon.mainImage || "";
        const realizations =
            salon.realizations && salon.realizations.length
                ? salon.realizations
                : avatar
                  ? [avatar]
                  : salon.mainImage
                    ? [salon.mainImage]
                    : [];
        const salonUrl = buildSalonUrl(salon);
        const multi = realizations.length > 1;
        const fallbackShot = avatar || salon.mainImage || "";
        const currency = currencySymbol();
        const priceFromLabel = getLang() === "fr" ? "À partir de" : "From";
        const noImageLabel = getLang() === "fr" ? "Pas d'image" : "No image";

        const shotsHtml = realizations.length
            ? realizations
                  .map(function (url, i) {
                      return (
                          '<a href="' +
                          escapeHtml(salonUrl) +
                          '" class="sq-salon-card-v3__shot-link' +
                          (i === 0 ? " is-active" : "") +
                          '" data-shot-index="' +
                          i +
                          '" tabindex="' +
                          (i === 0 ? "0" : "-1") +
                          '">' +
                          '<img src="' +
                          escapeHtml(url) +
                          '" alt="" class="sq-salon-card-v3__shot" loading="' +
                          (i === 0 ? "eager" : "lazy") +
                          '" onerror="(function(img){var fb=' +
                          JSON.stringify(fallbackShot) +
                          ";if(fb&&img.src!==fb){img.onerror=null;img.src=fb;}else{img.closest('.sq-salon-card-v3__shot-link')?.remove();}})(this)\">" +
                          "</a>"
                      );
                  })
                  .join("")
            : '<div class="salon-card-image-placeholder">' + escapeHtml(noImageLabel) + "</div>";

        const carouselNav = multi
            ? '<button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--prev" aria-label="Previous" data-carousel-prev>‹</button>' +
              '<button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--next" aria-label="Next" data-carousel-next>›</button>' +
              '<div class="sq-salon-card-v3__dots" aria-hidden="true">' +
              realizations
                  .map(function (_, i) {
                      return (
                          '<span class="sq-salon-card-v3__dot' +
                          (i === 0 ? " is-active" : "") +
                          '" data-dot="' +
                          i +
                          '"></span>'
                      );
                  })
                  .join("") +
              "</div>"
            : "";

        const avatarHtml = avatar
            ? '<img src="' +
              escapeHtml(avatar) +
              '" alt="" class="sq-salon-card-v3__avatar-img" loading="lazy" onerror="this.parentElement.classList.add(\'sq-salon-card-v3__avatar--fallback\')">'
            : '<span class="sq-salon-card-v3__avatar-fallback" aria-hidden="true">' +
              escapeHtml((salon.name || "?").charAt(0)) +
              "</span>";

        const ratingHtml =
            salon.review > 0
                ? '<span class="sq-salon-card-v3__rating"><span aria-hidden="true">★</span> ' +
                  Number(salon.review).toFixed(1) +
                  (salon.reviewCount ? " (" + salon.reviewCount + ")" : "") +
                  "</span>"
                : "";

        const services = Array.isArray(salon.topServices) ? salon.topServices : [];
        const servicesHtml = services.length
            ? '<ul class="sq-salon-card-v3__services">' +
              services
                  .map(function (svc) {
                      const svcUrl = svc.id
                          ? salonUrl +
                            "?serviceId=" +
                            encodeURIComponent(svc.id) +
                            "&book=1"
                          : salonUrl;
                      const price =
                          svc.price != null
                              ? '<span class="sq-salon-card-v3__svc-price">' +
                                escapeHtml(currency) +
                                svc.price +
                                "</span>"
                              : "";
                      const dur = svc.durationLabel
                          ? '<span class="sq-salon-card-v3__svc-dur">' +
                            escapeHtml(svc.durationLabel) +
                            "</span>"
                          : "";
                      const next = svc.nextAvailable
                          ? '<span class="sq-salon-card-v3__svc-next">' +
                            escapeHtml(svc.nextAvailable) +
                            "</span>"
                          : salon.nextAvailable
                            ? '<span class="sq-salon-card-v3__svc-next">' +
                              escapeHtml(salon.nextAvailable) +
                              "</span>"
                            : "";
                      return (
                          "<li>" +
                          '<a class="sq-salon-card-v3__svc" href="' +
                          escapeHtml(svcUrl) +
                          '">' +
                          '<span class="sq-salon-card-v3__svc-name">' +
                          escapeHtml(svc.name) +
                          "</span>" +
                          dur +
                          price +
                          next +
                          "</a></li>"
                      );
                  })
                  .join("") +
              "</ul>"
            : salon.minPrice != null
              ? '<p class="sq-salon-card-v3__from">' +
                escapeHtml(priceFromLabel) +
                " " +
                escapeHtml(currency) +
                salon.minPrice +
                "</p>"
              : "";

        return (
            '<article class="salon-card sq-salon-card-v2 sq-salon-card-v3 sq-salon-card-v3--split" data-salon-id="' +
            escapeHtml(salon._id) +
            '">' +
            '<div class="sq-salon-card-v3__media' +
            (multi ? " sq-salon-card-v3__media--carousel" : "") +
            (realizations.length ? "" : " sq-salon-card-v2__media--fallback") +
            '" data-carousel' +
            (multi
                ? ' data-carousel-count="' +
                  realizations.length +
                  '" data-carousel-index="0"'
                : "") +
            ">" +
            shotsHtml +
            carouselNav +
            "</div>" +
            '<div class="sq-salon-card-v3__body">' +
            '<div class="sq-salon-card-v3__identity">' +
            '<a href="' +
            escapeHtml(salonUrl) +
            '" class="sq-salon-card-v3__avatar">' +
            avatarHtml +
            "</a>" +
            '<div class="sq-salon-card-v3__identity-text">' +
            '<h3 class="salon-card-name sq-salon-card-v3__name">' +
            '<a href="' +
            escapeHtml(salonUrl) +
            '">' +
            escapeHtml(salon.name) +
            "</a></h3>" +
            (salon.address
                ? '<p class="salon-card-address sq-salon-card-v3__address">' +
                  escapeHtml(salon.address) +
                  "</p>"
                : "") +
            ratingHtml +
            "</div></div>" +
            servicesHtml +
            "</div></article>"
        );
    }

    function bindCarousels(root) {
        if (!root) return;
        root.querySelectorAll(".sq-salon-card-v3").forEach(function (card) {
            const links = Array.prototype.slice.call(
                card.querySelectorAll(".sq-salon-card-v3__shot-link")
            );
            const dots = Array.prototype.slice.call(
                card.querySelectorAll(".sq-salon-card-v3__dot")
            );
            if (links.length < 2) return;
            let idx = 0;
            const show = function (i) {
                idx = (i + links.length) % links.length;
                links.forEach(function (l, n) {
                    l.classList.toggle("is-active", n === idx);
                    l.tabIndex = n === idx ? 0 : -1;
                });
                dots.forEach(function (d, n) {
                    d.classList.toggle("is-active", n === idx);
                });
            };
            card.querySelector("[data-carousel-prev]")?.addEventListener("click", function (e) {
                e.preventDefault();
                show(idx - 1);
            });
            card.querySelector("[data-carousel-next]")?.addEventListener("click", function (e) {
                e.preventDefault();
                show(idx + 1);
            });
        });
    }

    function setSearchMode(active) {
        document.body.classList.toggle("sq-home-search-active", Boolean(active));
        const banner = document.getElementById("homeShareLookBanner");
        const hair = document.getElementById("homeHairStrip");
        if (banner) banner.hidden = Boolean(active);
        if (hair) hair.hidden = Boolean(active);
    }

    function formatStats(salonCount, reviewCount) {
        const isFr = getLang() === "fr";
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
        return salonCount + " " + salonWord + " · " + reviewCount + " " + reviewWord;
    }

    function renderHomeSearchResults(salons, query) {
        const wrap = document.getElementById("homeSearchResults");
        const grid = document.getElementById("homeSearchResultsGrid");
        const stats = document.getElementById("homeSearchResultsStats");
        const more = document.getElementById("homeSearchResultsMore");
        if (!wrap || !grid) return;

        setSearchMode(true);
        wrap.hidden = false;

        const reviewCount = (salons || []).reduce(function (acc, s) {
            return acc + (s.reviewCount || 0);
        }, 0);

        if (stats) {
            const base = formatStats((salons || []).length, reviewCount);
            stats.textContent = query
                ? base + (getLang() === "fr" ? " — « " + query + " »" : ' — "' + query + '"')
                : base;
        }

        if (!(salons || []).length) {
            grid.innerHTML =
                '<div class="no-results"><p>' +
                escapeHtml(t("homeProduct.emptySalonsSearch") || t("searchResults.noSalons")) +
                "</p></div>";
            if (more) more.hidden = true;
            return;
        }

        grid.innerHTML = salons.map(renderSalonCardHorizontal).join("");
        bindCarousels(grid);

        if (more) {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            const location = getLocationLabel();
            if (location) params.set("location", location);
            more.href = "/recherche" + (params.toString() ? "?" + params.toString() : "");
            more.hidden = salons.length < 8;
        }

        if (window.skedisyHomeMap && typeof window.skedisyHomeMap.setSalons === "function") {
            window.skedisyHomeMap.setSalons(salons);
        }
    }

    function homeSearchSalons(query, locationOverride) {
        const q = String(query || "").trim();
        const location = String(
            locationOverride != null ? locationOverride : getLocationLabel()
        ).trim();
        const wrap = document.getElementById("homeSearchResults");
        const grid = document.getElementById("homeSearchResultsGrid");
        if (!wrap || !grid) {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (location) params.set("location", location);
            window.location.href = "/recherche?" + params.toString();
            return;
        }

        grid.innerHTML =
            '<p class="sq-home-discovery-loading">' +
            escapeHtml(t("homeProduct.salonsLoading") || "…") +
            "</p>";
        wrap.hidden = false;
        setSearchMode(true);
        wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });

        requestLocation().then(function () {
            const params = new URLSearchParams({
                language: getLang(),
                sort: "best",
            });
            if (q) params.set("q", q);
            if (location) params.set("location", location);
            if (clientCoords.lat != null) params.set("latitude", String(clientCoords.lat));
            if (clientCoords.lng != null) params.set("longitude", String(clientCoords.lng));

            return fetch("/api/public/search-salons?" + params.toString())
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    const salons =
                        data.status && Array.isArray(data.salons) ? data.salons.slice(0, 12) : [];
                    renderHomeSearchResults(salons, q);
                })
                .catch(function () {
                    renderHomeSearchResults([], q);
                });
        });
    }

    /** Legacy compact card (si section nearby encore présente). */
    function renderSalonCard(salon) {
        return renderSalonCardHorizontal(salon);
    }

    function loadNearbySalons(searchQuery) {
        if (searchQuery) {
            homeSearchSalons(searchQuery);
            return Promise.resolve();
        }
        const track = document.getElementById("nearbySalonsTrack");
        if (!track) return Promise.resolve();

        const params = new URLSearchParams({
            latitude: String(clientCoords.lat),
            longitude: String(clientCoords.lng),
        });

        return fetch(API_BASE + "user/salon/getAll?" + params.toString(), {
            headers: { key: API_KEY, "Content-Type": "application/json" },
        })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data.status || !data.data || !data.data.length) {
                    track.innerHTML =
                        '<p class="sq-home-discovery-empty">' +
                        escapeHtml(t("homeProduct.emptySalons")) +
                        "</p>";
                    return;
                }
                track.innerHTML = data.data.slice(0, 5).map(renderSalonCard).join("");
                bindCarousels(track);
            })
            .catch(function () {
                track.innerHTML =
                    '<p class="sq-home-discovery-empty">' +
                    escapeHtml(t("homeProduct.emptySalons")) +
                    "</p>";
            });
    }

    function renderExpertCard(expert) {
        const salon = expert.salonInfo || {};
        const url = salon._id || salon.id ? buildSalonUrl(salon) : "#";
        const name =
            escapeHtml(((expert.fname || "") + " " + (expert.lname || "")).trim()) || "Experte";
        const img = expert.image || "";
        const salonName = salon.name || "";
        const initial = escapeHtml((expert.fname || expert.lname || "?").charAt(0));

        const imageHtml = img
            ? '<img src="' +
              escapeHtml(img) +
              '" alt="' +
              name +
              '" class="sq-expert-card__img" loading="lazy">'
            : '<div class="sq-expert-card__placeholder" aria-hidden="true">' + initial + "</div>";

        const ratingHtml =
            expert.review > 0
                ? '<span class="sq-expert-card__rating">★ ' +
                  Number(expert.review).toFixed(1) +
                  " (" +
                  (expert.reviewCount || 0) +
                  ")</span>"
                : "";

        const salonLine = salonName
            ? '<span class="sq-expert-card__salon">' +
              escapeHtml(
                  (t("homeProduct.expertAtSalonTpl") || "Chez __SALON__").replace(
                      "__SALON__",
                      salonName
                  )
              ) +
              "</span>"
            : "";

        return (
            '<a href="' +
            escapeHtml(url) +
            '" class="sq-expert-card">' +
            '<div class="sq-expert-card__avatar">' +
            imageHtml +
            "</div>" +
            '<div class="sq-expert-card__body">' +
            '<span class="sq-expert-card__name">' +
            name +
            "</span>" +
            ratingHtml +
            salonLine +
            "</div></a>"
        );
    }

    function loadTopExperts() {
        const track = document.getElementById("topExpertsTrack");
        if (!track) return Promise.resolve();

        return fetch(API_BASE + "user/expert/getTopExperts?start=0&limit=6", {
            headers: { key: API_KEY, "Content-Type": "application/json" },
        })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data.status || !data.data || !data.data.length) {
                    track.innerHTML =
                        '<p class="sq-home-discovery-empty">' +
                        escapeHtml(t("homeProduct.emptyExperts")) +
                        "</p>";
                    return;
                }
                track.innerHTML = data.data.map(renderExpertCard).join("");
            })
            .catch(function () {
                track.innerHTML =
                    '<p class="sq-home-discovery-empty">' +
                    escapeHtml(t("homeProduct.emptyExperts")) +
                    "</p>";
            });
    }

    function initHomeDiscovery() {
        document.getElementById("homeLocationApply")?.addEventListener("click", function () {
            const q = (document.getElementById("homeQuerySearchInput")?.value || "").trim();
            if (q && document.getElementById("homeSearchResults")) {
                setTimeout(function () {
                    homeSearchSalons(q);
                }, 50);
            }
        });

        if (document.getElementById("sqNearbySalons") || document.getElementById("topExpertsTrack")) {
            requestLocation().then(function () {
                return Promise.all([loadNearbySalons(), loadTopExperts()]);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", initHomeDiscovery);
    document.addEventListener("skedisy:language-changed", function () {
        if (document.getElementById("sqNearbySalons")) {
            loadNearbySalons();
            loadTopExperts();
        }
    });

    window.initHomeDiscovery = initHomeDiscovery;
    window.homeSearchSalons = homeSearchSalons;
})();
