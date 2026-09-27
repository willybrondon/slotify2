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

  fetch("/api/public/blog?limit=24")
    .then((r) => r.json())
    .then((data) => {
      const posts = (data && data.posts) || [];
      if (!posts.length) {
        grid.innerHTML = "";
        return;
      }
      if (soon) soon.hidden = true;
      grid.innerHTML = posts
        .map((p) => {
          const label = CAT_LABEL[p.category] || "Article";
          const mins = p.readingMinutes ? `${p.readingMinutes} min` : "";
          return `
          <a href="/blog/${esc(p.slug)}" class="sq-blog-card">
            ${
              p.coverImage
                ? `<img class="sq-blog-card-cover" src="${esc(p.coverImage)}" alt="" loading="lazy" />`
                : ""
            }
            <span class="sq-blog-card-label">${esc(label)}</span>
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
      /* keep static guides */
    });
})();
