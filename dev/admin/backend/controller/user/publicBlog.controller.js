const fs = require("fs");
const path = require("path");
const BlogPost = require("../../models/blogPost.model");

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

function escAttr(s) {
  return esc(s).replace(/'/g, "&#39;");
}

function formatDateFr(d) {
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

function resolveSalonportalPath() {
  const candidates = [
    path.join(__dirname, "..", "..", "salonportal", "public"),
    path.join(__dirname, "..", "..", "salonportal"),
    path.join(__dirname, "..", "..", "..", "salonportal", "public"),
    path.join(__dirname, "..", "..", "..", "salonportal"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }
  return path.join(__dirname, "..", "..", "..", "salonportal", "public");
}

function absoluteUrl(url, baseURL) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function injectHeadMeta(html, { title, description, canonical, ogImage, jsonLd }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
  if (/<meta\s+name=["']description["']/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="description" content="${escAttr(description)}">`
    );
  } else {
    out = out.replace(
      /<\/title>/i,
      `</title>\n    <meta name="description" content="${escAttr(description)}">`
    );
  }
  if (/<link\s+rel=["']canonical["']/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
      `<link rel="canonical" href="${escAttr(canonical)}">`
    );
  } else {
    out = out.replace(
      /<\/title>/i,
      `</title>\n    <link rel="canonical" href="${escAttr(canonical)}">`
    );
  }

  const seoBlock = `
    <meta name="robots" content="index,follow,max-image-preview:large">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escAttr(canonical)}">
    <meta property="og:title" content="${escAttr(title)}">
    <meta property="og:description" content="${escAttr(description)}">
    ${ogImage ? `<meta property="og:image" content="${escAttr(ogImage)}">` : ""}
    <meta property="og:site_name" content="Skedisy">
    <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}">
    <meta name="twitter:title" content="${escAttr(title)}">
    <meta name="twitter:description" content="${escAttr(description)}">
    ${ogImage ? `<meta name="twitter:image" content="${escAttr(ogImage)}">` : ""}
    ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
`;
  out = out.replace(/<\/head>/i, `${seoBlock}</head>`);
  return out;
}

function renderArticleBody(post) {
  const author =
    (post.author && post.author.name) || post.authorName || "Skedisy";
  const label = CAT_LABEL[post.category] || "Blog";
  const dateStr = formatDateFr(post.publishedAt);
  const mins = post.readingMinutes
    ? ` · ${esc(String(post.readingMinutes))} min`
    : "";

  return `
        <article class="sq-article" itemscope itemtype="https://schema.org/BlogPosting">
          <header class="sq-article-header">
            <a class="sq-article-back" href="/blog/">← Blog Skedisy</a>
            <p class="sq-kicker">${esc(label)}${dateStr ? " · " + esc(dateStr) : ""}${mins}</p>
            <h1 class="sq-display" itemprop="headline">${esc(post.title)}</h1>
            <p class="sq-article-by">Par <span itemprop="author">${esc(author)}</span></p>
            ${
              post.excerpt
                ? `<p class="sq-lead" itemprop="description">${esc(post.excerpt)}</p>`
                : ""
            }
          </header>
          ${
            post.coverImage
              ? `<figure class="sq-article-cover"><img src="${escAttr(
                  post.coverImage
                )}" alt="${escAttr(post.title)}" itemprop="image" /></figure>`
              : ""
          }
          <div class="sq-article-body" itemprop="articleBody">${
            post.contentHtml || ""
          }</div>
          <footer class="sq-article-footer">
            <a href="/blog/" class="sq-btn sq-btn-ghost">Tous les articles</a>
            <a href="/" class="sq-btn sq-btn-fill">Découvrir Skedisy</a>
          </footer>
        </article>`;
}

function renderListingCards(posts) {
  return posts
    .map((p) => {
      const label = CAT_LABEL[p.category] || "Article";
      const mins = p.readingMinutes ? `${p.readingMinutes} min` : "";
      const dateStr = formatDateFr(p.publishedAt);
      return `
          <a href="/blog/${escAttr(p.slug)}" class="sq-blog-card">
            ${
              p.coverImage
                ? `<img class="sq-blog-card-cover" src="${escAttr(
                    p.coverImage
                  )}" alt="" loading="lazy" />`
                : ""
            }
            <span class="sq-blog-card-label">${esc(label)}</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt || "")}</p>
            <span class="sq-blog-card-meta">${esc(dateStr)}${
        mins ? " · " + esc(mins) : ""
      }</span>
            <span class="sq-link">Lire l'article →</span>
          </a>`;
    })
    .join("");
}

exports.listPublished = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const category = (req.query.category || "").trim();
    const filter = { status: "published" };
    if (category) filter.category = category;
    const posts = await BlogPost.find(filter)
      .select(
        "title slug excerpt coverImage category tags authorName readingMinutes publishedAt seoTitle seoDescription"
      )
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return res.status(200).json({ status: true, posts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("author", "name bio avatar")
      .lean();
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    return res.status(200).json({ status: true, post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

/** SSR blog article — full HTML in response for Google indexing */
exports.serveBlogArticlePage = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    if (!slug || slug === "blog") {
      return res.redirect(301, "/blog/");
    }

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const salonportalPath = resolveSalonportalPath();
    const templatePath = path.join(salonportalPath, "blog", "article.html");

    if (!fs.existsSync(templatePath)) {
      return res
        .status(404)
        .send(
          `<h1>404 - Article not found</h1><p><a href="/blog/">Blog Skedisy</a></p>`
        );
    }

    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("author", "name bio avatar")
      .lean();

    let html = fs.readFileSync(templatePath, "utf8");

    if (!post) {
      html = html.replace(
        /<title>[^<]*<\/title>/i,
        `<title>Article introuvable — Blog Skedisy</title>`
      );
      html = html.replace(
        /<div class="container" id="sq-article-root"[^>]*>\s*<\/div>/i,
        `<div class="container" id="sq-article-root" data-ssr="1"><p class="sq-lead">Article introuvable. <a href="/blog/">Retour au blog</a></p></div>`
      );
      return res.status(404).type("html").send(html);
    }

    const seoTitle = post.seoTitle || post.title;
    const seoDesc =
      post.seoDescription ||
      post.excerpt ||
      `${post.title} — Blog Skedisy, beauté afro en Île-de-France.`;
    const canonical = `${baseURL}/blog/${post.slug}`;
    const ogImage = absoluteUrl(post.coverImage, baseURL);
    const authorName =
      (post.author && post.author.name) || post.authorName || "Skedisy";

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: seoDesc,
      image: ogImage || undefined,
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || post.publishedAt || post.createdAt,
      author: { "@type": "Person", name: authorName },
      publisher: {
        "@type": "Organization",
        name: "Skedisy",
        url: baseURL,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
    });

    html = injectHeadMeta(html, {
      title: `${seoTitle} — Skedisy`,
      description: seoDesc,
      canonical,
      ogImage,
      jsonLd,
    });

    const bodyHtml = renderArticleBody(post);
    if (
      /<div class="container" id="sq-article-root"[^>]*>\s*<\/div>/i.test(html)
    ) {
      html = html.replace(
        /<div class="container" id="sq-article-root"[^>]*>\s*<\/div>/i,
        `<div class="container" id="sq-article-root" data-ssr="1">${bodyHtml}</div>`
      );
    } else {
      html = html.replace(
        /id="sq-article-root"/i,
        `id="sq-article-root" data-ssr="1"`
      );
      html = html.replace(
        /(<div class="container" id="sq-article-root"[^>]*>)/i,
        `$1${bodyHtml}`
      );
    }

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).type("html").send(html);
  } catch (error) {
    console.error("[serveBlogArticlePage]", error);
    return res
      .status(500)
      .send(
        `<h1>Erreur</h1><p><a href="/blog/">Retour au blog</a></p>`
      );
  }
};

/** SSR blog listing — article links in HTML for crawlers */
exports.serveBlogIndexPage = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const salonportalPath = resolveSalonportalPath();
    const templatePath = path.join(salonportalPath, "blog", "index.html");

    if (!fs.existsSync(templatePath)) {
      return res
        .status(404)
        .send(`<h1>404 - Blog not found</h1><p><a href="/">Return to Skedisy</a></p>`);
    }

    let html = fs.readFileSync(templatePath, "utf8");
    const posts = await BlogPost.find({ status: "published" })
      .select(
        "title slug excerpt coverImage category readingMinutes publishedAt"
      )
      .sort({ publishedAt: -1 })
      .limit(24)
      .lean();

    if (posts.length) {
      const cards = renderListingCards(posts);
      html = html.replace(
        /<div class="sq-blog-grid" id="sq-blog-dynamic-grid"><\/div>/i,
        `<div class="sq-blog-grid" id="sq-blog-dynamic-grid" data-ssr="1">${cards}</div>`
      );
      html = html.replace(
        /id="sq-blog-soon-section"/i,
        `id="sq-blog-soon-section" hidden`
      );
    }

    if (!/<meta\s+name=["']robots["']/i.test(html)) {
      html = html.replace(
        /<\/head>/i,
        `    <meta name="robots" content="index,follow">\n    <link rel="alternate" type="application/rss+xml" title="Blog Skedisy" href="${baseURL}/blog/">\n</head>`
      );
    }

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).type("html").send(html);
  } catch (error) {
    console.error("[serveBlogIndexPage]", error);
    const salonportalPath = resolveSalonportalPath();
    const filePath = path.join(salonportalPath, "blog", "index.html");
    if (fs.existsSync(filePath)) {
      return res.status(200).sendFile(path.resolve(filePath));
    }
    return res.status(500).send("Error loading blog");
  }
};
