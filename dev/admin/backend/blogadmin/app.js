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
    toast: "",
  };
  let quill = null;

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

  function toast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      render();
    }, 2800);
  }

  async function api(path, options = {}) {
    const headers = Object.assign(
      { key: getApiKey(), "Content-Type": "application/json" },
      options.headers || {}
    );
    const token = getToken();
    if (token) headers.Authorization = token;
    const opts = Object.assign({}, options, { headers });
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }
    if (opts.body instanceof FormData) {
      delete headers["Content-Type"];
    }
    const res = await fetch(API_BASE + path.replace(/^\//, ""), opts);
    const data = await res.json().catch(() => ({}));
    if (res.status === 403 || data.code === "E_UNAUTHORIZED") {
      clearSession();
      state.view = "login";
      state.author = null;
      state.error = "Session expirée. Reconnectez-vous.";
      render();
      throw new Error("unauthorized");
    }
    return data;
  }

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);
    const data = await api("blogAdmin/upload", { method: "POST", body: fd });
    if (!data.status) throw new Error(data.message || "Upload échoué");
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
      const q = state.filter !== "all" ? `?status=${encodeURIComponent(state.filter)}` : "";
      const data = await api("blogAdmin/posts" + q);
      state.posts = data.posts || [];
    } catch (e) {
      state.error = e.message || "Erreur chargement";
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
      initQuill();
    } catch (e) {
      toast(e.message || "Erreur");
      state.loading = false;
      render();
    }
  }

  function initQuill() {
    const el = document.getElementById("ba-editor");
    if (!el || typeof Quill === "undefined") return;
    quill = new Quill("#ba-editor", {
      theme: "snow",
      placeholder: "Écrivez comme sur un blog beauté : intro accrocheuse, titres clairs, listes, images…",
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
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async () => {
                const file = input.files && input.files[0];
                if (!file) return;
                try {
                  toast("Upload image…");
                  const url = await uploadImage(file);
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, "image", url, "user");
                  quill.setSelection(range.index + 1);
                } catch (e) {
                  toast(e.message || "Upload échoué");
                }
              };
              input.click();
            },
          },
        },
      },
    });
    if (state.editing && state.editing.contentHtml) {
      quill.root.innerHTML = state.editing.contentHtml;
    }
  }

  function collectEditorForm() {
    const title = (document.getElementById("ba-title") || {}).value || "";
    const excerpt = (document.getElementById("ba-excerpt") || {}).value || "";
    const slug = (document.getElementById("ba-slug") || {}).value || "";
    const category = (document.getElementById("ba-category") || {}).value || "guides";
    const tags = (document.getElementById("ba-tags") || {}).value || "";
    const seoTitle = (document.getElementById("ba-seo-title") || {}).value || "";
    const seoDescription = (document.getElementById("ba-seo-desc") || {}).value || "";
    const coverImage = state.editing.coverImage || "";
    const contentHtml = quill ? quill.root.innerHTML : state.editing.contentHtml || "";
    return {
      title: title.trim(),
      excerpt: excerpt.trim(),
      slug: slug.trim(),
      category,
      tags,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      coverImage,
      contentHtml,
    };
  }

  async function saveDraft() {
    const body = collectEditorForm();
    if (!body.title) {
      toast("Titre requis");
      return;
    }
    state.loading = true;
    render();
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
        state.loading = false;
        render();
        initQuill();
        return;
      }
      state.editing = data.post;
      toast("Brouillon enregistré");
      state.loading = false;
      render();
      initQuill();
    } catch (e) {
      toast(e.message || "Erreur");
      state.loading = false;
      render();
      initQuill();
    }
  }

  async function submitReview() {
    await saveDraft();
    if (!state.editing || !state.editing._id) return;
    try {
      const data = await api("blogAdmin/posts/" + state.editing._id + "/submit", {
        method: "POST",
        body: {},
      });
      if (!data.status) {
        toast(data.message || "Envoi refusé");
        return;
      }
      state.editing = data.post;
      toast("Envoyé pour validation admin");
      render();
      initQuill();
    } catch (e) {
      toast(e.message || "Erreur");
    }
  }

  async function deletePost(id) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const data = await api("blogAdmin/posts/" + id, { method: "DELETE" });
      toast(data.message || "Supprimé");
      await loadPosts();
    } catch (e) {
      toast(e.message || "Erreur");
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
            <button class="ba-btn ba-btn-primary" type="submit" style="width:100%" ${state.loading ? "disabled" : ""}>
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
              <span class="ba-badge ${esc(p.status)}">${esc(STATUS_LABEL[p.status] || p.status)}</span>
              <span class="ba-hint">${esc(formatDate(p.updatedAt))} · ${esc(p.category || "")}</span>
            </div>
            ${
              p.status === "rejected" && p.rejectionReason
                ? `<div class="ba-reject-box" style="margin-top:10px">${esc(p.rejectionReason)}</div>`
                : ""
            }
          </div>
          <div class="ba-card-actions">
            ${
              canEdit
                ? `<button class="ba-btn ba-btn-ghost ba-btn-sm" data-edit="${esc(p._id)}">Écrire</button>`
                : `<a class="ba-btn ba-btn-ghost ba-btn-sm" href="/blog/${esc(p.slug)}" target="_blank" rel="noopener">Voir</a>`
            }
            ${
              canEdit
                ? `<button class="ba-btn ba-btn-danger ba-btn-sm" data-del="${esc(p._id)}">Suppr.</button>`
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
                    `<button class="ba-chip ${state.filter === f ? "active" : ""}" data-filter="${f}">${
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
              : cards || `<div class="ba-empty">Aucun article. Créez votre premier guide beauté.</div>`
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
          <span class="ba-user">${esc((state.author && state.author.name) || "")}</span>
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
              ? `<div class="ba-reject-box"><strong>Refusé :</strong> ${esc(p.rejectionReason)}</div>`
              : ""
          }
          <div class="ba-toolbar-row">
            <div>
              <span class="ba-badge ${esc(p.status || "draft")}">${esc(
                STATUS_LABEL[p.status] || "Brouillon"
              )}</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="ba-btn ba-btn-ghost" id="ba-save" ${state.loading ? "disabled" : ""}>Enregistrer</button>
              <button class="ba-btn ba-btn-primary" id="ba-submit" ${
                state.loading || p.status === "pending" || p.status === "published" ? "disabled" : ""
              }>Envoyer pour validation</button>
            </div>
          </div>
          <div class="ba-editor-layout">
            <div>
              <input class="ba-title-input" id="ba-title" value="${esc(p.title)}" placeholder="Titre de l’article" />
              <div id="ba-editor"></div>
              <p class="ba-tools-help">
                <strong>Outils d’écriture :</strong> titres H1–H3, gras/italique, couleurs, listes, citations,
                liens, images (upload), vidéos, alignement — style blog beauté (guides coiffure, tendances, salons).
              </p>
            </div>
            <aside class="ba-panel">
              <h2>Publication</h2>
              <div class="ba-cover" id="ba-cover-box">
                ${p.coverImage ? `<img src="${esc(p.coverImage)}" alt="" />` : `<p class="ba-hint">Image de couverture</p>`}
                <button class="ba-btn ba-btn-ghost ba-btn-sm" type="button" id="ba-cover-btn">Choisir une image</button>
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
                      `<option value="${c.id}" ${p.category === c.id ? "selected" : ""}>${c.label}</option>`
                  ).join("")}
                </select>
              </div>
              <div class="ba-field">
                <label>Tags (virgules)</label>
                <input id="ba-tags" value="${esc(tags)}" placeholder="tresses, locks, IDF" />
              </div>
              <div class="ba-field">
                <label>Slug URL</label>
                <input id="ba-slug" value="${esc(p.slug)}" placeholder="auto depuis le titre" />
              </div>
              <h2 style="margin-top:18px">SEO</h2>
              <div class="ba-field">
                <label>Meta titre</label>
                <input id="ba-seo-title" value="${esc(p.seoTitle)}" />
              </div>
              <div class="ba-field">
                <label>Meta description</label>
                <textarea id="ba-seo-desc" rows="3">${esc(p.seoDescription)}</textarea>
              </div>
              <p class="ba-hint">Publication sur skedisy.com/blog uniquement après validation admin.</p>
            </aside>
          </div>
        </main>
      </div>`;
  }

  function render() {
    if (state.view === "login") app.innerHTML = renderLogin();
    else if (state.view === "editor") app.innerHTML = renderEditor();
    else app.innerHTML = renderList();

    if (state.toast) {
      const t = document.createElement("div");
      t.className = "ba-toast";
      t.textContent = state.toast;
      app.appendChild(t);
    }
    bind();
  }

  function bind() {
    const loginForm = document.getElementById("ba-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
      });
    }

    const logout = document.getElementById("ba-logout");
    if (logout) {
      logout.onclick = () => {
        clearSession();
        state = {
          view: "login",
          author: null,
          posts: [],
          filter: "all",
          editing: null,
          loading: false,
          error: "",
          toast: "",
        };
        render();
      };
    }

    const back = document.getElementById("ba-back");
    if (back) {
      back.onclick = async () => {
        state.view = "list";
        state.editing = null;
        quill = null;
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
    if (coverBtn && coverInput) {
      coverBtn.onclick = () => coverInput.click();
      coverInput.onchange = async () => {
        const file = coverInput.files && coverInput.files[0];
        if (!file) return;
        try {
          toast("Upload couverture…");
          const url = await uploadImage(file);
          state.editing.coverImage = url;
          const html = quill ? quill.root.innerHTML : state.editing.contentHtml;
          const form = collectEditorForm();
          state.editing = Object.assign({}, state.editing, form, {
            coverImage: url,
            contentHtml: html,
          });
          render();
          initQuill();
        } catch (e) {
          toast(e.message || "Upload échoué");
        }
      };
    }
  }

  bootstrap();
})();
