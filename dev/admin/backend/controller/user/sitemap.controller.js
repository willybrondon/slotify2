const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const BlogPost = require("../../models/blogPost.model");

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

const urlEntry = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${xmlEsc(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;

/** Prefer longer ObjectId prefix when 6-char shortIds collide (import batches). */
function shortIdForSalon(salonId, collisionCounts) {
  const id = salonId.toString();
  const s6 = id.substring(0, 6);
  if ((collisionCounts[s6] || 0) > 1) {
    return id.substring(0, 10);
  }
  return s6;
}

// Generate sitemap.xml dynamically
exports.generateSitemap = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/+$/,
      ""
    );
    const currentDate = new Date().toISOString().split("T")[0];

    const [categories, salons, posts] = await Promise.all([
      Category.find({ isDelete: false, status: true })
        .select("_id name updatedAt")
        .lean(),
      Salon.find({ isDelete: false, isActive: true })
        .select("_id name updatedAt")
        .lean(),
      BlogPost.find({ status: "published" })
        .select("slug publishedAt updatedAt")
        .lean(),
    ]);

    const collisionCounts = {};
    salons.forEach((s) => {
      const s6 = s._id.toString().substring(0, 6);
      collisionCounts[s6] = (collisionCounts[s6] || 0) + 1;
    });

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    sitemap += urlEntry(`${baseURL}/`, currentDate, "daily", "1.0");
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

    categories.forEach((category) => {
      const slug = generateSlug(category.name);
      if (!slug) return;
      const shortId = category._id.toString().substring(0, 6);
      const lastmod = category.updatedAt
        ? new Date(category.updatedAt).toISOString().split("T")[0]
        : currentDate;
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
      const shortId = shortIdForSalon(salon._id, collisionCounts);
      const lastmod = salon.updatedAt
        ? new Date(salon.updatedAt).toISOString().split("T")[0]
        : currentDate;
      sitemap += urlEntry(
        `${baseURL}/salon/${slug}-${shortId}`,
        lastmod,
        "weekly",
        "0.7"
      );
    });

    posts.forEach((post) => {
      if (!post.slug) return;
      const lastmod = post.updatedAt || post.publishedAt
        ? new Date(post.updatedAt || post.publishedAt)
            .toISOString()
            .split("T")[0]
        : currentDate;
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
    res.status(500).send("Error generating sitemap");
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
Disallow: /admin/
Disallow: /user/
Disallow: /api/
Disallow: /salonpanel/
Disallow: /blogadmin/
Disallow: /compte/

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
