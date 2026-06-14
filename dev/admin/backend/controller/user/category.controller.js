const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const Expert = require("../../models/expert.model");
const Booking = require("../../models/booking.model");
const mongoose = require("mongoose");
const geolib = require("geolib");
const {
  getWebCopy,
  resolveLang,
  idfBannerHtml,
  skedisyFooterHtml,
} = require("../../lib/webPageCopy");
const { authUrls } = require("../../lib/publicAuthPage");

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

const getCategoryServiceIds = async (categoryId) => {
  const services = await Service.find({
    categoryId,
    isDelete: false,
    status: true,
  }).select("_id");
  return services.map((s) => s._id);
};

const appendSalonSearchFilter = (searchQuery, search) => {
  if (!search || !String(search).trim()) return searchQuery;
  const searchTerm = String(search).trim();
  return {
    ...searchQuery,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
      { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
      { "addressDetails.country": { $regex: searchTerm, $options: "i" } },
      { about: { $regex: searchTerm, $options: "i" } },
    ],
  };
};

const formatSalonAddress = (addressDetails) => {
  if (!addressDetails) return "";
  const line = [
    addressDetails.addressLine1,
    addressDetails.city,
    addressDetails.country,
  ]
    .filter(Boolean)
    .join(", ");
  return line.replace(/,\s*,/g, ",").replace(/^,|,$/g, "");
};

const buildSalonShareUrl = (salon, baseURL) => {
  const slug = generateSlug(salon.name);
  const shortId = salon._id.toString().substring(0, 6);
  return `${baseURL}/salon/${slug}-${shortId}`;
};

const formatSalonForCategory = (salon, { baseURL, language, copy }) => {
  const categoryServices = (salon.serviceIds || [])
    .filter((s) => s.id && s.price !== null && s.price !== undefined)
    .map((s) => s.price);
  const minPrice =
    categoryServices.length > 0 ? Math.min(...categoryServices) : null;
  const addr = salon.addressDetails || {};
  const city = addr.city || "";

  return {
    _id: salon._id,
    name: salon.name,
    mainImage:
      salon.mainImage ||
      (salon.image && salon.image.length > 0 ? salon.image[0] : ""),
    review: salon.review || 0,
    reviewCount: salon.reviewCount || 0,
    address: formatSalonAddress(addr),
    city,
    minPrice,
    distance: salon.distance ?? null,
    latitude: salon.locationCoordinates?.latitude
      ? parseFloat(salon.locationCoordinates.latitude)
      : null,
    longitude: salon.locationCoordinates?.longitude
      ? parseFloat(salon.locationCoordinates.longitude)
      : null,
    shareUrl: buildSalonShareUrl(salon, baseURL),
  };
};

const inferSearchCity = (search, salons) => {
  const term = (search || "").trim();
  if (!term || !salons.length) return null;

  const lower = term.toLowerCase();
  const citiesFromResults = [
    ...new Set(
      salons.map((s) => (s.city || "").trim()).filter(Boolean)
    ),
  ];

  const cityMatch = citiesFromResults.find((city) =>
    city.toLowerCase().includes(lower)
  );
  if (cityMatch) return cityMatch;

  // Recherche par nom de salon : afficher la ville du (des) résultat(s), pas le texte saisi
  if (citiesFromResults.length === 1) return citiesFromResults[0];
  if (citiesFromResults.length > 1) {
    const uniqueLower = new Set(citiesFromResults.map((c) => c.toLowerCase()));
    if (uniqueLower.size === 1) return citiesFromResults[0];
  }

  return salons[0]?.city?.trim() || null;
};

const sumReviewCount = (salons) =>
  salons.reduce((acc, s) => acc + (s.reviewCount || 0), 0);

