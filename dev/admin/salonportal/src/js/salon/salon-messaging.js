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
        <div class="sq-msg-modal__body" id="sqMsgBody"></div>
        <div class="sq-msg-modal__compose" id="sqMsgCompose" hidden>
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
    return root;
  }

  const state = {
    open: false,
    messages: [],
    pendingFiles: [],
    sending: false,
  };

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
        const photos = (m.photoUrls || [])
          .map(
            (u) =>
              `<a href="${escapeHtml(u)}" target="_blank" rel="noopener"><img src="${escapeHtml(u)}" alt="" class="sq-msg-thumb"/></a>`
          )
          .join("");
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
    const url = `/api/public/messaging/thread?salonId=${encodeURIComponent(cfg().salonId)}&userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "error");
    state.messages = data.messages || [];
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

  async function open() {
    if (!cfg().messagingEnabled) return;
    const root = ensureModal();
    root.classList.add("sq-msg-modal--open");
    state.open = true;
    document.getElementById("sqMsgSub").textContent = cfg().salonName || "";
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

  window.SalonMessaging = { open, close };
})();
