/**
 * Accueil web — salons à proximité & meilleurs experts (mêmes APIs que l'app cliente).
 */
(function () {
    const API_KEY = 'r8Cs1WcSI9';
    const API_BASE = window.location.origin.replace(/\/+$/, '') + '/';
    const IDF_DEFAULT = { lat: 48.8566, lng: 2.3522 };
    let clientCoords = { ...IDF_DEFAULT, fromGps: false };

    function t(key) {
        if (typeof getTranslation === 'function') return getTranslation(key);
        return key;
    }

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function slugify(name) {
        return (name || 'salon')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function buildSalonUrl(salon) {
        if (salon.shareUrl) return salon.shareUrl;
        const id = salon._id || salon.id;
        if (!id) return '#';
        const shortId = salon.shortId || String(id).substring(0, 6);
        const slug = salon.slug || slugify(salon.name);
        return API_BASE.replace(/\/+$/, '') + '/salon/' + slug + '-' + shortId;
    }

    function apiGet(path) {
        return fetch(API_BASE + path, {
            headers: { key: API_KEY, 'Content-Type': 'application/json' },
        }).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
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

    function renderSalonCard(salon) {
        const url = buildSalonUrl(salon);
        const name = escapeHtml(salon.name || 'Salon');
        const img = salon.mainImage || salon.image || '';
        const addr =
            salon.addressDetails?.addressLine1 ||
            salon.addressDetails?.city ||
            salon.address ||
            '';
        const dist =
            salon.distance != null
                ? '<span class="sq-discovery-card__distance"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' +
                  salon.distance.toFixed(1) +
                  ' km</span>'
                : '';
        const rating =
            salon.review != null
                ? '<span class="sq-discovery-card__rating"><i class="fas fa-star" aria-hidden="true"></i> ' +
                  Number(salon.review).toFixed(1) +
                  '</span>'
                : '';

        return (
            '<a class="sq-discovery-card sq-discovery-card--salon" href="' +
            escapeHtml(url) +
            '">' +
            '<span class="sq-discovery-card__media">' +
            (img
                ? '<img src="' + escapeHtml(img) + '" alt="" loading="lazy" onerror="this.classList.add(\'sq-discovery-card__img--fallback\')">'
                : '<span class="sq-discovery-card__placeholder"><i class="fas fa-store" aria-hidden="true"></i></span>') +
            '</span>' +
            '<span class="sq-discovery-card__body">' +
            '<strong class="sq-discovery-card__title">' +
            name +
            '</strong>' +
            (addr ? '<span class="sq-discovery-card__meta">' + escapeHtml(addr) + '</span>' : '') +
            '<span class="sq-discovery-card__row">' +
            dist +
            rating +
            '</span>' +
            '<span class="sq-discovery-card__cta">' +
            escapeHtml(t('homeProduct.viewSalon')) +
            '</span>' +
            '</span></a>'
        );
    }

    function renderExpertCard(expert) {
        const salon = expert.salonInfo || {};
        const url = salon._id || salon.id ? buildSalonUrl(salon) : '#';
        const name = escapeHtml((expert.fname || '') + ' ' + (expert.lname || '')).trim() || 'Experte';
        const img = expert.image || '';
        const salonName = escapeHtml(salon.name || '');
        const rating =
            expert.review != null
                ? '<span class="sq-discovery-card__rating"><i class="fas fa-star" aria-hidden="true"></i> ' +
                  Number(expert.review).toFixed(1) +
                  '</span>'
                : '';

        return (
            '<a class="sq-discovery-card sq-discovery-card--expert" href="' +
            escapeHtml(url) +
            '">' +
            '<span class="sq-discovery-card__media sq-discovery-card__media--round">' +
            (img
                ? '<img src="' + escapeHtml(img) + '" alt="" loading="lazy">'
                : '<span class="sq-discovery-card__placeholder"><i class="fas fa-user" aria-hidden="true"></i></span>') +
            '</span>' +
            '<span class="sq-discovery-card__body sq-discovery-card__body--center">' +
            '<strong class="sq-discovery-card__title">' +
            name +
            '</strong>' +
            (salonName ? '<span class="sq-discovery-card__meta">' + salonName + '</span>' : '') +
            rating +
            '<span class="sq-discovery-card__cta">' +
            escapeHtml(t('homeProduct.viewSalon')) +
            '</span>' +
            '</span></a>'
        );
    }

    function loadNearbySalons(searchQuery) {
        const track = document.getElementById('nearbySalonsTrack');
        const lead = document.getElementById('nearbySalonsLead');
        if (!track) return Promise.resolve();

        const params = new URLSearchParams({
            latitude: String(clientCoords.lat),
            longitude: String(clientCoords.lng),
        });
        if (searchQuery) params.set('search', searchQuery);

        return apiGet('user/salon/getAll?' + params.toString())
            .then(function (data) {
                if (!data.status || !data.data || !data.data.length) {
                    track.innerHTML =
                        '<p class="sq-home-discovery-empty">' +
                        escapeHtml(t(searchQuery ? 'homeProduct.emptySalonsSearch' : 'homeProduct.emptySalons')) +
                        '</p>';
                    return;
                }
                const salons = data.data.slice(0, 5);
                track.innerHTML = salons.map(renderSalonCard).join('');
                if (lead && searchQuery) {
                    lead.textContent = t('homeProduct.searchResultsSub').replace('__QUERY__', searchQuery);
                } else if (lead && !clientCoords.fromGps) {
                    lead.textContent = t('homeProduct.nearbySalonsSubNoGps');
                } else if (lead) {
                    lead.textContent = t('homeProduct.nearbySalonsSub');
                }
            })
            .catch(function () {
                track.innerHTML =
                    '<p class="sq-home-discovery-empty">' +
                    escapeHtml(t(searchQuery ? 'homeProduct.emptySalonsSearch' : 'homeProduct.emptySalons')) +
                    '</p>';
            });
    }

    function homeSearchSalons(query) {
        const q = String(query || '').trim();
        if (!q) return;

        const track = document.getElementById('nearbySalonsTrack');
        const section = document.getElementById('sqNearbySalons');
        if (!track) return;

        track.innerHTML =
            '<p class="sq-home-discovery-loading">' + escapeHtml(t('homeProduct.salonsLoading')) + '</p>';
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        requestLocation().then(function () {
            return loadNearbySalons(q);
        });
    }

    function loadTopExperts() {
        const track = document.getElementById('topExpertsTrack');
        if (!track) return Promise.resolve();

        return apiGet('user/expert/getTopExperts?start=0&limit=6')
            .then(function (data) {
                if (!data.status || !data.data || !data.data.length) {
                    track.innerHTML =
                        '<p class="sq-home-discovery-empty">' + escapeHtml(t('homeProduct.emptyExperts')) + '</p>';
                    return;
                }
                track.innerHTML = data.data.map(renderExpertCard).join('');
            })
            .catch(function () {
                track.innerHTML =
                    '<p class="sq-home-discovery-empty">' + escapeHtml(t('homeProduct.emptyExperts')) + '</p>';
            });
    }

    function initHomeDiscovery() {
        if (!document.getElementById('sqNearbySalons')) return;

        requestLocation().then(function () {
            return Promise.all([loadNearbySalons(), loadTopExperts()]);
        });
    }

    document.addEventListener('DOMContentLoaded', initHomeDiscovery);
    document.addEventListener('skedisy:language-changed', function () {
        if (document.getElementById('sqNearbySalons')) {
            loadNearbySalons();
            loadTopExperts();
        }
    });

    window.initHomeDiscovery = initHomeDiscovery;
    window.homeSearchSalons = homeSearchSalons;
})();
