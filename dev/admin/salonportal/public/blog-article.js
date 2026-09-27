/**
 * Public blog article — /blog/:slug
 */
(function () {
  const root = document.getElementById("sq-article-root");
  if (!root) return;

  const parts = window.location.pathname.replace(/\/+$/, "").split("/");
  const slug = decodeURIComponent(parts[parts.length - 1] || "").toLowerCase();
  if (!slug || slug === "blog") {
    root.innerHTML = `<p class="sq-lead">Article introuvable. <a href="/blog/">Retour au blog</a></p>`;
    return;
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
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return "";
    }
  }

  root.innerHTML = `<p class="sq-lead">Chargement…</p>`;

  fetch("/api/public/blog/" + encodeURIComponent(slug))
    .then((r) => r.json())
    .then((data) => {
      if (!data || !data.status || !data.post) {
        root.innerHTML = `<p class="sq-lead">Article introuvable. <a href="/blog/">Retour au blog</a></p>`;
        document.title = "Article introuvable — Blog Skedisy";
        return;
      }
      const p = data.post;
      const seoTitle = p.seoTitle || p.title;
      const seoDesc = p.seoDescription || p.excerpt || "";
      document.title = seoTitle + " — Skedisy";
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute("content", seoDesc);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", "https://skedisy.com/blog/" + p.slug);

      const author = (p.author && p.author.name) || p.authorName || "Skedisy";
      root.innerHTML = `
        <article class="sq-article">
          <header class="sq-article-header">
            <a class="sq-article-back" href="/blog/">← Blog Skedisy</a>
            <p class="sq-kicker">${esc(p.category || "guides")} · ${esc(
        formatDate(p.publishedAt)
      )}${p.readingMinutes ? " · " + esc(p.readingMinutes) + " min" : ""}</p>
            <h1 class="sq-display">${esc(p.title)}</h1>
            <p class="sq-article-by">Par ${esc(author)}</p>
            ${p.excerpt ? `<p class="sq-lead">${esc(p.excerpt)}</p>` : ""}
          </header>
          ${
            p.coverImage
              ? `<figure class="sq-article-cover"><img src="${esc(
                  p.coverImage
                )}" alt="" /></figure>`
              : ""
          }
          <div class="sq-article-body">${p.contentHtml || ""}</div>
          <footer class="sq-article-footer">
            <a href="/blog/" class="sq-btn sq-btn-ghost">Tous les articles</a>
            <a href="/" class="sq-btn sq-btn-fill">Découvrir Skedisy</a>
          </footer>
        </article>`;
    })
    .catch(() => {
      root.innerHTML = `<p class="sq-lead">Impossible de charger l'article. <a href="/blog/">Retour au blog</a></p>`;
    });
})();
