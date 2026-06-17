/**
 * Puce « Votre position » — style Squire (accueil + recherche).
 */
(function () {
    const STORAGE_KEY = 'skedisy-location-label';
    const DEFAULT_LABEL = 'Paris';
    const IDF_DEFAULT = { lat: 48.8566, lng: 2.3522 };

    function t(key) {
        if (typeof getTranslation === 'function') return getTranslation(key);
        return key;
    }

    function getChip() {
        return document.getElementById('homeLocationChip');
    }

    function getPopover() {
        return document.getElementById('homeLocationPopover');
    }

    function getInput() {
        return document.getElementById('homeLocationSearchInput');
    }

    function getValueEl() {
        return document.getElementById('homeLocationChipValue');
    }

    function setLabel(label) {
        const text = String(label || '').trim() || DEFAULT_LABEL;
        localStorage.setItem(STORAGE_KEY, text);
        const valueEl = getValueEl();
        if (valueEl) valueEl.textContent = text;
        const input = getInput();
        if (input && document.activeElement !== input) {
            input.value = text;
        }
        updateViewMapLink(text);
    }

    function getLabel() {
        const input = getInput();
        const fromInput = input && input.value.trim();
        if (fromInput) return fromInput;
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_LABEL;
    }

    function updateViewMapLink(location) {
        const link = document.getElementById('homeViewMapLink');
        if (!link) return;
        const params = new URLSearchParams();
        params.set('view', 'map');
        if (location) params.set('location', location);
        link.href = '/recherche?' + params.toString();
    }

    function closePopover() {
        const chip = getChip();
        const popover = getPopover();
        if (popover) popover.hidden = true;
        if (chip) chip.setAttribute('aria-expanded', 'false');
    }

    function openPopover() {
        const chip = getChip();
        const popover = getPopover();
        const input = getInput();
        if (!popover) return;

        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburger = document.getElementById('mobileMenuToggle');
        if (mobileMenu?.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay?.classList.remove('active');
            hamburger?.classList.remove('active');
        }

        popover.hidden = false;
        if (chip) chip.setAttribute('aria-expanded', 'true');
        if (input) {
            input.value = getLabel();
            input.focus();
            input.select();
        }
    }

    function applyLocation() {
        const input = getInput();
        const label = input ? input.value.trim() : '';
        if (!label) return;
        setLabel(label);
        closePopover();
    }

    function requestGpsLabel() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                const near = t('homeProduct.nearYou') || 'Near you';
                setLabel(near);
            },
            function () {
                setLabel(DEFAULT_LABEL);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
    }

    function initLocationChip() {
        const chip = getChip();
        if (!chip) return;

        const saved = localStorage.getItem(STORAGE_KEY);
        setLabel(saved || DEFAULT_LABEL);

        chip.addEventListener('click', function (e) {
            e.stopPropagation();
            const popover = getPopover();
            if (popover && popover.hidden) openPopover();
            else closePopover();
        });

        document.getElementById('homeLocationApply')?.addEventListener('click', applyLocation);

        getInput()?.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyLocation();
            }
            if (e.key === 'Escape') closePopover();
        });

        document.addEventListener('click', function (e) {
            const wrap = document.querySelector('.sq-location-chip-wrap');
            if (wrap && !wrap.contains(e.target)) closePopover();
        });

        if (!saved) {
            requestGpsLabel();
        }
    }

    document.addEventListener('DOMContentLoaded', initLocationChip);

    window.skedisyGetLocationLabel = getLabel;
    window.skedisySetLocationLabel = setLabel;
})();
