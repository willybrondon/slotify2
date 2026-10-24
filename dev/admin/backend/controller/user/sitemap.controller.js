const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const BlogPost = require("../../models/blogPost.model");
const {
  uniqueShortId,
  isExcludedFromSitemapSalonName,
} = require("../../lib/seoShortId");

// Generate slug from name (keep in sync with salon.controller)
const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const xmlEsc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const safeDay = (value, fallback) => {
  try {
    if (!value) return fallback;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toISOString().split("T")[0];
  } catch (_) {
    return fallback;
  }
};

const urlEntry = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${xmlEsc(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;

async function safeFind(label, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[Sitemap] ${label} query failed:`, err.message || err);
    return [];
  }
}

// Generate sitemap.xml dynamically
exports.generateSitemap = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const currentDate = new Date().toISOString().split("T")[0];

    const [categories, salonsRaw, posts] = await Promise.all([
      safeFind("categories", () =>
        Category.find({ isDelete: false, status: true })
          .select("_id name nameEn nameFr updatedAt")
          .lean()
      ),
      safeFind("salons", () =>
        Salon.find({ isDelete: false, isActive: true })
          .select("_id name updatedAt")
          .lean()
      ),
      safeFind("posts", () =>
        BlogPost.find({ status: "published" })
          .select("slug publishedAt updatedAt")
          .lean()
      ),
    ]);

    const salons = (salonsRaw || []).filter(
      (s) => !isExcludedFromSitemapSalonName(s.name)
    );

    const salonIdPool = salons.map((s) => s._id.toString());
    const categoryIdPool = (categories || []).map((c) => c._id.toString());

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Core public pages
    sitemap += urlEntry(`${baseURL}/`, currentDate, "daily", "1.0");
    sitemap += urlEntry(`${baseURL}/recherche`, currentDate, "daily", "0.9");
    sitemap += urlEntry(`${baseURL}/blog/`, currentDate, "daily", "0.9");
    sitemap += urlEntry(`${baseURL}/aide/`, currentDate, "weekly", "0.6");
    sitemap += urlEntry(
      `${baseURL}/professionnel/`,
      currentDate,
      "weekly",
      "0.7"
    );
    sitemap += urlEntry(
      `${baseURL}/ai-concierge.html`,
      currentDate,
      "weekly",
      "0.6"
    );
    sitemap += urlEntry(
      `${baseURL}/hair-profile.html`,
      currentDate,
      "monthly",
      "0.4"
    );
    sitemap += urlEntry(`${baseURL}/cookies/`, currentDate, "yearly", "0.3");
    sitemap += urlEntry(`${baseURL}/terms/`, currentDate, "yearly", "0.3");
    sitemap += urlEntry(`${baseURL}/privacy/`, currentDate, "yearly", "0.3");

    (categories || []).forEach((category) => {
      // Prefer FR label so sitemap matches page canonical (lang fr by default)
      const slug = generateSlug(
        category.nameFr || category.name || category.nameEn || ""
      );
      if (!slug) return;
      const shortId = uniqueShortId(category._id, categoryIdPool);
      const lastmod = safeDay(category.updatedAt, currentDate);
      sitemap += urlEntry(
        `${baseURL}/category/${slug}-${shortId}`,
        lastmod,
        "weekly",
        "0.8"
      );
    });

    salons.forEach((salon) => {
      const slug = generateSlug(salon.name);
      if (!slug) return;
      const shortId = uniqueShortId(salon._id, salonIdPool);
      const lastmod = safeDay(salon.updatedAt, currentDate);
      sitemap += urlEntry(
        `${baseURL}/salon/${slug}-${shortId}`,
        lastmod,
        "weekly",
        "0.7"
      );
    });

    (posts || []).forEach((post) => {
      if (!post.slug) return;
      const lastmod = safeDay(post.updatedAt || post.publishedAt, currentDate);
      sitemap += urlEntry(
        `${baseURL}/blog/${post.slug}`,
        lastmod,
        "weekly",
        "0.85"
      );
    });

    sitemap += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(sitemap);
  } catch (error) {
    console.error("[Sitemap] Error:", error);
    // Never leave Google with a hard failure if DB blips — emit a minimal valid sitemap
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const currentDate = new Date().toISOString().split("T")[0];
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntry(`${baseURL}/`, currentDate, "daily", "1.0")}</urlset>`;
    res.status(200);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(fallback);
  }
};

// Generate robots.txt
exports.generateRobots = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );

    const robots = `User-agent: *
Allow: /
Allow: /.well-known/
Allow: /category/
Allow: /salon/
Allow: /blog/
Allow: /aide/
Allow: /recherche
Allow: /professionnel/
Disallow: /admin/
Disallow: /user/
Disallow: /api/
Disallow: /salonpanel/
Disallow: /SalonPanel/
Disallow: /blogadmin/
Disallow: /compte/
Disallow: /compte/connexion
Disallow: /compte/inscription
Disallow: /salon/claim
Disallow: /salon/rejoindre
Disallow: /rejoindre
Disallow: /*?*return=
Disallow: /*?return=
Disallow: /*?*serviceId=
Disallow: /*?serviceId=
Disallow: /docs/
Disallow: /docs/index.html
Disallow: /request-adding-salon.html
Disallow: /request-adding-salon

Sitemap: ${baseURL}/sitemap.xml
`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(robots);
  } catch (error) {
    console.error("[Robots] Error:", error);
    res.status(500).send("Error generating robots.txt");
  }
};
