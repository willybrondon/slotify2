const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const mongoose = require("mongoose");
const geolib = require("geolib");

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

// Find category by short ID (first 6 characters of ObjectId)
const findCategoryByShortId = async (shortId) => {
  try {
    // Get all active categories and find one where ObjectId starts with shortId
    const categories = await Category.find({
      isDelete: false,
      status: true,
    }).select("_id");
    
    // Find category where _id starts with shortId
    const category = categories.find(c => c._id.toString().toLowerCase().startsWith(shortId.toLowerCase()));
    return category ? category._id : null;
  } catch (error) {
    console.error("Error finding category by short ID:", error);
    return null;
  }
};

// Helper function to get translated name
const getTranslatedName = (category, language = 'en') => {
  if (!category) return '';
  
  // Map language codes to field names
  const translationMap = {
    'en': category.nameEn || category.name,
    'fr': category.nameFr || category.nameEn || category.name,
    'pt': category.namePt || category.nameEn || category.name,
  };
  
  // Default to English if language not found
  return translationMap[language] || category.name || '';
};

// Helper function to get translated service name
const getTranslatedServiceName = (service, language = 'en') => {
  if (!service) return '';
  
  // Map language codes to field names
  const translationMap = {
    'en': service.nameEn || service.name,
    'fr': service.nameFr || service.nameEn || service.name,
    'pt': service.namePt || service.nameEn || service.name,
  };
  
  // Default to English if language not found
  return translationMap[language] || service.name || '';
};

