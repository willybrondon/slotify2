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
    calendarYear: null,
    calendarMonth: null,
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

  /**
   * Affiche un message dans la modale (succès / erreur / info), comme la confirmation finale.
   * @param {"success"|"error"|"info"} type
   * @param {string} message
   * @param {(() => void)|null} [onContinue] — si fourni, bouton pour reprendre le parcours
   */
  function getWebUser() {
    try {
      const raw = sessionStorage.getItem("skedisy_web_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearWebUser() {
    sessionStorage.removeItem("skedisy_web_user");
  }

  function saveBookingDraft() {
    sessionStorage.setItem(
      "skedisy_booking_draft",
      JSON.stringify({
        salonId: cfg.salonId,
        selectedServiceIds: state.selectedServiceIds,
        expertId: state.expertId,
        date: state.date,
        timeSlots: state.timeSlots,
        slotPickHint: state.slotPickHint,
        couponId: state.couponId,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      })
    );
  }

  function bindAuthNavLinks(root) {
    if (!root) return;
    root.querySelectorAll("[data-auth-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        saveBookingDraft();
        window.location.href = a.getAttribute("href");
      });
    });
  }

  function showBookingNotice(type, message, onContinue) {
    if (!stepsEl) return;
    const typeClass =
      type === "success" ? "success" : type === "error" ? "error" : "info";
    const btnHtml = onContinue
      ? `<button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBookingNotice">${escapeHtml(t("noticeContinue"))}</button>`
      : "";
    stepsEl.innerHTML = `
      <div class="sq-booking-notice sq-booking-notice--${typeClass}">
        <p class="sq-booking-notice__message">${escapeHtml(message)}</p>
        ${btnHtml}
      </div>
    `;
    const btn = document.getElementById("btnBookingNotice");
    if (btn && onContinue) {
      btn.onclick = () => onContinue();
    }
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
      const isPicked = picked.has(time);
      btn.classList.toggle("sq-slot-btn--picked", isPicked);
      btn.classList.toggle(
        "sq-slot-btn--unavailable",
        btn.classList.contains("sq-slot-btn--past") ||
          btn.classList.contains("sq-slot-btn--booked")
      );
    });
  }

  const localeTag = cfg.language === "en" ? "en-GB" : "fr-FR";

  function parseDateYmd(str) {
    const [y, m, d] = String(str || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function formatDateYmd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatMonthYear(year, monthIndex) {
    const d = new Date(year, monthIndex, 1);
    return d.toLocaleDateString(localeTag, { month: "long", year: "numeric" });
  }

  function formatWeekdayShort(date) {
    return date.toLocaleDateString(localeTag, { weekday: "short" }).replace(/\.$/, "");
  }

  function todayYmd() {
    return formatDateYmd(new Date());
  }

  function isDateBeforeToday(ymd) {
    return ymd < todayYmd();
  }

  function slotDateTime(ymd, slotTime) {
    const base = parseDateYmd(ymd);
    const mins = parseTime12h(slotTime);
    if (!base || mins == null) return null;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), Math.floor(mins / 60), mins % 60);
  }

  function isSlotPassed(ymd, slotTime) {
    const slotDt = slotDateTime(ymd, slotTime);
    if (!slotDt) return false;
    const now = new Date();
    const dayStart = parseDateYmd(ymd);
    if (!dayStart) return false;
    const todayStart = parseDateYmd(todayYmd());
    if (dayStart < todayStart) return true;
    if (formatDateYmd(dayStart) === todayYmd()) {
      return slotDt.getTime() <= now.getTime();
    }
    return false;
  }

  function getSlotStatus(slotTime) {
    if (busySlotsRef.has(slotTime)) return "booked";
    if (isSlotPassed(state.date, slotTime)) return "past";
    return "available";
  }

  let busySlotsRef = new Set();

  function initCalendarFromStateDate() {
    const base = parseDateYmd(state.date) || new Date();
    state.calendarYear = base.getFullYear();
    state.calendarMonth = base.getMonth();
  }

  function renderCalendarDays(container, onDayChange) {
    if (!container) return;
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayYmd();
    let html = "";
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const ymd = formatDateYmd(d);
      const disabled = isDateBeforeToday(ymd);
      const isSelected = state.date === ymd;
      const isToday = ymd === today;
      html += `<button type="button" class="sq-cal-day${isSelected ? " sq-cal-day--active" : ""}${isToday ? " sq-cal-day--today" : ""}${disabled ? " sq-cal-day--disabled" : ""}" data-ymd="${ymd}" ${disabled ? "disabled" : ""}>
        <span class="sq-cal-day__wd">${escapeHtml(formatWeekdayShort(d))}</span>
        <span class="sq-cal-day__num">${day}</span>
      </button>`;
    }
    container.innerHTML = html;
    container.querySelectorAll(".sq-cal-day:not([disabled])").forEach((btn) => {
      btn.onclick = () => {
        state.date = btn.getAttribute("data-ymd");
        renderCalendarDays(container, onDayChange);
        if (onDayChange) onDayChange();
      };
    });
  }

  function renderSlotGrid(slots, groupEl, onPick) {
    if (!slots?.length) {
      groupEl.innerHTML = "";
      return;
    }
    groupEl.innerHTML = `<div class="sq-slot-grid">${slots
      .map((slotTime) => {
        const status = getSlotStatus(slotTime);
        const picked = state.timeSlots.includes(slotTime);
        const cls = [
          "sq-slot-btn",
          status === "past" ? "sq-slot-btn--past" : "",
          status === "booked" ? "sq-slot-btn--booked" : "",
          status === "available" ? "sq-slot-btn--available" : "",
          picked ? "sq-slot-btn--picked" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const disabled = status !== "available";
        return `<button type="button" class="${cls}" data-time="${escapeHtml(slotTime)}" ${disabled ? "disabled" : ""}><span class="sq-slot-btn__label">${escapeHtml(slotTime)}</span></button>`;
      })
      .join("")}</div>`;

    if (onPick) {
      groupEl.querySelectorAll(".sq-slot-btn:not([disabled])").forEach((btn) => {
        btn.onclick = () => onPick(btn.getAttribute("data-time"));
      });
    }
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
    if (!code) {
      showBookingNotice("error", t("enterCouponCode"), () => renderStepPayment());
      return;
    }
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
      showBookingNotice("error", data.message || t("couponInvalid"), () =>
        renderStepPayment()
      );
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
      showBookingNotice(
        "error",
        tFmt("missingFields", "__LIST__", missing.join(", ")),
        () => renderStepPayment()
      );
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
      showBookingNotice("error", t("stripeNotLoaded"), () => renderStepPayment());
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
      showBookingNotice(
        "error",
        intentData.message || t("stripeUnavailable"),
        () => renderStepPayment()
      );
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
      showBookingNotice("info", t("stripeEnterCard"), () => renderStepPayment());
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
      showBookingNotice(
        "error",
        error.message || t("paymentCancelled"),
        () => renderStepPayment()
      );
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
      if (!state.selectedServiceIds.length) {
        showBookingNotice("error", t("selectOneService"), () => renderStepServices());
        return;
      }
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
    if (!state.date || isDateBeforeToday(state.date)) {
      state.date = todayYmd();
    }
    initCalendarFromStateDate();

    const monthLabel = formatMonthYear(state.calendarYear, state.calendarMonth);
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectDateTime)}</p>
      <section class="sq-booking-calendar" aria-label="${escapeHtml(t("selectDate"))}">
        <p class="sq-booking-calendar__label">${escapeHtml(t("selectDate"))}</p>
        <div class="sq-booking-calendar__header">
          <button type="button" class="sq-cal-nav" id="calPrevMonth" aria-label="${escapeHtml(t("monthPrev"))}">‹</button>
          <span class="sq-booking-calendar__month" id="calMonthLabel">${escapeHtml(monthLabel)}</span>
          <button type="button" class="sq-cal-nav" id="calNextMonth" aria-label="${escapeHtml(t("monthNext"))}">›</button>
        </div>
        <div class="sq-booking-calendar__days" id="bookingCalendarDays"></div>
      </section>
      <h3 class="sq-booking-slots-title">${escapeHtml(t("availableSlots"))}</h3>
      <div id="slotGroups" class="sq-slot-groups"></div>
      <p id="slotPickHint" class="sq-slot-pick-hint${state.slotPickHint ? "" : " sq-slot-pick-hint--hidden"}">${escapeHtml(state.slotPickHint)}</p>
      <button type="button" class="sq-booking-btn" id="btnDateNext" disabled>${escapeHtml(t("continue"))}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackExp">${escapeHtml(t("back"))}</button>
    `;

    const daysEl = document.getElementById("bookingCalendarDays");
    const monthLabelEl = document.getElementById("calMonthLabel");
    const slotGroups = document.getElementById("slotGroups");
    const slotPickHint = document.getElementById("slotPickHint");
    const btnNext = document.getElementById("btnDateNext");

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

    function refreshMonthUi() {
      if (monthLabelEl) {
        monthLabelEl.textContent = formatMonthYear(state.calendarYear, state.calendarMonth);
      }
      renderCalendarDays(daysEl, loadSlots);
    }

    function selectStartSlot(startSlot) {
      const durationMin = getServiceDurationMinutes();
      const built = buildSelectedSlotsForDuration(
        startSlot,
        durationMin,
        state.salonSlotMinutes
      );
      const blocked = built.find(
        (s) => busySlotsRef.has(s) || isSlotPassed(state.date, s)
      );
      if (blocked) {
        showBookingNotice("error", t("slotBusy"), () => renderStepDateTime());
        return;
      }
      const expectedLen = Math.max(1, Math.ceil(durationMin / 15));
      if (built.length !== expectedLen) {
        showBookingNotice("error", t("slotInvalid"), () => renderStepDateTime());
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
      if (!state.date || isDateBeforeToday(state.date)) {
        state.date = todayYmd();
        refreshMonthUi();
      }
      state.timeSlots = [];
      state.slotPickHint = "";
      btnNext.disabled = true;
      updateSlotHint();
      slotGroups.innerHTML = `<p class="sq-booking-loading">${escapeHtml(t("loading"))}</p>`;
      const data = await fetchSlots();
      if (!data.status || !data.isOpen) {
        slotGroups.innerHTML = `<p>${escapeHtml(t("slotsClosed"))}</p>`;
        return;
      }
      busySlotsRef = new Set(data.timeSlots || []);
      const st = data.salonTime || {};
      state.salonSlotMinutes = Math.max(1, parseInt(st.time, 10) || 15);
      state.breakStartTime = (st.breakStartTime || "").trim();
      state.breakEndTime = (st.breakEndTime || "").trim();

      let morning = data.allSlots?.morning || [];
      let evening = data.allSlots?.evening || [];
      if (evening.length > 1) evening = evening.slice(1);

      slotGroups.innerHTML = "";
      if (morning.length) {
        const wrap = document.createElement("div");
        wrap.className = "sq-slot-group";
        wrap.innerHTML = `<h4 class="sq-slot-group__title">${escapeHtml(t("slotMorning"))}</h4>`;
        const gridHost = document.createElement("div");
        wrap.appendChild(gridHost);
        slotGroups.appendChild(wrap);
        renderSlotGrid(morning, gridHost, selectStartSlot);
      }
      if (evening.length) {
        const wrap = document.createElement("div");
        wrap.className = "sq-slot-group";
        wrap.innerHTML = `<h4 class="sq-slot-group__title">${escapeHtml(t("slotAfternoon"))}</h4>`;
        const gridHost = document.createElement("div");
        wrap.appendChild(gridHost);
        slotGroups.appendChild(wrap);
        renderSlotGrid(evening, gridHost, selectStartSlot);
      }
      if (!morning.length && !evening.length) {
        slotGroups.innerHTML = `<p>${escapeHtml(t("slotsClosed"))}</p>`;
      } else {
        markPickedSlots(slotGroups);
      }
    }

    const prevBtn = document.getElementById("calPrevMonth");
    const nextBtn = document.getElementById("calNextMonth");
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (state.calendarMonth === 0) {
          state.calendarMonth = 11;
          state.calendarYear -= 1;
        } else {
          state.calendarMonth -= 1;
        }
        const lastOfMonth = formatDateYmd(
          new Date(state.calendarYear, state.calendarMonth + 1, 0)
        );
        if (lastOfMonth < todayYmd()) return;
        const firstOfMonth = formatDateYmd(
          new Date(state.calendarYear, state.calendarMonth, 1)
        );
        if (state.date < firstOfMonth || state.date > lastOfMonth) {
          state.date = firstOfMonth >= todayYmd() ? firstOfMonth : todayYmd();
        }
        refreshMonthUi();
        loadSlots();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (state.calendarMonth === 11) {
          state.calendarMonth = 0;
          state.calendarYear += 1;
        } else {
          state.calendarMonth += 1;
        }
        const firstOfMonth = formatDateYmd(
          new Date(state.calendarYear, state.calendarMonth, 1)
        );
        const lastOfMonth = formatDateYmd(
          new Date(state.calendarYear, state.calendarMonth + 1, 0)
        );
        if (state.date < firstOfMonth || state.date > lastOfMonth) {
          state.date = firstOfMonth;
        }
        refreshMonthUi();
        loadSlots();
      };
    }

    document.getElementById("btnBackExp").onclick = renderStepExperts;
    btnNext.onclick = renderStepContact;
    refreshMonthUi();
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
    const webUser = getWebUser();
    const auth = cfg.authUrls || {};
    const loginHref = auth.login || "/compte/connexion";
    const signupHref = auth.signup || "/compte/inscription";

    if (webUser) {
      state.userId = String(webUser.id);
      state.email = webUser.email || "";
      state.mobile = webUser.mobile || "";
      const displayName =
        [webUser.fname, webUser.lname].filter(Boolean).join(" ").trim() ||
        webUser.email;
      stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(t("bookAsGuest"))}</p>
      <div class="sq-booking-summary">
        <p><strong>${escapeHtml(cfg.salonName)}</strong></p>
        <p>${escapeHtml(state.date)} · ${escapeHtml(state.timeSlots.join(", "))}</p>
        ${renderPriceBreakdown(totals)}
      </div>
      <p class="sq-booking-connected">${escapeHtml(t("connectedAs"))} <strong>${escapeHtml(displayName)}</strong></p>
      <button type="button" class="sq-booking-btn" id="btnToPayment">${escapeHtml(t("continue"))}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnAuthSwitch">${escapeHtml(t("authUseOtherAccount"))}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackDate">${escapeHtml(t("back"))}</button>
    `;
      document.getElementById("btnToPayment").onclick = async () => {
        await loadCouponsForUser(state.userId);
        renderStepPayment();
      };
      document.getElementById("btnAuthSwitch").onclick = () => {
        clearWebUser();
        state.userId = null;
        renderStepContact();
      };
      document.getElementById("btnBackDate").onclick = renderStepDateTime;
      return;
    }

    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(t("bookAsGuest"))}</p>
      <p class="sq-booking-auth-prompt">
        ${escapeHtml(t("alreadyHaveAccount"))}
        <a href="${escapeHtml(loginHref)}" class="sq-booking-auth-link" data-auth-nav="login">${escapeHtml(t("authSignInLink"))}</a>
        ${escapeHtml(t("authOr"))}
        <a href="${escapeHtml(signupHref)}" class="sq-booking-auth-link" data-auth-nav="signup">${escapeHtml(t("authSignUpLink"))}</a>
      </p>
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
    bindAuthNavLinks(stepsEl);
    document.getElementById("btnSendOtp").onclick = async () => {
      state.email = document.getElementById("bkEmail").value.trim();
      state.mobile = document.getElementById("bkMobile").value.trim();
      const res = await fetch("/api/public/guest/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, mobile: state.mobile }),
      });
      const data = await res.json();
      const otpMsg = data.message || (data.status ? t("otpSent") : t("genericError"));
      showBookingNotice(data.status ? "info" : "error", otpMsg, () =>
        renderStepContact()
      );
    };
    document.getElementById("btnBackDate").onclick = renderStepDateTime;
    document.getElementById("btnToPayment").onclick = async () => {
      state.email = document.getElementById("bkEmail").value.trim();
      state.mobile = document.getElementById("bkMobile").value.trim();
      const otp = document.getElementById("bkOtp").value.trim();
      if (!state.email || !state.mobile) {
        showBookingNotice("error", t("emailPhoneRequired"), () =>
          renderStepContact()
        );
        return;
      }
      if (!otp) {
        showBookingNotice("error", t("enterOtp"), () => renderStepContact());
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
        showBookingNotice("error", vd.message || t("verifyFailed"), () =>
          renderStepContact()
        );
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
        showBookingNotice("error", t("sessionExpired"), () => renderStepContact());
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
        showBookingNotice("success", cfg.copy.bookingSuccess);
      } else if (result) {
        showBookingNotice(
          "error",
          result.message || t("bookingFailed"),
          () => renderStepPayment()
        );
      }
    };

    if (state.paymentMethod === "Stripe" && showStripe && state.userId) {
      const wrap = document.getElementById("sq-stripe-wrap");
      if (wrap) wrap.classList.remove("sq-stripe-wrap--hidden");
      mountStripePaymentElement(state.userId);
    }
  }

  function tryResumeBooking() {
    if (sessionStorage.getItem("skedisy_resume_booking") !== "1") return;
    sessionStorage.removeItem("skedisy_resume_booking");
    const raw = sessionStorage.getItem("skedisy_booking_draft");
    if (!raw) return;
    let draft;
    try {
      draft = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (String(draft.salonId) !== String(cfg.salonId)) return;

    state.selectedServiceIds = draft.selectedServiceIds || [];
    state.expertId = draft.expertId || null;
    state.date = draft.date || "";
    state.timeSlots = draft.timeSlots || [];
    state.slotPickHint = draft.slotPickHint || "";
    state.couponId = draft.couponId || null;
    state.couponCode = draft.couponCode || "";
    state.couponDiscount = draft.couponDiscount || 0;

    const webUser = getWebUser();
    if (webUser) {
      state.userId = String(webUser.id);
      state.email = webUser.email || "";
      state.mobile = webUser.mobile || "";
    } else {
      state.userId = null;
    }

    destroyStripeElement();
    openModal();

    if (state.userId) {
      loadCouponsForUser(state.userId).then(() => renderStepPayment());
    } else if (state.expertId && state.date && state.timeSlots.length) {
      renderStepContact();
    } else if (state.expertId && state.selectedServiceIds.length) {
      renderStepDateTime();
    } else if (state.selectedServiceIds.length) {
      renderStepExperts();
    } else {
      renderStepServices();
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
    saveDraft: saveBookingDraft,
  };

  renderExpertsRow();
  renderServiceTabs();
  renderServicesGrid();
  tryResumeBooking();
})();