const fetchExpertsForCategory = async ({
  categoryId,
  search,
  limit = 16,
  salonIdsFilter = null,
}) => {
  const serviceObjectIds = await getCategoryServiceIds(categoryId);
  if (!serviceObjectIds.length) return [];

  let salonQuery = {
    isDelete: false,
    isActive: true,
    "serviceIds.id": { $in: serviceObjectIds },
  };
  salonQuery = appendSalonSearchFilter(salonQuery, search);

  let salonIds = salonIdsFilter;
  if (!salonIds) {
    const salons = await Salon.find(salonQuery).select("_id").lean();
    salonIds = salons.map((s) => s._id);
  }
  if (!salonIds.length) return [];

  const experts = await Expert.find({
    isDelete: false,
    isBlock: false,
    salonId: { $in: salonIds },
    serviceId: { $in: serviceObjectIds },
  })
    .populate({
      path: "salonId",
      select: "name addressDetails isActive isDelete",
    })
    .select("fname lname image review reviewCount salonId")
    .sort({ review: -1, reviewCount: -1 })
    .limit(limit)
    .lean();

  return experts
    .filter((e) => e.salonId && e.salonId.isActive && !e.salonId.isDelete)
    .map((e) => {
      const salon = e.salonId;
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
        /\/+$/,
        ""
      );
      return {
        _id: e._id,
        name: `${e.fname || ""} ${e.lname || ""}`.trim(),
        image: e.image || "",
        review: e.review || 0,
        reviewCount: e.reviewCount || 0,
        salonName: salon.name || "",
        city: salon.addressDetails?.city || "",
        shareUrl: buildSalonShareUrl(salon, baseURL),
      };
    });
};

const renderSalonCardHtml = (salon, { currency, priceFromLabel, noImageLabel }) => {
  const imageHtml = salon.mainImage
    ? `<div class="sq-salon-card-v2__media"><img src="${salon.mainImage}" alt="${salon.name.replace(/"/g, "&quot;")}" class="salon-card-image" loading="lazy" onerror="this.closest('.sq-salon-card-v2__media')?.classList.add('sq-salon-card-v2__media--fallback')"></div>`
    : `<div class="sq-salon-card-v2__media sq-salon-card-v2__media--fallback"><div class="salon-card-image-placeholder">${noImageLabel}</div></div>`;

  const pricePart =
    salon.minPrice !== null
      ? `<span class="salon-card-price">${priceFromLabel} ${currency}${salon.minPrice}</span>`
      : "";
  const ratingPart =
    salon.review > 0
      ? `<span class="salon-card-rating"><span class="rating-stars" aria-hidden="true">★</span> ${salon.review.toFixed(1)} (${salon.reviewCount})</span>`
      : "";
  const metaRow =
    pricePart || ratingPart
      ? `<div class="salon-card-meta">${pricePart}${ratingPart}</div>`
      : "";
  const addressHtml = salon.address
    ? `<p class="salon-card-address">${salon.address}</p>`
    : "";

  return `
    <a href="${salon.shareUrl}" class="salon-card sq-salon-card-v2" data-salon-id="${salon._id}">
      ${imageHtml}
      <div class="salon-card-content">
        <h3 class="salon-card-name">${salon.name}</h3>
        ${metaRow}
        ${addressHtml}
      </div>
    </a>
  `;
};

