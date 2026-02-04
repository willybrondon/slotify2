const mongoose = require("mongoose");
const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Favorite = require("../../models/favourite.model");

const { deleteFile } = require("../../middleware/deleteFile");

const geolib = require("geolib");

const normalizeCityName = (cityName) => {
  return cityName
    .replace(/\s*\(.*?\)$/, "")
    .trim()
    .toLowerCase();
};

// Generate slug from salon name
const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Helper function to get translated category name
const getTranslatedCategoryName = (category, language = 'fr') => {
  if (!category) return 'Other Services';
  
  // Map language codes to field names
  const translationMap = {
    'en': category.nameEn || category.name,
    'fr': category.nameFr || category.nameEn || category.name,
    'pt': category.namePt || category.nameEn || category.name,
  };
  
  // Default to French if language not found
  return translationMap[language] || category.name || 'Other Services';
};

// Find salon by short ID (first 6 characters of ObjectId)
const findSalonByShortId = async (shortId) => {
  try {
    // Try to find salon where ObjectId starts with shortId
    const salons = await Salon.find({
      isActive: true,
      isDelete: false,
    }).select("_id name");
    
    // Find salon where _id starts with shortId
    const salon = salons.find(s => s._id.toString().startsWith(shortId));
    return salon ? salon._id.toString() : null;
  } catch (error) {
    console.error("[Find Salon By Short ID] Error:", error);
    return null;
  }
};

