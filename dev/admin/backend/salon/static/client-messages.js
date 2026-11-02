/**
 * Page /compte/messages — inbox cliente (toutes conversations par salon).
 */
(function () {
  const cfg = window.SKEDISY_ACCOUNT || {};
  const copy = cfg.copy || {};

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    const parts = String(name || "S")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return String(name || "SK").slice(0, 2).toUpperCase();
  }

  function formatWhen(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const now = new Date();
      const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      if (sameDay) {
        return d.toLocaleTimeString(cfg.lang === "en" ? "en-GB" : "fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return d.toLocaleDateString(cfg.lang === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch (_) {
      return "";
    }
  }

  const state = {
    user: null,
    conversations: [],
    activeId: null,
    activeSalon: null,
    messages: [],
    sending: false,
  };

  function renderList() {
    const list = document.getElementById("sqMsgInboxList");
    if (!list) return;
    if (!state.conversations.length) {
      list.innerHTML = `<div class="sq-msg-inbox-empty">
        <div class="sq-account-empty-state__icon" aria-hidden="true"><i class="fas fa-comments"></i></div>
        <p>${esc(copy.emptyMessages)}</p>
        <a class="sq-btn sq-btn-fill" href="/recherche">${esc(
          copy.browseSalons || "Trouver un salon"
        )}</a>
      </div>`;
      return;
    }
    list.innerHTML = state.conversations
      .map((c) => {
        const name = c.salon?.name || "Salon";
        const active = String(c._id) === String(state.activeId);
        const unread = Number(c.unreadUser) || 0;
        return `<button type="button" class="sq-msg-inbox-item${
          active ? " is-active" : ""
        }" data-conversation-id="${esc(c._id)}">
          <span class="sq-msg-inbox-item__avatar" aria-hidden="true">${esc(
            initials(name)
          )}</span>
          <span class="sq-msg-inbox-item__body">
            <span class="sq-msg-inbox-item__top">
              <strong>${esc(name)}</strong>
              <time>${esc(formatWhen(c.lastMessageAt))}</time>
            </span>
            <span class="sq-msg-inbox-item__preview">${esc(
              c.lastPreview || "—"
            )}</span>
            ${
              c.salon?.city
                ? `<span class="sq-msg-inbox-item__meta">${esc(c.salon.city)}</span>`
                : ""
            }
          </span>
          ${
            unread > 0
              ? `<span class="sq-msg-inbox-item__badge">${unread > 99 ? "99+" : unread}</span>`
              : ""
          }
        </button>`;
      })
      .join("");

    list.querySelectorAll("[data-conversation-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openConversation(btn.getAttribute("data-conversation-id"));
      });
    });
  }

  function renderThread() {
    const thread = document.getElementById("sqMsgInboxThread");
    const pane = document.getElementById("sqMsgInboxPane");
    if (!thread || !pane) return;

    if (!state.activeId) {
      pane.classList.remove("is-thread-open");
      thread.innerHTML = `<div class="sq-msg-inbox-placeholder">
        <div class="sq-account-empty-state__icon" aria-hidden="true"><i class="fas fa-envelope-open-text"></i></div>
        <p>${esc(copy.messagesSelect)}</p>
      </div>`;
      return;
    }

    pane.classList.add("is-thread-open");
    const salonName = state.activeSalon?.name || copy.messagesSalon || "Salon";
    const salonPath = state.activeSalon?.path || "#";
    const canReply = state.activeSalon?.messagingEnabled !== false;

    const bubbles = state.messages.length
      ? state.messages
          .map((m) => {
            const mine = m.sender === "user";
            const isSystem = m.sender === "system";
            const photos = (m.photoUrls || [])
              .map(
                (u) =>
                  `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(
                    u
                  )}" alt="" class="sq-msg-thumb"/></a>`
              )
              .join("");
            if (isSystem) {
              return `<div class="sq-msg-bubble sq-msg-bubble--system${
                m.isAutoReply ? " sq-msg-bubble--auto" : ""
              }">
                ${
                  m.isAutoReply
                    ? `<span class="sq-msg-auto-tag">${esc(copy.messagesAuto)}</span>`
                    : ""
                }
                ${m.body ? `<p>${esc(m.body)}</p>` : ""}
              </div>`;
            }
            return `<div class="sq-msg-bubble ${
              mine ? "sq-msg-bubble--mine" : "sq-msg-bubble--salon"
            }">
              ${m.body ? `<p>${esc(m.body)}</p>` : ""}
              ${photos ? `<div class="sq-msg-thumbs">${photos}</div>` : ""}
            </div>`;
          })
          .join("")
      : `<p class="sq-account-muted">${esc(copy.messagesSelect)}</p>`;

    thread.innerHTML = `
      <header class="sq-msg-inbox-thread__head">
        <button type="button" class="sq-msg-inbox-back" id="sqMsgInboxBack" aria-label="${esc(
          copy.messagesBack || "Retour"
        )}">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div class="sq-msg-inbox-thread__identity">
          <span class="sq-msg-inbox-item__avatar" aria-hidden="true">${esc(
            initials(salonName)
          )}</span>
          <div>
            <strong>${esc(salonName)}</strong>
            ${
              state.activeSalon?.city
                ? `<span class="sq-account-muted">${esc(state.activeSalon.city)}</span>`
                : ""
            }
          </div>
        </div>
        ${
          salonPath && salonPath !== "#"
            ? `<a class="sq-msg-inbox-salon-link" href="${esc(salonPath)}">${esc(
                copy.messagesOpenSalon
              )}</a>`
            : ""
        }
      </header>
      <div class="sq-msg-inbox-thread__body" id="sqMsgInboxBody">${bubbles}</div>
      ${
        canReply
          ? `<footer class="sq-msg-inbox-compose">
        <textarea id="sqMsgInboxInput" rows="2" placeholder="${esc(
          copy.messagesReply
        )}"></textarea>
        <button type="button" class="sq-btn sq-btn-fill" id="sqMsgInboxSend">${esc(
          copy.messagesSend
        )}</button>
      </footer>`
          : `<p class="sq-account-muted sq-msg-inbox-disabled">${esc(
              cfg.lang === "en"
                ? "Messaging is disabled for this salon."
                : "La messagerie est désactivée pour ce salon."
            )}</p>`
      }`;

    const body = document.getElementById("sqMsgInboxBody");
    if (body) body.scrollTop = body.scrollHeight;

    document.getElementById("sqMsgInboxBack")?.addEventListener("click", () => {
      state.activeId = null;
      state.activeSalon = null;
      state.messages = [];
      pane.classList.remove("is-thread-open");
      renderList();
      renderThread();
    });

    document.getElementById("sqMsgInboxSend")?.addEventListener("click", sendReply);
    document.getElementById("sqMsgInboxInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendReply();
      }
    });
  }

  async function openConversation(id) {
    if (!state.user || !id) return;
    state.activeId = id;
    renderList();
    const thread = document.getElementById("sqMsgInboxThread");
    if (thread) {
      thread.innerHTML = `<p class="sq-account-muted sq-account-loading">${esc(
        copy.loading || "Chargement…"
      )}</p>`;
    }
    try {
      const qs = new URLSearchParams({
        userId: state.user.id,
        conversationId: id,
      });
      const res = await fetch(`/api/public/client/conversation-messages?${qs}`);
      const data = await res.json();
      if (!data?.status) throw new Error(data?.message || "Erreur");
      state.messages = data.messages || [];
      state.activeSalon = data.salon || null;
      state.conversations = state.conversations.map((c) =>
        String(c._id) === String(id) ? { ...c, unreadUser: 0 } : c
      );
      renderList();
      renderThread();
    } catch (e) {
      if (thread) {
        thread.innerHTML = `<p class="sq-account-empty">${esc(e.message || "Erreur")}</p>`;
      }
    }
  }

  async function sendReply() {
    if (state.sending || !state.user || !state.activeSalon?._id) return;
    const input = document.getElementById("sqMsgInboxInput");
    const text = (input?.value || "").trim();
    if (!text) return;
    state.sending = true;
    const btn = document.getElementById("sqMsgInboxSend");
    if (btn) btn.disabled = true;
    try {
      const fd = new FormData();
      fd.append("salonId", String(state.activeSalon._id));
      fd.append("userId", state.user.id);
      fd.append("body", text);
      fd.append("lang", cfg.lang === "en" ? "en" : "fr");
      const res = await fetch("/api/public/messaging/send", { method: "POST", body: fd });
      const data = await res.json();
      if (!data?.status) throw new Error(data?.message || "Erreur");
      if (input) input.value = "";
      await openConversation(state.activeId);
      await refreshList(false);
    } catch (e) {
      alert(e.message || "Erreur");
    } finally {
      state.sending = false;
      if (btn) btn.disabled = false;
    }
  }

  async function refreshList(render = true) {
    const res = await fetch(
      `/api/public/client/conversations?userId=${encodeURIComponent(state.user.id)}`
    );
    const data = await res.json();
    if (!data?.status) throw new Error(data?.message || "Erreur");
    state.conversations = data.conversations || [];
    if (render) renderList();
  }

  async function mount(user) {
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (gate) gate.hidden = true;
    if (!content) return;
    content.hidden = false;
    state.user = user;

    content.innerHTML = `
      <div class="sq-msg-inbox" id="sqMsgInboxPane">
        <aside class="sq-msg-inbox__list-wrap">
          <div class="sq-msg-inbox__list" id="sqMsgInboxList">
            <p class="sq-account-muted sq-account-loading">${esc(
              copy.loading || "Chargement…"
            )}</p>
          </div>
        </aside>
        <section class="sq-msg-inbox__thread" id="sqMsgInboxThread"></section>
      </div>`;

    try {
      await refreshList(true);
      renderThread();
      const params = new URLSearchParams(window.location.search);
      const openId = params.get("c");
      if (openId) openConversation(openId);
    } catch (e) {
      const list = document.getElementById("sqMsgInboxList");
      if (list) {
        list.innerHTML = `<p class="sq-account-empty">${esc(e.message || "Erreur")}</p>`;
      }
    }
  }

  function init() {
    const user = window.SkedisyAccount?.getUser?.();
    const gate = document.getElementById("accountGate");
    const content = document.getElementById("accountContent");
    if (!user) {
      if (gate) gate.hidden = false;
      if (content) content.hidden = true;
      return;
    }
    mount(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