//get all category
exports.getAll = async (req, res) => {
  try {
    const language = req.query.language || 'en'; // Get language from query parameter, default to 'en'
    
    const categories = await Category.find({ isDelete: false, status: true }).select("-isDelete -updatedAt -createdAt").sort({
      createdAt: -1,
    });

    // Map categories with translated names
    const translatedCategories = categories.map(category => ({
      _id: category._id,
      name: getTranslatedName(category, language),
      image: category.image,
      status: category.status,
    }));

    return res.status(200).send({
      status: true,
      message: "Categories Found",
      data: translatedCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

// Get salons by category with search
exports.getSalonsByCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const search = req.query.search || "";
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const language = req.query.language || 'en'; // Get language from query parameter, default to 'en'

    if (!categoryId) {
      return res.status(200).json({
        status: false,
        message: "Category ID is required",
      });
    }

    // Get category details
    const category = await Category.findById(categoryId);
    if (!category || category.isDelete || !category.status) {
      return res.status(200).json({
        status: false,
        message: "Category not found",
      });
    }

    // Get all services in this category
    const services = await Service.find({
      categoryId: categoryId,
      isDelete: false,
      status: true,
    }).select("_id");

    const serviceIds = services.map(s => s._id);

    if (serviceIds.length === 0) {
      const translatedCategoryName = getTranslatedName(category, language);
      return res.status(200).json({
        status: true,
        message: "No salons found for this category",
        category: {
          _id: category._id,
          name: translatedCategoryName,
          image: category.image,
          description: category.description || `${translatedCategoryName} services available at top-rated salons`,
        },
        salons: [],
        total: 0,
      });
    }

    // Build search query
    let searchQuery = {
      isDelete: false,
      isActive: true,
      "serviceIds.id": { $in: serviceIds },
    };

    // Add search filter (address or service name)
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      searchQuery.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
        { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
        { "addressDetails.country": { $regex: searchTerm, $options: "i" } },
        { about: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Get salons
    let salons = await Salon.find(searchQuery)
      .populate({
        path: "serviceIds.id",
        match: { categoryId: categoryId, isDelete: false, status: true },
        select: "name nameEn nameFr namePt duration categoryId price",
      })
      .select("name mainImage review reviewCount addressDetails locationCoordinates about")
      .skip(start * limit)
      .limit(limit)
      .lean();

    // Filter out salons that don't have matching services after populate
    salons = salons.filter(salon => 
      salon.serviceIds && salon.serviceIds.some(s => s.id !== null)
    );

    // Calculate distance if coordinates provided
    if (latitude && longitude) {
      const userLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      salons = salons.map(salon => {
        if (salon.locationCoordinates?.latitude && salon.locationCoordinates?.longitude) {
          const salonLocation = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };
          const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
          salon.distance = distanceInMeters / 1000; // Convert to kilometers
        } else {
          salon.distance = null;
        }
        return salon;
      });

      // Sort by distance
      salons.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Get total count for pagination
    const total = await Salon.countDocuments(searchQuery);

    // Format salon data for response
    const formattedSalons = salons.map(salon => {
      // Translate service names in salon.serviceIds
      if (salon.serviceIds && Array.isArray(salon.serviceIds)) {
        salon.serviceIds = salon.serviceIds.map(serviceItem => {
          if (serviceItem.id) {
            return {
              ...serviceItem,
              id: {
                ...serviceItem.id,
                name: getTranslatedServiceName(serviceItem.id, language),
              }
            };
          }
          return serviceItem;
        });
      }
      
      // Get minimum price from services in this category
      const categoryServices = salon.serviceIds
        .filter(s => s.id && s.price !== null && s.price !== undefined)
        .map(s => s.price);
      const minPrice = categoryServices.length > 0 ? Math.min(...categoryServices) : null;

      // Generate slug for share link
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
      const slug = generateSlug(salon.name);
      const shortId = salon._id.toString().substring(0, 6);
      const slugWithId = `${slug}-${shortId}`;
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
      const shareUrl = `${baseURL}/salon/${slugWithId}`;

      return {
        _id: salon._id,
        name: salon.name,
        mainImage: salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : ""),
        review: salon.review || 0,
        reviewCount: salon.reviewCount || 0,
        address: salon.addressDetails 
          ? `${salon.addressDetails.addressLine1 || ""}, ${salon.addressDetails.city || ""}, ${salon.addressDetails.country || ""}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
          : "",
        minPrice: minPrice,
        distance: salon.distance || null,
        shareUrl: shareUrl,
      };
    });

    // Get translated category name
    const translatedCategoryName = getTranslatedName(category, language);
    
    return res.status(200).json({
      status: true,
      message: "Salons retrieved successfully",
      category: {
        _id: category._id,
        name: translatedCategoryName,
        image: category.image,
        description: category.description || `${translatedCategoryName} services available at top-rated salons`,
      },
      salons: formattedSalons,
      total: total,
    });
  } catch (error) {
    console.error("[Get Salons By Category] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Serve category page with salon listings
exports.serveCategoryPage = async (req, res) => {
  try {
    const slugWithId = req.params.slugWithId; // Now expecting /category/:slugWithId

    if (!slugWithId) {
      return res.status(404).send("Category not found");
    }

    // Skip if it's a known API route or static file path
    const excludedPaths = ['admin', 'user', 'api', '.well-known', 'favicon.ico', 'robots.txt', 'salon'];
    if (excludedPaths.includes(slugWithId.toLowerCase())) {
      return res.status(404).send("Not found");
    }

    // Check if it's the old format (24-character ObjectId) - reject it
    if (/^[0-9a-fA-F]{24}$/i.test(slugWithId)) {
      console.log("[Category Page] Old format detected, rejecting:", slugWithId);
      return res.status(404).send("Category not found. Please use the new URL format.");
    }

    // Extract short ID (last part after hyphen, should be 6 hex characters)
    const parts = slugWithId.split("-");
    const shortId = parts[parts.length - 1];
    
    // Validate short ID format (6 hex characters)
    if (!/^[0-9a-fA-F]{6}$/.test(shortId)) {
      console.log("[Category Page] Invalid short ID format:", shortId, "from slug:", slugWithId);
      return res.status(404).send("Category not found");
    }
    
    console.log("[Category Page] Looking for category with short ID:", shortId);
    const fullCategoryId = await findCategoryByShortId(shortId);
    
    if (!fullCategoryId) {
      console.log("[Category Page] Category not found for short ID:", shortId);
      return res.status(404).send("Category not found");
    }
    
    console.log("[Category Page] Found category:", fullCategoryId);

    const search = req.query.search || "";
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    // Get category details
    const category = await Category.findOne({
      _id: fullCategoryId,
      isDelete: false,
      status: true,
    });
    
    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Get salons for this category (limit to 50 for initial load)
    const serviceIds = await Service.find({
      categoryId: fullCategoryId,
      isDelete: false,
      status: true,
    }).select("_id");

    const serviceObjectIds = serviceIds.map(s => s._id);

    let searchQuery = {
      isDelete: false,
      isActive: true,
      "serviceIds.id": { $in: serviceObjectIds },
    };

    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      searchQuery.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
        { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
        { "addressDetails.country": { $regex: searchTerm, $options: "i" } },
        { about: { $regex: searchTerm, $options: "i" } },
      ];
    }

    let salons = await Salon.find(searchQuery)
      .populate({
        path: "serviceIds.id",
        match: { categoryId: fullCategoryId, isDelete: false, status: true },
        select: "name duration price",
      })
      .select("name mainImage review reviewCount addressDetails locationCoordinates about serviceIds")
      .limit(50)
      .lean();

    salons = salons.filter(salon => 
      salon.serviceIds && salon.serviceIds.some(s => s.id !== null)
    );

    // Calculate distance if coordinates provided
    if (latitude && longitude) {
      const userLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      salons = salons.map(salon => {
        if (salon.locationCoordinates?.latitude && salon.locationCoordinates?.longitude) {
          const salonLocation = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };
          const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
          salon.distance = distanceInMeters / 1000;
        } else {
          salon.distance = null;
        }
        return salon;
      });

      salons.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Format salons for display
    const formattedSalons = salons.map(salon => {
      const categoryServices = salon.serviceIds
        .filter(s => s.id && s.price !== null && s.price !== undefined)
        .map(s => s.price);
      const minPrice = categoryServices.length > 0 ? Math.min(...categoryServices) : null;

      const slug = generateSlug(salon.name);
      const shortId = salon._id.toString().substring(0, 6);
      const slugWithId = `${slug}-${shortId}`;
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
      const shareUrl = `${baseURL}/salon/${slugWithId}`;

      return {
        _id: salon._id,
        name: salon.name,
        mainImage: salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : ""),
        review: salon.review || 0,
        reviewCount: salon.reviewCount || 0,
        address: salon.addressDetails 
          ? `${salon.addressDetails.addressLine1 || ""}, ${salon.addressDetails.city || ""}, ${salon.addressDetails.country || ""}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
          : "",
        minPrice: minPrice,
        distance: salon.distance || null,
        shareUrl: shareUrl,
      };
    });

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    // Generate the new slug format for category URL
    const categorySlug = generateSlug(category.name);
    const categoryShortId = category._id.toString().substring(0, 6);
    const categorySlugWithId = `${categorySlug}-${categoryShortId}`;
    const categoryUrl = `${baseURL}/category/${categorySlugWithId}`;
    const currency = global.settingJSON?.currencySymbol || "$";

    // Generate HTML page
    const salonsHtml = formattedSalons.length > 0 
      ? formattedSalons.map(salon => {
          const ratingHtml = salon.review > 0 
            ? `<div class="salon-rating"><span class="rating-stars">⭐</span><span>${salon.review.toFixed(1)} (${salon.reviewCount})</span></div>`
            : '';
          const priceHtml = salon.minPrice !== null 
            ? `<div class="salon-price">From ${currency}${salon.minPrice}</div>`
            : '';
          const distanceHtml = salon.distance !== null
            ? `<div class="salon-distance">📍 ${salon.distance.toFixed(1)} km away</div>`
            : '';
          const imageHtml = salon.mainImage 
            ? `<img src="${salon.mainImage}" alt="${salon.name}" class="salon-card-image" onerror="this.style.display='none'">`
            : '<div class="salon-card-image-placeholder">No Image</div>';

          return `
            <a href="${salon.shareUrl}" class="salon-card">
              ${imageHtml}
              <div class="salon-card-content">
                <h3 class="salon-card-name">${salon.name}</h3>
                ${ratingHtml}
                ${priceHtml}
                ${salon.address ? `<div class="salon-address"><i class="fas fa-map-marker-alt"></i> ${salon.address}</div>` : ''}
                ${distanceHtml}
                <div class="salon-card-cta">
                  <span class="salon-card-cta-btn">
                    <i class="fas fa-calendar-check"></i> View & Book
                  </span>
                </div>
              </div>
            </a>
          `;
        }).join('')
      : '<div class="no-results"><p>No salons found for this category.</p></div>';

    const categoryDescription = category.description || `Find the best ${category.name} services at top-rated salons near you. Book your appointment today!`;
    const categoryImage = category.image || `${baseURL}/logo.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${category.name} - Skedisy | Book ${category.name} Services Online</title>
    <meta name="description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${category.name}, salon services, beauty services, book appointment, ${category.name.toLowerCase()}">
    <link rel="canonical" href="${categoryUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${categoryUrl}">
    <meta property="og:title" content="${category.name} - Skedisy">
    <meta property="og:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${categoryImage}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${categoryUrl}">
    <meta property="twitter:title" content="${category.name} - Skedisy">
    <meta property="twitter:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="twitter:image" content="${categoryImage}">
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "${category.name} Services",
      "description": "${categoryDescription.replace(/"/g, '\\"')}",
      "url": "${categoryUrl}",
      "image": "${categoryImage}",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": ${JSON.stringify(formattedSalons.slice(0, 10).map((salon, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "LocalBusiness",
            "name": salon.name,
            "url": salon.shareUrl
          }
        })))}
      }
    }
    </script>
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fff;
            color: #111;
            line-height: 1.6;
            padding-top: 80px; /* Account for fixed navbar */
        }
        /* Category Hero Section */
        .category-hero-section {
            position: relative;
            width: 100%;
            height: 400px;
            overflow: hidden;
            margin-top: 0;
        }
        .category-hero-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background-image: url('${baseURL}/logo.png');
            background-color: #667eea; /* Fallback color */
        }
        .category-hero-image-overlay {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 180px;
            height: 180px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 3;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .category-hero-image-overlay img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
        }
        .category-hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5));
            z-index: 1;
        }
        .category-hero-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            align-items: center;
            color: white;
            padding: 40px 0;
            padding-left: 240px; /* Make room for category image on left */
        }
        .category-hero-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 16px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .category-hero-description {
            font-size: 1.2rem;
            margin-bottom: 24px;
            max-width: 700px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            line-height: 1.6;
        }
        .category-hero-stats {
            display: flex;
            gap: 32px;
            font-size: 1.1rem;
        }
        .category-hero-stats span {
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 8px;
        }
        .category-hero-stats strong {
            font-size: 1.3rem;
            display: block;
        }
        
        .category-header {
            background: #fff;
            padding: 40px 0;
            border-bottom: 1px solid #eee;
        }
        .category-header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .category-subtitle {
            font-size: 2rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 12px;
        }
        .category-description {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 32px;
        }
        .search-section {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px 20px;
        }
        .search-container {
            position: relative;
            max-width: 600px;
            margin: 0 auto;
        }
        .search-input {
            width: 100%;
            padding: 16px 50px 16px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        .search-input:focus {
            outline: none;
            border-color: #111;
        }
        .search-icon {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 1.2rem;
        }
        .salons-section {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px 60px;
        }
        .salons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
            margin-top: 32px;
        }
        .salon-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s;
            display: block;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .salon-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
            border-color: #111;
        }
        .salon-card-image {
            width: 100%;
            height: 220px;
            object-fit: cover;
            transition: transform 0.3s;
        }
        .salon-card:hover .salon-card-image {
            transform: scale(1.05);
        }
        .salon-card-image-placeholder {
            width: 100%;
            height: 220px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }
        .salon-card-content {
            padding: 24px;
        }
        .salon-card-name {
            font-size: 1.3rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        .salon-rating {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 1rem;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .rating-stars {
            color: #ffa500;
            font-size: 1.1rem;
        }
        .salon-price {
            font-size: 1.2rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 12px;
            padding: 8px 0;
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
        }
        .salon-address {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        .salon-distance {
            font-size: 0.9rem;
            color: #999;
            font-weight: 500;
        }
        .salon-card-cta {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
            text-align: center;
        }
        .salon-card-cta-btn {
            background: #111;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            display: inline-block;
            width: 100%;
            text-align: center;
            transition: all 0.2s;
        }
        .salon-card:hover .salon-card-cta-btn {
            background: #333;
            transform: translateY(-1px);
        }
        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        .no-results p {
            font-size: 1.1rem;
        }
        @media (max-width: 768px) {
            body {
                padding-top: 80px;
            }
            .category-hero-section {
                height: auto;
                min-height: auto;
                padding-top: 30px;
                padding-bottom: 20px;
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                gap: 15px;
                position: relative;
            }
            .category-hero-image-overlay {
                position: relative;
                width: 100px;
                height: 100px;
                top: auto;
                left: auto;
                padding: 8px;
                margin: 0;
                flex-shrink: 0;
                z-index: 3;
            }
            .category-hero-content {
                padding-left: 0;
                padding-right: 20px;
                padding-top: 0;
                padding-bottom: 0;
                align-items: flex-start;
                flex: 1;
                min-width: 0;
                height: auto;
            }
            .category-hero-content .category-header-content {
                padding: 0;
                max-width: none;
            }
            .category-hero-title {
                font-size: 1.4rem;
                margin-bottom: 8px;
                margin-top: 0;
                line-height: 1.3;
            }
            .category-hero-description {
                font-size: 0.85rem;
                margin-bottom: 10px;
                line-height: 1.4;
                max-width: 100%;
            }
            .category-hero-stats {
                flex-direction: row;
                gap: 6px;
                font-size: 0.75rem;
                flex-wrap: wrap;
            }
            .category-hero-stats span {
                padding: 4px 10px;
                font-size: 0.75rem;
            }
            .category-hero-stats strong {
                font-size: 0.9rem;
                display: inline;
            }
            .category-subtitle {
                font-size: 1.75rem;
            }
            .salons-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <!-- Login Button Above QR Code -->
    <div class="login-above-qr">
        <a href="${baseURL}/salonpanel/" class="btn-login-above">Login</a>
    </div>
    
    <!-- QR Code Top Right Floating -->
    <div class="qr-topright">
        <div class="qr-top-flex">
            <div class="qr-top-block" data-app-type="customer" onclick="openPhoneSelection('customer')">
                <div id="qr-customer-top"></div>
                <div class="qr-label">Download Customer App</div>
            </div>
            <div class="qr-top-block" data-app-type="expert" onclick="openPhoneSelection('expert')">
                <div id="qr-expert-top"></div>
                <div class="qr-label">Download the Expert App</div>
            </div>
        </div>
    </div>
    
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="${baseURL}" style="text-decoration: none; color: inherit;">
                    <h2>Skedisy</h2>
                </a>
            </div>
            <!-- Desktop Categories Menu -->
            <div class="nav-menu-center desktop-only" id="categoriesMenu">
                <!-- Categories will be loaded dynamically -->
            </div>
            <!-- Mobile Menu - Hamburger positioned where login button was -->
            <div class="mobile-menu-wrapper">
                <div class="hamburger mobile-only" id="mobileMenuToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        <!-- Mobile Slide-in Menu -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>Menu</h3>
                <button class="mobile-menu-close" id="mobileMenuClose">&times;</button>
            </div>
            <div class="mobile-menu-content">
                <!-- Mobile Login Button -->
                <a href="${baseURL}/salonpanel/" class="btn-login-mobile-menu">Login</a>
                <div class="mobile-categories" id="mobileCategories">
                    <!-- Categories will be loaded dynamically -->
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <div class="category-hero-section">
        <div class="category-hero-background"></div>
        ${categoryImage ? `<div class="category-hero-image-overlay"><img src="${categoryImage}" alt="${category.name}" onerror="this.style.display='none'"></div>` : ''}
        <div class="category-hero-overlay"></div>
        <div class="category-hero-content">
            <div class="category-header-content">
                <h1 class="category-hero-title">${category.name}</h1>
                <p class="category-hero-description">${categoryDescription}</p>
                <div class="category-hero-stats">
                    <span><strong>${formattedSalons.length}</strong> Salons</span>
                    <span><strong>${formattedSalons.filter(s => s.review > 0).length}</strong> Rated</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="category-header">
        <div class="category-header-content">
            <h2 class="category-subtitle">Discover Top ${category.name} Salons</h2>
            <p class="category-description">${categoryDescription}</p>
        </div>
    </div>
    
    <div class="search-section">
        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="Search by address or service name..." value="${search.replace(/"/g, '&quot;')}">
            <i class="fas fa-search search-icon"></i>
        </div>
    </div>
    
    <div class="salons-section">
        <div class="salons-grid" id="salonsGrid">
            ${salonsHtml}
        </div>
    </div>

    <script>
        const categoryId = "${category._id}";
        const categorySlugWithId = "${categorySlugWithId}";
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = this.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (searchTerm.length >= 2 || searchTerm.length === 0) {
                    loadSalons(searchTerm);
                }
            }, 500);
        });

        function loadSalons(search = '') {
            // Use the same endpoint but with search parameter in URL
            const url = new URL(window.location.href);
            if (search) {
                url.searchParams.set('search', search);
            } else {
                url.searchParams.delete('search');
            }
            // Reload page with search parameter for server-side rendering
            window.location.href = url.toString();
        }

        function fetchSalons(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status && data.salons) {
                        updateSalonsGrid(data.salons);
                    }
                })
                .catch(error => {
                    console.error('Error loading salons:', error);
                });
        }

        function updateSalonsGrid(salons) {
            const grid = document.getElementById('salonsGrid');
            const currency = "${currency}";
            
            if (salons.length === 0) {
                grid.innerHTML = '<div class="no-results"><p>No salons found. Try a different search.</p></div>';
                return;
            }

            grid.innerHTML = salons.map(salon => {
                const ratingHtml = salon.review > 0 
                    ? \`<div class="salon-rating"><span class="rating-stars">⭐</span><span>\${salon.review.toFixed(1)} (\${salon.reviewCount})</span></div>\`
                    : '';
                const priceHtml = salon.minPrice !== null 
                    ? \`<div class="salon-price">From \${currency}\${salon.minPrice}</div>\`
                    : '';
                const distanceHtml = salon.distance !== null
                    ? \`<div class="salon-distance">📍 \${salon.distance.toFixed(1)} km away</div>\`
                    : '';
                const imageHtml = salon.mainImage 
                    ? \`<img src="\${salon.mainImage}" alt="\${salon.name}" class="salon-card-image" onerror="this.style.display='none'">\`
                    : '<div class="salon-card-image-placeholder">No Image</div>';

                return \`
                    <a href="\${salon.shareUrl}" class="salon-card">
                        \${imageHtml}
                        <div class="salon-card-content">
                            <h3 class="salon-card-name">\${salon.name}</h3>
                            \${ratingHtml}
                            \${priceHtml}
                            \${salon.address ? \`<div class="salon-address">📍 \${salon.address}</div>\` : ''}
                            \${distanceHtml}
                        </div>
                    </a>
                \`;
            }).join('');
        }
    </script>
    <script src="${baseURL}/script.js"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Category Page] Error:", error);
    res.status(500).send("Error loading category page");
  }
};
