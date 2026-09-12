/**
 * Skedisy — tunnel devis Afro (wedge SQUIRE)
 * Activé si window.SKEDISY_SALON_BOOKING.afroProjectFlowEnabled
 * Étapes: service → questions → devis → contact OTP → acompte Stripe (si besoin) → expert/créneau → confirm
 */
(function () {
  const cfg = window.SKEDISY_SALON_BOOKING;
  if (!cfg || !cfg.afroProjectFlowEnabled) return;

  const api = (path, opts) =>
    fetch(path, {
      headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
      ...opts,
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.status === false) throw new Error(j.message || "Erreur");
      return j;
    });

  let state = {
    services: [],
    service: null,
    answers: {},
    quote: null,
    demand: null,
    userId: null,
    expertId: null,
    date: "",
    time: "",
    experts: [],
    slots: [],
  };

  const modal = document.getElementById("salonAfroDemandModal");
  const stepsEl = document.getElementById("salonAfroDemandSteps");
  if (!modal || !stepsEl) return;

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("sq-booking-modal--open");
    loadServices().then(renderServiceStep);
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("sq-booking-modal--open");
  }

  document.querySelectorAll("[data-open-afro-demand]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });
  modal.querySelectorAll("[data-close-afro-demand]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  // Deep link ?flow=devis
  if (/[?&]flow=devis(?:&|$)/.test(location.search)) {
    setTimeout(openModal, 400);
  }

  async function loadServices() {
    const data = await api(`/api/public/demand/services?salonId=${encodeURIComponent(cfg.salonId)}`);
    state.services = (data.services || []).filter((s) => s.usesProjectFlow);
    if (!state.services.length) {
      state.services = data.services || [];
    }
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderServiceStep() {
    stepsEl.innerHTML = `
      <h3>Choisir une prestation</h3>
      <div class="sq-afro-list">
        ${state.services
          .map(
            (s) => `
          <button type="button" class="sq-afro-card" data-svc="${esc(s.serviceId)}">
            <strong>${esc(s.name)}</strong>
            <span>${esc(cfg.currency)}${Number(s.basePrice || 0).toFixed(2)} · dès ${esc(s.baseDuration)} min · ${esc(s.complexityTier)}</span>
          </button>`
          )
          .join("")}
      </div>
      <p class="sq-afro-hint">Réservation classique toujours disponible via « Réserver ».</p>`;
    stepsEl.querySelectorAll("[data-svc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.service = state.services.find((s) => String(s.serviceId) === btn.getAttribute("data-svc"));
        state.answers = {};
        renderQuestionsStep();
      });
    });
  }

  function renderQuestionsStep() {
    const schema = state.service.configSchema || [];
    if (!schema.length) {
      return getQuoteAndShow();
    }
    stepsEl.innerHTML = `
      <button type="button" class="sq-afro-back" data-back>← Retour</button>
      <h3>${esc(state.service.name)} — quelques précisions</h3>
      <form id="afroQForm" class="sq-afro-form">
        ${schema
          .map((f) => {
            if (f.type === "select" && Array.isArray(f.options)) {
              return `<label>${esc(f.label)}${f.required ? " *" : ""}
                <select name="${esc(f.id)}" ${f.required ? "required" : ""}>
                  <option value="">—</option>
                  ${f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
                </select></label>`;
            }
            return `<label>${esc(f.label)}${f.required ? " *" : ""}
              <input name="${esc(f.id)}" ${f.required ? "required" : ""} /></label>`;
          })
          .join("")}
        <button type="submit" class="sq-afro-primary">Voir mon devis</button>
      </form>`;
    stepsEl.querySelector("[data-back]")?.addEventListener("click", renderServiceStep);
    stepsEl.querySelector("#afroQForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.answers = {};
      fd.forEach((v, k) => {
        if (v) state.answers[k] = v;
      });
      getQuoteAndShow();
    });
  }

  async function getQuoteAndShow() {
    stepsEl.innerHTML = `<p>${esc(cfg.copy?.loading || "Chargement…")}</p>`;
    try {
      const created = await api("/api/public/demand/create", {
        method: "POST",
        body: JSON.stringify({
          salonId: cfg.salonId,
          serviceId: state.service.serviceId,
          answers: state.answers,
          source: "web",
          channelHint: /instagram/i.test(document.referrer) ? "instagram" : "other",
        }),
      });
      state.demand = created.demand;
      state.quote = created.demand;
      renderQuoteStep();
    } catch (err) {
      stepsEl.innerHTML = `<p class="sq-afro-error">${esc(err.message)}</p>
        <button type="button" class="sq-afro-back" data-back>← Retour</button>`;
      stepsEl.querySelector("[data-back]")?.addEventListener("click", renderQuestionsStep);
    }
  }

  function renderQuoteStep() {
    const q = state.quote;
    if (q.needsSalonReview) {
      stepsEl.innerHTML = `
        <button type="button" class="sq-afro-back" data-back>← Retour</button>
        <h3>Devis envoyé au salon</h3>
        <p class="sq-afro-price">${esc(cfg.currency)}${Number(q.estimatedPrice).toFixed(2)}</p>
        <p>Durée estimée : <strong>${esc(q.estimatedDurationMinutes)} min</strong></p>
        <p class="sq-afro-hint">Cette prestation nécessite une validation du salon. Vous serez contactée pour finaliser.</p>
        <ul class="sq-afro-breakdown">
          ${(q.priceBreakdown || [])
            .map((b) => `<li>${esc(b.label)} : ${esc(cfg.currency)}${Number(b.amount).toFixed(2)}</li>`)
            .join("")}
        </ul>
        <button type="button" class="sq-afro-primary" data-close-afro-demand>Fermer</button>`;
      stepsEl.querySelector("[data-back]")?.addEventListener("click", renderQuestionsStep);
      stepsEl.querySelector("[data-close-afro-demand]")?.addEventListener("click", closeModal);
      return;
    }
    stepsEl.innerHTML = `
      <button type="button" class="sq-afro-back" data-back>← Retour</button>
      <h3>Votre devis</h3>
      <p class="sq-afro-price">${esc(cfg.currency)}${Number(q.estimatedPrice).toFixed(2)}</p>
      <p>Durée estimée : <strong>${esc(q.estimatedDurationMinutes)} min</strong></p>
      ${
        q.depositAmount > 0
          ? `<p>Acompte : <strong>${esc(cfg.currency)}${Number(q.depositAmount).toFixed(2)}</strong></p>`
          : ""
      }
      <ul class="sq-afro-breakdown">
        ${(q.priceBreakdown || [])
          .map((b) => `<li>${esc(b.label)} : ${esc(cfg.currency)}${Number(b.amount).toFixed(2)}</li>`)
          .join("")}
      </ul>
      <button type="button" class="sq-afro-primary" data-next>Continuer</button>`;
    stepsEl.querySelector("[data-back]")?.addEventListener("click", renderQuestionsStep);
    stepsEl.querySelector("[data-next]")?.addEventListener("click", renderContactStep);
  }

  function renderContactStep() {
    stepsEl.innerHTML = `
      <h3>Vos coordonnées</h3>
      <form id="afroContact" class="sq-afro-form">
        <label>Email * <input type="email" name="email" required /></label>
        <label>Téléphone * <input name="phone" required /></label>
        <button type="button" class="sq-afro-secondary" data-otp>Envoyer le code</button>
        <label>Code OTP <input name="otp" placeholder="6 chiffres" /></label>
        <button type="submit" class="sq-afro-primary">Valider</button>
      </form>
      <p id="afroContactMsg" class="sq-afro-hint"></p>`;
    const form = stepsEl.querySelector("#afroContact");
    const msg = stepsEl.querySelector("#afroContactMsg");
    stepsEl.querySelector("[data-otp]").addEventListener("click", async () => {
      try {
        const fd = new FormData(form);
        await api("/api/public/guest/send-otp", {
          method: "POST",
          body: JSON.stringify({ email: fd.get("email"), phone: fd.get("phone") }),
        });
        msg.textContent = "Code envoyé.";
      } catch (e) {
        msg.textContent = e.message;
      }
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form);
        const verified = await api("/api/public/guest/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            email: fd.get("email"),
            phone: fd.get("phone"),
            otp: fd.get("otp"),
          }),
        });
        state.userId =
          verified.user?._id ||
          verified.user?.id ||
          verified.userId ||
          verified.data?._id ||
          verified.data?.userId;
        if (!state.userId) throw new Error("Connexion invitée incomplète");
        const needDeposit =
          Number(state.quote.depositAmount) > 0 &&
          state.quote.depositStatus !== "waived" &&
          state.quote.depositStatus !== "not_required" &&
          state.quote.depositStatus !== "paid";
        if (needDeposit) {
          await payDeposit();
        } else {
          await renderSlotStep();
        }
      } catch (err) {
        msg.textContent = err.message;
      }
    });
  }

  async function payDeposit() {
    stepsEl.innerHTML = `<p>Préparation du paiement acompte…</p><div id="afroStripe"></div><p id="afroPayMsg"></p>`;
    const msg = stepsEl.querySelector("#afroPayMsg");
    try {
      const intent = await api("/api/public/demand/stripe-intent", {
        method: "POST",
        body: JSON.stringify({ demandId: state.demand.id || state.demand._id }),
      });
      if (intent.alreadyPaid) {
        return renderSlotStep();
      }
      if (!window.Stripe) throw new Error("Stripe.js non chargé");
      const stripe = window.Stripe(intent.publishableKey, {
        stripeAccount: intent.connectedAccountId,
      });
      const elements = stripe.elements({ clientSecret: intent.clientSecret });
      const paymentElement = elements.create("payment");
      paymentElement.mount("#afroStripe");
      const payBtn = document.createElement("button");
      payBtn.className = "sq-afro-primary";
      payBtn.type = "button";
      payBtn.textContent = `Payer l'acompte (${cfg.currency}${Number(intent.depositAmount).toFixed(2)})`;
      stepsEl.appendChild(payBtn);
      payBtn.addEventListener("click", async () => {
        payBtn.disabled = true;
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });
        if (error) {
          msg.textContent = error.message;
          payBtn.disabled = false;
          return;
        }
        await api("/api/public/demand/confirm-deposit", {
          method: "POST",
          body: JSON.stringify({
            demandId: state.demand.id || state.demand._id,
            paymentIntentId: paymentIntent.id,
          }),
        });
        await renderSlotStep();
      });
    } catch (e) {
      msg.textContent = e.message + " — vous pouvez aussi réserver sans acompte via le parcours classique.";
    }
  }

  async function renderSlotStep() {
    stepsEl.innerHTML = `<p>Chargement des disponibilités…</p>`;
    try {
      const ex = await api(
        `/api/public/booking/experts?salonId=${encodeURIComponent(cfg.salonId)}&serviceId=${encodeURIComponent(state.service.serviceId)}`
      );
      state.experts = Array.isArray(ex.data) ? ex.data : ex.experts || [];
      if (!Array.isArray(state.experts)) state.experts = [];
      const today = new Date().toISOString().slice(0, 10);
      stepsEl.innerHTML = `
        <h3>Choisir un créneau</h3>
        <p class="sq-afro-hint">Durée réservée : ${esc(state.quote.estimatedDurationMinutes)} min</p>
        <form id="afroSlot" class="sq-afro-form">
          <label>Pro
            <select name="expertId" required>
              ${state.experts
                .map(
                  (e) =>
                    `<option value="${esc(e._id || e.id)}">${esc(
                      ((e.fname || "") + " " + (e.lname || e.name || "")).trim() || "Pro"
                    )}</option>`
                )
                .join("")}
            </select>
          </label>
          <label>Date <input type="date" name="date" value="${today}" required /></label>
          <button type="button" class="sq-afro-secondary" data-load-slots>Voir les horaires</button>
          <div id="afroSlots"></div>
          <button type="submit" class="sq-afro-primary">Confirmer le rendez-vous</button>
        </form>
        <p id="afroSlotMsg"></p>`;
      const form = stepsEl.querySelector("#afroSlot");
      const slotsBox = stepsEl.querySelector("#afroSlots");
      const msg = stepsEl.querySelector("#afroSlotMsg");
      stepsEl.querySelector("[data-load-slots]").addEventListener("click", async () => {
        const fd = new FormData(form);
        state.expertId = fd.get("expertId");
        state.date = fd.get("date");
        const qs = new URLSearchParams({
          salonId: cfg.salonId,
          expertId: state.expertId,
          date: state.date,
        });
        try {
          const slotRes = await api(`/api/public/booking/slots?${qs}`);
          if (!slotRes.isOpen) {
            slotsBox.innerHTML = "<p>Salon fermé ce jour-là.</p>";
            return;
          }
          const busy = new Set(
            (slotRes.timeSlots || []).flatMap((t) => String(t).split(",").map((s) => s.trim()))
          );
          let morning = slotRes.allSlots?.morning || [];
          let evening = slotRes.allSlots?.evening || [];
          if (evening.length > 1) evening = evening.slice(1);
          const free = [...morning, ...evening].filter((t) => t && !busy.has(t));
          slotsBox.innerHTML = free.length
            ? free
                .map(
                  (t) =>
                    `<label class="sq-afro-slot"><input type="radio" name="time" value="${esc(t)}" required /> ${esc(t)}</label>`
                )
                .join("")
            : "<p>Aucun créneau libre.</p>";
        } catch (e) {
          msg.textContent = e.message;
        }
      });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        state.expertId = fd.get("expertId");
        state.date = fd.get("date");
        state.time = fd.get("time");
        if (!state.time) {
          msg.textContent = "Choisissez un horaire.";
          return;
        }
        try {
          const booking = await api("/api/public/demand/convert", {
            method: "POST",
            body: JSON.stringify({
              demandId: state.demand.id || state.demand._id,
              userId: state.userId,
              expertId: state.expertId,
              date: state.date,
              time: state.time,
              paymentType: "cashAfterService",
            }),
          });
          stepsEl.innerHTML = `
            <h3>C’est confirmé</h3>
            <p>${esc(cfg.copy?.bookingSuccess || "Réservation enregistrée.")}</p>
            <p>N° ${esc(booking.data?.bookingId || "")}</p>
            <button type="button" class="sq-afro-primary" data-close-afro-demand>Fermer</button>`;
          stepsEl.querySelector("[data-close-afro-demand]")?.addEventListener("click", closeModal);
        } catch (err) {
          msg.textContent = err.message;
        }
      });
    } catch (e) {
      stepsEl.innerHTML = `<p class="sq-afro-error">${esc(e.message)}</p>`;
    }
  }
})();
