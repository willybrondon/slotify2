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

//get all category
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isDelete: false, status: true }).select("-isDelete -updatedAt -createdAt").sort({
      createdAt: -1,
    });

    return res.status(200).send({
      status: true,
      message: "Categories Found",
      data: categories,
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
      return res.status(200).json({
        status: true,
        message: "No salons found for this category",
        category: {
          _id: category._id,
          name: category.name,
          image: category.image,
          description: category.description || `${category.name} services available at top-rated salons`,
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
        select: "name duration categoryId",
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

    return res.status(200).json({
      status: true,
      message: "Salons retrieved successfully",
      category: {
        _id: category._id,
        name: category.name,
        image: category.image,
        description: category.description || `${category.name} services available at top-rated salons`,
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
                ${salon.address ? `<div class="salon-address">📍 ${salon.address}</div>` : ''}
                ${distanceHtml}
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
        .category-title {
            font-size: 2.5rem;
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
            border-radius: 12px;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
            display: block;
        }
        .salon-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            border-color: #111;
        }
        .salon-card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .salon-card-image-placeholder {
            width: 100%;
            height: 200px;
            background: #f8f8f8;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
        }
        .salon-card-content {
            padding: 20px;
        }
        .salon-card-name {
            font-size: 1.2rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 8px;
        }
        .salon-rating {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        .rating-stars {
            color: #ffa500;
        }
        .salon-price {
            font-size: 1rem;
            font-weight: 600;
            color: #111;
            margin-bottom: 8px;
        }
        .salon-address {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 4px;
        }
        .salon-distance {
            font-size: 0.85rem;
            color: #999;
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
            .category-title {
                font-size: 2rem;
            }
            .salons-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="category-header">
        <div class="category-header-content">
            <h1 class="category-title">${category.name}</h1>
            <p class="category-description">${category.description || `Find the best ${category.name} services at top-rated salons near you. Book your appointment today!`}</p>
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
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Category Page] Error:", error);
    res.status(500).send("Error loading category page");
  }
};
