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
  };

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

  function calcTotals(matched) {
    let sub = 0;
    let dur = 0;
    matched.forEach((m) => {
      sub += Number(m.price) || 0;
      dur += Number(m.duration) || 0;
    });
    const taxPct = Number(cfg.tax) || 0;
    const tax = (sub * taxPct) / 100;
    state.withoutTax = sub;
    state.total = sub + tax;
    state.duration = dur;
    return { sub, tax, total: state.total, dur };
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
      <button type="button" class="sq-booking-btn" id="btnServicesNext">Continuer</button>
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
      if (!state.selectedServiceIds.length) return alert("Choisissez une prestation.");
      renderStepExperts();
    };
  }

  async function renderStepExperts() {
    stepsEl.innerHTML = `<p>${escapeHtml(cfg.copy.selectExpert)}</p><div class="sq-booking-loading">…</div>`;
    const data = await fetchExpertsForService();
    if (!data.status || !data.data?.length) {
      stepsEl.innerHTML = `<p>Aucun expert pour cette prestation.</p><button type="button" class="sq-booking-btn" id="btnBackSvc">Retour</button>`;
      document.getElementById("btnBackSvc").onclick = renderStepServices;
      return;
    }
    state.matchedServices = data.matchedServices || [];
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.selectExpert)}</p>
      <div class="sq-experts-row sq-experts-row--modal" id="bookingExpertsPick"></div>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackSvc">Retour</button>
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
      <label class="sq-booking-field">Date <input type="date" id="bookingDate" value="${state.date}" min="${new Date().toISOString().slice(0, 10)}"></label>
      <div id="slotGroups" class="sq-slot-groups"></div>
      <button type="button" class="sq-booking-btn" id="btnDateNext" disabled>Continuer</button>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnBackExp">Retour</button>
    `;

    const dateInput = document.getElementById("bookingDate");
    const slotGroups = document.getElementById("slotGroups");
    const btnNext = document.getElementById("btnDateNext");

    async function loadSlots() {
      state.date = dateInput.value;
      state.timeSlots = [];
      btnNext.disabled = true;
      slotGroups.innerHTML = "Chargement…";
      const data = await fetchSlots();
      if (!data.status || !data.isOpen) {
        slotGroups.innerHTML = "<p>Fermé ou indisponible ce jour.</p>";
        return;
      }
      const busy = new Set(data.timeSlots || []);
      const renderGroup = (label, slots) => {
        if (!slots?.length) return "";
        return `<div class="sq-slot-group"><h4>${label}</h4><div class="sq-slot-list">${slots
          .map((t) => {
            const taken = busy.has(t);
            return `<button type="button" class="sq-slot-btn${taken ? " sq-slot-btn--busy" : ""}" data-time="${escapeHtml(t)}" ${taken ? "disabled" : ""}>${escapeHtml(t)}</button>`;
          })
          .join("")}</div></div>`;
      };
      slotGroups.innerHTML =
        renderGroup("Matin", data.allSlots?.morning) +
        renderGroup("Après-midi", data.allSlots?.evening);
      slotGroups.querySelectorAll(".sq-slot-btn:not([disabled])").forEach((btn) => {
        btn.onclick = () => {
          state.timeSlots = [btn.getAttribute("data-time")];
          slotGroups.querySelectorAll(".sq-slot-btn").forEach((b) => b.classList.remove("sq-slot-btn--picked"));
          btn.classList.add("sq-slot-btn--picked");
          btnNext.disabled = false;
        };
      });
    }

    dateInput.onchange = loadSlots;
    document.getElementById("btnBackExp").onclick = renderStepExperts;
    btnNext.onclick = renderStepContact;
    loadSlots();
  }

  function renderStepContact() {
    const totals = calcTotals(state.matchedServices.length ? state.matchedServices : cfg.services.filter((s) => state.selectedServiceIds.includes(s.id)));
    stepsEl.innerHTML = `
      <p class="sq-booking-step__lead">${escapeHtml(cfg.copy.yourDetails)}</p>
      <div class="sq-booking-summary">
        <p><strong>${escapeHtml(cfg.salonName)}</strong></p>
        <p>${escapeHtml(state.date)} · ${escapeHtml(state.timeSlots.join(", "))}</p>
        <p>${escapeHtml(cfg.currency)}${totals.total.toFixed(2)} — ${escapeHtml(cfg.copy.payAtSalon)}</p>
      </div>
      <label class="sq-booking-field">Email <input type="email" id="bkEmail" value="${escapeHtml(state.email)}" required></label>
      <label class="sq-booking-field">Téléphone <input type="tel" id="bkMobile" value="${escapeHtml(state.mobile)}" required></label>
      <label class="sq-booking-field">Code reçu par email <input type="text" id="bkOtp" inputmode="numeric" maxlength="6" placeholder="6 chiffres"></label>
      <button type="button" class="sq-booking-btn sq-booking-btn--ghost" id="btnSendOtp">Envoyer le code</button>
      <button type="button" class="sq-booking-btn" id="btnConfirm">${escapeHtml(cfg.copy.confirmBooking)}</button>
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
      alert(data.message || (data.status ? "Code envoyé" : "Erreur"));
    };
    document.getElementById("btnConfirm").onclick = async () => {
      state.email = document.getElementById("bkEmail").value.trim();
      state.mobile = document.getElementById("bkMobile").value.trim();
      const otp = document.getElementById("bkOtp").value.trim();
      const v = await fetch("/api/public/guest/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, mobile: state.mobile, otp }),
      });
      const vd = await v.json();
      if (!vd.status || !vd.user?._id) {
        alert(vd.message || "Vérification échouée");
        return;
      }
      state.userId = vd.user._id;
      const totals2 = calcTotals(
        state.matchedServices.length
          ? state.matchedServices
          : cfg.services.filter((s) => state.selectedServiceIds.includes(s.id))
      );
      const body = {
        userId: state.userId,
        expertId: state.expertId,
        salonId: cfg.salonId,
        serviceId: state.selectedServiceIds.join(","),
        date: state.date,
        time: state.timeSlots.join(","),
        amount: totals2.total,
        withoutTax: totals2.withoutTax,
        atPlace: 1,
        paymentType: "cashAfterService",
        duration: totals2.dur,
      };
      const cr = await fetch("/api/public/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const cd = await cr.json();
      if (cd.status) {
        stepsEl.innerHTML = `<p class="sq-booking-success">${escapeHtml(cfg.copy.bookingSuccess)}</p>`;
      } else {
        alert(cd.message || "Réservation impossible");
      }
    };
  }

  window.SalonBooking = {
    open(opts = {}) {
      state.selectedServiceIds = opts.serviceId ? [opts.serviceId] : [];
      state.expertId = opts.expertId || null;
      state.date = "";
      state.timeSlots = [];
      state.userId = null;
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
