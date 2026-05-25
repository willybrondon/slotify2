/**
 * Réservation web sur fiche salon — parcours proche app cliente (guest OTP + cash au salon).
 */
(function () {
  const cfg = window.SKEDISY_SALON_BOOKING;
  if (!cfg) return;

  const state = {
    selectedServiceIds: [],
    expertId: null,
    date: "",
    timeSlots: [],
    userId: null,
    email: "",
    mobile: "",
    matchedServices: [],
    total: 0,
    withoutTax: 0,
    paymentMethod: "cashAfterService",
    couponId: null,
    couponCode: "",
    couponDiscount: 0,
    availableCoupons: [],
    stripeInstance: null,
    stripeElements: null,
    stripePaymentElement: null,
    salonSlotMinutes: 15,
    breakStartTime: "",
    breakEndTime: "",
    slotPickHint: "",
  };

  const payCfg = cfg.payment || {};
  if (payCfg.cashAfterService === false && payCfg.isStripePay) {
    state.paymentMethod = "Stripe";
  }

  function t(key) {
    return cfg.copy[key] || key;
  }

  function tFmt(key, token, value) {
    return String(t(key)).split(token).join(value);
  }

  function parseTime12h(str) {
    const m = String(str || "")
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }

  function formatTime12h(totalMinutes) {
    const dayMin = ((totalMinutes % 1440) + 1440) % 1440;
    let h24 = Math.floor(dayMin / 60);
    const min = dayMin % 60;
    const ap = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ap}`;
  }

  function isBreakTime(slot, breakStart, breakEnd) {
    if (!breakStart || !breakEnd) return false;
    const t = parseTime12h(slot);
    const bs = parseTime12h(breakStart);
    const be = parseTime12h(breakEnd);
    if (t == null || bs == null || be == null) return false;
    return t > bs && t < be;
  }

  /** Même logique que l'app : start + créneaux tous les salonSlotMinutes jusqu'à la durée prestation. */
  function buildSelectedSlotsForDuration(startSlot, serviceDurationMin, salonSlotMinutes) {
    const startMin = parseTime12h(startSlot);
    if (startMin == null || serviceDurationMin <= 0) return [startSlot];

    const interval = Math.max(1, Number(salonSlotMinutes) || 15);
    const targetMin = startMin + serviceDurationMin;
    const slots = [startSlot];
    const iterations = Math.floor((targetMin - startMin) / interval);

    let currentMin = startMin;
    for (let i = 0; i < iterations; i++) {
      currentMin += interval;
      const label = formatTime12h(currentMin);
      if (isBreakTime(label, state.breakStartTime, state.breakEndTime)) {
        continue;
      }
      if (currentMin >= targetMin) break;
      slots.push(label);
    }
    return slots;
  }

  function getServiceDurationMinutes() {
    return calcTotals(getSelectedServices()).dur || 0;
  }

  function markPickedSlots(container) {
    if (!container) return;
    const picked = new Set(state.timeSlots);
    container.querySelectorAll(".sq-slot-btn").forEach((btn) => {
      const time = btn.getAttribute("data-time");
      btn.classList.toggle("sq-slot-btn--picked", picked.has(time));
    });
  }

  const modal = document.getElementById("salonBookingModal");
  const stepsEl = document.getElementById("salonBookingSteps");
  const tabsEl = document.getElementById("salonServiceTabs");
  const gridEl = document.getElementById("salonServicesGrid");
  const expertsRowEl = document.getElementById("salonExpertsRow");
  let activeCategory = "all";

  function $(sel) {
    return modal ? modal.querySelector(sel) : null;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function expertsForServices(serviceIds) {
    if (!serviceIds.length) return cfg.experts;
    return cfg.experts.filter((e) =>
      serviceIds.every((sid) => e.serviceIds.includes(sid))
    );
  }

  function servicesForExpert(expertId) {
    const ex = cfg.experts.find((e) => e.id === expertId);
    if (!ex) return cfg.services;
    return cfg.services.filter((s) => ex.serviceIds.includes(s.id));
  }

  function renderExpertsRow() {
    if (!expertsRowEl) return;
    expertsRowEl.innerHTML = cfg.experts
      .map((ex) => {
        const img = ex.image
          ? `<img src="${escapeHtml(ex.image)}" alt="" class="sq-salon-expert-chip__img">`
          : `<span class="sq-salon-expert-chip__letter">${escapeHtml((ex.name || "?").charAt(0))}</span>`;
        const rating =
          ex.review > 0
            ? `<span class="sq-salon-expert-chip__rating">★ ${ex.review.toFixed(1)}</span>`
            : "";
        return `<button type="button" class="sq-salon-expert-chip" data-expert-id="${escapeHtml(ex.id)}" title="${escapeHtml(ex.name)}">
        <span class="sq-salon-expert-chip__avatar">${img}</span>
        <span class="sq-salon-expert-chip__name">${escapeHtml(ex.name.split(" ")[0])}</span>
        ${rating}
      </button>`;
      })
      .join("");
    expertsRowEl.querySelectorAll("[data-expert-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        SalonBooking.open({ expertId: btn.getAttribute("data-expert-id") });
      });
    });
  }

  function renderServiceTabs() {
    if (!tabsEl) return;
    const tabs = [
      { id: "all", name: cfg.copy.allCategoriesTab },
      ...cfg.categories,
    ];
    tabsEl.innerHTML = tabs
      .map(
        (t) =>
          `<button type="button" class="sq-service-tab${activeCategory === t.id ? " sq-service-tab--active" : ""}" data-cat="${escapeHtml(t.id)}">${escapeHtml(t.name)}</button>`
      )
      .join("");
    tabsEl.querySelectorAll(".sq-service-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-cat");
        renderServiceTabs();
        renderServicesGrid();
      });
    });
  }

  function renderServicesGrid() {
    if (!gridEl) return;
    const list =
      activeCategory === "all"
        ? cfg.services
        : cfg.services.filter((s) => s.categoryId === activeCategory);
    gridEl.innerHTML = list
      .map((s) => {
        const selected = state.selectedServiceIds.includes(s.id);
        return `<button type="button" class="sq-service-card${selected ? " sq-service-card--selected" : ""}" data-service-id="${escapeHtml(s.id)}">
        <span class="sq-service-card__name">${escapeHtml(s.name)}</span>
        <span class="sq-service-card__meta">${escapeHtml(cfg.currency)}${s.price} · ${s.duration} ${cfg.copy.min}</span>
      </button>`;
      })
      .join("");
    gridEl.querySelectorAll(".sq-service-card").forEach((card) => {
      card.addEventListener("click", () => {
        SalonBooking.open({ serviceId: card.getAttribute("data-service-id") });
      });
    });
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

  modal?.querySelectorAll("[data-close-booking]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  async function fetchSlots() {
    const params = new URLSearchParams({
      date: state.date,
      salonId: cfg.salonId,
      expertId: state.expertId,
    });
    const res = await fetch(`/api/public/booking/slots?${params}`);
    return res.json();
  }

  async function fetchExpertsForService() {
    const params = new URLSearchParams({
      serviceId: state.selectedServiceIds.join(","),
      salonId: cfg.salonId,
    });
    const res = await fetch(`/api/public/booking/experts?${params}`);
    return res.json();
  }

  function getSelectedServices() {
    const ids = new Set(state.selectedServiceIds.map(String));
    return cfg.services.filter((s) => ids.has(String(s.id)));
  }

  function calcTotals(serviceList) {
    let sub = 0;
    let dur = 0;
    serviceList.forEach((s) => {
      sub += Number(s.price) || 0;
      dur += Number(s.duration) || 0;
    });
    const taxPct = Number(cfg.tax) || 0;
    const taxAmount = (sub * taxPct) / 100;
    const withTaxNum = parseFloat((taxAmount + sub).toFixed(2));
    const discount = Number(state.couponDiscount) || 0;
    const totalAfter = Math.max(0, withTaxNum - discount);
    state.withoutTax = Number(sub.toFixed(2));
    state.total = Number(totalAfter.toFixed(2));
    state.duration = dur;
    return {
      sub: state.withoutTax,
      tax: Number(taxAmount.toFixed(2)),
      withTax: withTaxNum,
      total: state.total,
      discount,
      dur,
    };
  }

  function buildBookingPayload(userId, totals) {
    const timeStr = state.timeSlots.filter(Boolean).join(",");
    const body = {
      userId: String(userId),
      expertId: String(state.expertId),
      salonId: String(cfg.salonId),
      serviceId: state.selectedServiceIds.map(String).join(","),
      date: state.date,
      time: timeStr,
      amount: totals.total,
      withoutTax: totals.sub,
      duration: totals.dur,
      atPlace: 1,
      paymentType: state.paymentMethod,
    };
    if (state.couponId && state.couponDiscount > 0) {
      body.couponId = String(state.couponId);
    }
    return body;
  }

  function destroyStripeElement() {
    if (state.stripePaymentElement) {
      try {
        state.stripePaymentElement.unmount();
      } catch (e) {
        /* ignore */
      }
    }
    state.stripePaymentElement = null;
    state.stripeElements = null;
  }

  async function loadCouponsForUser(userId) {
    const services = getSelectedServices();
    const sub = services.reduce((a, s) => a + (Number(s.price) || 0), 0);
    if (!userId || sub <= 0) return;
    const params = new URLSearchParams({
      userId: String(userId),
      amount: String(Math.floor(sub)),
      type: "2",
    });
    const res = await fetch(`/api/public/booking/coupons?${params}`);
    const data = await res.json();
    state.availableCoupons = data.status && data.data ? data.data : [];
  }

  async function applyCouponCode(userId) {
    const codeInput = document.getElementById("bkCouponCode");
    const code = (codeInput?.value || state.couponCode || "").trim();
    if (!code) return alert(t("enterCouponCode"));
    const totals = calcTotals(getSelectedServices());
    const res = await fetch("/api/public/booking/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        code,
        amount: totals.sub,
      }),
    });
    const data = await res.json();
    if (!data.status) {
      alert(data.message || t("couponInvalid"));
      return;
    }
    state.couponId = data.coupon?._id;
    state.couponCode = data.coupon?.code || code;
    state.couponDiscount = Number(data.data) || 0;
    destroyStripeElement();
    renderStepPayment();
  }

  function clearCoupon() {
    state.couponId = null;
    state.couponCode = "";
    state.couponDiscount = 0;
    destroyStripeElement();
    renderStepPayment();
  }

  async function createBooking(userId) {
    const totals = calcTotals(getSelectedServices());
    const body = buildBookingPayload(userId, totals);
    const missing = validateBookingPayload(body);
    if (missing.length) {
      alert(tFmt("missingFields", "__LIST__", missing.join(", ")));
      return { ok: false };
    }
    const cr = await fetch("/api/public/booking/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return cr.json();
  }

  async function mountStripePaymentElement(userId) {
    if (typeof Stripe === "undefined") {
      alert(t("stripeNotLoaded"));
      return false;
    }
    const totals = calcTotals(getSelectedServices());
    const intentRes = await fetch("/api/public/booking/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totals.total,
        userId,
        email: state.email,
      }),
    });
    const intentData = await intentRes.json();
    if (!intentData.status || !intentData.clientSecret) {
      alert(intentData.message || t("stripeUnavailable"));
      return false;
    }
    const pk = intentData.publishableKey || payCfg.stripePublishableKey;
    if (!state.stripeInstance) {
      state.stripeInstance = Stripe(pk);
    }
    destroyStripeElement();
    state.stripeElements = state.stripeInstance.elements({
      clientSecret: intentData.clientSecret,
      appearance: { theme: "stripe" },
    });
    state.stripePaymentElement = state.stripeElements.create("payment");
    const mountEl = document.getElementById("sq-stripe-element");
    if (mountEl) {
      mountEl.innerHTML = "";
      state.stripePaymentElement.mount(mountEl);
    }
    return true;
  }

  async function confirmStripePayment(userId) {
    if (!state.stripeInstance || !state.stripeElements) {
      const mounted = await mountStripePaymentElement(userId);
      if (!mounted) return { ok: false };
      alert(t("stripeEnterCard"));
      return { ok: false };
    }
    const { error } = await state.stripeInstance.confirmPayment({
      elements: state.stripeElements,
      confirmParams: {
        receipt_email: state.email || undefined,
      },
      redirect: "if_required",
    });
    if (error) {
      alert(error.message || t("paymentCancelled"));
      return { ok: false };
    }
    return createBooking(userId);
  }

  function validateBookingPayload(payload) {
    const missing = [];
    if (!payload.userId) missing.push(t("missingFieldAccount"));
    if (!payload.expertId) missing.push(t("missingFieldExpert"));
    if (!payload.salonId) missing.push(t("missingFieldSalon"));
    if (!payload.serviceId) missing.push(t("missingFieldService"));
    if (!payload.date) missing.push(t("missingFieldDate"));
    if (!payload.time) missing.push(t("missingFieldSlot"));
    if (!payload.withoutTax || payload.withoutTax <= 0) missing.push(t("missingFieldAmount"));
    if (!payload.amount || payload.amount <= 0) missing.push(t("missingFieldAmountTtc"));
    if (payload.atPlace === undefined || payload.atPlace === null || payload.atPlace === "") {
      missing.push(t("missingFieldPlace"));
    }
    return missing;
  }

  function renderStepServices() {
    const list =
      state.expertId != null
        ? servicesForExpert(state.expertId)
        : cfg.services;
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectServices)}</p>
      <div class="sq-service-tabs sq-service-tabs--modal" id="bookingServiceTabs"></div>
      <div class="sq-services-grid-4" id="bookingServicesGrid"></div>
      <button type="button" class="sq-booking-btn" id="btnServicesNext">${escapeHtml(t("continue"))}</button>
    `;
    const bTabs = document.getElementById("bookingServiceTabs");
    const bGrid = document.getElementById("bookingServicesGrid");
    const cats = [{ id: "all", name: cfg.copy.allCategoriesTab }, ...cfg.categories];
    let cat = "all";
    function paint() {
      bTabs.innerHTML = cats
        .map(
          (t) =>
            `<button type="button" class="sq-service-tab${cat === t.id ? " sq-service-tab--active" : ""}" data-cat="${t.id}">${escapeHtml(t.name)}</button>`
        )
        .join("");
      bTabs.querySelectorAll(".sq-service-tab").forEach((b) => {
        b.onclick = () => {
          cat = b.getAttribute("data-cat");
          paint();
        };
      });
      const filtered =
        cat === "all" ? list : list.filter((s) => s.categoryId === cat);
      bGrid.innerHTML = filtered
        .map((s) => {
          const sel = state.selectedServiceIds.includes(s.id);
          return `<button type="button" class="sq-service-card${sel ? " sq-service-card--selected" : ""}" data-sid="${s.id}">
            <span class="sq-service-card__name">${escapeHtml(s.name)}</span>
            <span class="sq-service-card__meta">${escapeHtml(cfg.currency)}${s.price} · ${s.duration} ${cfg.copy.min}</span>
          </button>`;
        })
        .join("");
      bGrid.querySelectorAll("[data-sid]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-sid");
          state.selectedServiceIds = state.selectedServiceIds.includes(id)
            ? []
            : [id];
          paint();
        };
      });
    }
    paint();
    document.getElementById("btnServicesNext").onclick = () => {
      if (!state.selectedServiceIds.length) return alert(t("selectOneService"));
      renderStepExperts();
    };
  }

  async function renderStepExperts() {
    stepsEl.innerHTML = `<p>${escapeHtml(cfg.copy.selectExpert)}</p><div class="sq-booking-loading">…</div>`;
    const data = await fetchExpertsForService();
    if (!data.status || !data.data?.length) {
      stepsEl.innerHTML = `<p>${escapeHtml(t("noExpertForService"))}</p><button type="button" class="sq-booking-btn" id="btnBackSvc">${escapeHtml(t("back"))}</button>`;
      document.getElementById("btnBackSvc").onclick = renderStepServices;
      return;
    }
    state.matchedServices = data.matchedServices || [];
    if (!state.selectedServiceIds.length && data.matchedServices?.length === 1) {
      const mid = data.matchedServices[0].id?._id || data.matchedServices[0].id;
      if (mid) state.selectedServiceIds = [String(mid)];
    }
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectExpert)}</p>
      <div class="sq-experts-row sq-experts-row--modal" id="bookingExpertsPick"></div>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackSvc">${escapeHtml(t("back"))}</button>
    `;
    const row = document.getElementById("bookingExpertsPick");
    row.innerHTML = data.data
      .map((ex) => {
        const name = `${ex.fname || ""} ${ex.lname || ""}`.trim();
        const img = ex.image
          ? `<img src="${escapeHtml(ex.image)}" alt="" class="sq-salon-expert-chip__img">`
          : `<span class="sq-salon-expert-chip__letter">${name.charAt(0)}</span>`;
        return `<button type="button" class="sq-salon-expert-chip" data-eid="${ex._id}">
          <span class="sq-salon-expert-chip__avatar">${img}</span>
          <span class="sq-salon-expert-chip__name">${escapeHtml(name.split(" ")[0])}</span>
        </button>`;
      })
      .join("");
    row.querySelectorAll("[data-eid]").forEach((btn) => {
      btn.onclick = () => {
        state.expertId = btn.getAttribute("data-eid");
        renderStepDateTime();
      };
    });
    document.getElementById("btnBackSvc").onclick = renderStepServices;
  }

  async function renderStepDateTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().slice(0, 10);
    state.date = state.date || defaultDate;

    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectDateTime)}</p>
      <label class="sq-booking-field">${escapeHtml(t("dateLabel"))} <input type="date" id="bookingDate" value="${state.date}" min="${new Date().toISOString().slice(0, 10)}"></label>
      <div id="slotGroups" class="sq-slot-groups"></div>
      <p id="slotPickHint" class="sq-slot-pick-hint${state.slotPickHint ? "" : " sq-slot-pick-hint--hidden"}">${escapeHtml(state.slotPickHint)}</p>
      <button type="button" class="sq-booking-btn" id="btnDateNext" disabled>${escapeHtml(t("continue"))}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackExp">${escapeHtml(t("back"))}</button>
    `;

    const dateInput = document.getElementById("bookingDate");
    const slotGroups = document.getElementById("slotGroups");
    const slotPickHint = document.getElementById("slotPickHint");
    const btnNext = document.getElementById("btnDateNext");
    let busySlots = new Set();

    function updateSlotHint() {
      if (!slotPickHint) return;
      if (!state.slotPickHint) {
        slotPickHint.classList.add("sq-slot-pick-hint--hidden");
        slotPickHint.textContent = "";
        return;
      }
      slotPickHint.textContent = state.slotPickHint;
      slotPickHint.classList.remove("sq-slot-pick-hint--hidden");
    }

    function selectStartSlot(startSlot) {
      const durationMin = getServiceDurationMinutes();
      const built = buildSelectedSlotsForDuration(
        startSlot,
        durationMin,
        state.salonSlotMinutes
      );
      const blocked = built.find((s) => busySlots.has(s));
      if (blocked) {
        alert(t("slotBusy"));
        state.timeSlots = [];
        state.slotPickHint = "";
        btnNext.disabled = true;
        markPickedSlots(slotGroups);
        updateSlotHint();
        return;
      }
      const expectedLen = Math.max(1, Math.ceil(durationMin / 15));
      if (built.length !== expectedLen) {
        alert(t("slotInvalid"));
        state.timeSlots = [];
        state.slotPickHint = "";
        btnNext.disabled = true;
        markPickedSlots(slotGroups);
        updateSlotHint();
        return;
      }
      state.timeSlots = built;
      const endSlot = built[built.length - 1];
      state.slotPickHint =
        built.length > 1
          ? `${t("slotSelectedRange")} : ${built[0]} → ${endSlot} (${durationMin} ${t("min")})`
          : `${t("slotSelectedRange")} : ${built[0]} (${durationMin} ${t("min")})`;
      markPickedSlots(slotGroups);
      updateSlotHint();
      btnNext.disabled = false;
    }

    async function loadSlots() {
      state.date = dateInput.value;
      state.timeSlots = [];
      state.slotPickHint = "";
      btnNext.disabled = true;
      updateSlotHint();
      slotGroups.innerHTML = escapeHtml(t("loading"));
      const data = await fetchSlots();
      if (!data.status || !data.isOpen) {
        slotGroups.innerHTML = `<p>${escapeHtml(t("slotsClosed"))}</p>`;
        return;
      }
      busySlots = new Set(data.timeSlots || []);
      const st = data.salonTime || {};
      state.salonSlotMinutes = Math.max(1, parseInt(st.time, 10) || 15);
      state.breakStartTime = (st.breakStartTime || "").trim();
      state.breakEndTime = (st.breakEndTime || "").trim();

      const renderGroup = (label, slots) => {
        if (!slots?.length) return "";
        return `<div class="sq-slot-group"><h4>${label}</h4><div class="sq-slot-list">${slots
          .map((slotTime) => {
            const taken = busySlots.has(slotTime);
            return `<button type="button" class="sq-slot-btn${taken ? " sq-slot-btn--busy" : ""}" data-time="${escapeHtml(slotTime)}" ${taken ? "disabled" : ""}>${escapeHtml(slotTime)}</button>`;
          })
          .join("")}</div></div>`;
      };
      slotGroups.innerHTML =
        renderGroup(t("slotMorning"), data.allSlots?.morning) +
        renderGroup(t("slotAfternoon"), data.allSlots?.evening);
      slotGroups.querySelectorAll(".sq-slot-btn:not([disabled])").forEach((btn) => {
        btn.onclick = () => selectStartSlot(btn.getAttribute("data-time"));
      });
    }

    dateInput.onchange = loadSlots;
    document.getElementById("btnBackExp").onclick = renderStepExperts;
    btnNext.onclick = renderStepContact;
    loadSlots();
  }

  function renderPriceBreakdown(totals) {
    let html = `<p>${escapeHtml(cfg.copy.subtotal)} : ${escapeHtml(cfg.currency)}${totals.sub.toFixed(2)}</p>`;
    if (totals.tax > 0) {
      html += `<p>${escapeHtml(cfg.copy.taxLabel)} : ${escapeHtml(cfg.currency)}${totals.tax.toFixed(2)}</p>`;
    }
    if (totals.discount > 0) {
      html += `<p class="sq-booking-summary__discount">${escapeHtml(cfg.copy.discount)} : −${escapeHtml(cfg.currency)}${totals.discount.toFixed(2)}</p>`;
    }
    html += `<p class="sq-booking-summary__total"><strong>${escapeHtml(cfg.copy.totalLabel)} : ${escapeHtml(cfg.currency)}${totals.total.toFixed(2)}</strong></p>`;
    return html;
  }

  function renderStepContact() {
    const totals = calcTotals(getSelectedServices());
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.yourDetails)}</p>
      <div class="sq-booking-summary">
        <p><strong>${escapeHtml(cfg.salonName)}</strong></p>
        <p>${escapeHtml(state.date)} · ${escapeHtml(state.timeSlots.join(", "))}</p>
        ${renderPriceBreakdown(totals)}
      </div>
      <label class="sq-booking-field">${escapeHtml(t("emailLabel"))} <input type="email" id="bkEmail" value="${escapeHtml(state.email)}" required></label>
      <label class="sq-booking-field">${escapeHtml(t("phoneLabel"))} <input type="tel" id="bkMobile" value="${escapeHtml(state.mobile)}" required></label>
      <label class="sq-booking-field">${escapeHtml(t("otpLabel"))} <input type="text" id="bkOtp" inputmode="numeric" maxlength="6" placeholder="${escapeHtml(t("otpPlaceholder"))}"></label>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnSendOtp">${escapeHtml(t("sendOtp"))}</button>
      <button type="button" class="sq-booking-btn" id="btnToPayment">${escapeHtml(t("continue"))}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackDate">${escapeHtml(t("back"))}</button>
    `;
    document.getElementById("btnSendOtp").onclick = async () => {
      state.email = document.getElementById("bkEmail").value.trim();
      state.mobile = document.getElementById("bkMobile").value.trim();
      const res = await fetch("/api/public/guest/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, mobile: state.mobile }),
      });
      const data = await res.json();
      alert(data.message || (data.status ? t("otpSent") : t("genericError")));
    };
    document.getElementById("btnBackDate").onclick = renderStepDateTime;
    document.getElementById("btnToPayment").onclick = async () => {
      state.email = document.getElementById("bkEmail").value.trim();
      state.mobile = document.getElementById("bkMobile").value.trim();
      const otp = document.getElementById("bkOtp").value.trim();
      if (!state.email || !state.mobile) {
        alert(t("emailPhoneRequired"));
        return;
      }
      if (!otp) {
        alert(t("enterOtp"));
        return;
      }
      const v = await fetch("/api/public/guest/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, mobile: state.mobile, otp }),
      });
      const vd = await v.json();
      const userId = vd.user?._id || vd.user?.id;
      if (!vd.status || !userId) {
        alert(vd.message || t("verifyFailed"));
        return;
      }
      state.userId = userId;
      await loadCouponsForUser(userId);
      renderStepPayment();
    };
  }

  function renderStepPayment() {
    const totals = calcTotals(getSelectedServices());
    const showCash = payCfg.cashAfterService !== false;
    const showStripe = payCfg.isStripePay && payCfg.stripePublishableKey;

    const couponList =
      state.availableCoupons.length > 0
        ? `<div class="sq-coupon-list">${state.availableCoupons
            .map(
              (c) =>
                `<button type="button" class="sq-coupon-pick" data-code="${escapeHtml(c.code)}">${escapeHtml(c.code)}${c.title ? ` — ${escapeHtml(c.title)}` : ""}</button>`
            )
            .join("")}</div>`
        : "";

    const appliedCoupon =
      state.couponDiscount > 0
        ? `<p class="sq-coupon-applied">${escapeHtml(cfg.copy.couponApplied)} : <strong>${escapeHtml(state.couponCode)}</strong> (−${escapeHtml(cfg.currency)}${state.couponDiscount.toFixed(2)}) <button type="button" class="sq-coupon-remove" id="btnRemoveCoupon">${escapeHtml(cfg.copy.removeCoupon)}</button></p>`
        : "";

    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.paymentTitle)}</p>
      <div class="sq-booking-summary">${renderPriceBreakdown(totals)}</div>
      <div class="sq-coupon-block">
        <label class="sq-booking-field">${escapeHtml(cfg.copy.couponCode)}
          <div class="sq-coupon-row">
            <input type="text" id="bkCouponCode" class="sq-coupon-row__input" value="${escapeHtml(state.couponCode)}" placeholder="${escapeHtml(t("couponPlaceholder"))}" autocomplete="off" spellcheck="false">
            <button type="button" class="sq-booking-btn sq-booking-btn--ghost sq-coupon-row__btn" id="btnApplyCoupon">${escapeHtml(cfg.copy.applyCoupon)}</button>
          </div>
        </label>
        ${couponList}
        ${appliedCoupon}
      </div>
      <p class="sq-booking-step__label">${escapeHtml(cfg.copy.selectPayment)}</p>
      <div class="sq-payment-methods">
        ${showCash ? `<label class="sq-payment-option"><input type="radio" name="payMethod" value="cashAfterService" ${state.paymentMethod === "cashAfterService" ? "checked" : ""}> <span>${escapeHtml(cfg.copy.payAtSalon)}</span></label>` : ""}
        ${showStripe ? `<label class="sq-payment-option"><input type="radio" name="payMethod" value="Stripe" ${state.paymentMethod === "Stripe" ? "checked" : ""}> <span>${escapeHtml(cfg.copy.payWithStripe)}</span></label>` : ""}
      </div>
      <div id="sq-stripe-wrap" class="sq-stripe-wrap${state.paymentMethod === "Stripe" ? "" : " sq-stripe-wrap--hidden"}">
        <p class="sq-stripe-hint">${escapeHtml(cfg.copy.stripeSecure)}</p>
        <div id="sq-stripe-element"></div>
      </div>
      <button type="button" class="sq-booking-btn" id="btnConfirm">${escapeHtml(cfg.copy.confirmBooking)}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackContact">${escapeHtml(t("back"))}</button>
    `;

    stepsEl.querySelectorAll('input[name="payMethod"]').forEach((radio) => {
      radio.onchange = async () => {
        state.paymentMethod = radio.value;
        destroyStripeElement();
        const wrap = document.getElementById("sq-stripe-wrap");
        if (wrap) {
          wrap.classList.toggle("sq-stripe-wrap--hidden", state.paymentMethod !== "Stripe");
        }
        if (state.paymentMethod === "Stripe" && state.userId) {
          await mountStripePaymentElement(state.userId);
        }
      };
    });

    stepsEl.querySelectorAll(".sq-coupon-pick").forEach((btn) => {
      btn.onclick = () => {
        const inp = document.getElementById("bkCouponCode");
        if (inp) inp.value = btn.getAttribute("data-code");
        applyCouponCode(state.userId);
      };
    });

    document.getElementById("btnApplyCoupon")?.addEventListener("click", () =>
      applyCouponCode(state.userId)
    );
    document.getElementById("btnRemoveCoupon")?.addEventListener("click", clearCoupon);
    document.getElementById("btnBackContact").onclick = renderStepContact;

    document.getElementById("btnConfirm").onclick = async () => {
      const userId = state.userId;
      if (!userId) {
        alert(t("sessionExpired"));
        renderStepContact();
        return;
      }

      const btn = document.getElementById("btnConfirm");
      btn.disabled = true;
      btn.textContent = "…";

      let result;
      if (state.paymentMethod === "Stripe") {
        result = await confirmStripePayment(userId);
      } else {
        result = await createBooking(userId);
      }

      btn.disabled = false;
      btn.textContent = cfg.copy.confirmBooking;

      if (result?.status) {
        destroyStripeElement();
        stepsEl.innerHTML = `<p class="sq-booking-success">${escapeHtml(cfg.copy.bookingSuccess)}</p>`;
      } else if (result) {
        alert(result.message || t("bookingFailed"));
      }
    };

    if (state.paymentMethod === "Stripe" && showStripe && state.userId) {
      const wrap = document.getElementById("sq-stripe-wrap");
      if (wrap) wrap.classList.remove("sq-stripe-wrap--hidden");
      mountStripePaymentElement(state.userId);
    }
  }

  window.SalonBooking = {
    open(opts = {}) {
      state.selectedServiceIds = opts.serviceId ? [opts.serviceId] : [];
      state.expertId = opts.expertId || null;
      state.date = "";
      state.timeSlots = [];
      state.slotPickHint = "";
      state.userId = null;
      state.couponId = null;
      state.couponCode = "";
      state.couponDiscount = 0;
      destroyStripeElement();
      openModal();
      if (state.expertId && !state.selectedServiceIds.length) {
        renderStepServices();
      } else if (state.selectedServiceIds.length) {
        renderStepExperts();
      } else {
        renderStepServices();
      }
    },
    close: closeModal,
  };

  renderExpertsRow();
  renderServiceTabs();
  renderServicesGrid();
})();
