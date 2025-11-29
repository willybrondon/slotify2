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

    if (!city) {
      return res.status(200).json({
        status: false,
        message: "City is required in query parameters.",
      });
    }

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
    }).populate("serviceIds.id");

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

    // Show all services for the salon regardless of city filtering
    // This ensures all services are displayed as requested
    let finalServices = salon.serviceIds;
    
    console.log("Salon Data API - Showing all services for salon:", finalServices.length);
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
      }).select("fname lname image review reviewCount serviceId"),
      Product.aggregate([
        { $match: { 
          createStatus: "Approved"
          // Temporarily remove salon filter to see all products
          // salon: salon._id // Filter products by salon ID (ObjectId)
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

    let salonData = salon.toObject();
    if (req.query.latitude && req.query.longitude) {
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };
      const device2 = {
        latitude: parseFloat(salon.locationCoordinates.latitude),
        longitude: parseFloat(salon.locationCoordinates.longitude),
      };
      const distanceInKilometers = geolib.getDistance(device1, device2) / 1000;

      salonData = { ...salonData, distance: distanceInKilometers };
    }

    salonData.serviceIds = finalServices;

    return res.status(200).json({
      status: true,
      message: "Success",
      salon: salonData,
      product,
      reviews,
      experts,
      tax,
    });
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
    }).populate("serviceIds.id");

    if (!salon) {
      return res.status(404).send("Salon not found");
    }

    // Fetch additional data: products, experts, reviews
    const [products, experts, reviews] = await Promise.all([
      Product.find({
        salon: salon._id,
        createStatus: "Approved"
      }).select("productName description price mainImage review rating").limit(10),
      Expert.find({
        salonId: salon._id,
        isBlock: false,
        isDelete: false,
      }).select("fname lname image review reviewCount").limit(10),
      Review.find({ salonId: salon._id })
        .populate({
          path: "userId",
          select: "fname lname image",
        })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Generate the new slug format for share URL
    const salonSlug = generateSlug(salon.name);
    const salonShortId = salon._id.toString().substring(0, 6);
    const salonSlugWithId = `${salonSlug}-${salonShortId}`;
    
    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${salonSlugWithId}`;
    const salonImage = salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : "");
    const salonName = salon.name || "Salon";
    const salonDescription = salon.about || `Book your appointment at ${salonName}`;
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

    // Services Section
    let servicesHtml = '';
    if (salon.serviceIds && salon.serviceIds.length > 0) {
      servicesHtml = salon.serviceIds.slice(0, 12).map(service => {
        const serviceName = (service.id?.name || 'Service').replace(/"/g, '&quot;');
        const servicePrice = service.price || 0;
        return `<div class="service-item"><div class="service-name">${serviceName}</div><div class="service-price">${currency}${servicePrice}</div></div>`;
      }).join('');
      const moreServices = salon.serviceIds.length > 12 ? `<p style="text-align: center; color: #666; margin-top: 16px; font-size: 0.95rem;">+ ${salon.serviceIds.length - 12} more services available in the app</p>` : '';
      servicesHtml = `<div class="section"><h3 class="section-title">💇 Services</h3><div class="services-grid">${servicesHtml}</div>${moreServices}</div>`;
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
        const imageHtml = expertImage ? `<img src="${expertImage}" alt="${expertName}" onerror="this.style.display='none'">` : `<div class="review-avatar" style="width: 60px; height: 60px;">${expertName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = expertRating > 0 ? `<div class="staff-rating">⭐ ${expertRating.toFixed(1)}</div>` : '';
        return `<div class="staff-item">${imageHtml}<div class="staff-info"><div class="staff-name">${expertName}</div>${ratingHtml}</div></div>`;
      }).join('');
      staffHtml = `<div class="section"><h3 class="section-title">👤 Staff</h3><div class="services-grid">${staffHtml}</div></div>`;
    } else {
      staffHtml = '<div class="section"><h3 class="section-title">👤 Staff</h3><p class="empty-state">No staff information available</p></div>';
    }

    // Reviews Section
    let reviewsHtml = '';
    if (reviews && reviews.length > 0) {
      reviewsHtml = reviews.map(review => {
        const userFname = (review.userId?.fname || '').replace(/"/g, '&quot;');
        const userLname = (review.userId?.lname || '').replace(/"/g, '&quot;');
        const userName = `${userFname} ${userLname}`.trim() || 'Anonymous';
        const userImage = review.userId?.image || '';
        const reviewRating = review.rating || 0;
        const reviewComment = ((review.comment || review.message || '').replace(/"/g, '&quot;').replace(/\n/g, '<br>'));
        const imageHtml = userImage ? `<img src="${userImage}" alt="${userName}" class="review-avatar" onerror="this.style.display='none'">` : `<div class="review-avatar">${userName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = reviewRating > 0 ? `<div class="review-rating">${'⭐'.repeat(Math.round(reviewRating))} ${reviewRating.toFixed(1)}</div>` : '';
        const commentHtml = reviewComment ? `<div class="review-text">${reviewComment}</div>` : '';
        return `<div class="review-item"><div class="review-header">${imageHtml}<div class="review-info"><div class="review-name">${userName}</div>${ratingHtml}</div></div>${commentHtml}</div>`;
      }).join('');
      reviewsHtml = `<div class="section"><h3 class="section-title">💬 Reviews</h3>${reviewsHtml}</div>`;
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
        // Try to open app, fallback to app store or show page
        function openApp() {
            // Try Android
            window.location = "${deepLink}";
            
            // Fallback after delay
            setTimeout(function() {
                // If still on page, show download options
                document.getElementById('download-section').style.display = 'block';
            }, 2000);
        }
        
        // Auto-try on page load
        window.onload = function() {
            // Only auto-open if coming from external link (not direct navigation)
            if (document.referrer === '' || document.referrer.indexOf('${baseURL}') === -1) {
                openApp();
            }
        };
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
        .salon-header {
            background: #fff;
            padding: 40px 0;
            border-bottom: 1px solid #eee;
        }
        .salon-header-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 40px;
            align-items: start;
        }
        .salon-image-wrapper {
            position: relative;
        }
        .salon-image {
            width: 100%;
            max-width: 400px;
            height: 300px;
            object-fit: cover;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .salon-info-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .salon-info-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #111;
            margin: 0;
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
            color: #111;
            margin-bottom: 20px;
        }
        .open-app-btn {
            background: #111;
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-bottom: 16px;
            transition: background 0.2s;
        }
        .open-app-btn:hover {
            background: #333;
        }
        #download-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e0e0e0;
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
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }
        .service-item, .product-item, .staff-item {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 12px;
            transition: transform 0.2s;
        }
        .service-item:hover, .product-item:hover, .staff-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .service-name, .product-name, .staff-name {
            font-weight: 600;
            color: #111;
            margin-bottom: 8px;
            font-size: 1.1rem;
        }
        .service-price, .product-price {
            color: #111;
            font-weight: 700;
            font-size: 1.2rem;
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
            gap: 16px;
            align-items: center;
        }
        .staff-item img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
        }
        .staff-info {
            flex: 1;
        }
        .staff-rating {
            color: #ffa500;
            font-size: 0.9rem;
            margin-top: 4px;
        }
        .review-item {
            background: #f8f8f8;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 16px;
        }
        .review-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .review-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            background: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-weight: 600;
        }
        .review-info {
            flex: 1;
        }
        .review-name {
            font-weight: 600;
            color: #111;
            font-size: 1rem;
        }
        .review-rating {
            color: #ffa500;
            font-size: 0.9rem;
            margin-top: 4px;
        }
        .review-text {
            color: #444;
            line-height: 1.7;
            font-size: 1rem;
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
        /* Responsive Design */
        @media (max-width: 968px) {
            .salon-header-content {
                grid-template-columns: 1fr;
                gap: 24px;
            }
            .salon-image {
                max-width: 100%;
                height: 250px;
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
                padding-top: 70px; /* Slightly less padding on mobile */
            }
            .salon-info-header h1 {
                font-size: 2rem;
            }
            .section-title {
                font-size: 1.5rem;
            }
            .footer-content {
                grid-template-columns: 1fr;
                gap: 32px;
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
        <div class="salon-header">
            <div class="container">
                <div class="salon-header-content">
                    ${salonImage ? `<div class="salon-image-wrapper"><img src="${salonImage}" alt="${salonName}" class="salon-image" onerror="this.style.display='none'"></div>` : ''}
                    <div class="salon-info-header">
                        <h1>${salonName}</h1>
                        ${ratingBadgeHtml}
                        <p class="salon-description">${salonDescription}</p>
                        <div class="salon-contact">
                            ${salonAddress ? `<p>📍 ${salonAddress}</p>` : ''}
                            ${salonMobile ? `<p>📞 ${salonMobile}</p>` : ''}
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
                                Open in Skedisy App
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
    <script src="${baseURL}/script.js"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Salon Web Page] Error:", error);
    res.status(500).send("Error loading salon page");
  }
};