exports.getAll = async (req, res) => {
  try {
    const userId = req.query.userId;
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const search = req.query.search || "";

    console.log("Salon API - Search term:", search);
    console.log("Salon API - Query params:", req.query);

    let user;
    if (userId) {
      user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(200).json({ status: false, message: "User not found" });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "User is blocked. Please contact admin" });
      }
    }

    // Build query with search filter
    let query = { isDelete: false, isActive: true };
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      
      // Enhanced search to include name, address, and city
      query = {
        isDelete: false,
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.landMark": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.state": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.country": { $regex: searchTerm, $options: "i" } }
        ]
      };
      
      console.log("Salon API - Enhanced search query:", JSON.stringify(query, null, 2));
    }

    let salons = await Salon.find(query);

    console.log("Salon API - Total salons found:", salons.length);

    if (latitude && longitude) {
      const userLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const distanceArray = await Promise.all(
        salons.map(async (salon) => {
          const salonLocation = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };

          const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
          const distanceInKilometers = distanceInMeters / 1000;

          const isFavorite = userId ? await Favorite.exists({ userId: userId, salonId: salon._id, type: 2 }) : false;

          return {
            ...salon.toObject(),
            distance: distanceInKilometers,
            isFavorite: !!isFavorite,
          };
        })
      );

      distanceArray.sort((a, b) => a.distance - b.distance);
      salons = distanceArray;
    } else {
      salons = await Promise.all(
        salons.map(async (salon) => {
          const isFavorite = userId ? await Favorite.exists({ userId: userId, salonId: salon._id, type: 2 }) : false;

          return {
            ...salon.toObject(),
            isFavorite: !!isFavorite,
          };
        })
      );
    }

    console.log("Salon API - Final salons count:", salons.length);

    return res.status(200).json({ status: true, message: "Success", data: salons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.serviceBaseSalon = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details" });
    }

    const serviceIds = req.query.serviceId.split(",");
    const experts = await Expert.find({
      serviceId: { $all: serviceIds },
      isDelete: false,
      isBlock: false,
    });

    const uniqueSalonIds = [...new Set(experts.map((expert) => expert.salonId.toString()))];

    const salons = await Promise.all(
      uniqueSalonIds.map(async (salonId) => {
        const salon = await Salon.findOne({ isDelete: false, _id: salonId });
        if (req.query.latitude && req.query.longitude) {
          const device1 = {
            latitude: parseFloat(req.query.latitude),
            longitude: parseFloat(req.query.longitude),
          };

          const device2 = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };

          const distanceInMeters = geolib.getDistance(device1, device2);

          const distanceInKilometers = distanceInMeters / 1000;
          console.log("distanceInMeters", distanceInMeters);
          console.log("distanceInKilometers", distanceInKilometers);

          return {
            _id: salon._id,
            name: salon.name,
            addressDetails: salon.addressDetails,
            image: salon.mainImage,
            mobile: salon.mobile,
            rating: salon.review,
            ratingCount: salon.reviewCount,
            distance: distanceInKilometers,
          };
        } else
          return {
            _id: salon._id,
            name: salon.name,
            addressDetails: salon.addressDetails,
            image: salon.mainImage,
            mobile: salon.mobile,
            rating: salon.review,
            ratingCount: salon.reviewCount,
          };
      })
    );
    return res.status(200).send({ status: true, data: salons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.salonData = async (req, res) => {
  try {
    const city = req.query.city ? req.query.city.trim() : null;

    console.log("Salon Data API - Received city:", city);
    console.log("Salon Data API - Query params:", req.query);

    // City is optional - don't block API if not provided
    // if (!city) {
    //   return res.status(200).json({
    //     status: false,
    //     message: "City is required in query parameters.",
    //   });
    // }

    if (!req.query.salonId) {
      return res.status(200).send({ status: false, message: "Invalid salon details." });
    }

    let salonId = req.query.salonId;
    
    // Check if it's a slug format (contains hyphens and ends with 6 hex characters)
    // If it's a full ObjectId (24 hex chars), we still accept it for API compatibility
    // But for web URLs, only slug format is used
    if (!/^[0-9a-fA-F]{24}$/.test(salonId)) {
      // It's a slug, extract short ID and resolve to full salon ID
      const parts = salonId.split("-");
      const shortId = parts[parts.length - 1];
      
      if (/^[0-9a-fA-F]{6}$/.test(shortId)) {
        const fullSalonId = await findSalonByShortId(shortId);
        if (fullSalonId) {
          salonId = fullSalonId;
        } else {
          return res.status(200).send({ status: false, message: "Salon Not Found" });
        }
      } else {
        return res.status(200).send({ status: false, message: "Invalid salon details." });
      }
    }

    const salon = await Salon.findOne({
      _id: salonId,
      isActive: true,
      isDelete: false,
    }).populate({
      path: "serviceIds.id",
      populate: {
        path: "categoryId",
        select: "name nameEn nameFr namePt"
      }
    });

    if (!salon) {
      return res.status(404).send({
        status: false,
        message: "Salon Not Found",
      });
    }

    console.log("Salon Data API - Salon found:", salon.name);
    console.log("Salon Data API - Total services in salon:", salon.serviceIds.length);
    console.log("Salon Data API - Services with allowCities:", salon.serviceIds.map(s => ({
      name: s.id?.name,
      allowCities: s.allowCities?.map(ac => ac.city)
    })));

    // Filter out services where the populated service (id) is null/undefined
    // This happens when service references are invalid (deleted services)
    // Preserve the original structure but ensure all fields are present
    let finalServices = salon.serviceIds
      .filter(service => {
        // Keep service if id exists and is not null (valid service reference)
        return service.id && service.id._id;
      })
      .map(service => {
        // Ensure all required fields are present with defaults
        return {
          id: service.id,
          price: service.price !== null && service.price !== undefined ? service.price : 0,
          allowCities: service.allowCities || [],
          _id: service._id || service.id._id
        };
      });
    
    console.log("Salon Data API - Valid services (after filtering null):", finalServices.length);
    console.log("Salon Data API - Service names:", finalServices.map(s => s.id?.name));

    console.log("Salon Data API - Fetching products for salon ID:", salon._id.toString());
    console.log("Salon Data API - Salon ID type:", typeof salon._id);
    console.log("Salon Data API - Salon ID:", salon._id);
    
    const [reviews, experts, product] = await Promise.all([
      Review.find({ salonId: salon._id }).populate({
        path: "userId",
        select: "fname lname image _id",
      }),
      Expert.find({
        salonId: salon._id,
        isBlock: false,
        isDelete: false,
      }).select("fname lname image review reviewCount serviceId").populate({
        path: "serviceId",
        select: "name nameEn nameFr namePt duration categoryId image",
        populate: {
          path: "categoryId",
          select: "name nameEn nameFr namePt image"
        }
      }),
      Product.aggregate([
        { $match: { 
          createStatus: "Approved",
          salon: new mongoose.Types.ObjectId(salon._id)
        } },
        {
          $project: {
            salon: 1,
            productName: 1,
            productCode: 1,
            description: 1,
            price: 1,
            review: 1,
            mainImage: 1,
            images: 1,
            shippingCharges: 1,
            quantity: 1,
            sold: 1,
            isOutOfStock: 1,
            category: 1,
            rating: 1,
            createStatus: 1,
            updateStatus: 1,
            isBestSeller: 1,
            mrp: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    console.log("Salon Data API - Products found:", product.length);
    console.log("Salon Data API - Product names:", product.map(p => p.productName));
    
    // Debug: Check if there are any products at all and their salon field
    const allProducts = await Product.find({ createStatus: "Approved" }).limit(5);
    console.log("Salon Data API - Sample products in database:", allProducts.map(p => ({
      productName: p.productName,
      salon: p.salon,
      salonType: typeof p.salon
    })));

    const tax = global.settingJSON.tax;
    if (!tax) {
      return res.status(200).send({ status: false, message: "Tax settings not found." });
    }

    // Convert salon to plain object and ensure serviceIds are properly set
    let salonData = salon.toObject();
    
    // Replace serviceIds with filtered and formatted services
    salonData.serviceIds = finalServices;
    
    // Add distance if coordinates are provided
    if (req.query.latitude && req.query.longitude) {
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };
      const device2 = {
        latitude: parseFloat(salon.locationCoordinates.latitude || 0),
        longitude: parseFloat(salon.locationCoordinates.longitude || 0),
      };
      
      if (device2.latitude && device2.longitude) {
        const distanceInKilometers = geolib.getDistance(device1, device2) / 1000;
        salonData.distance = distanceInKilometers;
      }
    }

    // Ensure all required fields are present in the response
    const responseData = {
      status: true,
      message: "Success",
      salon: {
        ...salonData,
        serviceIds: finalServices, // Ensure services are included
      },
      product: product || [],
      reviews: reviews || [],
      experts: experts || [],
      tax: tax || 0,
    };

    console.log("Salon Data API - Final response - Services count:", responseData.salon.serviceIds.length);
    console.log("Salon Data API - Final response - Experts count:", responseData.experts.length);
    console.log("Salon Data API - Final response - Products count:", responseData.product.length);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Get salon share URL
exports.getSalonShareUrl = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({
        status: false,
        message: "Salon ID is required",
      });
    }

    const salon = await Salon.findOne({
      _id: req.query.salonId,
      isActive: true,
      isDelete: false,
    });

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon not found",
      });
    }

    // Generate slug from salon name
    const slug = generateSlug(salon.name);
    // Get short ID (first 6 characters of ObjectId)
    const shortId = salon._id.toString().substring(0, 6);
    // Combine slug and short ID
    const slugWithId = `${slug}-${shortId}`;

    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${slugWithId}`;
    
    return res.status(200).json({
      status: true,
      message: "Share URL generated successfully",
      shareUrl: shareUrl,
      salonId: salon._id,
      salonName: salon.name,
    });
  } catch (error) {
    console.error("[Share URL] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Serve salon web page with Open Graph and App Links meta tags
exports.serveSalonWebPage = async (req, res) => {
  try {
    const slugWithId = req.params.slugWithId;

    if (!slugWithId) {
      return res.status(404).send("Salon not found");
    }

    // Skip if it's a known API route or static file path
    const excludedPaths = ['admin', 'user', 'salon', 'api', '.well-known', 'favicon.ico', 'robots.txt'];
    if (excludedPaths.includes(slugWithId.toLowerCase())) {
      return res.status(404).send("Not found");
    }

    // New format: slug with short ID (e.g., "coiffure-beaute-brasil-6885e2")
    // Extract short ID (last part after hyphen, should be 6 hex characters)
    const parts = slugWithId.split("-");
    const shortId = parts[parts.length - 1];
    
    // Validate short ID format (6 hex characters)
    if (!/^[0-9a-fA-F]{6}$/.test(shortId)) {
      return res.status(404).send("Salon not found");
    }
    
    const fullSalonId = await findSalonByShortId(shortId);
    
    if (!fullSalonId) {
      return res.status(404).send("Salon not found");
    }
    
    const salon = await Salon.findOne({
      _id: fullSalonId,
      isActive: true,
      isDelete: false,
    }).populate({
      path: "serviceIds.id",
      populate: {
        path: "categoryId",
        select: "name nameEn nameFr namePt image"
      }
    });

    if (!salon) {
      return res.status(404).send("Salon not found");
    }

    // Fetch additional data: products, experts, reviews with expert info
    const [products, experts, reviews] = await Promise.all([
      Product.find({
        salon: salon._id,
        createStatus: "Approved"
      }).select("productName description price mainImage review rating").limit(10),
      Expert.find({
        salonId: salon._id,
        isBlock: false,
        isDelete: false,
      }).select("fname lname image review reviewCount").limit(20),
      Review.find({ salonId: salon._id })
        .populate({
          path: "userId",
          select: "fname lname image",
        })
        .populate({
          path: "expertId",
          select: "fname lname image",
        })
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    // Generate the new slug format for share URL
    const salonSlug = generateSlug(salon.name);
    const salonShortId = salon._id.toString().substring(0, 6);
    const salonSlugWithId = `${salonSlug}-${salonShortId}`;
    
    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${salonSlugWithId}`;
    // Use heroImage if available, otherwise fallback to mainImage or first image
    const salonImage = salon.heroImage || salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : "");
    const salonName = salon.name || "Salon";
    const salonDescription = salon.about || `Book your appointment at ${salonName}`;
    // Get value proposition data
    const valueProposition = salon.valueProposition || {};
    const valuePropTitle = valueProposition.title || `${salonName} — Premier Hair & Beauty Experience`;
    const valuePropDescription = valueProposition.description || "";
    const valuePropFeatures = valueProposition.features || [];
    const salonAddress = salon.addressDetails 
      ? `${salon.addressDetails.addressLine1}, ${salon.addressDetails.city || ""}, ${salon.addressDetails.country || ""}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
      : "";
    const salonMobile = salon.mobile || "";
    const salonRating = salon.review || 0;
    const salonReviewCount = salon.reviewCount || 0;

    // Android package name and iOS bundle ID
    const androidPackage = process.env.ANDROID_PACKAGE_NAME || "com.skedisy.customer";
    const iosBundleId = process.env.IOS_BUNDLE_ID || "com.skedisy.customer";
    const iosAppStoreId = process.env.IOS_APP_STORE_ID || "";
    const deepLinkScheme = process.env.APP_DEEP_LINK_SCHEME || "slotify";
    const deepLink = `${deepLinkScheme}://salon/${salon._id}`;
    const currency = global.settingJSON?.currencySymbol || "$";

    // Build HTML sections
    // Opening Hours Section
    let openingHoursHtml = '';
    if (salon.salonTime && salon.salonTime.length > 0) {
      openingHoursHtml = salon.salonTime.map(time => {
        const isClosed = !time.isActive || (time.openTime === "" && time.closedTime === "");
        const timeDisplay = isClosed ? '<span class="hours-closed">Closed</span>' : `${time.openTime || 'N/A'} - ${time.closedTime || 'N/A'}`;
        return `<div class="hours-item"><span class="hours-day">${time.day || 'N/A'}</span><span class="hours-time">${timeDisplay}</span></div>`;
      }).join('');
      openingHoursHtml = `<div class="section"><h3 class="section-title">⏰ Opening Hours</h3><div class="hours-grid">${openingHoursHtml}</div></div>`;
    }

    // Services Section - Group by Category
    let servicesHtml = '';
    if (salon.serviceIds && salon.serviceIds.length > 0) {
      // Group services by category
      const servicesByCategory = {};
      salon.serviceIds.forEach(service => {
        if (service.id && service.id.categoryId) {
          const categoryId = service.id.categoryId._id?.toString() || service.id.categoryId?.toString() || 'other';
          const categoryName = getTranslatedCategoryName(service.id.categoryId, 'fr') || 'Other Services';
          if (!servicesByCategory[categoryId]) {
            servicesByCategory[categoryId] = {
              name: categoryName,
              services: []
            };
          }
          servicesByCategory[categoryId].services.push(service);
        } else {
          if (!servicesByCategory['other']) {
            servicesByCategory['other'] = {
              name: 'Other Services',
              services: []
            };
          }
          servicesByCategory['other'].services.push(service);
        }
      });

      // Build HTML for each category
      const categorySections = Object.values(servicesByCategory).map(category => {
        const serviceItems = category.services.slice(0, 8).map(service => {
          const serviceName = (service.id?.name || 'Service').replace(/"/g, '&quot;');
          const servicePrice = service.price || 0;
          const serviceDuration = service.id?.duration || 0;
          const durationText = serviceDuration > 0 ? `<div class="service-duration">⏱️ ${serviceDuration} min</div>` : '';
          return `
            <div class="service-item">
              <div class="service-header">
                <div class="service-name">${serviceName}</div>
                <div class="service-price">${currency}${servicePrice}</div>
              </div>
              ${durationText}
              <button onclick="openApp()" class="service-book-btn">
                <i class="fas fa-calendar-plus"></i> Book Now
              </button>
            </div>`;
        }).join('');
        const moreInCategory = category.services.length > 8 ? `<p class="service-more">+ ${category.services.length - 8} more in this category</p>` : '';
        return `
          <div class="service-category-group">
            <h4 class="service-category-title">${category.name}</h4>
            <div class="services-grid">${serviceItems}</div>
            ${moreInCategory}
          </div>`;
      }).join('');

      const totalServices = salon.serviceIds.length;
      const displayedServices = Object.values(servicesByCategory).reduce((sum, cat) => sum + Math.min(cat.services.length, 8), 0);
      const moreServices = totalServices > displayedServices ? `<p class="services-total-more">+ ${totalServices - displayedServices} more services available in the app</p>` : '';
      
      servicesHtml = `<div class="section"><h3 class="section-title">💇 Services</h3>${categorySections}${moreServices}</div>`;
    } else {
      servicesHtml = '<div class="section"><h3 class="section-title">💇 Services</h3><p class="empty-state">No services available</p></div>';
    }

    // Products Section
    let productsHtml = '';
    if (products && products.length > 0) {
      productsHtml = products.map(product => {
        const productName = (product.productName || 'Product').replace(/"/g, '&quot;');
        const productDesc = (product.description || '').replace(/"/g, '&quot;').substring(0, 120);
        const productImage = product.mainImage || '';
        const productPrice = product.price || 0;
        const imageHtml = productImage ? `<img src="${productImage}" alt="${productName}" onerror="this.style.display='none'">` : '';
        return `<div class="product-item">${imageHtml}<div class="product-info"><div class="product-name">${productName}</div>${productDesc ? `<div class="product-desc">${productDesc}</div>` : ''}<div class="product-price">${currency}${productPrice}</div></div></div>`;
      }).join('');
      productsHtml = `<div class="section"><h3 class="section-title">🛍️ Products</h3><div class="services-grid">${productsHtml}</div></div>`;
    } else {
      productsHtml = '<div class="section"><h3 class="section-title">🛍️ Products</h3><p class="empty-state">No products available</p></div>';
    }

    // Staff Section
    let staffHtml = '';
    if (experts && experts.length > 0) {
      staffHtml = experts.map(expert => {
        const expertFname = (expert.fname || '').replace(/"/g, '&quot;');
        const expertLname = (expert.lname || '').replace(/"/g, '&quot;');
        const expertName = `${expertFname} ${expertLname}`.trim() || 'Staff Member';
        const expertImage = expert.image || '';
        const expertRating = expert.review || 0;
        const imageHtml = expertImage ? `<img src="${expertImage}" alt="${expertName}" class="staff-item-img" onerror="this.style.display='none'">` : `<div class="review-avatar" style="width: 60px; height: 60px;">${expertName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = expertRating > 0 ? `<div class="staff-rating">⭐ ${expertRating.toFixed(1)}</div>` : '';
        return `<div class="staff-item">${imageHtml}<div class="staff-info"><div class="staff-name">${expertName}</div>${ratingHtml}</div></div>`;
      }).join('');
      staffHtml = `<div class="section"><h3 class="section-title">👤 Staff</h3><div class="services-grid">${staffHtml}</div></div>`;
    } else {
      staffHtml = '<div class="section"><h3 class="section-title">👤 Staff</h3><p class="empty-state">No staff information available</p></div>';
    }

    // Reviews Section - Show expert/staff info
    let reviewsHtml = '';
    if (reviews && reviews.length > 0) {
      reviewsHtml = reviews.map(review => {
        const userFname = (review.userId?.fname || '').replace(/"/g, '&quot;');
        const userLname = (review.userId?.lname || '').replace(/"/g, '&quot;');
        const userName = `${userFname} ${userLname}`.trim() || 'Anonymous';
        const userImage = review.userId?.image || '';
        const reviewRating = review.rating || 0;
        const reviewComment = ((review.review || review.comment || review.message || '').replace(/"/g, '&quot;').replace(/\n/g, '<br>'));
        
        // Expert/Staff information
        const expertFname = (review.expertId?.fname || '').replace(/"/g, '&quot;');
        const expertLname = (review.expertId?.lname || '').replace(/"/g, '&quot;');
        const expertName = `${expertFname} ${expertLname}`.trim();
        const expertInfo = expertName ? `<div class="review-expert">👤 With ${expertName}</div>` : '';
        
        const imageHtml = userImage ? `<img src="${userImage}" alt="${userName}" class="review-avatar" onerror="this.style.display='none'">` : `<div class="review-avatar">${userName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = reviewRating > 0 ? `<div class="review-rating">${'⭐'.repeat(Math.round(reviewRating))} ${reviewRating.toFixed(1)}</div>` : '';
        const commentHtml = reviewComment ? `<div class="review-text">${reviewComment}</div>` : '';
        return `<div class="review-item"><div class="review-header">${imageHtml}<div class="review-info"><div class="review-name">${userName}</div>${ratingHtml}${expertInfo}</div></div>${commentHtml}</div>`;
      }).join('');
      reviewsHtml = `<div class="section"><h3 class="section-title">💬 Reviews</h3><div class="reviews-container">${reviewsHtml}</div></div>`;
    } else {
      reviewsHtml = '<div class="section"><h3 class="section-title">💬 Reviews</h3><p class="empty-state">No reviews yet</p></div>';
    }

    // Rating badge HTML
    const ratingBadgeHtml = salonRating > 0 ? `<div class="rating-badge"><span class="rating-stars">⭐</span><span>${salonRating.toFixed(1)} (${salonReviewCount} reviews)</span></div>` : '';

    // Footer HTML (matching skedisy.com)
    const footerHtml = `
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Skedisy</h3>
                    <p>Transform your salon management with our all-in-one solution.</p>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> support@skedisy.com</p>
                        <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>About</h4>
                    <ul>
                        <li><a href="${baseURL}">Home</a></li>
                        <li><a href="${baseURL}/salonpanel">Sign Up</a></li>
                        <li><a href="${baseURL}">Pricing</a></li>
                        <li><a href="${baseURL}">Help Center</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Our Solutions</h4>
                    <ul>
                        <li><a href="${baseURL}">24/7 Online Booking</a></li>
                        <li><a href="${baseURL}">Calendar Management</a></li>
                        <li><a href="${baseURL}">Certified POS</a></li>
                        <li><a href="${baseURL}">Payment Terminal</a></li>
                        <li><a href="${baseURL}">Work Time Management</a></li>
                        <li><a href="${baseURL}">Marketing Solutions</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="${baseURL}/terms.html">Terms of Service</a></li>
                        <li><a href="${baseURL}/privacy.html">Privacy Policy</a></li>
                        <li><a href="${baseURL}">Cookie Management</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Skedisy. All rights reserved.</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">
                    <a href="${baseURL}/sitemap.xml" style="color: #999; text-decoration: none;">Sitemap</a> | 
                    <a href="${baseURL}/robots.txt" style="color: #999; text-decoration: none;">Robots.txt</a>
                </p>
            </div>
        </div>
    </footer>`;

    // Generate HTML with Open Graph and App Links meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${salonName} - Skedisy | Book Appointment Online</title>
    <meta name="description" content="${salonDescription.replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${salonName}, salon, beauty services, book appointment, ${salonAddress ? salonAddress.split(',').join(', ') : ''}">
    <link rel="canonical" href="${shareUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${shareUrl}" />
    <meta property="og:title" content="${salonName}" />
    <meta property="og:description" content="${salonDescription}" />
    ${salonImage ? `<meta property="og:image" content="${salonImage}" />` : ''}
    <meta property="og:site_name" content="Skedisy" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${shareUrl}" />
    <meta name="twitter:title" content="${salonName}" />
    <meta name="twitter:description" content="${salonDescription}" />
    ${salonImage ? `<meta name="twitter:image" content="${salonImage}" />` : ''}
    
    <!-- App Links (Android) -->
    <meta property="al:android:url" content="${deepLink}" />
    <meta property="al:android:package" content="${androidPackage}" />
    <meta property="al:android:app_name" content="Skedisy" />
    
    <!-- Universal Links (iOS) -->
    <meta property="al:ios:url" content="${deepLink}" />
    <meta property="al:ios:app_store_id" content="${iosAppStoreId}" />
    <meta property="al:ios:app_name" content="Skedisy" />
    
    <!-- Apple Smart App Banner -->
    ${iosAppStoreId ? `<meta name="apple-itunes-app" content="app-id=${iosAppStoreId}">` : ''}
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "name": "${salonName.replace(/"/g, '\\"')}",
      "description": "${salonDescription.replace(/"/g, '\\"')}",
      "url": "${shareUrl}",
      "image": "${salonImage || ''}",
      "telephone": "${salonMobile || ''}",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "${(salon.addressDetails?.addressLine1 || '').replace(/"/g, '\\"')}",
        "addressLocality": "${(salon.addressDetails?.city || '').replace(/"/g, '\\"')}",
        "addressRegion": "${(salon.addressDetails?.state || '').replace(/"/g, '\\"')}",
        "addressCountry": "${(salon.addressDetails?.country || '').replace(/"/g, '\\"')}"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "${salon.locationCoordinates?.latitude || ''}",
        "longitude": "${salon.locationCoordinates?.longitude || ''}"
      },
      "aggregateRating": ${salonRating > 0 ? `{
        "@type": "AggregateRating",
        "ratingValue": "${salonRating}",
        "reviewCount": "${salonReviewCount}"
      }` : 'null'},
      "priceRange": "${salon.serviceIds && salon.serviceIds.length > 0 ? '$$' : ''}",
      "openingHoursSpecification": ${salon.salonTime && salon.salonTime.length > 0 ? JSON.stringify(salon.salonTime.filter(t => t.isActive && t.openTime && t.closedTime).map(t => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": t.day,
        "opens": t.openTime,
        "closes": t.closedTime
      }))) : '[]'}
    }
    </script>
    
    <!-- Fallback redirect to app store or app -->
    <script>
        // Try to open app, fallback to app store or download page
        function openApp() {
            const deepLink = "${deepLink}";
            const androidPackage = "${androidPackage}";
            const iosAppStoreIdRaw = "${iosAppStoreId}";
            const iosAppStoreId = (iosAppStoreIdRaw && iosAppStoreIdRaw !== "undefined" && iosAppStoreIdRaw !== "null" && iosAppStoreIdRaw.trim() !== "") 
                ? iosAppStoreIdRaw 
                : "6752954525"; // Fallback to Skedisy iOS App Store ID
            const androidStoreUrl = "https://play.google.com/store/apps/details?id=" + androidPackage;
            const iosStoreUrl = "https://apps.apple.com/app/id" + iosAppStoreId;
            const baseURL = "${baseURL}";
            const downloadPageUrl = (baseURL && baseURL !== "undefined" && baseURL.trim() !== "") ? baseURL : "https://skedisy.com";
            
            // Detect device
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isAndroid = /Android/.test(navigator.userAgent);
            const isMobile = isIOS || isAndroid;
            
            // For desktop/computer: redirect to download page
            if (!isMobile) {
                window.location.href = downloadPageUrl;
                return;
            }
            
            // For mobile devices: try to open app, fallback to app store
            let appOpened = false;
            let pageHidden = false;
            const startTime = Date.now();
            
            // Track if page becomes hidden (indicates app might have opened)
            const handleVisibilityChange = function() {
                if (document.hidden) {
                    pageHidden = true;
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Track if page loses focus (another indicator app opened)
            const handleBlur = function() {
                pageHidden = true;
            };
            window.addEventListener('blur', handleBlur);
            
            // Try to open app via deep link
            window.location.href = deepLink;
            
            // Check if app opened after a short delay
            setTimeout(function() {
                // Remove event listeners
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('blur', handleBlur);
                
                // If page is still visible and focused, app likely didn't open
                // Redirect to appropriate app store
                if (!pageHidden && document.hasFocus()) {
                    if (isIOS) {
                        window.location.href = iosStoreUrl;
                    } else if (isAndroid) {
                        window.location.href = androidStoreUrl;
                    }
                }
            }, 2500); // Wait 2.5 seconds to check if app opened
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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #fff;
            color: #111;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding-top: 80px; /* Account for fixed navbar */
        }
        .main-wrapper {
            flex: 1;
            width: 100%;
            margin-top: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            width: 100%;
        }
        /* Hero Section */
        .hero-section {
            position: relative;
            width: 100%;
            height: 500px;
            overflow: hidden;
            margin-top: 0;
            margin-left: 0;
            margin-right: 0;
        }
        .hero-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            min-width: 100%;
            min-height: 100%;
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            background-attachment: scroll;
        }
        .hero-placeholder {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            min-width: 100%;
            min-height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
            z-index: 1;
        }
        .hero-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            align-items: center;
            color: #ffffff !important;
            padding: 40px 0;
        }
        .hero-content * {
            color: #ffffff !important;
        }
        .hero-content h1,
        .hero-content p {
            color: #ffffff !important;
        }
        .hero-title {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #ffffff !important;
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.8),
                0 4px 8px rgba(0,0,0,0.6),
                2px 2px 8px rgba(0,0,0,0.9),
                -1px -1px 0 rgba(0,0,0,0.5),
                1px 1px 0 rgba(0,0,0,0.5);
            line-height: 1.2;
        }
        .hero-title * {
            color: #ffffff !important;
        }
        .hero-subtitle {
            font-size: 1.3rem;
            margin-bottom: 24px;
            max-width: 700px;
            color: #ffffff !important;
            font-weight: 400;
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.8),
                0 4px 8px rgba(0,0,0,0.6),
                2px 2px 6px rgba(0,0,0,0.9),
                -1px -1px 0 rgba(0,0,0,0.5),
                1px 1px 0 rgba(0,0,0,0.5);
            line-height: 1.6;
        }
        .hero-subtitle,
        .hero-subtitle *,
        .hero-content .hero-subtitle,
        .hero-content .hero-subtitle *,
        p.hero-subtitle {
            color: #ffffff !important;
        }
        .hero-rating {
            margin-bottom: 32px;
        }
        .hero-rating .rating-badge {
            background: rgba(255,255,255,0.25);
            backdrop-filter: blur(10px);
            color: #ffffff !important;
            text-shadow: 
                0 1px 3px rgba(0,0,0,0.8),
                0 2px 6px rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .hero-cta-btn {
            background: #fff;
            color: #000000 !important;
            border: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: inline-flex;
            align-items: center;
            gap: 12px;
        }
        .hero-cta-btn * {
            color: #000000 !important;
        }
        .hero-cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(0,0,0,0.3);
            background: #f8f8f8;
        }
        .hero-cta-btn i {
            font-size: 1.1rem;
        }
        
        /* Value Proposition Section */
        .value-proposition-section {
            background: #f8f8f8;
            padding: 60px 0;
            border-bottom: 1px solid #eee;
        }
        .value-prop-description {
            text-align: center;
            margin-bottom: 40px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .value-prop-description p {
            font-size: 1.1rem;
            color: #555;
            line-height: 1.6;
        }
        .value-props-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 32px;
        }
        .value-prop-item {
            text-align: center;
            padding: 24px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .value-prop-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .value-prop-icon {
            font-size: 3rem;
            margin-bottom: 16px;
        }
        .value-prop-item h4 {
            font-size: 1.3rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 12px;
        }
        .value-prop-item p {
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
        }
        
        .salon-header {
            background: #fff;
            padding: 40px 0;
            border-bottom: 1px solid #eee;
        }
        .salon-header-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            align-items: start;
        }
        .salon-info-header {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .salon-info-header h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #111;
            margin: 0;
            background: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .salon-info-header .rating-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f8f8f8;
            padding: 8px 16px;
            border-radius: 20px;
            width: fit-content;
            font-size: 1rem;
            margin-top: 12px;
            margin-bottom: 12px;
            scroll-margin-bottom: 100px; /* Prevent hiding behind sticky button on mobile */
        }
        .rating-stars {
            color: #ffa500;
        }
        .salon-description {
            color: #444;
            font-size: 1.1rem;
            line-height: 1.7;
            margin: 16px 0;
        }
        .salon-contact {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 16px;
        }
        .salon-contact p {
            color: #666;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .content-wrapper {
            padding: 40px 0;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            align-items: start;
        }
        .main-content {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        .sidebar-content {
            position: sticky;
            top: 20px;
        }
        .booking-card {
            background: #f8f8f8;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .booking-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000000 !important;
            margin-bottom: 20px;
        }
        .open-app-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 18px 32px;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            margin-bottom: 16px;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .open-app-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        .open-app-btn i {
            font-size: 1rem;
        }
        #download-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e0e0e0;
            display: none; /* Hidden by default, shown when app not installed */
        }
        .download-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .btn {
            padding: 14px 24px;
            border-radius: 12px;
            text-decoration: none;
            text-align: center;
            font-weight: 600;
            transition: all 0.2s;
            display: block;
            font-size: 1rem;
        }
        .btn-primary {
            background: #111;
            color: white;
        }
        .btn-primary:hover {
            background: #333;
            transform: translateY(-2px);
        }
        .section {
            background: #fff;
            padding: 32px 0;
            border-bottom: 1px solid #eee;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 24px;
            padding-top: 20px; /* Add top padding for mobile */
            scroll-margin-top: 100px; /* Prevent hiding behind navbar on mobile */
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }
        /* Service Category Grouping */
        .service-category-group {
            margin-bottom: 40px;
        }
        .service-category-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111;
            margin-bottom: 20px;
            padding-bottom: 12px;
            padding-top: 20px; /* Add top padding for mobile */
            border-bottom: 2px solid #eee;
            scroll-margin-top: 100px; /* Prevent hiding behind navbar on mobile */
        }
        .service-item, .product-item, .staff-item {
            background: #fff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s;
        }
        .service-item:hover, .product-item:hover, .staff-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-color: #111;
        }
        .service-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .service-name, .product-name, .staff-name {
            font-weight: 600;
            color: #111;
            font-size: 1.1rem;
            flex: 1;
        }
        .service-price, .product-price {
            color: #111;
            font-weight: 700;
            font-size: 1.2rem;
            margin-left: 16px;
        }
        .service-duration {
            color: #666;
            font-size: 0.9rem;
            margin-top: 8px;
        }
        .service-book-btn {
            margin-top: 16px;
            width: 100%;
            background: #111;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .service-book-btn:hover {
            background: #333;
            transform: translateY(-1px);
        }
        .service-book-btn i {
            font-size: 0.9rem;
        }
        .service-more, .services-total-more {
            text-align: center;
            color: #666;
            margin-top: 16px;
            font-size: 0.95rem;
            font-style: italic;
        }
        .product-item {
            display: flex;
            gap: 16px;
            align-items: start;
        }
        .product-item img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            flex-shrink: 0;
        }
        .product-info {
            flex: 1;
        }
        .product-desc {
            color: #666;
            font-size: 0.9rem;
            margin: 8px 0;
        }
        .staff-item {
            display: flex;
            gap: 20px;
            align-items: center;
            padding: 20px;
        }
        .staff-item img,
        .staff-item-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            object-position: center center;
            flex-shrink: 0;
            border: 3px solid #f0f0f0;
            display: block;
        }
        .staff-info {
            flex: 1;
        }
        .staff-name {
            font-size: 1.2rem;
            margin-bottom: 8px;
        }
        .staff-rating {
            color: #ffa500;
            font-size: 1rem;
            margin-top: 4px;
            font-weight: 600;
        }
        .reviews-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .review-item {
            background: #fff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s;
        }
        .review-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-color: #111;
        }
        .review-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
        }
        .review-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 1.2rem;
            flex-shrink: 0;
        }
        .review-info {
            flex: 1;
        }
        .review-name {
            font-weight: 600;
            color: #111;
            font-size: 1.1rem;
            margin-bottom: 6px;
        }
        .review-rating {
            color: #ffa500;
            font-size: 1rem;
            margin-bottom: 8px;
        }
        .review-expert {
            color: #666;
            font-size: 0.9rem;
            margin-top: 4px;
            font-style: italic;
        }
        .review-text {
            color: #444;
            line-height: 1.7;
            font-size: 1rem;
            margin-top: 12px;
        }
        .hours-grid {
            display: grid;
            gap: 0;
        }
        .hours-item {
            display: flex;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #eee;
        }
        .hours-item:last-child {
            border-bottom: none;
        }
        .hours-day {
            font-weight: 600;
            color: #111;
            font-size: 1rem;
        }
        .hours-time {
            color: #666;
            font-size: 1rem;
        }
        .hours-closed {
            color: #999;
            font-style: italic;
        }
        .empty-state {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 40px 20px;
            background: #f8f8f8;
            border-radius: 12px;
        }
        /* Footer Styles */
        .footer {
            background: #000;
            color: white;
            padding: 60px 0 30px;
            margin-top: 60px;
        }
        .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-bottom: 40px;
        }
        .footer-section h3, .footer-section h4 {
            margin-bottom: 20px;
            color: #fff;
            font-weight: 700;
        }
        .footer-section h3 {
            font-size: 1.5rem;
        }
        .footer-section h4 {
            font-size: 1.1rem;
        }
        .footer-section p {
            color: #bdc3c7;
            margin-bottom: 16px;
            line-height: 1.6;
        }
        .footer-section ul {
            list-style: none;
        }
        .footer-section li {
            margin-bottom: 12px;
        }
        .footer-section a {
            color: #bdc3c7;
            text-decoration: none;
            transition: color 0.3s;
        }
        .footer-section a:hover {
            color: #fff;
        }
        .contact-info p {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
        }
        .contact-info i {
            width: 20px;
        }
        .footer-bottom {
            border-top: 1px solid #34495e;
            padding-top: 30px;
            text-align: center;
            color: #bdc3c7;
        }
        /* Sticky Booking Button on Mobile */
        .sticky-booking-btn {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #111;
            color: white;
            padding: 16px;
            z-index: 1000;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        .sticky-booking-btn button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
        }
        
        /* Responsive Design */
        @media (max-width: 968px) {
            .hero-section {
                height: 400px;
            }
            .hero-title {
                font-size: 2.5rem;
                color: #ffffff !important;
            }
            .hero-subtitle {
                font-size: 1.1rem;
                color: #ffffff !important;
            }
            .hero-overlay {
                background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.75));
            }
            .value-props-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            .salon-header-content {
                grid-template-columns: 1fr;
                gap: 24px;
            }
            .content-grid {
                grid-template-columns: 1fr;
                gap: 32px;
            }
            .sidebar-content {
                position: static;
            }
            .services-grid {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 768px) {
            body {
                padding-top: 0;
                padding-bottom: 100px; /* Space for sticky button */
                overflow-x: hidden;
            }
            .main-wrapper {
                margin-top: 0;
                padding-top: 0;
            }
            .hero-section {
                position: relative;
                height: 400px;
                width: 100%;
                max-width: 100vw;
                margin: 0;
                padding: 0;
                left: 0;
                right: 0;
                overflow: hidden;
            }
            .hero-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                min-width: 100%;
                min-height: 100%;
                background-size: cover;
                background-position: center center;
                background-repeat: no-repeat;
                object-fit: cover;
            }
            .hero-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                min-width: 100%;
                min-height: 100%;
                background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8));
                z-index: 1;
            }
            .hero-title,
            .hero-subtitle {
                color: #ffffff !important;
            }
            .hero-title {
                font-size: 2rem;
            }
            .hero-subtitle {
                font-size: 1rem;
            }
            .hero-cta-btn {
                padding: 14px 28px;
                font-size: 1rem;
            }
            .value-props-grid {
                grid-template-columns: 1fr;
            }
            .salon-info-header h2 {
                font-size: 1.75rem;
                padding: 10px 16px;
            }
            .section-title {
                font-size: 1.5rem;
                padding-top: 30px; /* Extra padding on mobile */
            }
            .service-category-title {
                padding-top: 30px; /* Extra padding on mobile */
            }
            .footer-content {
                grid-template-columns: 1fr;
                gap: 32px;
            }
            .sticky-booking-btn {
                display: block;
            }
            .salon-info-header .rating-badge {
                margin-bottom: 20px; /* Extra margin on mobile */
            }
            .content-wrapper {
                padding-bottom: 120px; /* Extra padding to prevent content hiding behind sticky button */
            }
            .hero-content {
                position: relative;
                height: 100%;
                padding: 20px;
                z-index: 2;
            }
            .hero-content .container {
                padding: 0 20px;
                width: 100%;
                max-width: 100%;
            }
        }
        @media (max-width: 480px) {
            .hero-section {
                position: relative;
                height: 400px;
                width: 100%;
                max-width: 100vw;
                margin: 0;
                padding: 0;
                left: 0;
                right: 0;
                overflow: hidden;
            }
            .hero-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                min-width: 100%;
                min-height: 100%;
                background-size: cover;
                background-position: center center;
                background-repeat: no-repeat;
                object-fit: cover;
            }
            .hero-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                min-width: 100%;
                min-height: 100%;
                z-index: 1;
            }
            .hero-content {
                position: relative;
                height: 100%;
                padding: 15px;
                z-index: 2;
            }
            .hero-content .container {
                padding: 0 15px;
                width: 100%;
                max-width: 100%;
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
    
    <div class="main-wrapper">
        <!-- Hero Section -->
        <div class="hero-section">
            ${salonImage ? `<div class="hero-image" style="background-image: url('${salonImage}');"></div>` : '<div class="hero-image hero-placeholder"></div>'}
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <div class="container">
                    <h1 class="hero-title">${valuePropTitle}</h1>
                    ${valuePropDescription ? `<p class="hero-subtitle" data-original-subtitle="${valuePropDescription.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">${valuePropDescription.length > 150 ? valuePropDescription.substring(0, 150) + '...' : valuePropDescription}</p>` : `<p class="hero-subtitle" data-original-subtitle="${salonDescription.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">${salonDescription.length > 150 ? salonDescription.substring(0, 150) + '...' : salonDescription}</p>`}
                    ${ratingBadgeHtml ? `<div class="hero-rating">${ratingBadgeHtml}</div>` : ''}
                    <button onclick="openApp()" class="hero-cta-btn">
                        <i class="fas fa-calendar-check"></i> Book Now
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Value Proposition Section -->
        ${valuePropFeatures.length > 0 || valuePropDescription ? `
        <div class="value-proposition-section">
            <div class="container">
                ${valuePropDescription ? `<div class="value-prop-description"><p>${valuePropDescription}</p></div>` : ''}
                ${valuePropFeatures.length > 0 ? `
                <div class="value-props-grid">
                    ${valuePropFeatures.map((feature, index) => {
                        const icons = ['✨', '👨‍🎨', '💆', '⭐', '🌟', '💅', '🎨', '💇'];
                        const icon = icons[index % icons.length];
                        return `
                        <div class="value-prop-item">
                            <div class="value-prop-icon">${icon}</div>
                            <h4>${feature}</h4>
                        </div>
                        `;
                    }).join('')}
                    ${salonReviewCount > 0 ? `
                    <div class="value-prop-item">
                        <div class="value-prop-icon">⭐</div>
                        <h4>Top Rated</h4>
                        <p>Rated ${salonRating.toFixed(1)} by ${salonReviewCount} clients</p>
                    </div>
                    ` : ''}
                </div>
                ` : `
                <div class="value-props-grid">
                    <div class="value-prop-item">
                        <div class="value-prop-icon">✨</div>
                        <h4>Elegant Atmosphere</h4>
                        <p>Experience luxury in a sophisticated and welcoming environment</p>
                    </div>
                    <div class="value-prop-item">
                        <div class="value-prop-icon">👨‍🎨</div>
                        <h4>Expert Stylists</h4>
                        <p>Our team of experienced professionals is dedicated to your satisfaction</p>
                    </div>
                    <div class="value-prop-item">
                        <div class="value-prop-icon">💆</div>
                        <h4>Personalized Service</h4>
                        <p>Every appointment includes a personalized consultation</p>
                    </div>
                    ${salonReviewCount > 0 ? `
                    <div class="value-prop-item">
                        <div class="value-prop-icon">⭐</div>
                        <h4>Top Rated</h4>
                        <p>Rated ${salonRating.toFixed(1)} by ${salonReviewCount} clients</p>
                    </div>
                    ` : ''}
                </div>
                `}
            </div>
        </div>
        ` : `
        <div class="value-proposition-section">
            <div class="container">
                <div class="value-props-grid">
                    <div class="value-prop-item">
                        <div class="value-prop-icon">✨</div>
                        <h4>Elegant Atmosphere</h4>
                        <p>Experience luxury in a sophisticated and welcoming environment</p>
                    </div>
                    <div class="value-prop-item">
                        <div class="value-prop-icon">👨‍🎨</div>
                        <h4>Expert Stylists</h4>
                        <p>Our team of experienced professionals is dedicated to your satisfaction</p>
                    </div>
                    <div class="value-prop-item">
                        <div class="value-prop-icon">💆</div>
                        <h4>Personalized Service</h4>
                        <p>Every appointment includes a personalized consultation</p>
                    </div>
                    ${salonReviewCount > 0 ? `
                    <div class="value-prop-item">
                        <div class="value-prop-icon">⭐</div>
                        <h4>Top Rated</h4>
                        <p>Rated ${salonRating.toFixed(1)} by ${salonReviewCount} clients</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        `}
        
        <!-- Salon Info Section -->
        <div class="salon-header">
            <div class="container">
                <div class="salon-header-content">
                    <div class="salon-info-header">
                        <h2>About ${salonName}</h2>
                        <p class="salon-description">${salonDescription}</p>
                        <div class="salon-contact">
                            ${salonAddress ? `<p><i class="fas fa-map-marker-alt"></i> ${salonAddress}</p>` : ''}
                            ${salonMobile ? `<p><i class="fas fa-phone"></i> ${salonMobile}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-wrapper">
            <div class="container">
                <div class="content-grid">
                    <div class="main-content">
                        ${openingHoursHtml}
                        ${servicesHtml}
                        ${productsHtml}
                        ${staffHtml}
                        ${reviewsHtml}
                    </div>
                    
                    <div class="sidebar-content">
                        <div class="booking-card">
                            <h3>Book Your Appointment</h3>
                            <button onclick="openApp()" class="open-app-btn">
                                <i class="fas fa-calendar-check"></i> Book Now
                            </button>
                            <div id="download-section">
                                <p style="text-align: center; margin-bottom: 16px; color: #666; font-size: 0.95rem;">
                                    Don't have the app? Download it now:
                                </p>
                                <div class="download-buttons">
                                    <a href="https://play.google.com/store/apps/details?id=${androidPackage}" class="btn btn-primary" target="_blank">
                                        <i class="fab fa-google-play"></i> Download for Android
                                    </a>
                                    ${iosAppStoreId ? `<a href="https://apps.apple.com/app/id${iosAppStoreId}" class="btn btn-primary" target="_blank">
                                        <i class="fab fa-apple"></i> Download for iOS
                                    </a>` : '<a href="https://apps.apple.com/search?term=skedisy" class="btn btn-primary" target="_blank"><i class="fab fa-apple"></i> Download for iOS</a>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        ${footerHtml}
    </div>
    
    <!-- Sticky Booking Button (Mobile Only) -->
    <div class="sticky-booking-btn">
        <button onclick="openApp()">
            <i class="fas fa-calendar-check"></i> Book Your Appointment
        </button>
    </div>
    
    <script src="${baseURL}/script.js"></script>
    <script>
        // Truncate hero-subtitle to 46 characters on mobile only
        (function() {
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (!heroSubtitle) return;
            
            // Get original text from data attribute (most reliable)
            let originalText = heroSubtitle.getAttribute('data-original-subtitle');
            
            // Decode HTML entities if present
            if (originalText) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalText;
                originalText = tempDiv.textContent || tempDiv.innerText || originalText;
            } else {
                // Fallback to current text content
                originalText = heroSubtitle.textContent || heroSubtitle.innerText || '';
            }
            
            // Check if screen is mobile (max-width: 768px)
            function isMobile() {
                return window.innerWidth <= 768;
            }
            
            function applyTruncation() {
                if (!originalText) return;
                
                if (isMobile() && originalText.length > 46) {
                    heroSubtitle.textContent = originalText.substring(0, 46) + '...';
                } else {
                    heroSubtitle.textContent = originalText;
                }
            }
            
            // Apply on load
            applyTruncation();
            
            // Re-apply on window resize (debounced)
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(applyTruncation, 100);
            });
        })();
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Salon Web Page] Error:", error);
    res.status(500).send("Error loading salon page");
  }
};