(function () {
  const cfg = window.__SKEDISY_BLOG__ || {};
  const API_BASE = (cfg.apiBase || window.location.origin + "/").replace(/\/?$/, "/");
  const API_KEY = cfg.apiKey || "";
  const TOKEN_KEY = "blogAdminToken";
  const AUTHOR_KEY = "blogAdminAuthor";
  const KEY_STORE = "blogAdminApiKey";

  const CATEGORIES = [
    { id: "guides", label: "Guides" },
    { id: "coiffure", label: "Coiffure" },
    { id: "salons", label: "Salons" },
    { id: "app", label: "App" },
    { id: "pro", label: "Pro" },
    { id: "tendances", label: "Tendances" },
    { id: "autre", label: "Autre" },
  ];

  const STATUS_LABEL = {
    draft: "Brouillon",
    pending: "En validation",
    published: "Publié",
    rejected: "Refusé",
  };

  const app = document.getElementById("app");
  let state = {
    view: "login",
    author: null,
    posts: [],
    filter: "all",
    editing: null,
    loading: false,
    error: "",
  };
  let quill = null;
  let toastTimer = null;

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }
  function getApiKey() {
    return sessionStorage.getItem(KEY_STORE) || API_KEY || "";
  }
  function setSession(token, author, apiKey) {
    sessionStorage.setItem(TOKEN_KEY, token || "");
    sessionStorage.setItem(AUTHOR_KEY, JSON.stringify(author || {}));
    if (apiKey) sessionStorage.setItem(KEY_STORE, apiKey);
  }
  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(AUTHOR_KEY);
    sessionStorage.removeItem(KEY_STORE);
  }

  /** Toast without remounting the editor (avoids Quill destroy / scroll bugs). */
  function toast(msg) {
    let el = document.getElementById("ba-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ba-toast";
      el.className = "ba-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = String(msg || "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2800);
  }

  async function api(path, options = {}) {
    const isForm = options.body instanceof FormData;
    const headers = Object.assign({ key: getApiKey() }, options.headers || {});
    if (!isForm && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    // Let the browser set multipart boundary for FormData
    if (isForm) {
      delete headers["Content-Type"];
    }

    const token = getToken();
    if (token) headers.Authorization = token;

    const opts = Object.assign({}, options, { headers });
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }

    let res;
    try {
      res = await fetch(API_BASE + path.replace(/^\//, ""), opts);
    } catch (e) {
      throw new Error("Réseau indisponible. Réessayez.");
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 403 || data.code === "E_UNAUTHORIZED") {
      clearSession();
      quill = null;
      state.view = "login";
      state.author = null;
      state.error = "Session expirée. Reconnectez-vous.";
      render();
      throw new Error("unauthorized");
    }
    if (!res.ok && !data.message) {
      throw new Error("Erreur serveur (" + res.status + ")");
    }
    return data;
  }

  async function uploadImage(file) {
    if (!file) throw new Error("Fichier manquant");
    if (!String(file.type || "").startsWith("image/")) {
      throw new Error("Choisissez une image (JPG, PNG, WebP…).");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Image trop lourde (max 8 Mo).");
    }
    const fd = new FormData();
    fd.append("image", file, file.name || "image.jpg");
    const data = await api("blogAdmin/upload", { method: "POST", body: fd });
    if (!data || !data.status || !data.url) {
      throw new Error((data && data.message) || "Upload échoué");
    }
    return data.url;
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(d) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return "";
    }
  }

  function emptyPost() {
    return {
      _id: null,
      title: "",
      slug: "",
      excerpt: "",
      contentHtml: "",
      coverImage: "",
      category: "guides",
      tags: [],
      seoTitle: "",
      seoDescription: "",
      status: "draft",
      rejectionReason: "",
    };
  }

  function destroyQuill() {
    if (!quill) return;
    try {
      const root = quill.root;
      if (root && root.parentNode) {
        // Quill wraps toolbar+container; wipe parent editor host on next render.
      }
    } catch (_) {}
    quill = null;
  }

  function syncEditingFromDom() {
    if (!state.editing || state.view !== "editor") return;
    const titleEl = document.getElementById("ba-title");
    const excerptEl = document.getElementById("ba-excerpt");
    const slugEl = document.getElementById("ba-slug");
    const categoryEl = document.getElementById("ba-category");
    const tagsEl = document.getElementById("ba-tags");
    const seoTitleEl = document.getElementById("ba-seo-title");
    const seoDescEl = document.getElementById("ba-seo-desc");
    if (titleEl) state.editing.title = titleEl.value;
    if (excerptEl) state.editing.excerpt = excerptEl.value;
    if (slugEl) state.editing.slug = slugEl.value;
    if (categoryEl) state.editing.category = categoryEl.value;
    if (tagsEl) {
      state.editing.tags = String(tagsEl.value || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (seoTitleEl) state.editing.seoTitle = seoTitleEl.value;
    if (seoDescEl) state.editing.seoDescription = seoDescEl.value;
    if (quill) {
      state.editing.contentHtml = quill.root.innerHTML;
    }
  }

  function collectEditorForm() {
    syncEditingFromDom();
    const p = state.editing || emptyPost();
    return {
      title: String(p.title || "").trim(),
      excerpt: String(p.excerpt || "").trim(),
      slug: String(p.slug || "").trim(),
      category: p.category || "guides",
      tags: Array.isArray(p.tags) ? p.tags : [],
      seoTitle: String(p.seoTitle || "").trim(),
      seoDescription: String(p.seoDescription || "").trim(),
      coverImage: String(p.coverImage || "").trim(),
      contentHtml: p.contentHtml || "",
    };
  }

  function setBusy(busy) {
    state.loading = !!busy;
    ["ba-save", "ba-submit", "ba-cover-btn", "ba-new"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !!busy;
    });
  }

  function updateStatusBadge() {
    const badge = document.getElementById("ba-status-badge");
    if (!badge || !state.editing) return;
    const st = state.editing.status || "draft";
    badge.className = "ba-badge " + st;
    badge.textContent = STATUS_LABEL[st] || st;
    const submit = document.getElementById("ba-submit");
    if (submit) {
      submit.disabled =
        state.loading || st === "pending" || st === "published";
    }
  }

  function updateCoverPreview(url) {
    if (!state.editing) return;
    state.editing.coverImage = url || "";
    const box = document.getElementById("ba-cover-box");
    if (!box) return;
    let img = box.querySelector("img.ba-cover-img");
    const hint = box.querySelector(".ba-cover-hint");
    let clearBtn = document.getElementById("ba-cover-clear");
    if (!url) {
      if (img) img.remove();
      if (clearBtn) clearBtn.remove();
      if (!hint) {
        const p = document.createElement("p");
        p.className = "ba-hint ba-cover-hint";
        p.textContent = "Image de couverture";
        box.insertBefore(p, box.firstChild);
      }
      return;
    }
    if (hint) hint.remove();
    if (!img) {
      img = document.createElement("img");
      img.className = "ba-cover-img";
      img.alt = "";
      box.insertBefore(img, box.firstChild);
    }
    img.src = url;
    if (!clearBtn) {
      clearBtn = document.createElement("button");
      clearBtn.className = "ba-btn ba-btn-ghost ba-btn-sm";
      clearBtn.type = "button";
      clearBtn.id = "ba-cover-clear";
      clearBtn.textContent = "Retirer";
      clearBtn.onclick = () => {
        updateCoverPreview("");
        toast("Couverture retirée");
      };
      const coverBtn = document.getElementById("ba-cover-btn");
      if (coverBtn && coverBtn.parentNode === box) {
        box.insertBefore(clearBtn, coverBtn.nextSibling);
      } else {
        box.appendChild(clearBtn);
      }
    }
  }

  function initQuill() {
    const host = document.getElementById("ba-editor");
    if (!host || typeof Quill === "undefined") return;

    // Avoid double-init on the same host
    if (host.querySelector(".ql-editor") && quill) return;

    destroyQuill();
    host.innerHTML = "";

    quill = new Quill(host, {
      theme: "snow",
      placeholder:
        "Écrivez comme sur un blog beauté : intro accrocheuse, titres clairs, listes, images…",
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
          handlers: {
            image: function () {
              pickAndInsertInlineImage();
            },
          },
        },
      },
    });

    const html = (state.editing && state.editing.contentHtml) || "";
    if (html && html !== "<p><br></p>") {
      quill.clipboard.dangerouslyPasteHTML(html);
    }
  }

  function pickAndInsertInlineImage() {
    if (!quill) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const editor = quill;
      if (!editor) return;
      try {
        toast("Upload image…");
        const url = await uploadImage(file);
        // Quill must still be the live instance (toast must not remount)
        if (!quill || quill !== editor) {
          toast("Éditeur rechargé — réinsérez l’image.");
          return;
        }
        const range = quill.getSelection(true) || {
          index: Math.max(0, quill.getLength() - 1),
          length: 0,
        };
        quill.insertEmbed(range.index, "image", url, "user");
        quill.setSelection(range.index + 1, 0, "user");
        syncEditingFromDom();
        toast("Image ajoutée");
      } catch (e) {
        if (e.message !== "unauthorized") {
          toast(e.message || "Upload échoué");
        }
      }
    };
    input.click();
  }

  async function bootstrap() {
    const token = getToken();
    if (!token) {
      state.view = "login";
      render();
      return;
    }
    try {
      const me = await api("blogAdmin/me");
      if (!me.status) throw new Error("no");
      state.author = me.author;
      state.view = "list";
      await loadPosts();
    } catch (_) {
      clearSession();
      state.view = "login";
      render();
    }
  }

  async function loadPosts() {
    state.loading = true;
    render();
    try {
      const q =
        state.filter !== "all"
          ? "?status=" + encodeURIComponent(state.filter)
          : "";
      const data = await api("blogAdmin/posts" + q);
      state.posts = data.posts || [];
    } catch (e) {
      if (e.message !== "unauthorized") {
        toast(e.message || "Erreur chargement");
      }
    } finally {
      state.loading = false;
      render();
    }
  }

  async function login(email, password) {
    state.error = "";
    state.loading = true;
    render();
    try {
      const data = await api("blogAdmin/login", {
        method: "POST",
        body: { email, password },
      });
      if (!data.status) {
        state.error = data.message || "Connexion refusée";
        state.loading = false;
        render();
        return;
      }
      setSession(data.token, data.author, data.apiKey || API_KEY);
      state.author = data.author;
      state.view = "list";
      state.loading = false;
      await loadPosts();
    } catch (e) {
      state.error = "Impossible de se connecter.";
      state.loading = false;
      render();
    }
  }

  async function openEditor(id) {
    state.loading = true;
    render();
    try {
      if (!id) {
        state.editing = emptyPost();
      } else {
        const data = await api("blogAdmin/posts/" + id);
        if (!data.status) throw new Error(data.message || "Introuvable");
        state.editing = data.post;
      }
      state.view = "editor";
      state.loading = false;
      render();
    } catch (e) {
      state.loading = false;
      if (e.message !== "unauthorized") toast(e.message || "Erreur");
      state.view = "list";
      render();
    }
  }

  async function saveDraft() {
    const body = collectEditorForm();
    if (!body.title) {
      toast("Titre requis");
      return false;
    }
    setBusy(true);
    try {
      let data;
      if (state.editing._id) {
        data = await api("blogAdmin/posts/" + state.editing._id, {
          method: "PUT",
          body,
        });
      } else {
        data = await api("blogAdmin/posts", { method: "POST", body });
      }
      if (!data.status) {
        toast(data.message || "Erreur sauvegarde");
        setBusy(false);
        return false;
      }
      // Keep live editor content; merge server fields (id, slug, status…)
      const liveHtml = quill ? quill.root.innerHTML : body.contentHtml;
      state.editing = Object.assign({}, data.post, {
        contentHtml: liveHtml,
        coverImage: body.coverImage || data.post.coverImage || "",
      });
      updateStatusBadge();
      toast("Brouillon enregistré");
      setBusy(false);
      return true;
    } catch (e) {
      if (e.message !== "unauthorized") toast(e.message || "Erreur");
      setBusy(false);
      return false;
    }
  }

  async function submitReview() {
    const ok = await saveDraft();
    if (!ok || !state.editing || !state.editing._id) return;
    setBusy(true);
    try {
      const data = await api(
        "blogAdmin/posts/" + state.editing._id + "/submit",
        { method: "POST", body: {} }
      );
      if (!data.status) {
        toast(data.message || "Envoi refusé");
        setBusy(false);
        return;
      }
      state.editing = Object.assign({}, state.editing, data.post, {
        contentHtml: quill ? quill.root.innerHTML : state.editing.contentHtml,
      });
      updateStatusBadge();
      toast("Envoyé pour validation admin");
    } catch (e) {
      if (e.message !== "unauthorized") toast(e.message || "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const data = await api("blogAdmin/posts/" + id, { method: "DELETE" });
      toast(data.message || "Supprimé");
      await loadPosts();
    } catch (e) {
      if (e.message !== "unauthorized") toast(e.message || "Erreur");
    }
  }

  async function onCoverSelected(file) {
    if (!file || !state.editing) return;
    try {
      toast("Upload couverture…");
      const url = await uploadImage(file);
      updateCoverPreview(url);
      toast("Couverture mise à jour");
    } catch (e) {
      if (e.message !== "unauthorized") toast(e.message || "Upload échoué");
    }
  }

  function renderLogin() {
    return `
      <div class="ba-login">
        <div class="ba-login-card">
          <h1>Skedisy</h1>
          <p class="ba-sub">Espace rédaction blog</p>
          ${state.error ? `<div class="ba-error">${esc(state.error)}</div>` : ""}
          <form id="ba-login-form">
            <div class="ba-field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" autocomplete="username" required placeholder="auteur@skedisy.com" />
            </div>
            <div class="ba-field">
              <label for="password">Mot de passe</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required />
            </div>
            <button class="ba-btn ba-btn-primary" type="submit" style="width:100%" ${
              state.loading ? "disabled" : ""
            }>
              ${state.loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
          <p class="ba-hint" style="text-align:center;margin-top:18px">
            Accès fourni par l’équipe Skedisy. Les articles sont publiés après validation admin.
          </p>
        </div>
      </div>`;
  }

  function renderList() {
    const filters = ["all", "draft", "pending", "published", "rejected"];
    const cards = (state.posts || [])
      .map((p) => {
        const canEdit = p.status !== "published";
        return `
        <article class="ba-card">
          <div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt || "Sans extrait")}</p>
            <div class="ba-meta">
              <span class="ba-badge ${esc(p.status)}">${esc(
                STATUS_LABEL[p.status] || p.status
              )}</span>
              <span class="ba-hint">${esc(formatDate(p.updatedAt))} · ${esc(
          p.category || ""
        )}</span>
            </div>
            ${
              p.status === "rejected" && p.rejectionReason
                ? `<div class="ba-reject-box" style="margin-top:10px">${esc(
                    p.rejectionReason
                  )}</div>`
                : ""
            }
          </div>
          <div class="ba-card-actions">
            ${
              canEdit
                ? `<button class="ba-btn ba-btn-ghost ba-btn-sm" data-edit="${esc(
                    p._id
                  )}">Écrire</button>`
                : `<a class="ba-btn ba-btn-ghost ba-btn-sm" href="/blog/${esc(
                    p.slug
                  )}" target="_blank" rel="noopener">Voir</a>`
            }
            ${
              canEdit
                ? `<button class="ba-btn ba-btn-danger ba-btn-sm" data-del="${esc(
                    p._id
                  )}">Suppr.</button>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");

    return `
      <div class="ba-shell">
        ${renderTop()}
        <main class="ba-main">
          <div class="ba-toolbar-row">
            <div class="ba-filters">
              ${filters
                .map(
                  (f) =>
                    `<button class="ba-chip ${
                      state.filter === f ? "active" : ""
                    }" data-filter="${f}">${
                      f === "all" ? "Tous" : STATUS_LABEL[f]
                    }</button>`
                )
                .join("")}
            </div>
            <button class="ba-btn ba-btn-primary" id="ba-new">Nouvel article</button>
          </div>
          ${
            state.loading
              ? `<div class="ba-empty">Chargement…</div>`
              : cards ||
                `<div class="ba-empty">Aucun article. Créez votre premier guide beauté.</div>`
          }
        </main>
      </div>`;
  }

  function renderTop() {
    return `
      <header class="ba-top">
        <div class="ba-brand">
          <h1>Skedisy</h1>
          <span>Rédaction blog</span>
        </div>
        <div class="ba-top-actions">
          <span class="ba-user">${esc(
            (state.author && state.author.name) || ""
          )}</span>
          ${
            state.view === "editor"
              ? `<button class="ba-btn ba-btn-ghost ba-btn-sm" id="ba-back">Mes articles</button>`
              : ""
          }
          <button class="ba-btn ba-btn-ghost ba-btn-sm" id="ba-logout">Déconnexion</button>
        </div>
      </header>`;
  }

  function renderEditor() {
    const p = state.editing || emptyPost();
    const tags = Array.isArray(p.tags) ? p.tags.join(", ") : "";
    return `
      <div class="ba-shell">
        ${renderTop()}
        <main class="ba-main">
          ${
            p.status === "rejected" && p.rejectionReason
              ? `<div class="ba-reject-box"><strong>Refusé :</strong> ${esc(
                  p.rejectionReason
                )}</div>`
              : ""
          }
          <div class="ba-toolbar-row">
            <div>
              <span class="ba-badge ${esc(p.status || "draft")}" id="ba-status-badge">${esc(
                STATUS_LABEL[p.status] || "Brouillon"
              )}</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="ba-btn ba-btn-ghost" id="ba-save">Enregistrer</button>
              <button class="ba-btn ba-btn-primary" id="ba-submit" ${
                p.status === "pending" || p.status === "published"
                  ? "disabled"
                  : ""
              }>Envoyer pour validation</button>
            </div>
          </div>
          <div class="ba-editor-layout">
            <div class="ba-editor-col">
              <input class="ba-title-input" id="ba-title" value="${esc(
                p.title
              )}" placeholder="Titre de l’article" />
              <div id="ba-editor"></div>
              <p class="ba-tools-help">
                <strong>Outils d’écriture :</strong> titres H1–H3, gras/italique, couleurs, listes, citations,
                liens, images (upload), vidéos, alignement.
              </p>
            </div>
            <aside class="ba-panel ba-panel-side">
              <h2>Publication</h2>
              <div class="ba-cover" id="ba-cover-box">
                ${
                  p.coverImage
                    ? `<img class="ba-cover-img" src="${esc(
                        p.coverImage
                      )}" alt="" />`
                    : `<p class="ba-hint ba-cover-hint">Image de couverture</p>`
                }
                <button class="ba-btn ba-btn-ghost ba-btn-sm" type="button" id="ba-cover-btn">Choisir une image</button>
                ${
                  p.coverImage
                    ? `<button class="ba-btn ba-btn-ghost ba-btn-sm" type="button" id="ba-cover-clear">Retirer</button>`
                    : ""
                }
                <input type="file" id="ba-cover-input" accept="image/*" hidden />
              </div>
              <div class="ba-field">
                <label>Extrait (accroche)</label>
                <textarea id="ba-excerpt" rows="3">${esc(p.excerpt)}</textarea>
              </div>
              <div class="ba-field">
                <label>Catégorie</label>
                <select id="ba-category">
                  ${CATEGORIES.map(
                    (c) =>
                      `<option value="${c.id}" ${
                        p.category === c.id ? "selected" : ""
                      }>${c.label}</option>`
                  ).join("")}
                </select>
              </div>
              <div class="ba-field">
                <label>Tags (virgules)</label>
                <input id="ba-tags" value="${esc(tags)}" placeholder="tresses, locks, IDF" />
              </div>
              <div class="ba-field">
                <label>Slug URL</label>
                <input id="ba-slug" value="${esc(
                  p.slug
                )}" placeholder="auto depuis le titre" />
              </div>
              <h2 style="margin-top:18px">SEO</h2>
              <div class="ba-field">
                <label>Meta titre</label>
                <input id="ba-seo-title" value="${esc(p.seoTitle)}" />
              </div>
              <div class="ba-field">
                <label>Meta description</label>
                <textarea id="ba-seo-desc" rows="3">${esc(
                  p.seoDescription
                )}</textarea>
              </div>
              <p class="ba-hint">Publication sur skedisy.com/blog uniquement après validation admin.</p>
            </aside>
          </div>
        </main>
      </div>`;
  }

  function render() {
    const wasEditor = state.view === "editor";
    if (wasEditor) {
      syncEditingFromDom();
    } else {
      destroyQuill();
    }

    if (state.view === "login") {
      destroyQuill();
      app.innerHTML = renderLogin();
    } else if (state.view === "editor") {
      destroyQuill();
      app.innerHTML = renderEditor();
    } else {
      destroyQuill();
      app.innerHTML = renderList();
    }

    bind();

    if (state.view === "editor") {
      // Init after DOM paint so Quill measures correctly
      requestAnimationFrame(() => initQuill());
    }
  }

  function bind() {
    const loginForm = document.getElementById("ba-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        login(
          document.getElementById("email").value,
          document.getElementById("password").value
        );
      });
    }

    const logout = document.getElementById("ba-logout");
    if (logout) {
      logout.onclick = () => {
        clearSession();
        destroyQuill();
        state = {
          view: "login",
          author: null,
          posts: [],
          filter: "all",
          editing: null,
          loading: false,
          error: "",
        };
        render();
      };
    }

    const back = document.getElementById("ba-back");
    if (back) {
      back.onclick = async () => {
        syncEditingFromDom();
        destroyQuill();
        state.view = "list";
        state.editing = null;
        await loadPosts();
      };
    }

    const neu = document.getElementById("ba-new");
    if (neu) neu.onclick = () => openEditor(null);

    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.onclick = async () => {
        state.filter = btn.getAttribute("data-filter");
        await loadPosts();
      };
    });
    document.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.onclick = () => openEditor(btn.getAttribute("data-edit"));
    });
    document.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = () => deletePost(btn.getAttribute("data-del"));
    });

    const save = document.getElementById("ba-save");
    if (save) save.onclick = () => saveDraft();
    const submit = document.getElementById("ba-submit");
    if (submit) submit.onclick = () => submitReview();

    const coverBtn = document.getElementById("ba-cover-btn");
    const coverInput = document.getElementById("ba-cover-input");
    const coverClear = document.getElementById("ba-cover-clear");
    if (coverBtn && coverInput) {
      coverBtn.onclick = () => coverInput.click();
      coverInput.onchange = () => {
        const file = coverInput.files && coverInput.files[0];
        coverInput.value = "";
        onCoverSelected(file);
      };
    }
    if (coverClear) {
      coverClear.onclick = () => {
        updateCoverPreview("");
        const clearBtn = document.getElementById("ba-cover-clear");
        if (clearBtn) clearBtn.remove();
        toast("Couverture retirée");
      };
    }

    // Persist field edits into state without remount
    ["ba-title", "ba-excerpt", "ba-slug", "ba-category", "ba-tags", "ba-seo-title", "ba-seo-desc"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", syncEditingFromDom);
        el.addEventListener("input", syncEditingFromDom);
      }
    );
  }

  bootstrap();
})();
