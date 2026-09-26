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
    /** Ouverture depuis une puce « Notre équipe » : expert déjà choisi. */
    bookingFromExpert: false,
    /** Retour depuis l’étape expert pour ajouter des prestations. */
    returnToExpertStep: false,
    walletBalance: 0,
    /** Afro project flow (inline dans le tunnel classique). */
    afroByServiceId: {},
    afroMetaLoaded: false,
    afroAnswers: {},
    policyAccepted: false,
    policyAcceptText: "",
    afroPhotoUrls: [],
    afroDemand: null,
    afroConfigServiceId: null,
    afroSkipPrecision: false,
    afroPrecisionFormOpen: false,
    manageReschedule: null,
    loyaltyDiscount: 0,
    loyaltyPercent: 0,
    loyaltyLabel: "",
    applyLoyalty: false,
    clientHistory: [],
    /** Produits cochés sur la fiche presta (ids) */
    selectedProductIds: [],
    /** Sélections inline par prestation sur la page salon */
    pageSvcDraft: {},
  };

  const payCfg = { ...(cfg.payment || {}) };

  async function refreshPaymentSettings() {
    try {
      const params = new URLSearchParams();
      if (state.userId) params.set("userId", String(state.userId));
      const qs = params.toString();
      const res = await fetch(
        `/api/public/booking/payment-settings${qs ? `?${qs}` : ""}`
      );
      const data = await res.json();
      if (data.status && data.settings) {
        Object.assign(payCfg, data.settings);
        if (data.walletBalance != null) {
          state.walletBalance = Number(data.walletBalance) || 0;
        }
        syncDefaultPaymentMethod();
        return true;
      }
    } catch (e) {
      console.warn("[salon-booking] payment settings refresh failed", e);
    }
    return false;
  }

  function getAvailablePaymentMethods() {
    const list = [];
    if (payCfg.cashAfterService !== false && cfg.salonAcceptsCash !== false) {
      list.push({ value: "cashAfterService", label: cfg.copy.payAtSalon });
    }
    if (
      payCfg.isStripePay &&
      payCfg.stripePublishableKey &&
      cfg.salonAcceptsStripe !== false
    ) {
      list.push({ value: "Stripe", label: cfg.copy.payWithStripe });
    }
    if (payCfg.isWalletPay) {
      const bal = Number(state.walletBalance) || 0;
      const tpl = cfg.copy.payWithWalletBalance || cfg.copy.payWithWallet || "Wallet";
      const label = tpl.includes("__BALANCE__")
        ? tpl.replace("__BALANCE__", `${cfg.currency}${bal.toFixed(2)}`)
        : tpl;
      list.push({ value: "wallet", label });
    }
    return list;
  }

  function syncDefaultPaymentMethod() {
    const available = getAvailablePaymentMethods();
    if (!available.some((m) => m.value === state.paymentMethod)) {
      state.paymentMethod = available[0]?.value || "cashAfterService";
    }
  }

  syncDefaultPaymentMethod();

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
        bookingFromExpert: state.bookingFromExpert,
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
    // Aligné backend / generateTimeSlots : pause = [breakStart, breakEnd)
    return t >= bs && t < be;
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
      if (currentMin >= targetMin) break;
      const label = formatTime12h(currentMin);
      // Ne pas sauter la pause : un RDV ne peut pas traverser la coupure
      if (isBreakTime(label, state.breakStartTime, state.breakEndTime)) {
        return slots;
      }
      slots.push(label);
    }
    return slots;
  }

  function getServiceDurationMinutes() {
    return calcTotals(getSelectedServices()).dur || 0;
  }

  function afroEnabled() {
    return Boolean(cfg.afroProjectFlowEnabled);
  }

  function getAfroMeta(serviceId) {
    return state.afroByServiceId[normalizeServiceId(serviceId)] || null;
  }

  function getPrimaryProjectService() {
    for (const sid of state.selectedServiceIds) {
      const meta = getAfroMeta(sid);
      if (meta && meta.usesProjectFlow) {
        const svc = cfg.services.find(
          (s) => normalizeServiceId(s.id) === normalizeServiceId(sid)
        );
        return { id: normalizeServiceId(sid), service: svc, meta };
      }
    }
    return null;
  }

  function getServiceDepositPercent(svc) {
    if (!svc) return 0;
    const card = svc.detailCard || {};
    const pct =
      card.depositPercent != null
        ? Number(card.depositPercent)
        : svc.depositPercent != null
          ? Number(svc.depositPercent)
          : 0;
    return Number.isFinite(pct) && pct > 0 ? Math.min(100, pct) : 0;
  }

  /** First selected service that needs an acompte (or project flow primary). */
  function getDemandTargetService() {
    const project = getPrimaryProjectService();
    if (project) return project;
    for (const sid of state.selectedServiceIds) {
      const svc = cfg.services.find(
        (s) => normalizeServiceId(s.id) === normalizeServiceId(sid)
      );
      if (getServiceDepositPercent(svc) > 0) {
        return {
          id: normalizeServiceId(sid),
          service: svc,
          meta: getAfroMeta(sid) || {},
        };
      }
    }
    return null;
  }

  function selectedNeedsDeposit() {
    // Online deposit requires Stripe Connect — otherwise book pay-at-salon only
    if (cfg.salonAcceptsStripe === false) return false;
    if (demandNeedsDeposit(state.afroDemand)) return true;
    if (Number(state.afroDemand?.depositAmount) > 0) {
      return state.afroDemand.depositStatus === "unpaid";
    }
    return getSelectedServices().some((s) => getServiceDepositPercent(s) > 0);
  }

  async function ensureAfroDemandForDeposit() {
    // No online deposit / devis create when salon has no Stripe Connect
    if (cfg.salonAcceptsStripe === false) return null;
    if (state.afroDemand && Number(state.afroDemand.depositAmount) > 0) {
      return state.afroDemand;
    }
    if (!selectedNeedsDeposit()) return null;
    const answers = {
      ...(state.afroAnswers && typeof state.afroAnswers === "object"
        ? state.afroAnswers
        : {}),
      _skipPrecision: true,
    };
    return createAfroDemandFromAnswers(answers, state.afroPhotoUrls || [], {
      skipPrecision: true,
    });
  }

  function clearAfroQuote() {
    state.afroAnswers = {};
    state.afroPhotoUrls = [];
    state.afroDemand = null;
    state.afroConfigServiceId = null;
    state.afroSkipPrecision = false;
    state.afroPrecisionFormOpen = false;
  }

  function hasAcceptedAfroQuote() {
    const primary = getPrimaryProjectService();
    if (!primary) return true;
    if (state.afroSkipPrecision) return true;
    if (!state.afroDemand) return false;
    if (normalizeServiceId(state.afroConfigServiceId) !== primary.id) return false;
    // Estimation soft : même en review salon, on laisse finir la résa (pending).
    return true;
  }

  function needsAfroConfigStep() {
    // Plus d’étape « précisions / devis » dans le tunnel — options sur la fiche presta
    return false;
  }

  /**
   * Rebuild options / products from currently selected service drafts only.
   * Deselect must drop that service's addons/products from cart totals.
   */
  function applyPageDraftsToBookingState() {
    if (!state.selectedServiceIds.length) {
      state.afroAnswers = {};
      state.selectedProductIds = [];
      state.afroConfigServiceId = null;
      state.afroDemand = null;
      state.afroSkipPrecision = false;
      state.afroPrecisionFormOpen = false;
      return;
    }

    const addons = new Set();
    const productIds = new Set();

    state.selectedServiceIds.forEach((sid) => {
      const draft = state.pageSvcDraft?.[normalizeServiceId(sid)];
      if (!draft) return;
      (draft.addons || []).forEach((id) => addons.add(String(id)));
      (draft.productIds || []).forEach((pid) => productIds.add(String(pid)));
    });

    const answers = {};
    if (addons.size) answers.addons = Array.from(addons);
    if (productIds.size) answers.selectedProductIds = Array.from(productIds);

    state.afroAnswers = answers;
    state.selectedProductIds = Array.from(productIds);
    // Demand/deposit may still target one primary — never collapse multi-select.
    state.afroConfigServiceId = normalizeServiceId(state.selectedServiceIds[0]);
    state.afroSkipPrecision = true;
    state.afroPrecisionFormOpen = false;
    // Invalidate stale demand when selection changes (recomputed at payment if needed)
    state.afroDemand = null;
  }

  async function loadAfroMeta() {
    if (!afroEnabled() || state.afroMetaLoaded) return;
    try {
      const res = await fetch(
        `/api/public/demand/services?salonId=${encodeURIComponent(cfg.salonId)}`
      );
      const data = await res.json();
      if (!data.status || !data.afroProjectFlowEnabled) {
        state.afroMetaLoaded = true;
        return;
      }
      const map = {};
      (data.services || []).forEach((s) => {
        map[normalizeServiceId(s.serviceId)] = s;
      });
      state.afroByServiceId = map;
      state.afroMetaLoaded = true;
    } catch (e) {
      console.warn("[salon-booking] afro meta load failed", e);
      state.afroMetaLoaded = true;
    }
  }

  function channelHintFromReferrer() {
    const ref = String(document.referrer || "");
    if (/instagram/i.test(ref)) return "instagram";
    if (/facebook|fb\.com/i.test(ref)) return "facebook";
    if (/google/i.test(ref)) return "google";
    if (/wa\.me|whatsapp/i.test(ref)) return "whatsapp";
    return "other";
  }

  function demandNeedsDeposit(demand) {
    if (!demand) return false;
    const amount = Number(demand.depositAmount) || 0;
    if (amount <= 0) return false;
    const st = demand.depositStatus;
    return st !== "paid" && st !== "waived" && st !== "not_required";
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
    // Keep selected day in view (not stuck on day 1)
    const active = container.querySelector(".sq-cal-day--active");
    if (active && typeof active.scrollIntoView === "function") {
      requestAnimationFrame(() => {
        active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      });
    }
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
  const stickyBarEl = document.getElementById("salonBookingStickyBar");
  const stickyMobileBtn = document.getElementById("salonStickyBookingBtn");
  const tabsEl = document.getElementById("salonServiceTabs");
  const gridEl = document.getElementById("salonServicesGrid");
  const expertsRowEl = document.getElementById("salonExpertsRow");
  const servicesSummaryEl = document.getElementById("salonServicesSummary");
  const asideSummaryEl = document.getElementById("salonBookingAsideSummary");
  let activeCategory = "all";

  function setModalBack(handler) {
    const btn = document.getElementById("bookingModalBack");
    if (!btn) return;
    btn.onclick = null;
    if (typeof handler === "function") {
      btn.hidden = false;
      btn.onclick = (e) => {
        e.preventDefault();
        handler();
      };
    } else {
      btn.hidden = true;
    }
  }

  function setModalTitle(text) {
    const el = document.getElementById("bookingModalTitle");
    if (el) el.textContent = text || t("bookNow");
  }

  function formatDisplayDate(ymd) {
    const d = parseDateYmd(ymd);
    if (!d) return ymd || "";
    return d.toLocaleDateString(localeTag, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  function $(sel) {
    return modal ? modal.querySelector(sel) : null;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function normalizeServiceId(id) {
    return String(id == null ? "" : id).trim();
  }

  function toMoneyNumber(v) {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v ?? "")
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  function isServiceSelected(id) {
    const sid = normalizeServiceId(id);
    if (!sid) return false;
    return state.selectedServiceIds.some((x) => normalizeServiceId(x) === sid);
  }

  /** Sélection multiple comme l'app : clic = ajouter/retirer une prestation. */
  function toggleServiceSelection(id) {
    const sid = normalizeServiceId(id);
    if (!sid) return;
    if (isServiceSelected(sid)) {
      state.selectedServiceIds = state.selectedServiceIds.filter(
        (x) => normalizeServiceId(x) !== sid
      );
    } else {
      state.selectedServiceIds = [...state.selectedServiceIds, sid];
    }
    // Keep cart totals / sticky count in sync with selection
    applyPageDraftsToBookingState();
    if (
      state.afroConfigServiceId &&
      state.selectedServiceIds.length &&
      !state.selectedServiceIds.some(
        (x) => normalizeServiceId(x) === normalizeServiceId(state.afroConfigServiceId)
      )
    ) {
      state.afroConfigServiceId = normalizeServiceId(state.selectedServiceIds[0]);
      state.afroDemand = null;
    }
  }

  function formatDurationLabel(minutes) {
    const m = Math.max(0, Number(minutes) || 0);
    if (m <= 0) return "";
    if (m < 60) return `${m} ${t("min")}`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (!rem) return `${h}h`;
    return `${h}h${String(rem).padStart(2, "0")}`;
  }

  function buildServiceCardHtml(s) {
    const selected = isServiceSelected(s.id);
    const check = selected
      ? `<span class="sq-service-card__check" aria-hidden="true"><i class="fas fa-check-circle"></i></span>`
      : "";
    const stateLabel = selected
      ? t("serviceTapToDeselect")
      : t("serviceTapToSelect");
    const afro = getAfroMeta(s.id);
    const projectBadge = "";
    const baseDur = Number(afro?.baseDuration || s.duration) || Number(s.duration) || 0;
    const maxDur = afro && afro.usesProjectFlow ? Math.round(baseDur * 1.6) : baseDur;
    const durationInfo =
      afro && afro.usesProjectFlow && baseDur > 0
        ? `<span class="sq-service-card__info">${escapeHtml(
            t("afroServiceInfoDuration")
              .split("__MIN__")
              .join(String(baseDur))
              .split("__MAX__")
              .join(String(maxDur))
          )}</span>`
        : "";
    // Même carte prestation : prix catalogue ; durée indicative si règles salon
    const priceLabel =
      afro && afro.usesProjectFlow
        ? `${escapeHtml(t("afroFromPrice"))} ${escapeHtml(cfg.currency)}${s.price}`
        : `${escapeHtml(cfg.currency)}${s.price} · ${s.duration} ${escapeHtml(cfg.copy.min)}`;
    return `<button type="button" class="sq-service-card${selected ? " sq-service-card--selected" : ""}" data-service-id="${escapeHtml(s.id)}" aria-pressed="${selected ? "true" : "false"}">
        ${check}
        <span class="sq-service-card__name">${escapeHtml(s.name)}${projectBadge}</span>
        <span class="sq-service-card__meta">${priceLabel}</span>
        ${durationInfo}
        <span class="sq-service-card__state${selected ? " sq-service-card__state--selected" : ""}">${escapeHtml(stateLabel)}</span>
      </button>`;
  }

  function listHtml(items, prefix) {
    if (!items || !items.length) return "";
    return `<ul>${items
      .map((x) => `<li>${escapeHtml(prefix || "")}${escapeHtml(x)}</li>`)
      .join("")}</ul>`;
  }

  function getServiceAddonCatalog(s) {
    const card = s?.detailCard || {};
    const fromCard = Array.isArray(card.addons) ? card.addons : [];
    if (fromCard.length) return fromCard;
    const afro = getAfroMeta(s?.id);
    return Array.isArray(afro?.addonDefs) ? afro.addonDefs : [];
  }

  function getPageSvcDraft(serviceId) {
    const sid = normalizeServiceId(serviceId);
    if (!state.pageSvcDraft[sid]) {
      state.pageSvcDraft[sid] = {
        addons: [],
        productIds: [],
        photoFile: null,
        photoPreview: "",
      };
    }
    return state.pageSvcDraft[sid];
  }

  function estimateServiceLiveTotals(s, draft) {
    const afro = getAfroMeta(s.id);
    let price = toMoneyNumber(s.price);
    let dur =
      toMoneyNumber(afro?.baseDuration) > 0
        ? toMoneyNumber(afro.baseDuration)
        : toMoneyNumber(s.duration);
    dur += Math.max(0, toMoneyNumber(afro?.prepBufferMinutes));
    const catalog = getServiceAddonCatalog(s);
    const chosen = new Set((draft?.addons || []).map(String));
    catalog.forEach((a) => {
      if (!chosen.has(String(a.id || a._id))) return;
      price += toMoneyNumber(a.addPrice);
      dur += toMoneyNumber(a.addMinutes);
    });
    (draft?.productIds || []).forEach((pid) => {
      const p = (s.recommendedProducts || []).find(
        (x) => String(x.id) === String(pid)
      );
      if (p && !p.isOutOfStock) price += toMoneyNumber(p.price);
    });
    return { price, dur };
  }

  function updateServiceCardLiveTotals(row) {
    if (!row) return;
    const sid = row.getAttribute("data-service-id");
    const s = cfg.services.find(
      (x) => normalizeServiceId(x.id) === normalizeServiceId(sid)
    );
    if (!s) return;
    const draft = getPageSvcDraft(sid);
    const live = estimateServiceLiveTotals(s, draft);
    const priceEl = row.querySelector("[data-svc-live-price]");
    const durEl = row.querySelector("[data-svc-live-dur]");
    if (priceEl) {
      priceEl.textContent = `${cfg.currency}${Number(live.price).toFixed(0)}`;
    }
    if (durEl) {
      durEl.textContent = formatDurationLabel(live.dur) || "—";
    }
  }

  function buildSalonPageServiceCardHtml(s, opts = {}) {
    const card = s.detailCard || {};
    const afro = getAfroMeta(s.id);
    const draft = getPageSvcDraft(s.id);
    const live = estimateServiceLiveTotals(s, draft);
    const durLabel = formatDurationLabel(live.dur);
    const priceNum = Number(live.price) || 0;
    const priceStr = `${escapeHtml(cfg.currency)}${priceNum.toFixed(0)}`;
    const metaLine = [durLabel, priceStr].filter(Boolean).join(" · ");
    const selected = isServiceSelected(s.id);
    const svcReview = Number(s.review) || 0;
    const svcReviewCount = Number(s.reviewCount) || 0;
    const ratingBadge =
      svcReview > 0
        ? `<div class="sq-svc-row__rating rating-badge"><span class="rating-stars" aria-hidden="true">⭐</span><span>${svcReview.toFixed(1)} (${svcReviewCount} ${escapeHtml(
            t("reviewsCount")
          )})</span></div>`
        : "";
    const shortDesc = String(card.shortDescription || "").trim();
    const includes = Array.isArray(card.includes) ? card.includes : [];
    const prepMust = Array.isArray(card.prepMust) ? card.prepMust : [];
    const prepAvoid = Array.isArray(card.prepAvoid) ? card.prepAvoid : [];
    const addons = getServiceAddonCatalog(s);
    const depositPct =
      card.depositPercent != null
        ? Number(card.depositPercent)
        : s.depositPercent != null
          ? Number(s.depositPercent)
          : null;
    const depositAmt =
      depositPct != null && depositPct > 0
        ? Math.round((priceNum * depositPct) / 100)
        : null;

    const includesBlock = includes.length
      ? `<div class="sq-svc-block"><p class="sq-svc-block__title">✨ ${escapeHtml(
          t("serviceIncludesTitle")
        )}</p><div class="sq-svc-chips">${includes
          .map((x) => `<span class="sq-svc-chip">${escapeHtml(x)}</span>`)
          .join("")}</div></div>`
      : "";

    const prepBlock =
      prepMust.length || prepAvoid.length
        ? `<div class="sq-svc-block"><p class="sq-svc-block__title">📋 ${escapeHtml(
            t("servicePrepTitle")
          )}</p><div class="sq-svc-prep">${
            prepMust.length
              ? `<div><strong>${escapeHtml(t("servicePrepMust"))}</strong>${listHtml(
                  prepMust,
                  "☑ "
                )}</div>`
              : ""
          }${
            prepAvoid.length
              ? `<div><strong>${escapeHtml(t("servicePrepAvoid"))}</strong>${listHtml(
                  prepAvoid,
                  "❌ "
                )}</div>`
              : ""
          }</div></div>`
        : "";

    const inspirationBlock = card.inspirationPhotoEnabled
      ? `<div class="sq-svc-block">
          <p class="sq-svc-block__title">📸 ${escapeHtml(
            t("serviceInspirationTitle")
          )}</p>
          <p class="sq-svc-row__desc" style="-webkit-line-clamp:unset;display:block">${escapeHtml(
            t("serviceInspirationHint")
          )}</p>
          <label class="sq-svc-inspire-upload">
            <input type="file" accept="image/*" capture="environment" data-svc-inspire-file hidden />
            <span class="sq-svc-inspire-upload__btn" data-svc-inspire-label>${escapeHtml(
              draft.photoPreview
                ? t("serviceInspirationChange")
                : t("serviceInspirationUpload")
            )}</span>
          </label>
          <div class="sq-svc-inspire-preview${
            draft.photoPreview ? "" : " sq-svc-inspire-preview--hidden"
          }" data-svc-inspire-preview>
            ${
              draft.photoPreview
                ? `<img src="${escapeHtml(
                    draft.photoPreview
                  )}" alt="" class="sq-svc-inspire-preview__img" />`
                : ""
            }
          </div>
        </div>`
      : "";

    const selectedAddons = new Set((draft.addons || []).map(String));
    const addonsBlock = addons.length
      ? `<div class="sq-svc-block"><p class="sq-svc-block__title">➕ ${escapeHtml(
          t("serviceAddonsTitle")
        )}</p><div class="sq-svc-addons">${addons
          .map((a, i) => {
            const id = String(a.id || a._id || `addon_${i + 1}`);
            const addP = Number(a.addPrice) || 0;
            const addM = Number(a.addMinutes) || 0;
            const bits = [];
            if (addP) bits.push(`+${escapeHtml(cfg.currency)}${addP}`);
            if (addM) bits.push(`+${formatDurationLabel(addM)}`);
            const checked = selectedAddons.has(id) ? "checked" : "";
            return `<label class="sq-svc-addon sq-svc-addon--check">
              <input type="checkbox" data-svc-addon="${escapeHtml(
                id
              )}" ${checked} />
              <span>${escapeHtml(a.label || id)}${
              bits.length ? ` · ${bits.join(" · ")}` : ""
            }</span>
            </label>`;
          })
          .join("")}</div></div>`
      : "";

    const recProducts = Array.isArray(s.recommendedProducts)
      ? s.recommendedProducts
      : [];
    const selectedProducts = new Set((draft.productIds || []).map(String));
    const productsBlock = recProducts.length
      ? `<div class="sq-svc-block"><p class="sq-svc-block__title">🛍️ ${escapeHtml(
          t("serviceProductsTitle")
        )}</p><div class="sq-svc-products">${recProducts
          .map((p) => {
            const oos = Boolean(p.isOutOfStock);
            const pid = String(p.id);
            const img = p.image
              ? `<img src="${escapeHtml(p.image)}" alt="" class="sq-svc-product__img" loading="lazy">`
              : `<span class="sq-svc-product__ph">${escapeHtml(
                  (p.name || "?").charAt(0)
                )}</span>`;
            const checked = selectedProducts.has(pid) ? "checked" : "";
            return `<label class="sq-svc-product${oos ? " is-oos" : ""}">
              <div class="sq-svc-product__thumb">${img}</div>
              <div class="sq-svc-product__body">
                <span class="sq-svc-product__name">${escapeHtml(p.name || "")}</span>
                <span class="sq-svc-product__price">${escapeHtml(cfg.currency)}${
              Number(p.price) || 0
            }</span>
              </div>
              ${
                oos
                  ? `<span class="sq-svc-product__oos">${escapeHtml(
                      t("serviceProductOutOfStock")
                    )}</span>`
                  : `<span class="sq-svc-product__check"><input type="checkbox" data-svc-product="${escapeHtml(
                      pid
                    )}" ${checked} /><span>${escapeHtml(
                      t("serviceProductSelect")
                    )}</span></span>`
              }
            </label>`;
          })
          .join("")}</div></div>`
      : "";

    const statsBlock = `<div class="sq-svc-stats">
        <div class="sq-svc-stat"><strong>⏱️ ${escapeHtml(
          t("serviceDurationTitle")
        )}</strong><span data-svc-live-dur>${escapeHtml(
      durLabel || "—"
    )}</span></div>
        <div class="sq-svc-stat"><strong>💰 ${escapeHtml(
          t("serviceLiveTotal") || t("servicePriceTitle")
        )}</strong><span data-svc-live-price>${priceStr}</span></div>
        ${
          depositAmt != null
            ? `<div class="sq-svc-stat"><strong>🔐 ${escapeHtml(
                t("serviceDepositTitle")
              )}</strong>${escapeHtml(cfg.currency)}${depositAmt}</div>`
            : ""
        }
      </div>`;

    const noteBlock = card.importantNote
      ? `<div class="sq-svc-note">⚠️ ${escapeHtml(card.importantNote)}</div>`
      : "";

    // Page + modal: + / check like customer app (bold name only when selected)
    const actionAttr = "data-svc-select";
    const actionHtml = selected
      ? `<i class="fas fa-check-circle" aria-hidden="true"></i><span class="sq-sr-only">${escapeHtml(
          t("serviceRemoveFromSelection") || "Retirer"
        )}</span>`
      : `<i class="fas fa-plus-circle" aria-hidden="true"></i><span class="sq-sr-only">${escapeHtml(
          t("serviceAddToSelection") || "Ajouter"
        )}</span>`;
    const selectedBadge = selected
      ? `<span class="sq-svc-row__selected-badge">${escapeHtml(
          t("serviceSelectedBadge") || "Sélectionnée"
        )}</span>`
      : "";

    return `<article class="sq-svc-row${
      selected ? " is-selected" : ""
    }${opts.forceOpen ? " is-open" : ""}" data-service-id="${escapeHtml(String(s.id))}">
      <button type="button" class="sq-svc-row__head" data-svc-toggle aria-expanded="${
        opts.forceOpen ? "true" : "false"
      }">
        <div class="sq-svc-row__main">
          <div class="sq-svc-row__top">
            <span class="sq-svc-row__name-wrap">
              <span class="sq-svc-row__name">${escapeHtml(s.name)}</span>
              ${selectedBadge}
            </span>
            <span class="sq-svc-row__meta">${metaLine}</span>
          </div>
          ${ratingBadge}
          ${
            shortDesc
              ? `<p class="sq-svc-row__desc">${escapeHtml(shortDesc)}</p>`
              : ""
          }
        </div>
        <span class="sq-svc-row__chevron" aria-hidden="true">›</span>
      </button>
      <div class="sq-svc-row__panel">
        ${includesBlock}
        ${prepBlock}
        ${addonsBlock}
        ${productsBlock}
        ${inspirationBlock}
        ${statsBlock}
        ${noteBlock}
        <div class="sq-svc-row__actions">
          <button type="button" class="sq-svc-row__book sq-svc-row__book--icon${
            selected ? " sq-svc-row__book--selected" : ""
          }" ${actionAttr} aria-label="${escapeHtml(
      selected
        ? t("serviceRemoveFromSelection") || "Retirer"
        : t("serviceAddToSelection") || "Ajouter"
    )}">${actionHtml}</button>
        </div>
      </div>
    </article>`;
  }

  function bindServiceCardClicks(rootEl, onAfterToggle) {
    if (!rootEl) return;
    rootEl.querySelectorAll(".sq-service-card[data-service-id]").forEach((card) => {
      card.addEventListener("click", () => {
        toggleServiceSelection(card.getAttribute("data-service-id"));
        if (typeof onAfterToggle === "function") onAfterToggle();
      });
    });
  }

  function bindSalonPageServiceCards(rootEl, opts = {}) {
    if (!rootEl) return;
    const mode = opts.mode === "modal" ? "modal" : "page";
    const onSelectionChange =
      typeof opts.onSelectionChange === "function"
        ? opts.onSelectionChange
        : mode === "page"
          ? () => handleSalonPageServiceSelection()
          : null;
    const onToggleOpen =
      typeof opts.onToggleOpen === "function" ? opts.onToggleOpen : null;
    rootEl.querySelectorAll(".sq-svc-row").forEach((row) => {
      const toggle = row.querySelector("[data-svc-toggle]");
      const selectBtn = row.querySelector("[data-svc-select]");
      const sid = row.getAttribute("data-service-id");
      if (toggle) {
        toggle.addEventListener("click", () => {
          const open = row.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          if (onToggleOpen) onToggleOpen(sid, open);
        });
      }

      const syncDraftFromDom = () => {
        const draft = getPageSvcDraft(sid);
        draft.addons = Array.from(
          row.querySelectorAll("[data-svc-addon]:checked")
        ).map((el) => String(el.getAttribute("data-svc-addon")));
        draft.productIds = Array.from(
          row.querySelectorAll("[data-svc-product]:checked")
        ).map((el) => String(el.getAttribute("data-svc-product")));
        updateServiceCardLiveTotals(row);
      };

      row.querySelectorAll("[data-svc-addon], [data-svc-product]").forEach((el) => {
        el.addEventListener("click", (e) => e.stopPropagation());
        el.addEventListener("change", (e) => {
          e.stopPropagation();
          syncDraftFromDom();
          if (isServiceSelected(sid)) {
            applyPageDraftsToBookingState();
            renderSalonPageSelectionUI();
            if (isModalOpen()) renderServicesStickyBar();
          }
        });
      });

      const fileInput = row.querySelector("[data-svc-inspire-file]");
      const previewEl = row.querySelector("[data-svc-inspire-preview]");
      const labelEl = row.querySelector("[data-svc-inspire-label]");
      fileInput?.addEventListener("click", (e) => e.stopPropagation());
      fileInput?.addEventListener("change", (e) => {
        e.stopPropagation();
        const draft = getPageSvcDraft(sid);
        const file = fileInput.files && fileInput.files[0];
        if (draft.photoPreview) {
          try {
            URL.revokeObjectURL(draft.photoPreview);
          } catch (err) {
            /* ignore */
          }
        }
        if (!file || !file.type.startsWith("image/")) {
          draft.photoFile = null;
          draft.photoPreview = "";
          if (previewEl) {
            previewEl.innerHTML = "";
            previewEl.classList.add("sq-svc-inspire-preview--hidden");
          }
          if (labelEl) labelEl.textContent = t("serviceInspirationUpload");
          return;
        }
        draft.photoFile = file;
        draft.photoPreview = URL.createObjectURL(file);
        if (previewEl) {
          previewEl.innerHTML = `<img src="${draft.photoPreview}" alt="" class="sq-svc-inspire-preview__img" />`;
          previewEl.classList.remove("sq-svc-inspire-preview--hidden");
        }
        if (labelEl) labelEl.textContent = t("serviceInspirationChange");
      });

      if (selectBtn) {
        selectBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          syncDraftFromDom();
          const wasSelected = isServiceSelected(sid);
          toggleServiceSelection(sid);
          if (!wasSelected) {
            applyPageDraftsToBookingState();
            const draft = getPageSvcDraft(sid);
            if (draft.photoFile) {
              try {
                selectBtn.disabled = true;
                const url = await uploadAfroInspirationPhoto(draft.photoFile);
                state.afroPhotoUrls = Array.from(
                  new Set([...(state.afroPhotoUrls || []), String(url)])
                );
              } catch (err) {
                console.warn("[svc-select-photo]", err);
              } finally {
                selectBtn.disabled = false;
              }
            }
          } else {
            applyPageDraftsToBookingState();
          }
          // Page: stay on salon detail so user can add another service;
          // refresh badges + summed price/duration. Modal only if already open.
          if (mode === "page") {
            renderServicesGrid();
            handleSalonPageServiceSelection();
            return;
          }
          applyPageDraftsToBookingState();
          if (onSelectionChange) onSelectionChange(sid);
        });
      }
    });
  }

  function initSalonMosaic() {
    const root = document.querySelector(".sq-salon-detail__mosaic");
    if (!root || root.classList.contains("sq-salon-detail__mosaic--placeholder")) return;
    const shots = Array.from(root.querySelectorAll(".sq-salon-detail__mosaic-shot"));
    if (shots.length <= 1) return;
    let index = 0;
    const dots = Array.from(root.querySelectorAll("[data-mosaic-dot]"));
    const setIndex = (i) => {
      index = (i + shots.length) % shots.length;
      shots.forEach((el, n) => el.classList.toggle("is-active", n === index));
      dots.forEach((el, n) => el.classList.toggle("is-active", n === index));
    };
    shots.forEach((el, n) => {
      el.addEventListener("click", () => setIndex(n));
    });
    root.querySelector("[data-mosaic-prev]")?.addEventListener("click", (e) => {
      e.preventDefault();
      setIndex(index - 1);
    });
    root.querySelector("[data-mosaic-next]")?.addEventListener("click", (e) => {
      e.preventDefault();
      setIndex(index + 1);
    });
    dots.forEach((el) => {
      el.addEventListener("click", () => {
        const n = Number(el.getAttribute("data-mosaic-dot"));
        if (!Number.isNaN(n)) setIndex(n);
      });
    });
  }

  function isModalOpen() {
    return Boolean(modal?.classList.contains("sq-booking-modal--open"));
  }

  function hideBookingStickyBar() {
    if (!stickyBarEl) return;
    stickyBarEl.innerHTML = "";
    stickyBarEl.classList.add("sq-booking-sticky-bar--hidden");
  }

  function continueFromServices() {
    if (!state.selectedServiceIds.length) {
      showBookingNotice("error", t("selectOneService"), () => renderStepServices());
      return;
    }
    hideBookingStickyBar();
    applyPageDraftsToBookingState();
    afterServicesContinue();
  }

  function renderServicesStickyBar() {
    if (!stickyBarEl) return;
    const selected = getSelectedServices();
    if (!selected.length || !isModalOpen()) {
      hideBookingStickyBar();
      return;
    }
    const totals = calcTotals(selected);
    const names = selected.map((s) => s.name).join(", ");
    const taxLine =
      totals.tax > 0
        ? `<p class="sq-booking-sticky-bar__tax">${escapeHtml(cfg.currency)}${totals.tax.toFixed(2)} ${escapeHtml(cfg.copy.taxLabel || t("tax"))}</p>`
        : "";
    stickyBarEl.classList.remove("sq-booking-sticky-bar--hidden");
    stickyBarEl.innerHTML = `
      <div class="sq-booking-sticky-bar__inner">
        <div class="sq-booking-sticky-bar__info">
          <p class="sq-booking-sticky-bar__count">${escapeHtml(
            tFmt("servicesSelectedCount", "{n}", String(selected.length))
          )}</p>
          <p class="sq-booking-sticky-bar__names">${escapeHtml(names)}</p>
          <p class="sq-booking-sticky-bar__meta">${escapeHtml(cfg.currency)}${totals.sub.toFixed(2)} · ${totals.dur} ${escapeHtml(t("min"))}</p>
          ${taxLine}
        </div>
        <button type="button" class="sq-booking-sticky-bar__cta" id="stickyBarContinue">${escapeHtml(t("continue"))}</button>
      </div>
    `;
    const btn = document.getElementById("stickyBarContinue");
    if (btn) btn.onclick = continueFromServices;
  }

  function openBookingForSelection() {
    applyPageDraftsToBookingState();
    openModal();
    // Skip redundant "services again" step → go straight to expert
    if (state.selectedServiceIds.length) {
      afterServicesContinue();
      return;
    }
    renderStepServices();
    if (stepsEl) stepsEl.scrollTop = 0;
  }

  /**
   * Salon detail page: multi-select stays on the page (StyleSeat).
   * Modal opens only when the user taps Réserver / sticky Continuer.
   */
  function handleSalonPageServiceSelection() {
    renderSalonPageSelectionUI();
    if (isModalOpen()) {
      if (state.selectedServiceIds.length > 0) {
        renderServicesStickyBar();
      } else {
        hideBookingStickyBar();
        renderStepServices();
      }
      return;
    }
    // Stay on salon detail: show summed récap (mobile: scroll to list summary)
    if (
      state.selectedServiceIds.length &&
      servicesSummaryEl &&
      window.innerWidth <= 968
    ) {
      servicesSummaryEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function updateBookButtons() {
    const selected = getSelectedServices();
    const count = selected.length;
    const totals = count ? calcTotals(selected) : null;
    const bookLabel =
      count > 0
        ? tFmt("bookNowWithCount", "{n}", String(count))
        : t("bookNow");
    const stickyLabel = count > 0 ? t("continue") : t("bookNow");
    const metaText =
      totals && count > 0
        ? `${cfg.currency}${totals.sub.toFixed(2)} · ${totals.dur} ${t("min")}`
        : "";

    document.querySelectorAll(".open-app-btn").forEach((btn) => {
      const labelEl = btn.querySelector(".open-app-btn__label");
      const metaEl = btn.querySelector(".open-app-btn__meta");
      if (labelEl) {
        labelEl.innerHTML = `<i class="fas fa-calendar-check"></i> ${escapeHtml(bookLabel)}`;
      } else {
        const icon = btn.querySelector("i");
        if (icon) {
          btn.innerHTML = `${icon.outerHTML} ${escapeHtml(bookLabel)}`;
        } else {
          btn.textContent = bookLabel;
        }
      }
      if (metaEl) {
        if (metaText) {
          metaEl.hidden = false;
          metaEl.textContent = metaText;
        } else {
          metaEl.hidden = true;
          metaEl.textContent = "";
        }
      }
    });

    // Dedicated aside meta (in case structure differs)
    const asideMeta = document.getElementById("salonAsideBookMeta");
    if (asideMeta) {
      if (metaText) {
        asideMeta.hidden = false;
        asideMeta.textContent = metaText;
      } else {
        asideMeta.hidden = true;
        asideMeta.textContent = "";
      }
    }

    document.querySelectorAll(".sticky-booking-btn button").forEach((btn) => {
      const icon = btn.querySelector("i");
      if (icon) {
        btn.innerHTML = `${icon.outerHTML} ${escapeHtml(stickyLabel)}`;
      } else {
        btn.textContent = stickyLabel;
      }
    });
    // Mobile + desktop sticky: show summed price + duration when selecting
    const stickyBar = document.getElementById("salonStickyBookingBar");
    if (stickyBar) {
      stickyBar.classList.toggle("sticky-booking-btn--active", count > 0);
      let sumEl = document.getElementById("salonStickyBookingSummary");
      if (!sumEl) {
        sumEl = document.createElement("div");
        sumEl.id = "salonStickyBookingSummary";
        sumEl.className = "sticky-booking-btn__summary";
        stickyBar.insertBefore(sumEl, stickyBar.firstChild);
      }
      if (totals && count > 0) {
        const names = selected.map((s) => s.name).join(", ");
        sumEl.hidden = false;
        sumEl.innerHTML = `
          <p class="sticky-booking-btn__count">${escapeHtml(
            tFmt("servicesSelectedCount", "{n}", String(count))
          )}</p>
          <p class="sticky-booking-btn__names">${escapeHtml(names)}</p>
          <p class="sticky-booking-btn__meta">${escapeHtml(metaText)}</p>
        `;
      } else {
        sumEl.hidden = true;
        sumEl.innerHTML = "";
      }
    }
  }

  function renderSalonPageSelectionUI() {
    renderServicesSelectionSummary(servicesSummaryEl);
    renderServicesSelectionSummary(asideSummaryEl);
    updateBookButtons();
  }

  function expertsForServices(serviceIds) {
    if (!serviceIds.length) return cfg.experts;
    const wanted = serviceIds.map(normalizeServiceId);
    return cfg.experts.filter((e) => {
      const expertServices = (e.serviceIds || []).map(normalizeServiceId);
      return wanted.every((sid) => expertServices.includes(sid));
    });
  }

  function renderServicesSelectionSummary(hostEl) {
    if (!hostEl) return;
    const selected = getSelectedServices();
    if (!selected.length) {
      hostEl.innerHTML = "";
      hostEl.classList.add("sq-booking-services-summary--hidden");
      return;
    }
    const totals = calcTotals(selected);
    const names = selected.map((s) => s.name).join(", ");
    hostEl.classList.remove("sq-booking-services-summary--hidden");
    hostEl.innerHTML = `
      <p class="sq-booking-services-summary__count">${escapeHtml(
        tFmt("servicesSelectedCount", "{n}", String(selected.length))
      )}</p>
      <p class="sq-booking-services-summary__names">${escapeHtml(names)}</p>
      <p class="sq-booking-services-summary__meta">${escapeHtml(cfg.currency)}${totals.sub.toFixed(2)} · ${totals.dur} ${escapeHtml(t("min"))}</p>
      ${totals.tax > 0 ? `<p class="sq-booking-services-summary__tax">${escapeHtml(cfg.currency)}${totals.tax.toFixed(2)} ${escapeHtml(cfg.copy.taxLabel || t("tax"))}</p>` : ""}
    `;
  }

  function getExpertById(expertId) {
    return cfg.experts.find((e) => String(e.id) === String(expertId));
  }

  function servicesForExpert(expertId) {
    const ex = getExpertById(expertId);
    if (!ex) return cfg.services;
    const allowed = new Set((ex.serviceIds || []).map(normalizeServiceId));
    return cfg.services.filter((s) => allowed.has(normalizeServiceId(s.id)));
  }

  function afterServicesContinue() {
    if (state.bookingFromExpert && state.expertId) {
      renderStepDateTime();
      return;
    }
    if (state.returnToExpertStep) {
      state.returnToExpertStep = false;
      renderStepExperts();
      return;
    }
    renderStepExperts();
  }

  function backFromDateTime() {
    if (state.bookingFromExpert && state.expertId) {
      renderStepServices();
      return;
    }
    renderStepExperts();
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
    // Keep only panels the user opened — do NOT auto-expand selected
    // (keeps card heights equal while multi-selecting)
    const openIds = new Set();
    gridEl.querySelectorAll(".sq-svc-row.is-open").forEach((row) => {
      const id = normalizeServiceId(row.getAttribute("data-service-id"));
      if (id) openIds.add(id);
    });
    const list =
      activeCategory === "all"
        ? cfg.services
        : cfg.services.filter((s) => s.categoryId === activeCategory);
    const scrollTop = gridEl.scrollTop;
    gridEl.innerHTML = list
      .map((s) =>
        buildSalonPageServiceCardHtml(s, {
          forceOpen: openIds.has(normalizeServiceId(s.id)),
        })
      )
      .join("");
    bindSalonPageServiceCards(gridEl, {
      onToggleOpen: () => {},
    });
    renderSalonPageSelectionUI();
    gridEl.scrollTop = scrollTop;
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("sq-booking-modal--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setModalTitle(t("bookNow"));
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("sq-booking-modal--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    hideBookingStickyBar();
    setModalBack(null);
    setModalTitle(t("bookNow"));
    renderServicesGrid();
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
    const byId = new Map();
    (cfg.services || []).forEach((s) => {
      const id = normalizeServiceId(s.id || s._id);
      if (id) byId.set(id, s);
    });
    // Preserve selection order so totals / names stay stable
    return state.selectedServiceIds
      .map((id) => byId.get(normalizeServiceId(id)))
      .filter(Boolean);
  }

  function calcTotals(serviceList) {
    let sub = 0;
    let dur = 0;
    const list = Array.isArray(serviceList) ? serviceList : [];
    // Sum every selected service (catalogue + per-service options only)
    list.forEach((s) => {
      const sid = normalizeServiceId(s.id || s._id);
      sub += toMoneyNumber(s.price);
      const meta = state.afroByServiceId?.[sid];
      let serviceDur = toMoneyNumber(s.duration);
      if (meta) {
        const base =
          toMoneyNumber(meta.baseDuration) > 0
            ? toMoneyNumber(meta.baseDuration)
            : serviceDur;
        const buffer = Math.max(0, toMoneyNumber(meta.prepBufferMinutes));
        serviceDur = base + buffer;
      }
      // Never fall back to shared afroAnswers — that broke multi-select sums
      const draft = state.pageSvcDraft?.[sid];
      const chosen = Array.isArray(draft?.addons)
        ? draft.addons.map(String)
        : [];
      if (chosen.length) {
        const catalog = getServiceAddonCatalog(s);
        catalog.forEach((a) => {
          if (!chosen.includes(String(a.id || a._id))) return;
          sub += toMoneyNumber(a.addPrice);
          serviceDur += toMoneyNumber(a.addMinutes);
        });
      }
      const draftProducts = Array.isArray(draft?.productIds)
        ? draft.productIds.map(String)
        : [];
      (s.recommendedProducts || []).forEach((p) => {
        if (p.isOutOfStock) return;
        if (draftProducts.includes(String(p.id))) {
          sub += toMoneyNumber(p.price);
        }
      });
      dur += serviceDur;
    });
    // Products selected without a draft (legacy / shared) — avoid double-count
    if (state.selectedProductIds?.length) {
      const alreadyCounted = new Set();
      list.forEach((s) => {
        const sid = normalizeServiceId(s.id || s._id);
        const draft = state.pageSvcDraft?.[sid];
        (draft?.productIds || []).forEach((pid) => alreadyCounted.add(String(pid)));
      });
      const svcPool = list.length ? list : cfg.services || [];
      svcPool.forEach((s) => {
        (s.recommendedProducts || []).forEach((p) => {
          const pid = String(p.id);
          if (
            state.selectedProductIds.includes(pid) &&
            !alreadyCounted.has(pid) &&
            !p.isOutOfStock
          ) {
            sub += toMoneyNumber(p.price);
            alreadyCounted.add(pid);
          }
        });
      });
    }
    const taxPct = toMoneyNumber(cfg.tax);
    const taxAmount = (sub * taxPct) / 100;
    const withTaxNum = parseFloat((taxAmount + sub).toFixed(2));
    if (state.applyLoyalty && Number(state.loyaltyPercent) > 0) {
      state.loyaltyDiscount = parseFloat(
        (((Number(sub) || 0) * Number(state.loyaltyPercent)) / 100).toFixed(2)
      );
    }
    const discount =
      (Number(state.couponDiscount) || 0) + (Number(state.loyaltyDiscount) || 0);
    const totalAfter = Math.max(0, withTaxNum - discount);
    state.withoutTax = Number(sub.toFixed(2));
    state.total = Number(totalAfter.toFixed(2));
    state.duration = dur;

    let depositAmount = 0;
    if (state.afroDemand && Number(state.afroDemand.depositAmount) > 0) {
      depositAmount = Number(state.afroDemand.depositAmount);
    } else {
      const primary =
        getDemandTargetService()?.service || list[0] || null;
      const pct = getServiceDepositPercent(primary);
      if (pct > 0) {
        depositAmount = Math.round((state.withoutTax * pct) / 100);
      }
    }
    const balanceDue = Math.max(0, state.withoutTax - depositAmount);

    return {
      sub: state.withoutTax,
      tax: Number(taxAmount.toFixed(2)),
      withTax: withTaxNum,
      total: state.total,
      discount,
      dur,
      depositAmount,
      balanceDue,
      quoted: Boolean(state.afroDemand),
    };
  }

  function buildBookingPayload(userId, totals) {
    const timeStr = state.timeSlots.filter(Boolean).join(",");
    // Always book every selected service (deposit demand may still reference primary)
    const serviceIds = state.selectedServiceIds.map(String).filter(Boolean);
    const body = {
      userId: String(userId),
      expertId: String(state.expertId),
      salonId: String(cfg.salonId),
      serviceId: serviceIds.join(","),
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
    if (state.applyLoyalty && state.loyaltyDiscount > 0) {
      body.applyLoyalty = true;
    }
    // Infos presta (options / photo / produits) → salon à la confirmation, sans étape devis
    const answers = state.afroAnswers && typeof state.afroAnswers === "object"
      ? { ...state.afroAnswers }
      : {};
    delete answers._skipPrecision;
    if (Object.keys(answers).length) {
      body.clientAnswers = answers;
    }
    if (Array.isArray(state.afroPhotoUrls) && state.afroPhotoUrls.length) {
      body.inspirationPhotoUrls = state.afroPhotoUrls;
    }
    if (Array.isArray(state.selectedProductIds) && state.selectedProductIds.length) {
      body.selectedProductIds = state.selectedProductIds.map(String);
    }
    if (state.policyAccepted) {
      body.policyAccepted = true;
      body.policyAcceptText = state.policyAcceptText || "";
    }
    const demandId = state.afroDemand?.id || state.afroDemand?._id;
    if (demandId) {
      body.demandId = String(demandId);
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
      salonId: String(cfg.salonId || ""),
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
        salonId: cfg.salonId || undefined,
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

  function renderAfroBreakdownList(demand) {
    const rows = demand.priceBreakdown || [];
    if (!rows.length) return "";
    return `<ul class="sq-afro-breakdown">${rows
      .map(
        (b) =>
          `<li>${escapeHtml(b.label)} : ${escapeHtml(cfg.currency)}${Number(b.amount).toFixed(2)}</li>`
      )
      .join("")}</ul>`;
  }

  async function createAfroDemandFromAnswers(answers, photoUrls, opts = {}) {
    const primary = getDemandTargetService() || getPrimaryProjectService();
    if (!primary) throw new Error(t("selectOneService"));
    const payload = {
      salonId: cfg.salonId,
      serviceId: primary.id,
      answers: answers || {},
      photoUrls: photoUrls || [],
      source: "web",
      channelHint: channelHintFromReferrer(),
      userId: state.userId || undefined,
    };
    if (opts.skipPrecision || answers?._skipPrecision) {
      payload.skipPrecision = true;
      payload.answers = { ...(answers || {}), _skipPrecision: true };
    }
    const res = await fetch("/api/public/demand/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.status || !data.demand) {
      throw new Error(data.message || t("genericError"));
    }
    state.afroAnswers = answers || {};
    state.afroPhotoUrls = photoUrls || [];
    state.afroConfigServiceId = primary.id;
    state.afroDemand = data.demand;
    // Keep multi-service selection — demand is only for deposit primary
    if (
      !state.selectedServiceIds.some(
        (x) => normalizeServiceId(x) === normalizeServiceId(primary.id)
      )
    ) {
      state.selectedServiceIds = [
        primary.id,
        ...state.selectedServiceIds.map(normalizeServiceId),
      ];
    }
    return data.demand;
  }

  function renderStepAfroQuote() {
    hideBookingStickyBar();
    const q = state.afroDemand;
    const primary = getPrimaryProjectService();
    const name = primary?.service?.name || primary?.meta?.name || "";
    if (!q) {
      renderStepAfroConfig();
      return;
    }
    const reviewNote = q.needsSalonReview
      ? `<p class="sq-booking-step__hint">${escapeHtml(t("afroReviewHint"))}</p>`
      : `<p class="sq-booking-step__hint">${escapeHtml(t("afroQuoteHint"))}</p>`;
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(
        q.needsSalonReview ? t("afroReviewTitle") : t("afroQuoteTitle")
      )}</p>
      ${reviewNote}
      <div class="sq-booking-summary">
        <p><strong>${escapeHtml(name)}</strong></p>
        <p class="sq-afro-price">${escapeHtml(cfg.currency)}${Number(q.estimatedPrice).toFixed(2)}</p>
        <p>${escapeHtml(t("afroEstimatedDuration"))} : <strong>${escapeHtml(String(q.estimatedDurationMinutes))} ${escapeHtml(t("min"))}</strong></p>
        ${
          Number(q.depositAmount) > 0
            ? `<p>${escapeHtml(t("afroDeposit"))} : <strong>${escapeHtml(cfg.currency)}${Number(q.depositAmount).toFixed(2)}</strong></p>`
            : ""
        }
        ${renderAfroBreakdownList(q)}
      </div>
      <button type="button" class="sq-booking-btn" id="btnAfroQuoteNext">${escapeHtml(
        q.needsSalonReview ? t("afroContinuePending") : t("continue")
      )}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnAfroBackCfg2">${escapeHtml(t("back"))}</button>
    `;
    document.getElementById("btnAfroQuoteNext").onclick = () => {
      afterServicesContinue();
    };
    document.getElementById("btnAfroBackCfg2").onclick = () => {
      clearAfroQuote();
      renderStepAfroConfig();
    };
  }

  function afroFieldVisible(field, answers) {
    const when = field && field.showWhen;
    if (!when || !when.variableId) return true;
    const val = answers[when.variableId];
    const hasVal = val !== undefined && val !== null && val !== "";
    if (when.notEquals !== undefined && when.notEquals !== null) {
      return hasVal && String(val) !== String(when.notEquals);
    }
    if (when.equals === undefined || when.equals === null) return hasVal;
    return String(val) === String(when.equals);
  }

  function renderAfroFieldControl(f, answers) {
    const val = answers[f.id] != null ? String(answers[f.id]) : "";
    if (f.type === "select" && Array.isArray(f.options)) {
      return `<label class="sq-booking-field" data-afro-field="${escapeHtml(f.id)}">${escapeHtml(f.label)}${
        f.required ? " *" : ""
      }
            <select name="${escapeHtml(f.id)}" ${f.required ? "required" : ""}>
              <option value="">—</option>
              ${f.options
                .map(
                  (o) =>
                    `<option value="${escapeHtml(o)}" ${
                      val === String(o) ? "selected" : ""
                    }>${escapeHtml(o)}</option>`
                )
                .join("")}
            </select></label>`;
    }
    if (f.type === "boolean") {
      return `<label class="sq-afro-accept" data-afro-field="${escapeHtml(f.id)}"><input type="checkbox" name="${escapeHtml(
        f.id
      )}" value="oui" ${val === "oui" ? "checked" : ""} /> <span>${escapeHtml(f.label)}</span></label>`;
    }
    return `<label class="sq-booking-field" data-afro-field="${escapeHtml(f.id)}">${escapeHtml(f.label)}${
      f.required ? " *" : ""
    }
          <input name="${escapeHtml(f.id)}" value="${escapeHtml(val)}" ${f.required ? "required" : ""} /></label>`;
  }

  function collectAfroFormAnswers(form) {
    const answers = {};
    const addons = [];
    form.querySelectorAll("[name]").forEach((el) => {
      if (el.name === "__photoFile") return;
      if (el.name === "addons" || el.name === "addons[]") {
        if (el.checked) addons.push(String(el.value));
        return;
      }
      if (el.type === "checkbox") {
        if (el.checked) answers[el.name] = el.value || "oui";
        return;
      }
      if (el.value !== undefined && el.value !== "") {
        answers[el.name] = String(el.value);
      }
    });
    if (addons.length) answers.addons = addons;
    return answers;
  }

  function renderStepAfroConfig() {
    hideBookingStickyBar();
    const primary = getPrimaryProjectService();
    if (!primary) {
      afterServicesContinue();
      return;
    }
    const schema = primary.meta.configSchema || [];
    const requirePhoto = Boolean(primary.meta.requirePhoto);
    const addonDefs = primary.meta.addonDefs || [];
    const name = primary.service?.name || primary.meta.name || "";

    if (!schema.length && !requirePhoto && !addonDefs.length) {
      // Rien à préciser → suite réservation (pas d’écran devis)
      afterServicesContinue();
      return;
    }

    if (!state.afroPrecisionFormOpen) {
      stepsEl.innerHTML = `
        <p class="sq-booking-step__lead">${escapeHtml(t("afroPrecisionChoiceTitle"))}</p>
        <p class="sq-booking-step__hint">${escapeHtml(
          tFmt("afroPrecisionChoiceHint", "__NAME__", name)
        )}</p>
        <p class="sq-booking-step__hint">${escapeHtml(name)}</p>
        <button type="button" class="sq-booking-btn" id="btnAfroAddPrecision">${escapeHtml(
          t("afroPrecisionAdd")
        )}</button>
        <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnAfroSkipPrecision">${escapeHtml(
          t("afroPrecisionSkip")
        )}</button>
        <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnAfroBackSvcChoice">${escapeHtml(
          t("back")
        )}</button>
      `;
      document.getElementById("btnAfroAddPrecision").onclick = () => {
        state.afroPrecisionFormOpen = true;
        state.afroSkipPrecision = false;
        renderStepAfroConfig();
      };
      document.getElementById("btnAfroSkipPrecision").onclick = () => {
        clearAfroQuote();
        state.afroSkipPrecision = true;
        afterServicesContinue();
      };
      document.getElementById("btnAfroBackSvcChoice").onclick = () => {
        clearAfroQuote();
        renderStepServices();
      };
      if (stepsEl) stepsEl.scrollTop = 0;
      return;
    }

    const answers = { ...(state.afroAnswers || {}) };
    const visibleSchema = schema.filter((f) => afroFieldVisible(f, answers));
    const fieldsHtml = visibleSchema.map((f) => renderAfroFieldControl(f, answers)).join("");
    const selectedAddons = Array.isArray(answers.addons) ? answers.addons.map(String) : [];
    const addonsHtml = addonDefs.length
      ? `<fieldset class="sq-afro-addons"><legend>${escapeHtml(
          t("afroAddonsTitle") || "Options"
        )}</legend>${addonDefs
          .map((a) => {
            const checked = selectedAddons.includes(String(a.id)) ? "checked" : "";
            const priceBit =
              Number(a.addPrice) > 0
                ? ` (+${escapeHtml(cfg.currency)}${Number(a.addPrice).toFixed(0)})`
                : "";
            const minBit =
              Number(a.addMinutes) > 0 ? ` · +${Number(a.addMinutes)} min` : "";
            return `<label class="sq-afro-addon"><input type="checkbox" name="addons" value="${escapeHtml(
              String(a.id)
            )}" ${checked} /> <span>${escapeHtml(a.label || a.id)}${priceBit}${minBit}</span></label>`;
          })
          .join("")}</fieldset>`
      : "";
    const materials = primary.meta.materials;
    const materialsHtml = materials
      ? `<p class="sq-booking-step__hint">${escapeHtml(
          materials.packs
            ? `Matières : ${materials.packs}`
            : materials.note ||
              (materials.salonProvides
                ? "Mèches fournies par le salon"
                : materials.clientBrings
                  ? "Cliente apporte ses mèches"
                  : "")
        )}</p>`
      : "";

    const photoHtml = `<label class="sq-booking-field">${escapeHtml(
      requirePhoto ? t("afroPhotoLabel") : t("afroPhotoOptional")
    )}${requirePhoto ? " *" : ""}
        <input type="file" name="__photoFile" id="afroPhotoFile" accept="image/*" capture="environment" ${
          requirePhoto ? "required" : ""
        } />
      </label>
      <div id="afroPhotoPreview" class="sq-afro-photo-preview sq-afro-photo-preview--hidden" aria-live="polite"></div>
      <p class="sq-booking-step__hint">${escapeHtml(t("afroPhotoHint"))}</p>`;

    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(t("afroConfigTitle"))}</p>
      <p class="sq-booking-step__hint">${escapeHtml(tFmt("afroConfigHint", "__NAME__", name))}</p>
      <form id="afroConfigForm" class="sq-afro-form">
        ${fieldsHtml}
        ${addonsHtml}
        ${materialsHtml}
        ${photoHtml}
        <button type="submit" class="sq-booking-btn">${escapeHtml(t("afroSeeQuote"))}</button>
      </form>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnAfroBackSvc">${escapeHtml(t("back"))}</button>
    `;
    document.getElementById("btnAfroBackSvc").onclick = () => {
      state.afroPrecisionFormOpen = false;
      renderStepAfroConfig();
    };
    const form = document.getElementById("afroConfigForm");
    const photoInput = document.getElementById("afroPhotoFile");
    const previewEl = document.getElementById("afroPhotoPreview");
    photoInput?.addEventListener("change", () => {
      const file = photoInput.files && photoInput.files[0];
      if (!previewEl) return;
      if (!file || !file.type.startsWith("image/")) {
        previewEl.innerHTML = "";
        previewEl.classList.add("sq-afro-photo-preview--hidden");
        return;
      }
      const url = URL.createObjectURL(file);
      previewEl.innerHTML = `<img src="${url}" alt="" class="sq-afro-photo-preview__img" />`;
      previewEl.classList.remove("sq-afro-photo-preview--hidden");
    });
    form.querySelectorAll("select, input").forEach((el) => {
      if (el.name === "__photoFile") return;
      el.addEventListener("change", () => {
        const next = collectAfroFormAnswers(form);
        const before = schema
          .map((f) => afroFieldVisible(f, state.afroAnswers || {}))
          .join(",");
        const after = schema.map((f) => afroFieldVisible(f, next)).join(",");
        state.afroAnswers = next;
        if (before !== after) renderStepAfroConfig();
      });
    });
    form.onsubmit = async (e) => {
      e.preventDefault();
      const nextAnswers = collectAfroFormAnswers(form);
      schema.forEach((f) => {
        if (!afroFieldVisible(f, nextAnswers)) {
          delete nextAnswers[f.id];
          return;
        }
        if (f.type === "boolean" && nextAnswers[f.id] == null) nextAnswers[f.id] = "non";
      });
      const file = photoInput?.files && photoInput.files[0];
      if (requirePhoto && !file) {
        showBookingNotice("error", t("afroPhotoRequired"), () => renderStepAfroConfig());
        return;
      }
      stepsEl.innerHTML = `<p class="sq-booking-loading">${escapeHtml(t("loading"))}</p>`;
      try {
        let photoUrls = [];
        if (file) {
          stepsEl.innerHTML = `<p class="sq-booking-loading">${escapeHtml(t("afroPhotoUploading"))}</p>`;
          photoUrls = [await uploadAfroInspirationPhoto(file)];
        }
        state.afroAnswers = nextAnswers;
        state.afroPhotoUrls = photoUrls;
        state.afroConfigServiceId = primary.id;
        state.afroDemand = null;
        state.afroSkipPrecision = true;
        afterServicesContinue();
      } catch (err) {
        showBookingNotice("error", err.message || t("genericError"), () =>
          renderStepAfroConfig()
        );
      }
    };
    if (stepsEl) stepsEl.scrollTop = 0;
  }

  async function uploadAfroInspirationPhoto(file) {
    const body = new FormData();
    body.append("photo", file);
    const res = await fetch("/api/public/demand/upload-photo", {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.status || !data.url) {
      throw new Error(data.message || t("afroPhotoUploadFailed"));
    }
    return String(data.url);
  }

  function renderStepServices(opts = {}) {
    const expandId = opts.expandServiceId
      ? normalizeServiceId(opts.expandServiceId)
      : null;
    const list =
      state.expertId != null
        ? servicesForExpert(state.expertId)
        : cfg.services;
    const ex =
      state.bookingFromExpert && state.expertId
        ? getExpertById(state.expertId)
        : null;
    const expertHint = ex
      ? `<p class="sq-booking-step__hint sq-booking-step__hint--expert">${escapeHtml(
          tFmt("expertPreselectedHint", "__NAME__", ex.name || "")
        )}</p>`
      : "";
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectServices)}</p>
      ${expertHint}
      <p class="sq-booking-step__hint">${escapeHtml(t("servicesMultiHint"))}</p>
      <div class="sq-service-tabs sq-service-tabs--modal" id="bookingServiceTabs"></div>
      <div class="sq-services-list sq-services-list--modal" id="bookingServicesGrid"></div>
    `;
    const bTabs = document.getElementById("bookingServiceTabs");
    const bGrid = document.getElementById("bookingServicesGrid");
    const cats = [{ id: "all", name: cfg.copy.allCategoriesTab }, ...cfg.categories];
    let cat = "all";
    /** Keep accordion panels open across re-paints (manually opened + last focused). */
    const openServiceIds = new Set();
    if (expandId) openServiceIds.add(expandId);

    function collectOpenIdsFromDom() {
      if (!bGrid) return;
      bGrid.querySelectorAll(".sq-svc-row.is-open").forEach((row) => {
        const id = normalizeServiceId(row.getAttribute("data-service-id"));
        if (id) openServiceIds.add(id);
      });
    }

    function paint(optsPaint = {}) {
      const scrollTop = bGrid ? bGrid.scrollTop : 0;
      if (optsPaint.keepOpenFromDom !== false) {
        collectOpenIdsFromDom();
      }
      if (optsPaint.focusServiceId) {
        const fid = normalizeServiceId(optsPaint.focusServiceId);
        // Keep equal card heights while adding: only close on deselect, never auto-open
        if (!isServiceSelected(fid)) openServiceIds.delete(fid);
      }
      // Drop open ids that are no longer selected (deselect sync)
      Array.from(openServiceIds).forEach((id) => {
        if (
          optsPaint.focusServiceId &&
          normalizeServiceId(optsPaint.focusServiceId) === id &&
          !isServiceSelected(id)
        ) {
          openServiceIds.delete(id);
        }
      });

      bTabs.innerHTML = cats
        .map(
          (tab) =>
            `<button type="button" class="sq-service-tab${cat === tab.id ? " sq-service-tab--active" : ""}" data-cat="${tab.id}">${escapeHtml(tab.name)}</button>`
        )
        .join("");
      bTabs.querySelectorAll(".sq-service-tab").forEach((b) => {
        b.onclick = () => {
          cat = b.getAttribute("data-cat");
          paint({ keepOpenFromDom: true });
        };
      });
      const filtered =
        cat === "all" ? list : list.filter((s) => s.categoryId === cat);
      // Keep selected services visible (with badge) even if another category tab is active
      const filteredIds = new Set(
        filtered.map((s) => normalizeServiceId(s.id))
      );
      const selectedPinned =
        cat === "all"
          ? []
          : list.filter((s) => {
              const sid = normalizeServiceId(s.id);
              return isServiceSelected(sid) && !filteredIds.has(sid);
            });
      const displayList = [...selectedPinned, ...filtered];
      bGrid.innerHTML = displayList
        .map((s) => {
          const sid = normalizeServiceId(s.id);
          return buildSalonPageServiceCardHtml(s, {
            mode: "modal",
            forceOpen: openServiceIds.has(sid),
          });
        })
        .join("");
      bindSalonPageServiceCards(bGrid, {
        mode: "modal",
        onToggleOpen: (sid, isOpen) => {
          const id = normalizeServiceId(sid);
          if (isOpen) openServiceIds.add(id);
          else openServiceIds.delete(id);
        },
        onSelectionChange: (sid) => {
          const id = normalizeServiceId(sid);
          if (!isServiceSelected(id)) openServiceIds.delete(id);
          paint({
            keepOpenFromDom: true,
            focusServiceId: id || null,
          });
          renderSalonPageSelectionUI();
          renderServicesStickyBar();
          if (id && isServiceSelected(id) && bGrid) {
            const row = bGrid.querySelector(
              `.sq-svc-row[data-service-id="${CSS.escape(id)}"]`
            );
            row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        },
      });
      renderSalonPageSelectionUI();
      renderServicesStickyBar();
      if (bGrid) bGrid.scrollTop = scrollTop;
      if (optsPaint.scrollToExpand && expandId) {
        const openRow = bGrid.querySelector(
          `.sq-svc-row[data-service-id="${CSS.escape(expandId)}"]`
        );
        openRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
    paint({ keepOpenFromDom: false, scrollToExpand: Boolean(expandId) });
    if (stepsEl) stepsEl.scrollTop = 0;
  }

  async function renderStepExperts() {
    hideBookingStickyBar();
    setModalTitle(t("bookNow"));
    setModalBack(() => closeModal());
    stepsEl.innerHTML = `<p>${escapeHtml(cfg.copy.selectExpert)}</p><div class="sq-booking-loading">…</div>`;
    const data = await fetchExpertsForService();
    if (!data.status || !data.data?.length) {
      stepsEl.innerHTML = `<p>${escapeHtml(t("noExpertForService"))}</p>`;
      setModalBack(() => closeModal());
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
  }

  async function renderStepDateTime() {
    hideBookingStickyBar();
    setModalTitle(t("bookNow"));
    setModalBack(() => {
      if (state.manageReschedule) {
        state.manageReschedule = null;
        closeModal();
        return;
      }
      backFromDateTime();
    });
    if (!state.date || isDateBeforeToday(state.date)) {
      state.date = todayYmd();
    }
    initCalendarFromStateDate();

    const monthLabel = formatMonthYear(state.calendarYear, state.calendarMonth);
    stepsEl.innerHTML = `
      <div class="sq-booking-datetime">
        <div class="sq-booking-datetime__static">
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
          <p class="sq-booking-datetime__selected" id="bookingSelectedDate">${escapeHtml(
            formatDisplayDate(state.date)
          )}</p>
          <button type="button" class="sq-booking-btn" id="btnDateNext" disabled>${escapeHtml(
            state.manageReschedule
              ? t("manageRescheduleConfirm") || "Confirmer le nouveau créneau"
              : t("continue")
          )}</button>
        </div>
        <div class="sq-booking-datetime__scroll">
          <h3 class="sq-booking-slots-title">${escapeHtml(t("availableSlots"))}</h3>
          <div id="slotGroups" class="sq-slot-groups"></div>
          <p id="slotPickHint" class="sq-slot-pick-hint${state.slotPickHint ? "" : " sq-slot-pick-hint--hidden"}">${escapeHtml(state.slotPickHint)}</p>
        </div>
      </div>
    `;

    const daysEl = document.getElementById("bookingCalendarDays");
    const monthLabelEl = document.getElementById("calMonthLabel");
    const selectedDateEl = document.getElementById("bookingSelectedDate");
    const slotGroups = document.getElementById("slotGroups");
    const slotPickHint = document.getElementById("slotPickHint");
    const btnNext = document.getElementById("btnDateNext");

    function syncSelectedDateLabel() {
      if (selectedDateEl) {
        selectedDateEl.textContent = formatDisplayDate(state.date);
      }
    }

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
      renderCalendarDays(daysEl, () => {
        syncSelectedDateLabel();
        loadSlots();
      });
      syncSelectedDateLabel();
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
        initCalendarFromStateDate();
        refreshMonthUi();
      }
      syncSelectedDateLabel();
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

    function clampDateToVisibleMonth() {
      const firstOfMonth = formatDateYmd(
        new Date(state.calendarYear, state.calendarMonth, 1)
      );
      const lastOfMonth = formatDateYmd(
        new Date(state.calendarYear, state.calendarMonth + 1, 0)
      );
      const today = todayYmd();
      if (state.date >= firstOfMonth && state.date <= lastOfMonth) return;
      // Prefer today when browsing the current month — never jump to day 1 if today is available
      if (today >= firstOfMonth && today <= lastOfMonth) {
        state.date = today;
      } else {
        state.date = firstOfMonth >= today ? firstOfMonth : today;
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
        clampDateToVisibleMonth();
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
        clampDateToVisibleMonth();
        refreshMonthUi();
        loadSlots();
      };
    }

    btnNext.onclick = async () => {
      if (state.manageReschedule) {
        const { bookingId, token, expertId } = state.manageReschedule;
        if (!state.date || !state.timeSlots?.length) return;
        btnNext.disabled = true;
        try {
          const res = await fetch("/api/public/booking/reschedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              token,
              date: state.date,
              startTime: state.timeSlots[0],
              expertId: expertId || state.expertId,
            }),
          });
          const data = await res.json();
          if (!data.status) {
            btnNext.disabled = false;
            showBookingNotice("error", data.message || t("genericError"), () =>
              renderStepDateTime()
            );
            return;
          }
          state.manageReschedule = null;
          stepsEl.innerHTML = `
            <div class="sq-booking-notice sq-booking-notice--success">
              <p class="sq-booking-notice__message">${escapeHtml(
                data.message || "Créneau mis à jour"
              )}</p>
              <p>${escapeHtml(String(data.booking?.date || state.date))} · ${escapeHtml(
                String(data.booking?.startTime || state.timeSlots[0])
              )}</p>
              <button type="button" class="sq-booking-btn" id="btnBookingDone">${escapeHtml(
                t("afroClose")
              )}</button>
            </div>`;
          document.getElementById("btnBookingDone").onclick = closeModal;
          void loadUpcomingBookingsBanner();
        } catch (e) {
          btnNext.disabled = false;
          showBookingNotice("error", e.message || t("genericError"));
        }
        return;
      }
      renderStepContact();
    };
    refreshMonthUi();
    await loadSlots();
    if (stepsEl) stepsEl.scrollTop = 0;
  }

  function renderPriceBreakdown(totals) {
    let html = "";
    html += `<p>${escapeHtml(cfg.copy.subtotal)} : ${escapeHtml(cfg.currency)}${totals.sub.toFixed(2)}</p>`;
    if (totals.dur > 0) {
      html += `<p>${escapeHtml(t("afroEstimatedDuration") || t("serviceDurationTitle"))} : <strong>${totals.dur} ${escapeHtml(t("min"))}</strong></p>`;
    }
    if (totals.tax > 0) {
      html += `<p>${escapeHtml(cfg.copy.taxLabel)} : ${escapeHtml(cfg.currency)}${totals.tax.toFixed(2)}</p>`;
    }
    if (totals.discount > 0) {
      const loyaltyBit =
        state.applyLoyalty && state.loyaltyDiscount > 0
          ? ` <span class="sq-loyalty-tag">${escapeHtml(
              state.loyaltyLabel || "Fidélité"
            )}</span>`
          : "";
      html += `<p class="sq-booking-summary__discount">${escapeHtml(cfg.copy.discount)} : −${escapeHtml(cfg.currency)}${totals.discount.toFixed(2)}${loyaltyBit}</p>`;
    }
    if (Number(totals.depositAmount) > 0) {
      html += `<p>${escapeHtml(t("afroDeposit") || "Acompte")} : <strong>${escapeHtml(cfg.currency)}${Number(totals.depositAmount).toFixed(2)}</strong></p>`;
      html += `<p>${escapeHtml(t("afroBalanceDue") || "Reste à régler")} : ${escapeHtml(cfg.currency)}${Number(totals.balanceDue || 0).toFixed(2)}</p>`;
    }
    html += `<p class="sq-booking-summary__total"><strong>${escapeHtml(cfg.copy.totalLabel)} : ${escapeHtml(cfg.currency)}${totals.total.toFixed(2)}</strong></p>`;
    return html;
  }

  function renderStepContact() {
    hideBookingStickyBar();
    const totals = calcTotals(getSelectedServices());
    const webUser = getWebUser();
    const auth = cfg.authUrls || {};
    const loginHref = auth.login || "/compte/connexion";
    const signupHref = auth.signup || "/compte/inscription";

    if (webUser) {
      state.userId = String(webUser.id);
      state.email = webUser.email || "";
      state.mobile = webUser.mobile || "";
      state.walletBalance = Number(webUser.amount) || 0;
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
        await renderStepPayment();
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
      state.walletBalance = Number(vd.user?.amount) || 0;
      await loadCouponsForUser(userId);
      await renderStepPayment();
    };
  }

  async function renderStepPayment() {
    hideBookingStickyBar();
    await refreshPaymentSettings();

    if (selectedNeedsDeposit()) {
      try {
        stepsEl.innerHTML = `<p class="sq-booking-loading">${escapeHtml(t("loading"))}</p>`;
        await ensureAfroDemandForDeposit();
      } catch (err) {
        showBookingNotice("error", err.message || t("genericError"), () =>
          renderStepContact()
        );
        return;
      }
    }

    const totals = calcTotals(getSelectedServices());
    const needDeposit =
      cfg.salonAcceptsStripe !== false && demandNeedsDeposit(state.afroDemand);
    const methods = getAvailablePaymentMethods();
    const showStripe = methods.some((m) => m.value === "Stripe");

    if (needDeposit) {
      state.paymentMethod = "cashAfterService";
    }

    const paymentOptionsHtml = needDeposit
      ? `<p class="sq-booking-step__hint">${escapeHtml(t("afroDepositPayHint"))}</p>`
      : methods
          .map(
            (m) =>
              `<label class="sq-payment-option"><input type="radio" name="payMethod" value="${escapeHtml(m.value)}" ${state.paymentMethod === m.value ? "checked" : ""}> <span>${escapeHtml(m.label)}</span></label>`
          )
          .join("");

    const couponBlock = needDeposit
      ? ""
      : `<div class="sq-coupon-block">
        <label class="sq-booking-field">${escapeHtml(cfg.copy.couponCode)}
          <div class="sq-coupon-row">
            <input type="text" id="bkCouponCode" class="sq-coupon-row__input" value="${escapeHtml(state.couponCode)}" placeholder="${escapeHtml(t("couponPlaceholder"))}" autocomplete="off" spellcheck="false">
            <button type="button" class="sq-booking-btn sq-booking-btn--ghost sq-coupon-row__btn" id="btnApplyCoupon">${escapeHtml(cfg.copy.applyCoupon)}</button>
          </div>
        </label>
        ${
          state.availableCoupons.length > 0
            ? `<div class="sq-coupon-list">${state.availableCoupons
                .map(
                  (c) =>
                    `<button type="button" class="sq-coupon-pick" data-code="${escapeHtml(c.code)}">${escapeHtml(c.code)}${c.title ? ` — ${escapeHtml(c.title)}` : ""}</button>`
                )
                .join("")}</div>`
            : ""
        }
        ${
          state.couponDiscount > 0
            ? `<p class="sq-coupon-applied">${escapeHtml(cfg.copy.couponApplied)} : <strong>${escapeHtml(state.couponCode)}</strong> (−${escapeHtml(cfg.currency)}${state.couponDiscount.toFixed(2)}) <button type="button" class="sq-coupon-remove" id="btnRemoveCoupon">${escapeHtml(cfg.copy.removeCoupon)}</button></p>`
            : ""
        }
      </div>`;

    const confirmLabel = needDeposit
      ? tFmt(
          "afroConfirmWithDeposit",
          "__AMOUNT__",
          `${cfg.currency}${Number(state.afroDemand.depositAmount).toFixed(2)}`
        )
      : cfg.copy.confirmBooking;

    const pol = cfg.cancellationPolicy || {};
    const policyBlock = pol.enabled
      ? `<label class="sq-policy-accept"><input type="checkbox" id="bkPolicyAccept" ${
          state.policyAccepted ? "checked" : ""
        }> <span>${escapeHtml(
          t("policyAcceptLabel") || cfg.copy.policyAcceptLabel || ""
        )}</span></label>
         <p class="sq-booking-step__hint">${escapeHtml(
           (t("lateArrivalHint") || cfg.copy.lateArrivalHint || "")
             .split("__M__")
             .join(String(pol.lateArrivalMinutes ?? 15))
         )}</p>`
      : "";

    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.paymentTitle)}</p>
      <div class="sq-booking-summary">${renderPriceBreakdown(totals)}</div>
      ${
        needDeposit
          ? `<p class="sq-booking-step__hint">${escapeHtml(t("afroCancelPolicyHint"))}</p>`
          : ""
      }
      ${couponBlock}
      ${policyBlock}
      <p class="sq-booking-step__label">${escapeHtml(cfg.copy.selectPayment)}</p>
      <div class="sq-payment-methods">
        ${paymentOptionsHtml || `<p class="sq-booking-step__hint">${escapeHtml(t("stripeUnavailable"))}</p>`}
      </div>
      <div id="sq-stripe-wrap" class="sq-stripe-wrap${needDeposit || state.paymentMethod === "Stripe" ? "" : " sq-stripe-wrap--hidden"}">
        <p class="sq-stripe-hint">${escapeHtml(needDeposit ? t("afroDepositStripeHint") : cfg.copy.stripeSecure)}</p>
        <div id="sq-stripe-element"></div>
      </div>
      <button type="button" class="sq-booking-btn" id="btnConfirm">${escapeHtml(confirmLabel)}</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackContact">${escapeHtml(t("back"))}</button>
    `;

    if (!needDeposit) {
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
    }

    document.getElementById("btnBackContact").onclick = renderStepContact;

    document.getElementById("bkPolicyAccept")?.addEventListener("change", (e) => {
      state.policyAccepted = Boolean(e.target.checked);
      state.policyAcceptText = t("policyAcceptLabel") || cfg.copy.policyAcceptLabel || "";
    });

    document.getElementById("btnConfirm").onclick = async () => {
      const userId = state.userId;
      if (!userId) {
        showBookingNotice("error", t("sessionExpired"), () => renderStepContact());
        return;
      }

      const pol = cfg.cancellationPolicy || {};
      if (pol.enabled && !state.policyAccepted) {
        showBookingNotice(
          "error",
          t("policyAcceptRequired") || cfg.copy.policyAcceptRequired || "",
          () => renderStepPayment()
        );
        return;
      }

      const btn = document.getElementById("btnConfirm");
      btn.disabled = true;
      btn.textContent = "…";

      let result;
      try {
        if (needDeposit) {
          const depOk = await confirmAfroDepositPayment();
          if (!depOk.ok) {
            showBookingNotice("error", depOk.message || t("bookingFailed"), () =>
              renderStepPayment()
            );
            btn.disabled = false;
            btn.textContent = confirmLabel;
            return;
          }
          state.paymentMethod = "cashAfterService";
          result = await createBooking(userId);
        } else if (state.paymentMethod === "Stripe") {
          result = await confirmStripePayment(userId);
        } else if (state.paymentMethod === "wallet") {
          const totalsNow = calcTotals(getSelectedServices());
          if (state.walletBalance < totalsNow.total) {
            showBookingNotice(
              "error",
              cfg.copy.walletInsufficient || t("walletInsufficient"),
              () => renderStepPayment()
            );
            btn.disabled = false;
            btn.textContent = cfg.copy.confirmBooking;
            return;
          }
          result = await createBooking(userId);
        } else {
          result = await createBooking(userId);
        }
      } catch (err) {
        result = { status: false, message: err.message || t("bookingFailed") };
      }

      btn.disabled = false;
      btn.textContent = confirmLabel;

      if (result?.status) {
        destroyStripeElement();
        showBookingSuccess(result);
      } else if (result) {
        showBookingNotice(
          "error",
          result.message || t("bookingFailed"),
          () => renderStepPayment()
        );
      }
    };

    if (needDeposit && state.userId) {
      await mountAfroDepositElement();
    } else if (state.paymentMethod === "Stripe" && showStripe && state.userId) {
      const wrap = document.getElementById("sq-stripe-wrap");
      if (wrap) wrap.classList.remove("sq-stripe-wrap--hidden");
      mountStripePaymentElement(state.userId);
    }
  }

  function showBookingSuccess(result) {
    const bookingId =
      result?.booking?.bookingId ||
      result?.data?.bookingId ||
      result?.bookingId ||
      "";
    const totals = calcTotals(getSelectedServices());
    const checklist = (() => {
      const primary = getPrimaryProjectService();
      const card =
        primary?.service?.detailCard ||
        (cfg.services || []).find(
          (s) => normalizeServiceId(s.id || s.serviceId) === primary?.id
        )?.detailCard ||
        {};
      const meta = primary?.meta || {};
      const must = (
        Array.isArray(card.prepMust) && card.prepMust.length
          ? card.prepMust
          : Array.isArray(meta.prepMust)
            ? meta.prepMust
            : []
      ).slice(0, 5);
      const avoid = (
        Array.isArray(card.prepAvoid) && card.prepAvoid.length
          ? card.prepAvoid
          : Array.isArray(meta.prepAvoid)
            ? meta.prepAvoid
            : []
      ).slice(0, 5);
      if (!must.length && !avoid.length) {
        return "";
      }
      return `<ul class="sq-afro-breakdown">${must
        .map((x) => `<li>✓ ${escapeHtml(x)}</li>`)
        .join("")}${avoid.map((x) => `<li>✕ ${escapeHtml(x)}</li>`).join("")}</ul>`;
    })();
    const emailHint = `<p class="sq-booking-step__hint">${escapeHtml(
      t("bookingCancelEmailHint") ||
        "Un email de confirmation vous a été envoyé (lien pour annuler si besoin)."
    )}</p>`;
    stepsEl.innerHTML = `
      <div class="sq-booking-notice sq-booking-notice--success">
        <p class="sq-booking-notice__message">${escapeHtml(t("afroConfirmUnified") || cfg.copy.bookingSuccess)}</p>
        ${bookingId ? `<p><strong>N° ${escapeHtml(String(bookingId))}</strong></p>` : ""}
        <p>${escapeHtml(cfg.currency)}${totals.sub.toFixed(2)} · ${totals.dur} ${escapeHtml(t("min"))}</p>
        ${emailHint}
        ${checklist ? `<p class="sq-booking-step__lead">${escapeHtml(t("afroPrepTitle"))}</p>${checklist}` : ""}
        <button type="button" class="sq-booking-btn" id="btnBookingDone">${escapeHtml(t("afroClose"))}</button>
      </div>
    `;
    document.getElementById("btnBookingDone").onclick = closeModal;
    clearAfroQuote();
  }

  async function cancelManagedBooking(bookingId, token, evaluation) {
    const lateWarn =
      evaluation?.mode === "late"
        ? `\n\n${evaluation.message || ""}`
        : evaluation?.enabled && evaluation?.mode !== "free"
          ? `\n\n${evaluation.message || ""}`
          : "";
    if (
      !window.confirm(
        (t("manageCancelConfirm") ||
          "Confirmer l’annulation de cette réservation ?") + lateWarn
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/public/booking/cancel-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, token }),
      });
      const data = await res.json();
      if (!data.status) {
        showBookingNotice("error", data.message || t("genericError"), () =>
          showBookingSuccess({
            status: true,
            data: { _id: bookingId, bookingId: "" },
            manageToken: token,
            evaluation,
          })
        );
        return;
      }
      stepsEl.innerHTML = `
        <div class="sq-booking-notice sq-booking-notice--success">
          <p class="sq-booking-notice__message">${escapeHtml(data.message || "Réservation annulée")}</p>
          <button type="button" class="sq-booking-btn" id="btnBookingDone">${escapeHtml(t("afroClose"))}</button>
        </div>`;
      document.getElementById("btnBookingDone").onclick = closeModal;
    } catch (e) {
      showBookingNotice("error", e.message || t("genericError"));
    }
  }

  async function openRescheduleFlow(bookingId, token, bookingSnap) {
    const expertId = bookingSnap?.expertId || state.expertId;
    if (!expertId) {
      showBookingNotice("error", t("selectExpert") || "Expert requis");
      return;
    }
    state.manageReschedule = { bookingId, token, expertId: String(expertId) };
    state.expertId = String(expertId);
    state.date = "";
    state.timeSlots = [];
    state.slotPickHint = "";
    openModal();
    await renderStepDateTime();
  }

  async function loadUpcomingBookingsBanner() {
    if (!state.userId || !cfg.salonId) return;
    try {
      const res = await fetch(
        `/api/public/client/upcoming?salonId=${encodeURIComponent(
          cfg.salonId
        )}&userId=${encodeURIComponent(state.userId)}`
      );
      const data = await res.json();
      if (!data.status || !Array.isArray(data.bookings) || !data.bookings.length) {
        return;
      }
      let banner = document.getElementById("sqUpcomingBanner");
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "sqUpcomingBanner";
        banner.className = "sq-upcoming-banner";
        const host =
          document.querySelector(".sq-salon-detail__page .container") ||
          document.querySelector(".content-wrapper") ||
          document.body;
        host.insertBefore(banner, host.firstChild);
      }
      const rows = data.bookings
        .slice(0, 3)
        .map((b) => {
          const ev = b.evaluation || {};
          const actions = [];
          if (ev.canReschedule) {
            actions.push(
              `<button type="button" class="sq-upcoming-banner__link" data-act="reschedule" data-id="${escapeHtml(
                String(b._id)
              )}" data-token="${escapeHtml(String(b.manageToken))}" data-expert="${escapeHtml(
                String(b.expertId || "")
              )}">${escapeHtml(t("manageReschedule") || "Modifier")}</button>`
            );
          }
          if (ev.canCancel) {
            actions.push(
              `<button type="button" class="sq-upcoming-banner__link" data-act="cancel" data-id="${escapeHtml(
                String(b._id)
              )}" data-token="${escapeHtml(String(b.manageToken))}" data-mode="${escapeHtml(
                String(ev.mode || "")
              )}" data-msg="${escapeHtml(String(ev.message || ""))}">${escapeHtml(
                t("manageCancel") || "Annuler"
              )}</button>`
            );
          }
          return `<li>
            <span>${escapeHtml(String(b.date))} · ${escapeHtml(
              String(b.startTime || "")
            )}</span>
            <span class="sq-upcoming-banner__acts">${actions.join(" · ")}</span>
            ${
              ev.message
                ? `<small class="sq-upcoming-banner__hint">${escapeHtml(ev.message)}</small>`
                : ""
            }
          </li>`;
        })
        .join("");
      banner.innerHTML = `<div class="sq-upcoming-banner__inner">
        <strong>${escapeHtml(t("upcomingTitle") || "Vos prochains rendez-vous")}</strong>
        <ul class="sq-upcoming-banner__list">${rows}</ul>
        <button type="button" class="sq-upcoming-banner__cta" id="sqBookNewSlot">${escapeHtml(
          t("bookNewSlot") || "Réserver un nouveau créneau"
        )}</button>
      </div>`;
      document.getElementById("sqBookNewSlot")?.addEventListener("click", () => {
        window.SalonBooking.open({});
      });
      banner.querySelectorAll("[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const token = btn.getAttribute("data-token");
          const act = btn.getAttribute("data-act");
          if (act === "cancel") {
            void cancelManagedBooking(id, token, {
              mode: btn.getAttribute("data-mode"),
              message: btn.getAttribute("data-msg"),
              canCancel: true,
            });
            openModal();
          } else if (act === "reschedule") {
            openModal();
            void openRescheduleFlow(id, token, {
              expertId: btn.getAttribute("data-expert"),
            });
          }
        });
      });
    } catch (e) {
      console.warn("[upcoming] load failed", e);
    }
  }

  let afroDepositElements = null;
  let afroDepositStripe = null;

  async function mountAfroDepositElement() {
    destroyStripeElement();
    const demandId = state.afroDemand?.id || state.afroDemand?._id;
    if (!demandId) return false;
    const intentRes = await fetch("/api/public/demand/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demandId }),
    });
    const intent = await intentRes.json();
    if (!intent.status) {
      showBookingNotice("error", intent.message || t("genericError"), () =>
        renderStepPayment()
      );
      return false;
    }
    if (intent.alreadyPaid) {
      state.afroDemand.depositStatus = "paid";
      await renderStepPayment();
      return true;
    }
    if (typeof Stripe === "undefined") {
      showBookingNotice("error", t("stripeNotLoaded"), () => renderStepPayment());
      return false;
    }
    afroDepositStripe = window.Stripe(intent.publishableKey, {
      stripeAccount: intent.connectedAccountId,
    });
    afroDepositElements = afroDepositStripe.elements({
      clientSecret: intent.clientSecret,
    });
    const paymentElement = afroDepositElements.create("payment");
    const mountEl = document.getElementById("sq-stripe-element");
    if (mountEl) paymentElement.mount("#sq-stripe-element");
    state._afroDepositIntent = intent;
    return true;
  }

  async function confirmAfroDepositPayment() {
    const demand = state.afroDemand;
    if (!demandNeedsDeposit(demand)) return { ok: true };
    if (demand.depositStatus === "paid") return { ok: true };
    if (!afroDepositStripe || !afroDepositElements) {
      const mounted = await mountAfroDepositElement();
      if (demandNeedsDeposit(state.afroDemand) === false) return { ok: true };
      if (!mounted || !afroDepositStripe) {
        return { ok: false, message: t("stripeNotLoaded") };
      }
    }
    const { error, paymentIntent } = await afroDepositStripe.confirmPayment({
      elements: afroDepositElements,
      redirect: "if_required",
    });
    if (error) {
      return { ok: false, message: error.message || t("paymentCancelled") };
    }
    const demandId = demand.id || demand._id;
    const conf = await fetch("/api/public/demand/confirm-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        demandId,
        paymentIntentId: paymentIntent?.id,
      }),
    });
    const data = await conf.json();
    if (!data.status) {
      return { ok: false, message: data.message || t("bookingFailed") };
    }
    state.afroDemand.depositStatus = "paid";
    if (data.demand) {
      Object.assign(state.afroDemand, data.demand);
    }
    return { ok: true };
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
    state.bookingFromExpert = Boolean(draft.bookingFromExpert);
    state.returnToExpertStep = false;
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
      state.walletBalance = Number(webUser.amount) || 0;
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
    getSelectedServiceContext() {
      const sid = state.selectedServiceIds?.[0];
      if (!sid) return null;
      const svc = cfg.services.find(
        (s) => normalizeServiceId(s.id) === normalizeServiceId(sid)
      );
      return {
        serviceId: normalizeServiceId(sid),
        serviceName: svc?.name || "",
      };
    },
    async open(opts = {}) {
      state.bookingFromExpert = Boolean(opts.expertId);
      state.returnToExpertStep = false;
      state.expertId = opts.expertId || null;
      clearAfroQuote();

      if (opts.expertId && !opts.serviceId) {
        state.selectedServiceIds = [];
      } else if (opts.serviceId) {
        state.selectedServiceIds = [normalizeServiceId(opts.serviceId)];
      }

      state.date = "";
      state.timeSlots = [];
      state.slotPickHint = "";
      state.userId = null;
      state.couponId = null;
      state.couponCode = "";
      state.couponDiscount = 0;
      state.selectedProductIds = Array.isArray(opts.productIds)
        ? opts.productIds.map(String)
        : [];
      destroyStripeElement();
      renderServicesGrid();
      openModal();

      // Options déjà cochées sur la fiche presta → réservation directe (pas de devis)
      if (opts.skipPrecision && opts.serviceId) {
        const sid = normalizeServiceId(opts.serviceId);
        const answers = {
          ...(opts.afroAnswers || {}),
        };
        if (Array.isArray(opts.addons) && opts.addons.length) {
          answers.addons = opts.addons.map(String);
        }
        delete answers._skipPrecision;
        state.afroAnswers = answers;
        state.afroPhotoUrls = Array.isArray(opts.photoUrls)
          ? opts.photoUrls
          : [];
        state.afroSkipPrecision = true;
        state.afroConfigServiceId = sid;
        state.afroPrecisionFormOpen = false;
        state.afroDemand = null;
        afterServicesContinue();
        return;
      }

      // Depuis catégorie / deep-link : montrer le détail presta avant de continuer
      if (opts.serviceId && state.selectedServiceIds.length) {
        renderStepServices({ expandServiceId: opts.serviceId });
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
  initSalonMosaic();

  stickyMobileBtn?.addEventListener("click", () => {
    applyPageDraftsToBookingState();
    if (state.selectedServiceIds.length > 0) {
      openBookingForSelection();
      return;
    }
    openModal();
    renderStepServices();
  });

  // Aside « Réserver (n) » — keep multi-selection, open tunnel
  document.querySelectorAll(".open-app-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Prefer programmatic multi-select open over empty SalonBooking.open()
      if (!state.selectedServiceIds.length) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      applyPageDraftsToBookingState();
      openBookingForSelection();
    }, true);
  });

  tryResumeBooking();

  async function startRebookFromToken(token) {
    try {
      const res = await fetch(`/api/public/rebook/${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!data.status || !data.rebook) return false;
      const rb = data.rebook;
      const slots = Array.isArray(rb.suggestedSlots) ? rb.suggestedSlots.slice(0, 3) : [];
      const slotsHtml = slots.length
        ? `<div class="sq-rebook-slots" role="group" aria-label="Créneaux suggérés">
            <p class="sq-rebook-slots__label">3 créneaux suggérés</p>
            ${slots
              .map(
                (s, i) =>
                  `<button type="button" class="sq-rebook-slot" data-rebook-slot="${i}">
                    <strong>${escapeHtml(String(s.date || ""))}</strong>
                    <span>${escapeHtml(String(s.time || s.startTime || ""))}</span>
                    ${
                      s.expertName
                        ? `<em>${escapeHtml(String(s.expertName))}</em>`
                        : ""
                    }
                  </button>`
              )
              .join("")}
          </div>`
        : "";
      const banner = document.createElement("div");
      banner.className = "sq-rebook-banner";
      banner.innerHTML = `<div class="sq-rebook-banner__inner">
        <strong>${escapeHtml(rb.headline || "")}</strong>
        <p>${escapeHtml(rb.subline || "")}</p>
        <ul class="sq-rebook-banner__meta">
          ${rb.expertName ? `<li>Même coiffeuse : ${escapeHtml(rb.expertName)}</li>` : ""}
          <li>Même configuration</li>
          <li>Nouveau créneau</li>
          ${
            rb.loyalty?.eligible
              ? `<li class="sq-rebook-banner__loyalty">Fidélité : −${escapeHtml(
                  String(rb.loyalty.percent)
                )}% (${escapeHtml(String(rb.loyalty.priorCount))} visite${
                  Number(rb.loyalty.priorCount) > 1 ? "s" : ""
                })</li>`
              : ""
          }
          ${
            Array.isArray(rb.history) && rb.history.length
              ? `<li>${rb.history.length} prestation${
                  rb.history.length > 1 ? "s" : ""
                } dans votre historique ici</li>`
              : ""
          }
        </ul>
        ${slotsHtml}
        <button type="button" class="sq-rebook-banner__cta" id="sqRebookCta">${escapeHtml(
          rb.cta || "Réserver ma dernière coiffure"
        )}</button>
      </div>`;
      const host =
        document.querySelector(".sq-salon-detail__page .container") ||
        document.querySelector(".content-wrapper") ||
        document.body;
      host.insertBefore(banner, host.firstChild);

      const applySlot = (slot) => {
        if (!slot) return;
        if (slot.date) state.date = String(slot.date);
        const t = slot.time || slot.startTime;
        if (t) {
          state.timeSlots = [String(t)];
        }
        if (slot.expertId) {
          state.expertId = String(slot.expertId);
          state.bookingFromExpert = true;
        }
      };

      const go = (slot) => {
        state.selectedServiceIds = [normalizeServiceId(rb.serviceId)];
        state.expertId = (slot && slot.expertId) || rb.expertId || null;
        state.bookingFromExpert = Boolean(state.expertId);
        state.afroAnswers = rb.answers || {};
        state.afroPhotoUrls = rb.photoUrls || [];
        state.afroConfigServiceId = normalizeServiceId(rb.serviceId);
        state.afroSkipPrecision = false;
        state.afroPrecisionFormOpen = false;
        applySlot(slot);
        if (rb.loyalty?.eligible && Number(rb.loyalty.amount) > 0) {
          state.applyLoyalty = true;
          state.loyaltyPercent = Number(rb.loyalty.percent) || 0;
          state.loyaltyDiscount = Number(rb.loyalty.amount) || 0;
          state.loyaltyLabel = rb.loyalty.label || "";
        } else {
          state.applyLoyalty = false;
          state.loyaltyPercent = 0;
          state.loyaltyDiscount = 0;
          state.loyaltyLabel = "";
        }
        state.clientHistory = Array.isArray(rb.history) ? rb.history : [];
        openModal();
        // Rebook : mêmes réponses, pas d’écran devis — directement expert / créneau
        state.afroSkipPrecision = true;
        state.afroDemand = null;
        afterServicesContinue();
      };
      document.getElementById("sqRebookCta")?.addEventListener("click", () => go(null));
      banner.querySelectorAll("[data-rebook-slot]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-rebook-slot"));
          go(slots[idx] || null);
        });
      });
      return true;
    } catch (e) {
      console.warn("[rebook] load failed", e);
      return false;
    }
  }

  void loadAfroMeta().then(async () => {
    renderServicesGrid();
    const wu = getWebUser();
    if (wu?.id) {
      state.userId = String(wu.id);
      void loadUpcomingBookingsBanner();
    }
    if (/[?&]flow=devis(?:&|$)/.test(location.search)) {
      setTimeout(() => {
        openModal();
        renderStepServices();
      }, 350);
    }
    const q = new URLSearchParams(location.search);
    const rebookToken = q.get("rebook");
    if (rebookToken) {
      await startRebookFromToken(rebookToken);
      return;
    }
    const sid = q.get("serviceId");
    if (sid) {
      setTimeout(() => {
        window.SalonBooking.open({ serviceId: sid });
      }, 400);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible" &&
      stepsEl.querySelector('input[name="payMethod"]')
    ) {
      void renderStepPayment();
    }
  });
})();
