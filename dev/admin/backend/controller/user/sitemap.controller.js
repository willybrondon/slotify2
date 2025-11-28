const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");

// Generate slug from name
const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Generate sitemap.xml dynamically
exports.generateSitemap = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const currentDate = new Date().toISOString().split('T')[0];

    // Get all active categories
    const categories = await Category.find({
      isDelete: false,
      status: true,
    }).select("_id name updatedAt");

    // Get all active salons
    const salons = await Salon.find({
      isDelete: false,
      isActive: true,
    }).select("_id name updatedAt");

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Add homepage
    sitemap += `  <url>
    <loc>${baseURL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add category pages
    categories.forEach((category) => {
      const slug = generateSlug(category.name);
      const shortId = category._id.toString().substring(0, 6);
      const categoryUrl = `${baseURL}/category/${slug}-${shortId}`;
      const lastmod = category.updatedAt ? new Date(category.updatedAt).toISOString().split('T')[0] : currentDate;
      
      sitemap += `  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add salon pages
    salons.forEach((salon) => {
      const slug = generateSlug(salon.name);
      const shortId = salon._id.toString().substring(0, 6);
      const salonUrl = `${baseURL}/salon/${slug}-${shortId}`;
      const lastmod = salon.updatedAt ? new Date(salon.updatedAt).toISOString().split('T')[0] : currentDate;
      
      sitemap += `  <url>
    <loc>${salonUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error("[Sitemap] Error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

// Generate robots.txt
exports.generateRobots = async (req, res) => {
  try {
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    
    const robots = `User-agent: *
Allow: /
Allow: /category/
Allow: /salon/
Disallow: /admin/
Disallow: /user/
Disallow: /api/
Disallow: /salonpanel/

Sitemap: ${baseURL}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error("[Robots] Error:", error);
    res.status(500).send("Error generating robots.txt");
  }
};

