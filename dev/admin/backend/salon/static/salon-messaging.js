(function () {
  "use strict";

  const cfg = () => window.SKEDISY_SALON_MESSAGING || {};
  const t = (key) => (cfg().copy && cfg().copy[key]) || key;

  function getWebUser() {
    try {
      const raw = sessionStorage.getItem("skedisy_web_user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      if (!u || !(u.id || u._id)) return null;
      return u;
    } catch (e) {
      return null;
    }
  }

  function userIdOf(u) {
    return u ? String(u.id || u._id) : "";
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureModal() {
    let root = document.getElementById("sqSalonMessaging");
    if (root) return root;
    root = document.createElement("div");
    root.id = "sqSalonMessaging";
    root.className = "sq-msg-modal";
    root.innerHTML = `
      <div class="sq-msg-modal__backdrop" data-msg-close="1"></div>
      <div class="sq-msg-modal__panel" role="dialog" aria-modal="true" aria-labelledby="sqMsgTitle">
        <button type="button" class="sq-msg-modal__close" data-msg-close="1" aria-label="Close">&times;</button>
        <div class="sq-msg-modal__head">
          <h3 id="sqMsgTitle">${escapeHtml(t("messageTitle"))}</h3>
          <p class="sq-msg-modal__sub" id="sqMsgSub"></p>
        </div>
        <div class="sq-msg-context" id="sqMsgContext" hidden></div>
        <div class="sq-msg-modal__body" id="sqMsgBody"></div>
        <div class="sq-msg-modal__compose" id="sqMsgCompose" hidden>
          <div class="sq-msg-topics" id="sqMsgTopics" role="group" aria-label="Sujet"></div>
          <div class="sq-msg-photos" id="sqMsgPhotos"></div>
          <label class="sq-msg-photo-btn">
            <input type="file" id="sqMsgFile" accept="image/*" multiple hidden />
            <span>${escapeHtml(t("messageAddPhoto"))}</span>
          </label>
          <textarea id="sqMsgInput" rows="2" placeholder="${escapeHtml(t("messagePlaceholder"))}"></textarea>
          <button type="button" class="sq-msg-send" id="sqMsgSend">${escapeHtml(t("messageSend"))}</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener("click", (e) => {
      if (e.target && e.target.getAttribute("data-msg-close")) close();
    });
    const file = root.querySelector("#sqMsgFile");
    file.addEventListener("change", () => {
      state.pendingFiles = Array.from(file.files || []).slice(0, 4);
      renderPendingPhotos();
    });
    root.querySelector("#sqMsgSend").addEventListener("click", send);
    renderTopicChips();
    return root;
  }

  const TOPIC_CHIPS = [
    { id: "price", labelKey: "messageTopicPrice", fallback: "Prix / durée" },
    { id: "booking", labelKey: "messageTopicBooking", fallback: "Réservation" },
    { id: "prep", labelKey: "messageTopicPrep", fallback: "Préparation" },
    { id: "technical", labelKey: "messageTopicTechnical", fallback: "Technique" },
    { id: "cancel", labelKey: "messageTopicCancel", fallback: "Annulation" },
    { id: "payment", labelKey: "messageTopicPayment", fallback: "Paiement" },
  ];

  const state = {
    open: false,
    messages: [],
    pendingFiles: [],
    sending: false,
    context: {
      serviceId: "",
      serviceName: "",
      demandId: "",
      bookingId: "",
      topic: "",
    },
  };

  function renderTopicChips() {
    const el = document.getElementById("sqMsgTopics");
    if (!el) return;
    el.innerHTML = TOPIC_CHIPS.map((chip) => {
      const label = t(chip.labelKey);
      const text = label === chip.labelKey ? chip.fallback : label;
      const on = state.context.topic === chip.id;
      return `<button type="button" class="sq-msg-topic${on ? " is-active" : ""}" data-topic="${chip.id}">${escapeHtml(text)}</button>`;
    }).join("");
    el.querySelectorAll("[data-topic]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-topic");
        state.context.topic = state.context.topic === id ? "" : id;
        renderTopicChips();
      });
    });
  }

  function setContext(opts = {}) {
    state.context = {
      // StyleSeat-style: chat is with people (salon), not locked to a service
      serviceId: "",
      serviceName: "",
      demandId: opts.demandId ? String(opts.demandId) : "",
      bookingId: opts.bookingId ? String(opts.bookingId) : "",
      topic: opts.topic ? String(opts.topic) : state.context.topic || "",
    };
  }

  function contextQuery() {
    const q = [];
    if (state.context.demandId) {
      q.push(`demandId=${encodeURIComponent(state.context.demandId)}`);
    }
    if (state.context.bookingId) {
      q.push(`bookingId=${encodeURIComponent(state.context.bookingId)}`);
    }
    if (state.context.topic) {
      q.push(`topic=${encodeURIComponent(state.context.topic)}`);
    }
    return q.length ? `&${q.join("&")}` : "";
  }

  function appendContextToFormData(fd) {
    if (state.context.demandId) fd.append("demandId", state.context.demandId);
    if (state.context.bookingId) fd.append("bookingId", state.context.bookingId);
    if (state.context.topic) fd.append("topic", state.context.topic);
  }

  function renderContextBanner() {
    const el = document.getElementById("sqMsgContext");
    if (!el) return;
    el.hidden = true;
    el.innerHTML = "";
  }

  function renderPendingPhotos() {
    const el = document.getElementById("sqMsgPhotos");
    if (!el) return;
    if (!state.pendingFiles.length) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = state.pendingFiles
      .map((f, i) => `<span class="sq-msg-photo-chip">${escapeHtml(f.name || "photo " + (i + 1))}</span>`)
      .join("");
  }

  function renderMessages() {
    const body = document.getElementById("sqMsgBody");
    if (!body) return;
    if (!state.messages.length) {
      body.innerHTML = `<p class="sq-msg-empty">${escapeHtml(t("messageEmpty"))}</p>`;
      return;
    }
    body.innerHTML = state.messages
      .map((m) => {
        const mine = m.sender === "user";
        const isSystem = m.sender === "system";
        const photos = (m.photoUrls || [])
          .map(
            (u) =>
              `<a href="${escapeHtml(u)}" target="_blank" rel="noopener"><img src="${escapeHtml(u)}" alt="" class="sq-msg-thumb"/></a>`
          )
          .join("");
        if (isSystem) {
          const auto = m.isAutoReply
            ? `<span class="sq-msg-auto-tag">${escapeHtml(
                t("messageAutoReplyTag") || "Auto"
              )}</span>`
            : "";
          return `<div class="sq-msg-bubble sq-msg-bubble--system${
            m.isAutoReply ? " sq-msg-bubble--auto" : ""
          }">
            ${auto}
            ${m.body ? `<p>${escapeHtml(m.body)}</p>` : ""}
          </div>`;
        }
        return `<div class="sq-msg-bubble ${mine ? "sq-msg-bubble--mine" : "sq-msg-bubble--salon"}">
          ${m.body ? `<p>${escapeHtml(m.body)}</p>` : ""}
          ${photos ? `<div class="sq-msg-thumbs">${photos}</div>` : ""}
        </div>`;
      })
      .join("");
    body.scrollTop = body.scrollHeight;
  }

  async function loadThread(userId) {
    const body = document.getElementById("sqMsgBody");
    if (body) body.innerHTML = `<p class="sq-msg-empty">${escapeHtml(t("loading"))}</p>`;
    const url = `/api/public/messaging/thread?salonId=${encodeURIComponent(cfg().salonId)}&userId=${encodeURIComponent(userId)}${contextQuery()}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "error");
    state.messages = data.messages || [];
    const ctx = data.context || data.conversation || {};
    if (ctx.demandId) state.context.demandId = String(ctx.demandId);
    if (ctx.bookingId) state.context.bookingId = String(ctx.bookingId);
    if (ctx.topic) state.context.topic = ctx.topic;
    // Do not restore serviceId — messaging is salon/people scoped (StyleSeat)
    state.context.serviceId = "";
    state.context.serviceName = "";
    renderContextBanner();
    renderMessages();
  }

  async function send() {
    if (state.sending) return;
    const user = getWebUser();
    const userId = userIdOf(user);
    if (!userId) {
      showLoginGate();
      return;
    }
    const input = document.getElementById("sqMsgInput");
    const text = (input && input.value) || "";
    if (!String(text).trim() && !state.pendingFiles.length) return;

    state.sending = true;
    const btn = document.getElementById("sqMsgSend");
    if (btn) btn.textContent = t("messageSending");
    try {
      const fd = new FormData();
      fd.append("salonId", cfg().salonId);
      fd.append("userId", userId);
      fd.append("body", text);
      appendContextToFormData(fd);
      fd.append("lang", cfg().language === "en" ? "en" : "fr");
      state.pendingFiles.forEach((f) => fd.append("photos", f));
      const res = await fetch("/api/public/messaging/send", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.status) throw new Error(data.message || t("messageError"));
      if (input) input.value = "";
      state.pendingFiles = [];
      const file = document.getElementById("sqMsgFile");
      if (file) file.value = "";
      renderPendingPhotos();
      await loadThread(userId);
    } catch (err) {
      alert(err.message || t("messageError"));
    } finally {
      state.sending = false;
      if (btn) btn.textContent = t("messageSend");
    }
  }

  function showLoginGate() {
    const body = document.getElementById("sqMsgBody");
    const compose = document.getElementById("sqMsgCompose");
    if (compose) compose.hidden = true;
    const auth = cfg().authUrls || {};
    if (body) {
      body.innerHTML = `
        <p class="sq-msg-empty">${escapeHtml(t("messageLoginHint"))}</p>
        <div class="sq-msg-auth">
          <a class="sq-btn sq-btn-fill" href="${escapeHtml(auth.login || "/compte/connexion")}">${escapeHtml(t("authSignInLink"))}</a>
          <span>${escapeHtml(t("authOr") || "ou")}</span>
          <a href="${escapeHtml(auth.signup || "/compte/inscription")}">${escapeHtml(t("authSignUpLink"))}</a>
        </div>`;
    }
  }

  /**
   * Open salon messaging (StyleSeat-style: talk to people at the salon).
   * @param {{ demandId?: string, bookingId?: string, topic?: string }} [opts]
   */
  async function open(opts = {}) {
    if (!cfg().messagingEnabled) return;
    setContext({
      demandId: opts.demandId || "",
      bookingId: opts.bookingId || "",
      topic: opts.topic || "",
    });
    const root = ensureModal();
    root.classList.add("sq-msg-modal--open");
    state.open = true;
    const sub = document.getElementById("sqMsgSub");
    if (sub) {
      sub.textContent =
        t("messageSalonHint") ||
        (cfg().salonName
          ? `Discussion avec ${cfg().salonName}`
          : "Discussion avec le salon");
    }
    renderContextBanner();
    renderTopicChips();
    const user = getWebUser();
    const userId = userIdOf(user);
    const compose = document.getElementById("sqMsgCompose");
    if (!userId) {
      showLoginGate();
      return;
    }
    if (compose) compose.hidden = false;
    try {
      await loadThread(userId);
    } catch (e) {
      showLoginGate();
    }
  }

  function close() {
    const root = document.getElementById("sqSalonMessaging");
    if (root) root.classList.remove("sq-msg-modal--open");
    state.open = false;
  }

  window.SalonMessaging = { open, close, setContext };
})();
