const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const mongoose = require("mongoose");
const geolib = require("geolib");
const {
  getWebCopy,
  resolveLang,
  idfBannerHtml,
  skedisyFooterHtml,
} = require("../../lib/webPageCopy");

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
    
    const language = resolveLang(req.query.lang || req.query.language);
    const copy = getWebCopy(language);
    const categoryDisplayName = getTranslatedName(category, language) || category.name;
    
    // Generate the new slug format for category URL
    const categorySlug = generateSlug(categoryDisplayName);
    const categoryShortId = category._id.toString().substring(0, 6);
    const categorySlugWithId = `${categorySlug}-${categoryShortId}`;
    const categoryUrl = `${baseURL}/category/${categorySlugWithId}`;
    const currency = global.settingJSON?.currencySymbol || "$";
    const priceFromLabel = language === "fr" ? "À partir de" : "From";
    const priceDisclaimer =
      language === "fr"
        ? "Prix indicatif — le montant définitif sera confirmé par le salon."
        : "Indicative price — the final amount will be confirmed with the salon.";

    // Generate HTML page
    const salonsHtml = formattedSalons.length > 0 
      ? formattedSalons.map(salon => {
          const ratingHtml = salon.review > 0 
            ? `<div class="salon-rating"><span class="rating-stars">⭐</span><span>${salon.review.toFixed(1)} (${salon.reviewCount})</span></div>`
            : '';
          const priceHtml = salon.minPrice !== null 
            ? `<div class="salon-price">${priceFromLabel} ${currency}${salon.minPrice}</div>`
            : '';
          const distanceHtml = salon.distance !== null
            ? `<div class="salon-distance">📍 ${copy.kmAway(salon.distance.toFixed(1))}</div>`
            : '';
          const imageHtml = salon.mainImage 
            ? `<img src="${salon.mainImage}" alt="${salon.name}" class="salon-card-image" onerror="this.style.display='none'">`
            : `<div class="salon-card-image-placeholder">${copy.noImage}</div>`;

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
                    <i class="fas fa-calendar-check"></i> ${copy.viewBook}
                  </span>
                </div>
              </div>
            </a>
          `;
        }).join('')
      : `<div class="no-results"><p>${copy.noSalonsCategory}</p></div>`;

    const categoryDescription = category.description || copy.categoryMetaDesc(categoryDisplayName);
    const idfBanner = idfBannerHtml(copy);
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
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sk-public-page sq-page">
    <!-- Login Button Above QR Code -->
    <div class="login-above-qr">
        <a href="${baseURL}/salonpanel/" class="btn-login-above">Login</a>
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
        ${categoryImage ? `<div class="category-hero-image-overlay"><img src="${categoryImage}" alt="${categoryDisplayName}" onerror="this.style.display='none'"></div>` : ''}
        <div class="category-hero-overlay"></div>
        <div class="category-hero-content">
            <div class="category-header-content">
                <h1 class="category-hero-title">${categoryDisplayName}</h1>
                <p class="category-hero-description">${categoryDescription}</p>
                <div class="category-hero-stats">
                    <span><strong>${formattedSalons.length}</strong> ${copy.categorySalons}</span>
                    <span><strong>${formattedSalons.filter(s => s.review > 0).length}</strong> ${copy.categoryRated}</span>
                </div>
            </div>
        </div>
    </div>

    ${idfBanner}
    
    <div class="category-header">
        <div class="category-header-content">
            <h2 class="category-subtitle">${copy.discoverSalons(categoryDisplayName)}</h2>
            <p class="category-description">${categoryDescription}</p>
        </div>
    </div>
    
    <div class="search-section">
        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="${copy.searchPlaceholder.replace(/"/g, '&quot;')}" value="${search.replace(/"/g, '&quot;')}">
            <i class="fas fa-search search-icon"></i>
        </div>
    </div>
    
    <div class="salons-section">
        <p class="price-disclaimer">${priceDisclaimer}</p>
        <div class="salons-grid" id="salonsGrid">
            ${salonsHtml}
        </div>
    </div>

    <div class="sked-app-banner">
        <h3>${copy.appBannerTitle}</h3>
        <p>${copy.appBannerDesc}</p>
        <a href="${baseURL}/#download-customer">${copy.bookOnApp}</a>
    </div>

    ${footerHtml}

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
            const priceFromLabel = ${JSON.stringify(priceFromLabel)};
            const viewBookLabel = ${JSON.stringify(copy.viewBook)};
            const noImageLabel = ${JSON.stringify(copy.noImage)};
            const kmAwayTpl = ${JSON.stringify(copy.kmAway("__KM__"))};
            const noSalonsSearch = ${JSON.stringify(copy.noSalonsSearch)};
            
            if (salons.length === 0) {
                grid.innerHTML = '<div class="no-results"><p>' + noSalonsSearch + '</p></div>';
                return;
            }

            grid.innerHTML = salons.map(salon => {
                const ratingHtml = salon.review > 0 
                    ? \`<div class="salon-rating"><span class="rating-stars">⭐</span><span>\${salon.review.toFixed(1)} (\${salon.reviewCount})</span></div>\`
                    : '';
                const priceHtml = salon.minPrice !== null 
                    ? \`<div class="salon-price">\${priceFromLabel} \${currency}\${salon.minPrice}</div>\`
                    : '';
                const distanceHtml = salon.distance !== null
                    ? \`<div class="salon-distance">📍 \${kmAwayTpl.replace('__KM__', salon.distance.toFixed(1))}</div>\`
                    : '';
                const imageHtml = salon.mainImage 
                    ? \`<img src="\${salon.mainImage}" alt="\${salon.name}" class="salon-card-image" onerror="this.style.display='none'">\`
                    : '<div class="salon-card-image-placeholder">' + noImageLabel + '</div>';

                return \`
                    <a href="\${salon.shareUrl}" class="salon-card">
                        \${imageHtml}
                        <div class="salon-card-content">
                            <h3 class="salon-card-name">\${salon.name}</h3>
                            \${ratingHtml}
                            \${priceHtml}
                            \${salon.address ? \`<div class="salon-address"><i class="fas fa-map-marker-alt"></i> \${salon.address}</div>\` : ''}
                            \${distanceHtml}
                            <div class="salon-card-cta">
                              <span class="salon-card-cta-btn"><i class="fas fa-calendar-check"></i> \${viewBookLabel}</span>
                            </div>
                        </div>
                    </a>
                \`;
            }).join('');
        }
    </script>
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
