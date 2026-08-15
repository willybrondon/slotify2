/**
 * Mini-carte salons — accueil desktop (avant le QR code).
 */
(function () {
    const mapEl = document.getElementById('homeSalonMap');
    if (!mapEl || typeof L === 'undefined') return;

    const API_KEY = 'r8Cs1WcSI9';
    const API_BASE = window.location.origin.replace(/\/+$/, '') + '/';
    const IDF_CENTER = [48.8566, 2.3522];
    let mapInstance = null;
    let markersLayer = null;
    let clientCoords = { lat: 48.8566, lng: 2.3522 };

    function t(key) {
        if (typeof getTranslation === 'function') return getTranslation(key);
        return key;
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

    function refreshMarkers(salons) {
        if (!mapInstance || !markersLayer) return;
        markersLayer.clearLayers();
        const bounds = [];
        const mapUi = window.skedisySalonMapUi;

        salons.forEach(function (salon) {
            if (salon.latitude == null || salon.longitude == null) return;
            const marker = L.marker([salon.latitude, salon.longitude]);
            const popupHtml = mapUi
                ? mapUi.renderSalonMapPopup(salon, t('homeProduct.viewSalon'))
                : '<strong>' + (salon.name || 'Salon') + '</strong>';
            marker.bindPopup(popupHtml, { maxWidth: 260, className: 'sq-leaflet-popup' });
            markersLayer.addLayer(marker);
            bounds.push([salon.latitude, salon.longitude]);
        });

        if (bounds.length) {
            mapInstance.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
        } else {
            mapInstance.setView(IDF_CENTER, 11);
        }
    }

    function loadSalons() {
        const params = new URLSearchParams({
            latitude: String(clientCoords.lat),
            longitude: String(clientCoords.lng),
        });

        return fetch(API_BASE + 'user/salon/getAll?' + params.toString(), {
            headers: { key: API_KEY, 'Content-Type': 'application/json' },
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                const salons =
                    data.status && Array.isArray(data.data) ? data.data.slice(0, 40) : [];
                refreshMarkers(salons);
            })
            .catch(function () {
                mapInstance.setView(IDF_CENTER, 11);
            });
    }

    function initMap() {
        if (mapInstance) return;
        mapInstance = L.map(mapEl, {
            scrollWheelZoom: false,
            zoomControl: true,
            attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(mapInstance);
        markersLayer = L.layerGroup().addTo(mapInstance);
        mapInstance.setView(IDF_CENTER, 11);
        setTimeout(function () {
            mapInstance.invalidateSize();
        }, 200);
    }

    function init() {
        initMap();
        requestLocation().then(loadSalons);
        window.addEventListener('resize', function () {
            if (mapInstance) {
                setTimeout(function () {
                    mapInstance.invalidateSize();
                }, 150);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