const renderExpertCardHtml = (expert, { expertAtSalonLabel }) => {
  const imageHtml = expert.image
    ? `<img src="${expert.image}" alt="${expert.name.replace(/"/g, "&quot;")}" class="sq-expert-card__img" loading="lazy" onerror="this.classList.add('sq-expert-card__img--error')">`
    : `<div class="sq-expert-card__placeholder" aria-hidden="true">${(expert.name || "?").charAt(0)}</div>`;
  const ratingHtml =
    expert.review > 0
      ? `<span class="sq-expert-card__rating">★ ${expert.review.toFixed(1)} (${expert.reviewCount})</span>`
      : "";
  const salonLine = expert.salonName
    ? `<span class="sq-expert-card__salon">${expertAtSalonLabel(expert.salonName)}</span>`
    : "";

  return `
    <a href="${expert.shareUrl}" class="sq-expert-card">
      <div class="sq-expert-card__avatar">${imageHtml}</div>
      <div class="sq-expert-card__body">
        <span class="sq-expert-card__name">${expert.name}</span>
        ${ratingHtml}
        ${salonLine}
      </div>
    </a>
  `;
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

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    const formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language })
    );
    const translatedCategoryName = getTranslatedName(category, language);
    const searchCity = inferSearchCity(search, formattedSalons);

    return res.status(200).json({
      status: true,
      message: "Salons retrieved successfully",
      category: {
        _id: category._id,
        name: translatedCategoryName,
        image: category.image,
        description:
          category.description ||
          `${translatedCategoryName} services available at top-rated salons`,
      },
      salons: formattedSalons,
      total,
      totalReviews: sumReviewCount(formattedSalons),
      searchCity,
    });
  } catch (error) {
    console.error("[Get Salons By Category] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertsByCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit, 10) || 16;
    const language = req.query.language || "fr";

    if (!categoryId) {
      return res.status(200).json({
        status: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category || category.isDelete || !category.status) {
      return res.status(200).json({
        status: false,
        message: "Category not found",
      });
    }

    const experts = await fetchExpertsForCategory({
      categoryId,
      search,
      limit,
    });
    
    return res.status(200).json({
      status: true,
      message: "Experts retrieved successfully",
      category: {
        _id: category._id,
        name: getTranslatedName(category, language),
      },
      experts,
      total: experts.length,
    });
  } catch (error) {
    console.error("[Get Experts By Category] Error:", error);
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

    searchQuery = appendSalonSearchFilter(searchQuery, search);

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

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    const language = resolveLang(req.query.lang || req.query.language);
    const formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language })
    );
    const copy = getWebCopy(language);
    const categoryDisplayName = getTranslatedName(category, language) || category.name;
    const categorySlug = generateSlug(categoryDisplayName);
    const categoryShortId = category._id.toString().substring(0, 6);
    const categorySlugWithId = `${categorySlug}-${categoryShortId}`;
    const categoryUrl = `${baseURL}/category/${categorySlugWithId}`;
    const currency = global.settingJSON?.currencySymbol || "€";
    const priceFromLabel = language === "fr" ? "À partir de" : "From";
    const priceDisclaimer =
      language === "fr"
        ? "Prix indicatif — le montant définitif sera confirmé par le salon."
        : "Indicative price — the final amount will be confirmed with the salon.";
    const totalReviews = sumReviewCount(formattedSalons);
    const searchCity = inferSearchCity(search, formattedSalons);
    const experts = await fetchExpertsForCategory({
      categoryId: fullCategoryId,
      search,
      limit: 16,
      salonIdsFilter: formattedSalons.map((s) => s._id),
    });

    const cardOpts = { currency, priceFromLabel, noImageLabel: copy.noImage };
    const salonsHtml =
      formattedSalons.length > 0
        ? formattedSalons
            .map((salon) => renderSalonCardHtml(salon, cardOpts))
            .join("")
        : `<div class="no-results"><p>${copy.noSalonsCategory}</p></div>`;

    const expertsHtml =
      experts.length > 0
        ? experts
            .map((expert) =>
              renderExpertCardHtml(expert, {
                expertAtSalonLabel: copy.expertAtSalon,
              })
            )
            .join("")
        : `<p class="sq-category-discover__empty">${copy.noExpertsCategory}</p>`;

    const searchMessageHtml = searchCity
      ? `<p class="sq-category-discover__city-msg">${copy.resultsInCity(searchCity)}</p>`
      : "";
    const statsLabel = copy.resultsCount(formattedSalons.length, totalReviews);
    const categoryDescription = category.description || copy.categoryMetaDesc(categoryDisplayName);
    const pageTitle = copy.discoverSalons(categoryDisplayName);
    const pageLead = copy.categoryPageLead(categoryDisplayName);
    const idfBanner = idfBannerHtml(copy);
    const returnPath =
      `/category/${categorySlugWithId}` + (language !== "fr" ? `?lang=${language}` : "");
    const clientAuth = authUrls(baseURL, returnPath, language);
    const footerHtml = skedisyFooterHtml(baseURL, copy);
    const categoryImage = category.image || `${baseURL}/logo.png`;

    const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${copy.categoryMetaTitle(categoryDisplayName).replace(/"/g, '&quot;')}</title>
    <meta name="description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${copy.categoryMetaKeywords(categoryDisplayName)}">
    <link rel="canonical" href="${categoryUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${categoryUrl}">
    <meta property="og:title" content="${categoryDisplayName} - Skedisy">
    <meta property="og:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${categoryImage}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${categoryUrl}">
    <meta property="twitter:title" content="${categoryDisplayName} - Skedisy">
    <meta property="twitter:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="twitter:image" content="${categoryImage}">
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "${categoryDisplayName} Services",
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
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sk-public-page sq-page">
    <!-- Login Button Above QR Code -->
    <div class="login-above-qr">
        <a href="${clientAuth.login}" class="btn-login-above">${copy.headerLogin}</a>
    </div>
    
    <div class="qr-topright qr-topright--client">
        <div class="qr-top-flex">
            <div class="qr-top-block" data-app-type="customer" onclick="openPhoneSelection('customer')">
                <div class="qr-code-wrapper">
                    <div id="qr-customer-top"></div>
                    <img class="qr-logo-overlay" src="${baseURL}/images/logo.png" alt="Skedisy">
                </div>
                <div class="qr-label">${copy.qrCustomer}</div>
            </div>
        </div>
    </div>
    
    <!-- Navigation -->
    <nav class="navbar sq-navbar">
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
                <a href="${clientAuth.login}" class="btn-login-mobile-menu">${copy.headerLogin}</a>
                <div class="mobile-categories" id="mobileCategories">
                    <!-- Categories will be loaded dynamically -->
                </div>
            </div>
        </div>
    </nav>
    
    ${idfBanner}

    <main class="sq-category-discover">
        <header class="sq-category-discover__head sq-category-discover__head--with-img">
            <div class="sq-category-discover__head-img">
                <img src="${categoryImage}" alt="${categoryDisplayName.replace(/"/g, "&quot;")}" loading="lazy" onerror="this.style.display='none'">
                </div>
            <div class="sq-category-discover__head-text">
                <h1 class="sq-category-discover__title">${pageTitle}</h1>
                <p class="sq-category-discover__lead">${pageLead}</p>
            </div>
        </header>

        <div class="sq-category-discover__search search-section">
            <div class="search-container sq-search-wrap">
                <i class="fas fa-search sq-search-wrap__icon" aria-hidden="true"></i>
                <input type="search" id="searchInput" class="search-input sq-search-wrap__input" placeholder="${copy.searchPlaceholder.replace(/"/g, "&quot;")}" value="${search.replace(/"/g, "&quot;")}" autocomplete="off">
        </div>
    </div>
    
        <div class="sq-category-discover__toolbar">
            <div class="sq-category-discover__stats-wrap">
                <p class="sq-category-discover__stats" id="categoryStats">${statsLabel}</p>
                <div id="categorySearchMessage">${searchMessageHtml}</div>
            </div>
            <div class="sq-category-discover__view-toggle" role="group" aria-label="Affichage">
                <button type="button" class="sq-view-btn sq-view-btn--active" id="btnListView" data-view="list">${copy.listView}</button>
                <button type="button" class="sq-view-btn" id="btnMapView" data-view="map">${copy.mapView}</button>
        </div>
    </div>
    
        <div class="sq-category-discover__main sq-category-discover__main--list" id="categoryMain">
            <div id="categoryMap" class="sq-category-discover__map" aria-hidden="true"></div>
            <div class="sq-category-discover__list-wrap">
        <p class="price-disclaimer">${priceDisclaimer}</p>
                <div class="salons-grid sq-salons-grid--3" id="salonsGrid">
            ${salonsHtml}
                </div>
        </div>
    </div>

        <section class="sq-category-discover__experts" aria-labelledby="expertsHeading">
            <h2 id="expertsHeading" class="sq-category-discover__experts-title">${copy.categoryExpertsTitle}</h2>
            <div class="sq-experts-scroll" id="expertsRow">
                ${expertsHtml}
            </div>
        </section>
    </main>

    <div class="sked-app-banner">
        <h3>${copy.appBannerTitle}</h3>
        <p>${copy.appBannerDesc}</p>
        <a href="${baseURL}/#download-customer">${copy.bookOnApp}</a>
    </div>

    ${footerHtml}

    <script>
        window.SKEDISY_CATEGORY_PAGE = {
            categoryId: "${category._id}",
            language: "${language}",
            initialSalons: ${JSON.stringify(formattedSalons)},
            initialExperts: ${JSON.stringify(experts)},
            initialSearchCity: ${JSON.stringify(searchCity)},
            initialTotalReviews: ${totalReviews},
            copy: {
                resultsInCityTpl: ${JSON.stringify(copy.resultsInCityTpl)},
                expertAtSalonTpl: ${JSON.stringify(copy.expertAtSalonTpl)},
                mapView: ${JSON.stringify(copy.mapView)},
                listView: ${JSON.stringify(copy.listView)},
                noSalonsSearch: ${JSON.stringify(copy.noSalonsSearch)},
                noExpertsCategory: ${JSON.stringify(copy.noExpertsCategory)}
            },
            render: {
                currency: ${JSON.stringify(currency)},
                priceFromLabel: ${JSON.stringify(priceFromLabel)},
                noImageLabel: ${JSON.stringify(copy.noImage)}
            }
        };
    </script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="${baseURL}/category-page.js"></script>
    <script type="module" src="${baseURL}/qr-code-init.js"></script>
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

const COUNTABLE_BOOKING_STATUSES = ["confirm", "completed"];

const buildServiceNameRegex = (term) => ({
  isDelete: false,
  status: true,
  $or: [
    { name: { $regex: term, $options: "i" } },
    { nameEn: { $regex: term, $options: "i" } },
    { nameFr: { $regex: term, $options: "i" } },
    { namePt: { $regex: term, $options: "i" } },
  ],
});

/** Suggestions recherche : top 5 catégories + top 10 prestations (réservations) */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const language = resolveLang(req.query.lang || req.query.language);

    const topServicesAgg = await Booking.aggregate([
      { $match: { isDelete: false, status: { $in: COUNTABLE_BOOKING_STATUSES } } },
      { $unwind: "$serviceId" },
      { $group: { _id: "$serviceId", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]);

    let services = [];
    if (topServicesAgg.length) {
      const serviceIds = topServicesAgg.map((row) => row._id);
      const serviceDocs = await Service.find({
        _id: { $in: serviceIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt categoryId")
        .lean();
      const order = new Map(
        topServicesAgg.map((row, index) => [String(row._id), index])
      );
      services = serviceDocs
        .sort(
          (a, b) =>
            (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99)
        )
        .map((service) => {
          const stats = topServicesAgg.find(
            (row) => String(row._id) === String(service._id)
          );
          return {
            _id: service._id,
            name: getTranslatedServiceName(service, language),
            categoryId: service.categoryId,
            bookings: stats?.bookings || 0,
          };
        });
    }

    if (services.length < 10) {
      const existingIds = services.map((s) => s._id);
      const fallbackServices = await Service.find({
        _id: { $nin: existingIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt categoryId")
        .sort({ createdAt: -1 })
        .limit(10 - services.length)
        .lean();
      services = services.concat(
        fallbackServices.map((service) => ({
          _id: service._id,
          name: getTranslatedServiceName(service, language),
          categoryId: service.categoryId,
          bookings: 0,
        }))
      );
    }

    const topCategoriesAgg = await Booking.aggregate([
      { $match: { isDelete: false, status: { $in: COUNTABLE_BOOKING_STATUSES } } },
      { $unwind: "$serviceId" },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "svc",
        },
      },
      { $unwind: "$svc" },
      { $match: { "svc.categoryId": { $ne: null }, "svc.isDelete": false } },
      { $group: { _id: "$svc.categoryId", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    let categories = [];
    if (topCategoriesAgg.length) {
      const categoryIds = topCategoriesAgg.map((row) => row._id);
      const categoryDocs = await Category.find({
        _id: { $in: categoryIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt image")
        .lean();
      const order = new Map(
        topCategoriesAgg.map((row, index) => [String(row._id), index])
      );
      categories = categoryDocs
        .sort(
          (a, b) =>
            (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99)
        )
        .map((category) => {
          const translated = getTranslatedName(category, language);
          const stats = topCategoriesAgg.find(
            (row) => String(row._id) === String(category._id)
          );
          return {
            _id: category._id,
            name: translated,
            image: category.image || "",
            bookings: stats?.bookings || 0,
            url: `/category/${generateSlug(translated)}-${category._id
              .toString()
              .substring(0, 6)}`,
          };
        });
    }

    if (categories.length < 5) {
      const existingIds = categories.map((c) => c._id);
      const fallbackCategories = await Category.find({
        _id: { $nin: existingIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt image")
        .sort({ createdAt: -1 })
        .limit(5 - categories.length)
        .lean();
      categories = categories.concat(
        fallbackCategories.map((category) => {
          const translated = getTranslatedName(category, language);
          return {
            _id: category._id,
            name: translated,
            image: category.image || "",
            bookings: 0,
            url: `/category/${generateSlug(translated)}-${category._id
              .toString()
              .substring(0, 6)}`,
          };
        })
      );
    }

    return res.status(200).json({
      status: true,
      categories,
      services,
    });
  } catch (error) {
    console.error("[Search Suggestions] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/** Recherche publique salons (salon + prestation + localisation) — page /recherche */
exports.searchSalonsPublic = async (req, res) => {
  try {
    const unifiedQ = (req.query.q || "").trim();
    const salonTerm = (req.query.salon || "").trim();
    const serviceTerm = (req.query.service || req.query.prestation || "").trim();
    const locationTerm = (req.query.location || req.query.city || "").trim();
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const minRating = parseFloat(req.query.minRating) || 0;
    const sort = req.query.sort || "distance";
    const language = resolveLang(req.query.lang || req.query.language);
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");

    let query = { isDelete: false, isActive: true };
    const andConditions = [];

    if (unifiedQ && !salonTerm && !serviceTerm) {
      const matchedServices = await Service.find(buildServiceNameRegex(unifiedQ)).select(
        "_id"
      );
      const serviceIds = matchedServices.map((s) => s._id);
      const orClause = [
        { name: { $regex: unifiedQ, $options: "i" } },
        { about: { $regex: unifiedQ, $options: "i" } },
      ];
      if (serviceIds.length) {
        orClause.push({ "serviceIds.id": { $in: serviceIds } });
      }
      andConditions.push({ $or: orClause });
    } else if (salonTerm) {
      andConditions.push({
        $or: [
          { name: { $regex: salonTerm, $options: "i" } },
          { about: { $regex: salonTerm, $options: "i" } },
        ],
      });
    }

    if (locationTerm) {
      andConditions.push({
        $or: [
          { "addressDetails.city": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.landMark": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.state": { $regex: locationTerm, $options: "i" } },
        ],
      });
    }

    if (serviceTerm && !(unifiedQ && !salonTerm && !serviceTerm)) {
      const services = await Service.find(buildServiceNameRegex(serviceTerm)).select(
        "_id"
      );
      const serviceIds = services.map((s) => s._id);
      if (!serviceIds.length) {
        return res.status(200).json({
          status: true,
          salons: [],
          totalReviews: 0,
          searchCity: null,
        });
      }
      andConditions.push({ "serviceIds.id": { $in: serviceIds } });
    }

    if (andConditions.length) {
      query.$and = andConditions;
    }

    let salons = await Salon.find(query)
      .populate({
        path: "serviceIds.id",
        match: { isDelete: false, status: true },
        select: "name price",
      })
      .select("name mainImage image review reviewCount addressDetails locationCoordinates about serviceIds")
      .limit(100)
      .lean();

    salons = salons.filter((s) => s.serviceIds?.length ? true : true);

    if (minRating > 0) {
      salons = salons.filter((s) => (s.review || 0) >= minRating);
    }

    if (latitude && longitude) {
      const userLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      salons = salons.map((salon) => {
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
    }

    if (sort === "rating") {
      salons.sort((a, b) => (b.review || 0) - (a.review || 0));
    } else if (sort === "reviews") {
      salons.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (latitude && longitude) {
      salons.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    const formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language, copy: {} })
    );
    const searchCity =
      locationTerm ||
      inferSearchCity(salonTerm || serviceTerm, formattedSalons);

    return res.status(200).json({
      status: true,
      salons: formattedSalons,
      totalReviews: sumReviewCount(formattedSalons),
      searchCity,
      language,
    });
  } catch (error) {
    console.error("[Search Salons Public] Error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
