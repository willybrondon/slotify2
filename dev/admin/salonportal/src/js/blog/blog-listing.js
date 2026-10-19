/**
 * Public blog listing — loads published posts from /api/public/blog
 */
(function () {
  const grid = document.getElementById("sq-blog-dynamic-grid");
  const soon = document.getElementById("sq-blog-soon-section");
  if (!grid) return;

  const CAT_LABEL = {
    guides: "Guides",
    coiffure: "Coiffure",
    salons: "Salons",
    app: "App",
    pro: "Pro",
    tendances: "Tendances",
    autre: "Blog",
  };

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
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return "";
    }
  }

  const params = new URLSearchParams(window.location.search || "");
  const forAudience = (params.get("for") || params.get("audience") || "client").toLowerCase();
  const isPro = forAudience === "pro";

  const switchEl = document.getElementById("sq-blog-audience-switch");
  if (switchEl) {
    switchEl.setAttribute("data-audience", isPro ? "pro" : "client");
    switchEl.innerHTML = isPro
      ? `<a href="/blog/" class="sq-link" data-translate="blog.switchToClient">← Articles clientes</a>`
      : `<a href="/blog/?for=pro" class="sq-link" data-translate="blog.switchToPro">Articles pro →</a>`;
  }
  const heroTitle = document.querySelector('[data-translate="blog.heroTitle"], [data-translate="blog.forProsTitle"], [data-translate="blog.forClientsTitle"]');
  const heroLead = document.querySelector('[data-translate="blog.heroLead"], [data-translate="blog.forProsLead"], [data-translate="blog.forClientsLead"]');
  if (isPro && heroTitle) {
    heroTitle.setAttribute("data-translate", "blog.forProsTitle");
    heroTitle.textContent = "Blog pro";
  }
  if (isPro && heroLead) {
    heroLead.setAttribute("data-translate", "blog.forProsLead");
  }

  // Server already injected article cards for SEO
  if (grid.getAttribute("data-ssr") === "1" && grid.children.length) {
    if (soon) soon.hidden = true;
    return;
  }

  fetch("/api/public/blog?limit=24&for=" + encodeURIComponent(isPro ? "pro" : "client"))
    .then((r) => r.json())
    .then((data) => {
      const posts = (data && data.posts) || [];
      if (!posts.length) {
        grid.innerHTML = `<p class="sq-lead">${
          isPro
            ? "Aucun article pro pour le moment."
            : "Aucun article pour le moment."
        }</p>`;
        return;
      }
      if (soon) soon.hidden = true;
      grid.innerHTML = posts
        .map((p) => {
          const label = CAT_LABEL[p.category] || "Article";
          const aud =
            p.audience === "pro"
              ? "Pro"
              : p.audience === "both"
              ? "Clientes & pro"
              : "";
          const mins = p.readingMinutes ? `${p.readingMinutes} min` : "";
          return `
          <a href="/blog/${esc(p.slug)}" class="sq-blog-card">
            ${
              p.coverImage
                ? `<img class="sq-blog-card-cover" src="${esc(p.coverImage)}" alt="" loading="lazy" />`
                : ""
            }
            <span class="sq-blog-card-label">${esc(label)}${
            aud ? " · " + esc(aud) : ""
          }</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt || "")}</p>
            <span class="sq-blog-card-meta">${esc(formatDate(p.publishedAt))}${
            mins ? " · " + esc(mins) : ""
          }</span>
            <span class="sq-link">Lire l'article →</span>
          </a>`;
        })
        .join("");
    })
    .catch(() => {
      /* keep empty */
    });
})();
