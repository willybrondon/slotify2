/**
 * Carte salons — vignettes style Squire (carré + initiales si pas d'image).
 */
(function (global) {
    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function salonInitials(name) {
        const parts = String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        if (!parts.length) return "?";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function renderSalonThumb(salon) {
        const initials = salonInitials(salon.name);
        const img = salon.mainImage
            ? `<img src="${escapeHtml(salon.mainImage)}" alt="" class="sq-salon-thumb__img" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">`
            : "";
        const initialsHidden = salon.mainImage ? " hidden" : "";
        return `<div class="sq-salon-thumb">${img}<span class="sq-salon-thumb--initials"${initialsHidden}>${escapeHtml(initials)}</span></div>`;
    }

    function renderSalonMapListCard(salon, opts) {
        const options = opts || {};
        const priceFromLabel = options.priceFromLabel || "À partir de";
        const currency = options.currency || "€";
        const ratingPart =
            salon.review > 0
                ? `<span class="salon-card-rating"><span class="rating-stars" aria-hidden="true">★</span> ${salon.review.toFixed(1)} (${salon.reviewCount || 0})</span>`
                : "";
        const pricePart =
            salon.minPrice != null
                ? `<span class="salon-card-price">${escapeHtml(priceFromLabel)} ${escapeHtml(currency)}${salon.minPrice}</span>`
                : "";
        const metaRow =
            pricePart || ratingPart
                ? `<div class="salon-card-meta">${pricePart}${ratingPart}</div>`
                : "";
        const addressHtml = salon.address
            ? `<p class="salon-card-address">${escapeHtml(salon.address)}</p>`
            : "";

        return `
      <a href="${escapeHtml(salon.shareUrl)}" class="salon-card sq-salon-card-v2 sq-salon-card-v2--map-row" data-salon-id="${escapeHtml(salon._id)}">
        ${renderSalonThumb(salon)}
        <div class="salon-card-content">
          <h3 class="salon-card-name">${escapeHtml(salon.name)}</h3>
          ${addressHtml}
          ${metaRow}
        </div>
      </a>`;
    }

    function renderSalonMapPopup(salon, viewSalonLabel) {
        const ratingPart =
            salon.review > 0
                ? `<span class="sq-map-popup-card__rating">★ ${salon.review.toFixed(1)} (${salon.reviewCount || 0})</span>`
                : "";
        const address = salon.address
            ? `<p class="sq-map-popup-card__address">${escapeHtml(salon.address)}</p>`
            : "";

        return `
      <a href="${escapeHtml(salon.shareUrl)}" class="sq-map-popup-card">
        ${renderSalonThumb(salon)}
        <div class="sq-map-popup-card__body">
          <strong class="sq-map-popup-card__name">${escapeHtml(salon.name)}</strong>
          ${address}
          ${ratingPart}
        </div>
      </a>`;
    }

    global.skedisySalonMapUi = {
        escapeHtml,
        salonInitials,
        renderSalonThumb,
        renderSalonMapListCard,
        renderSalonMapPopup,
    };
})(typeof window !== "undefined" ? window : globalThis);
