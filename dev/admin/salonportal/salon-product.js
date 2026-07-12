/**
 * Achat produit salon sur fiche web — parcours proche app cliente (portefeuille).
 */
(function () {
  const cfg = window.SKEDISY_SALON_PRODUCTS;
  if (!cfg) return;

  const state = {
    productId: null,
    product: null,
    quantity: 1,
    selectedAttributes: {},
    userId: null,
    walletBalance: 0,
    addresses: [],
    step: "detail",
  };

  const payCfg = { ...(cfg.payment || {}) };
  const modal = document.getElementById("salonProductModal");
  const stepsEl = document.getElementById("salonProductSteps");
  const stickyBar = document.getElementById("salonProductStickyBar");

  function t(key) {
    return cfg.copy[key] || key;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getWebUser() {
    try {
      const raw = sessionStorage.getItem("skedisy_web_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setWebUser(user) {
    if (!user) return;
    sessionStorage.setItem(
      "skedisy_web_user",
      JSON.stringify({
        id: String(user._id || user.id),
        fname: user.fname || "",
        lname: user.lname || "",
        email: user.email || "",
        mobile: user.mobile || "",
        amount: Number(user.amount) || 0,
      })
    );
  }

  function clearWebUser() {
    sessionStorage.removeItem("skedisy_web_user");
  }

  function saveProductDraft() {
    sessionStorage.setItem(
      "skedisy_product_draft",
      JSON.stringify({
        salonId: cfg.salonId,
        productId: state.productId,
        quantity: state.quantity,
        selectedAttributes: state.selectedAttributes,
        step: state.step,
      })
    );
  }

  function authHref(base) {
    const url = new URL(base, window.location.origin);
    url.searchParams.set("return", window.location.pathname + window.location.search);
    return url.pathname + url.search;
  }

  function bindAuthNavLinks(root) {
    if (!root) return;
    root.querySelectorAll("[data-auth-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        saveProductDraft();
        sessionStorage.setItem("skedisy_resume_product", "1");
        window.location.href = authHref(a.getAttribute("href"));
      });
    });
  }

  function renderCheckoutSteps(current) {
    const steps = [
      { key: "productStepProduct", n: 1 },
      { key: "productStepDelivery", n: 2 },
      { key: "productStepPayment", n: 3 },
      { key: "productStepDone", n: 4 },
    ];
    return `<nav class="sq-product-steps" aria-label="Checkout">${steps
      .map(
        (s) => `<div class="sq-product-steps__item${
          current >= s.n ? " sq-product-steps__item--active" : ""
        }${current === s.n ? " sq-product-steps__item--current" : ""}">
      <span class="sq-product-steps__dot">${s.n}</span>
      <span class="sq-product-steps__label">${escapeHtml(t(s.key))}</span>
    </div>`
      )
      .join("")}</nav>`;
  }

  function renderSuccessStep(orderPayload) {
    const { total } = computeTotals();
    const orderId = orderPayload?.data?.orderId || "";
    if (!stepsEl) return;
    stepsEl.innerHTML = `
      ${renderCheckoutSteps(4)}
      <div class="sq-product-success">
        <div class="sq-product-success__icon" aria-hidden="true">✓</div>
        <h3 class="sq-product-success__title">${escapeHtml(t("productOrderSuccessTitle"))}</h3>
        <p class="sq-product-success__lead">${escapeHtml(t("productOrderSuccess"))}</p>
        <div class="sq-product-summary sq-product-success__card">
          ${orderId ? `<div class="sq-product-summary__row"><strong>${escapeHtml(orderId)}</strong></div>` : ""}
          <div class="sq-product-summary__row sq-product-summary__row--total">
            <span>${escapeHtml(t("totalLabel"))}</span>
            <span>${formatMoney(total)}</span>
          </div>
        </div>
        <button type="button" class="sq-booking-btn sq-product-success__cta" id="btnProductSuccessClose">
          ${escapeHtml(t("noticeContinue"))}
        </button>
      </div>
    `;
    if (stickyBar) stickyBar.classList.add("sq-booking-sticky-bar--hidden");
    document.getElementById("btnProductSuccessClose")?.addEventListener("click", closeModal);
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("sq-booking-modal--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("sq-booking-modal--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showNotice(type, message, onContinue) {
    if (!stepsEl) return;
    const typeClass =
      type === "success" ? "success" : type === "error" ? "error" : "info";
    const btnHtml = onContinue
      ? `<button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnProductNotice">${escapeHtml(t("noticeContinue"))}</button>`
      : "";
    stepsEl.innerHTML = `
      <div class="sq-booking-notice sq-booking-notice--${typeClass}">
        <p class="sq-booking-notice__message">${escapeHtml(message)}</p>
        ${btnHtml}
      </div>
    `;
    if (stickyBar) stickyBar.classList.add("sq-booking-sticky-bar--hidden");
    const btn = document.getElementById("btnProductNotice");
    if (btn && onContinue) btn.onclick = () => onContinue();
  }

  function computeTotals() {
    const p = state.product;
    if (!p) return { subtotal: 0, shipping: 0, total: 0 };
    const subtotal = (Number(p.price) || 0) * state.quantity;
    const shipping = Number(p.shippingCharges) || 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total: Math.round(total) };
  }

  function formatMoney(n) {
    return `${cfg.currency}${Number(n).toFixed(2)}`;
  }

  function attributesValid() {
    const attrs = state.product?.attributes || [];
    if (!attrs.length) return true;
    return attrs.every((attr) => {
      const name = attr.name;
      return name && state.selectedAttributes[name];
    });
  }

  function buildAttributesArray() {
    const list = [];
    Object.entries(state.selectedAttributes).forEach(([name, value]) => {
      if (name && value) {
        list.push({ name, value, _id: "" });
      }
    });
    return list;
  }

  function updateStickyBar() {
    if (!stickyBar || !state.product) return;
    const { total } = computeTotals();
    const outOfStock = state.product.isOutOfStock;
    stickyBar.innerHTML = `
      <div class="sq-booking-sticky-bar__inner">
        <div class="sq-booking-sticky-bar__info">
          <p class="sq-booking-sticky-bar__count">${escapeHtml(state.product.productName || "")}</p>
          <p class="sq-booking-sticky-bar__meta">${formatMoney(total)}</p>
        </div>
        <button type="button" class="sq-booking-sticky-bar__cta" id="btnProductStickyCta" ${outOfStock ? "disabled" : ""}>
          ${escapeHtml(outOfStock ? t("productOutOfStock") : t("productBuyNow"))}
        </button>
      </div>
    `;
    stickyBar.classList.remove("sq-booking-sticky-bar--hidden");
    document.getElementById("btnProductStickyCta")?.addEventListener("click", onBuyNowClick);
  }

  async function refreshWallet() {
    if (!state.userId) return;
    try {
      const res = await fetch(
        `/api/public/booking/payment-settings?userId=${encodeURIComponent(state.userId)}`
      );
      const data = await res.json();
      if (data.status) {
        Object.assign(payCfg, data.settings || {});
        if (data.walletBalance != null) {
          state.walletBalance = Number(data.walletBalance) || 0;
        }
      }
    } catch (e) {
      console.warn("[salon-product] wallet refresh failed", e);
    }
  }

  async function loadProductDetail(productId) {
    showNotice("info", t("productLoading"));
    try {
      const res = await fetch(
        `/api/public/product/detail?productId=${encodeURIComponent(productId)}`
      );
      const data = await res.json();
      if (!data.status || !data.product) {
        showNotice("error", data.message || t("genericError"));
        return false;
      }
      state.product = data.product;
      state.productId = productId;
      state.quantity = 1;
      state.selectedAttributes = {};
      state.step = "detail";
      renderDetailStep();
      return true;
    } catch (e) {
      showNotice("error", t("genericError"));
      return false;
    }
  }

  function renderDetailStep() {
    const p = state.product;
    if (!p || !stepsEl) return;

    const attrs = p.attributes || [];
    const attrsHtml = attrs.length
      ? attrs
          .map((attr) => {
            const name = attr.name || "";
            const values = attr.value || [];
            const chips = values
              .map((val) => {
                const selected = state.selectedAttributes[name] === val;
                return `<button type="button" class="sq-product-attr-chip${selected ? " sq-product-attr-chip--selected" : ""}" data-attr-name="${escapeHtml(name)}" data-attr-value="${escapeHtml(val)}">${escapeHtml(val)}</button>`;
              })
              .join("");
            return `<div class="sq-product-attr-group">
              <p class="sq-product-attr-label">${escapeHtml(name)}</p>
              <div class="sq-product-attr-chips">${chips}</div>
            </div>`;
          })
          .join("")
      : "";

    const desc = (p.description || "").trim();
    const descHtml = desc
      ? `<div class="sq-product-detail__desc"><h4>${escapeHtml(t("productDescription"))}</h4><p>${escapeHtml(desc)}</p></div>`
      : "";

    const mrpHtml =
      p.mrp && p.mrp > p.price
        ? `<span class="sq-product-detail__mrp">${formatMoney(p.mrp)}</span>`
        : "";

    const imageHtml = p.mainImage
      ? `<img src="${escapeHtml(p.mainImage)}" alt="" class="sq-product-detail__img" loading="lazy">`
      : `<div class="sq-product-detail__img sq-product-detail__img--placeholder">${escapeHtml((p.productName || "P").charAt(0))}</div>`;

    const { subtotal, shipping, total } = computeTotals();

    stepsEl.innerHTML = `
      ${renderCheckoutSteps(1)}
      <div class="sq-product-detail">
        <div class="sq-product-detail__hero">${imageHtml}</div>
        <div class="sq-product-detail__body">
          ${p.brand ? `<p class="sq-product-detail__brand">${escapeHtml(p.brand)}</p>` : ""}
          <h3 class="sq-product-detail__name">${escapeHtml(p.productName || "")}</h3>
          <div class="sq-product-detail__price-row">
            <span class="sq-product-detail__price">${formatMoney(p.price)}</span>
            ${mrpHtml}
          </div>
          ${descHtml}
          ${attrsHtml}
          <div class="sq-product-qty">
            <span class="sq-product-qty__label">${escapeHtml(t("productQuantity"))}</span>
            <div class="sq-product-qty__controls">
              <button type="button" class="sq-product-qty__btn" id="btnQtyMinus" aria-label="-">−</button>
              <span class="sq-product-qty__value" id="productQtyValue">${state.quantity}</span>
              <button type="button" class="sq-product-qty__btn" id="btnQtyPlus" aria-label="+">+</button>
            </div>
          </div>
          <div class="sq-product-summary">
            <div class="sq-product-summary__row"><span>${escapeHtml(t("subtotal"))}</span><span>${formatMoney(subtotal)}</span></div>
            <div class="sq-product-summary__row"><span>${escapeHtml(t("productShipping"))}</span><span>${formatMoney(shipping)}</span></div>
            <div class="sq-product-summary__row sq-product-summary__row--total"><span>${escapeHtml(t("totalLabel"))}</span><span>${formatMoney(total)}</span></div>
          </div>
          <button type="button" class="sq-booking-btn sq-product-detail__cta" id="btnProductBuy" ${p.isOutOfStock ? "disabled" : ""}>
            ${escapeHtml(p.isOutOfStock ? t("productOutOfStock") : t("productBuyNow"))}
          </button>
        </div>
      </div>
    `;

    updateStickyBar();

    stepsEl.querySelectorAll(".sq-product-attr-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-attr-name");
        const value = btn.getAttribute("data-attr-value");
        if (!name) return;
        state.selectedAttributes[name] = value;
        renderDetailStep();
      });
    });

    document.getElementById("btnQtyMinus")?.addEventListener("click", () => {
      if (state.quantity > 1) {
        state.quantity--;
        renderDetailStep();
      }
    });
    document.getElementById("btnQtyPlus")?.addEventListener("click", () => {
      state.quantity++;
      renderDetailStep();
    });
    document.getElementById("btnProductBuy")?.addEventListener("click", onBuyNowClick);
  }

  function onBuyNowClick() {
    if (!state.product || state.product.isOutOfStock) return;
    if (!attributesValid()) {
      showNotice("error", t("productSelectAllAttributes"), () => renderDetailStep());
      return;
    }

    const webUser = getWebUser();
    if (webUser) {
      state.userId = String(webUser.id);
      state.walletBalance = Number(webUser.amount) || 0;
      refreshWallet().then(() => renderAddressStep());
      return;
    }
    state.step = "auth";
    renderAuthStep();
  }

  function renderAuthStep() {
    const auth = cfg.authUrls || {};
    const loginHref = authHref(auth.login || "/compte/connexion");
    const signupHref = authHref(auth.signup || "/compte/inscription");

    stepsEl.innerHTML = `
      ${renderCheckoutSteps(2)}
      <div class="sq-booking-step">
        <p class="sq-booking-step__hint">${escapeHtml(t("yourDetails"))}</p>
        <p class="sq-booking-auth-prompt">
          ${escapeHtml(t("alreadyHaveAccount"))}
          <a href="${escapeHtml(loginHref)}" class="sq-booking-auth-link" data-auth-nav="login">${escapeHtml(t("authSignInLink"))}</a>
          ${escapeHtml(t("authOr"))}
          <a href="${escapeHtml(signupHref)}" class="sq-booking-auth-link" data-auth-nav="signup">${escapeHtml(t("authSignUpLink"))}</a>
        </p>
        <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnProductBackDetail">${escapeHtml(t("back"))}</button>
      </div>
    `;
    if (stickyBar) stickyBar.classList.add("sq-booking-sticky-bar--hidden");
    bindAuthNavLinks(stepsEl);
    document.getElementById("btnProductBackDetail")?.addEventListener("click", () => {
      state.step = "detail";
      renderDetailStep();
    });
  }

  async function loadAddresses() {
    if (!state.userId) return [];
    try {
      const res = await fetch(
        `/api/public/product/addresses?userId=${encodeURIComponent(state.userId)}`
      );
      const data = await res.json();
      if (data.status && Array.isArray(data.address)) {
        state.addresses = data.address;
        return data.address;
      }
    } catch (e) {
      console.warn("[salon-product] addresses failed", e);
    }
    return [];
  }

  function renderAddressStep() {
    state.step = "address";
    stepsEl.innerHTML = `<p class="sq-booking-step__hint">${escapeHtml(t("productLoading"))}</p>`;
    if (stickyBar) stickyBar.classList.add("sq-booking-sticky-bar--hidden");

    loadAddresses().then((list) => {
      const selected = list.find((a) => a.isSelect);
      const cardsHtml = list.length
        ? list
            .map((addr) => {
              const sel = addr.isSelect || (selected && selected._id === addr._id);
              return `<button type="button" class="sq-product-address-card${sel ? " sq-product-address-card--selected" : ""}" data-address-id="${escapeHtml(String(addr._id))}">
                <strong>${escapeHtml(addr.name || "")}</strong>
                <span>${escapeHtml(addr.address || "")}</span>
                <span>${escapeHtml(addr.zipCode || "")} ${escapeHtml(addr.city || "")}, ${escapeHtml(addr.country || "")}</span>
              </button>`;
            })
            .join("")
        : "";

      stepsEl.innerHTML = `
        ${renderCheckoutSteps(2)}
        <div class="sq-booking-step">
          <h3 class="sq-booking-step__label">${escapeHtml(t("productDeliveryTitle"))}</h3>
          <p class="sq-booking-step__hint">${escapeHtml(t("productDeliveryHint"))}</p>
          ${cardsHtml ? `<div class="sq-product-address-list">${cardsHtml}</div>` : ""}
          <form id="productAddressForm" class="sq-product-address-form">
            <label class="sq-booking-field">${escapeHtml(t("productAddressName"))}
              <input type="text" id="addrName" required autocomplete="name">
            </label>
            <label class="sq-booking-field">${escapeHtml(t("productAddressLine"))}
              <input type="text" id="addrLine" required autocomplete="street-address">
            </label>
            <label class="sq-booking-field">${escapeHtml(t("productAddressCity"))}
              <input type="text" id="addrCity" required autocomplete="address-level2">
            </label>
            <label class="sq-booking-field">${escapeHtml(t("productAddressState"))}
              <input type="text" id="addrState" required autocomplete="address-level1">
            </label>
            <label class="sq-booking-field">${escapeHtml(t("productAddressZip"))}
              <input type="text" id="addrZip" required autocomplete="postal-code">
            </label>
            <label class="sq-booking-field">${escapeHtml(t("productAddressCountry"))}
              <input type="text" id="addrCountry" value="France" required autocomplete="country-name">
            </label>
            <button type="submit" class="sq-booking-btn">${escapeHtml(list.length ? t("productAddAddress") : t("productUseAddress"))}</button>
          </form>
          <div class="sq-product-step-actions">
            <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnProductBackAuth">${escapeHtml(t("back"))}</button>
            ${list.length ? `<button type="button" class="sq-booking-btn" id="btnProductContinuePay">${escapeHtml(t("continue"))}</button>` : ""}
          </div>
        </div>
      `;

      stepsEl.querySelectorAll(".sq-product-address-card").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const addressId = btn.getAttribute("data-address-id");
          if (!addressId || !state.userId) return;
          await fetch(
            `/api/public/product/address/select?addressId=${encodeURIComponent(addressId)}&userId=${encodeURIComponent(state.userId)}`,
            { method: "PATCH" }
          );
          renderAddressStep();
        });
      });

      document.getElementById("productAddressForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!state.userId) return;
        const body = {
          userId: state.userId,
          name: document.getElementById("addrName")?.value.trim(),
          address: document.getElementById("addrLine")?.value.trim(),
          city: document.getElementById("addrCity")?.value.trim(),
          state: document.getElementById("addrState")?.value.trim(),
          zipCode: document.getElementById("addrZip")?.value.trim(),
          country: document.getElementById("addrCountry")?.value.trim(),
        };
        const res = await fetch("/api/public/product/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.status) {
          showNotice("error", data.message || t("genericError"), () => renderAddressStep());
          return;
        }
        renderPaymentStep();
      });

      document.getElementById("btnProductContinuePay")?.addEventListener("click", () => {
        const hasSelected = list.some((a) => a.isSelect);
        if (!hasSelected) {
          showNotice("error", t("productDeliveryHint"), () => renderAddressStep());
          return;
        }
        renderPaymentStep();
      });

      document.getElementById("btnProductBackAuth")?.addEventListener("click", () => {
        if (getWebUser()) renderAddressStep();
        else renderAuthStep();
      });
    });
  }

  function renderPaymentStep() {
    state.step = "payment";
    const { subtotal, shipping, total } = computeTotals();
    const walletEnabled = payCfg.isWalletPay !== false;
    const walletOk = state.walletBalance >= total;
    const walletLabel = (t("payWithWalletBalance") || t("payWithWallet") || "Wallet")
      .replace("__BALANCE__", formatMoney(state.walletBalance));

    stepsEl.innerHTML = `
      ${renderCheckoutSteps(3)}
      <div class="sq-booking-step sq-product-payment">
        <h3 class="sq-booking-step__label">${escapeHtml(t("productOrderTitle"))}</h3>
        <div class="sq-product-payment-card">
          <div class="sq-product-payment-card__row">
            <span>${escapeHtml(state.product?.productName || "")}</span>
            <span>× ${state.quantity}</span>
          </div>
          <div class="sq-product-summary">
            <div class="sq-product-summary__row"><span>${escapeHtml(t("subtotal"))}</span><span>${formatMoney(subtotal)}</span></div>
            <div class="sq-product-summary__row"><span>${escapeHtml(t("productShipping"))}</span><span>${formatMoney(shipping)}</span></div>
            <div class="sq-product-summary__row sq-product-summary__row--total"><span>${escapeHtml(t("totalLabel"))}</span><span>${formatMoney(total)}</span></div>
          </div>
        </div>
        <p class="sq-booking-step__label">${escapeHtml(t("selectPayment"))}</p>
        ${
          walletEnabled
            ? `<label class="sq-product-pay-option${walletOk ? "" : " sq-product-pay-option--disabled"}">
                <input type="radio" name="productPay" value="wallet" ${walletOk ? "checked" : "disabled"}>
                <span class="sq-product-pay-option__icon" aria-hidden="true">💳</span>
                <span class="sq-product-pay-option__text">
                  <strong>${escapeHtml(walletLabel)}</strong>
                  ${!walletOk ? `<small>${escapeHtml(t("walletInsufficient"))}</small>` : ""}
                </span>
              </label>`
            : `<p class="sq-booking-step__hint">${escapeHtml(t("productWalletDisabled"))}</p>`
        }
        <div class="sq-product-step-actions">
          <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnProductBackAddress">${escapeHtml(t("back"))}</button>
          <button type="button" class="sq-booking-btn" id="btnProductConfirm" ${!walletEnabled || !walletOk ? "disabled" : ""}>
            ${escapeHtml(t("productOrderConfirm"))}
          </button>
        </div>
      </div>
    `;
    if (stickyBar) stickyBar.classList.add("sq-booking-sticky-bar--hidden");

    document.getElementById("btnProductBackAddress")?.addEventListener("click", renderAddressStep);
    document.getElementById("btnProductConfirm")?.addEventListener("click", confirmOrder);
  }

  async function confirmOrder() {
    if (!state.userId || !state.productId) return;
    const { total } = computeTotals();

    const btn = document.getElementById("btnProductConfirm");
    if (btn) {
      btn.disabled = true;
      btn.textContent = t("loading") || t("productLoading");
    }

    try {
      const res = await fetch("/api/public/product/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.userId,
          productId: state.productId,
          productQuantity: state.quantity,
          attributesArray: buildAttributesArray(),
          finalTotal: total,
          type: "withoutcart",
        }),
      });
      const data = await res.json();

      if (!data.status) {
        const msg =
          data.code === "WALLET_INSUFFICIENT"
            ? t("walletInsufficient")
            : data.message || t("productOrderFailed");
        showNotice("error", msg, () => renderPaymentStep());
        return;
      }

      const webUser = getWebUser();
      if (webUser) {
        webUser.amount = Math.max(0, (Number(webUser.amount) || 0) - total);
        setWebUser(webUser);
      }

      sessionStorage.removeItem("skedisy_product_draft");
      sessionStorage.removeItem("skedisy_resume_product");

      renderSuccessStep(data);
    } catch (e) {
      showNotice("error", t("productOrderFailed"), () => renderPaymentStep());
    }
  }

  function renderConnectedBar() {
    const webUser = getWebUser();
    if (!webUser) return;
    state.userId = String(webUser.id);
    state.walletBalance = Number(webUser.amount) || 0;
  }

  function tryResumeProduct() {
    if (sessionStorage.getItem("skedisy_resume_product") !== "1") return;
    sessionStorage.removeItem("skedisy_resume_product");

    const raw = sessionStorage.getItem("skedisy_product_draft");
    if (!raw) return;

    let draft;
    try {
      draft = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (draft.salonId && String(draft.salonId) !== String(cfg.salonId)) return;

    renderConnectedBar();
    refreshWallet();

    if (draft.productId) {
      state.productId = draft.productId;
      state.quantity = draft.quantity || 1;
      state.selectedAttributes = draft.selectedAttributes || {};
      openModal();
      loadProductDetail(draft.productId).then((ok) => {
        if (!ok) return;
        if (state.userId) {
          if (draft.step === "payment") renderPaymentStep();
          else renderAddressStep();
        }
      });
    }
  }

  window.SalonProduct = {
    open(productId) {
      if (!productId) return;
      renderConnectedBar();
      openModal();
      loadProductDetail(productId);
    },
    close: closeModal,
    saveDraft: saveProductDraft,
  };

  document.querySelectorAll(".sq-product-card[data-product-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-product-id");
      if (id) window.SalonProduct.open(id);
    });
  });

  modal?.querySelectorAll("[data-close-product]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  tryResumeProduct();
})();
