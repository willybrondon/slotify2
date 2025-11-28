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

    const salon = await Salon.findOne({
      _id: req.query.salonId,
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

    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${salon._id}`;
    
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
    const salonId = req.params.salonId;

    if (!salonId) {
      return res.status(404).send("Salon not found");
    }

    const salon = await Salon.findOne({
      _id: salonId,
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

    // Ensure baseURL doesn't have trailing slash to avoid double slashes
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const shareUrl = `${baseURL}/salon/${salon._id}`;
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
      openingHoursHtml = `<div class="section"><h3 class="section-title">⏰ Opening Hours</h3>${openingHoursHtml}</div>`;
    }

    // Services Section
    let servicesHtml = '';
    if (salon.serviceIds && salon.serviceIds.length > 0) {
      servicesHtml = salon.serviceIds.slice(0, 10).map(service => {
        const serviceName = (service.id?.name || 'Service').replace(/"/g, '&quot;');
        const servicePrice = service.price || 0;
        return `<div class="service-item"><div class="service-name">${serviceName}</div><div class="service-price">${currency}${servicePrice}</div></div>`;
      }).join('');
      const moreServices = salon.serviceIds.length > 10 ? `<p style="text-align: center; color: #666; margin-top: 10px;">+ ${salon.serviceIds.length - 10} more services</p>` : '';
      servicesHtml = `<div class="section"><h3 class="section-title">💇 Services</h3>${servicesHtml}${moreServices}</div>`;
    } else {
      servicesHtml = '<div class="section"><h3 class="section-title">💇 Services</h3><p class="empty-state">No services available</p></div>';
    }

    // Products Section
    let productsHtml = '';
    if (products && products.length > 0) {
      productsHtml = products.map(product => {
        const productName = (product.productName || 'Product').replace(/"/g, '&quot;');
        const productDesc = (product.description || '').replace(/"/g, '&quot;').substring(0, 100);
        const productImage = product.mainImage || '';
        const productPrice = product.price || 0;
        const imageHtml = productImage ? `<img src="${productImage}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; float: left; margin-right: 12px;" onerror="this.style.display='none'">` : '';
        return `<div class="product-item">${imageHtml}<div class="product-name">${productName}</div><div style="color: #666; font-size: 14px; margin: 5px 0;">${productDesc}</div><div class="product-price">${currency}${productPrice}</div><div style="clear: both;"></div></div>`;
      }).join('');
      productsHtml = `<div class="section"><h3 class="section-title">🛍️ Products</h3>${productsHtml}</div>`;
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
        const imageHtml = expertImage ? `<img src="${expertImage}" alt="${expertName}" style="width: 50px; height: 50px; border-radius: 50%; float: left; margin-right: 12px; object-fit: cover;" onerror="this.style.display='none'">` : '';
        const ratingHtml = expertRating > 0 ? `<div style="color: #ffa500; font-size: 14px;">⭐ ${expertRating.toFixed(1)}</div>` : '';
        return `<div class="staff-item">${imageHtml}<div class="staff-name">${expertName}</div>${ratingHtml}<div style="clear: both;"></div></div>`;
      }).join('');
      staffHtml = `<div class="section"><h3 class="section-title">👤 Staff</h3>${staffHtml}</div>`;
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
        const imageHtml = userImage ? `<img src="${userImage}" alt="${userName}" class="review-avatar" onerror="this.style.display='none'">` : `<div class="review-avatar" style="background: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">${userName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = reviewRating > 0 ? `<div class="review-rating">${'⭐'.repeat(Math.round(reviewRating))} ${reviewRating.toFixed(1)}</div>` : '';
        const commentHtml = reviewComment ? `<div class="review-text">${reviewComment}</div>` : '';
        return `<div class="review-item"><div class="review-header">${imageHtml}<div><div class="review-name">${userName}</div>${ratingHtml}</div></div>${commentHtml}</div>`;
      }).join('');
      reviewsHtml = `<div class="section"><h3 class="section-title">💬 Reviews</h3>${reviewsHtml}</div>`;
    } else {
      reviewsHtml = '<div class="section"><h3 class="section-title">💬 Reviews</h3><p class="empty-state">No reviews yet</p></div>';
    }

    // Rating badge HTML
    const ratingBadgeHtml = salonRating > 0 ? `<div class="rating-badge"><span class="rating-stars">⭐</span><span>${salonRating.toFixed(1)} (${salonReviewCount} reviews)</span></div>` : '';

    // Generate HTML with Open Graph and App Links meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${salonName} - Skedisy</title>
    
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
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .salon-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .salon-info {
            margin-bottom: 20px;
        }
        .salon-info h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 22px;
        }
        .salon-info p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        .address {
            color: #888;
            font-size: 14px;
        }
        #download-section {
            display: none;
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }
        .download-buttons {
            display: flex;
            gap: 10px;
            flex-direction: column;
        }
        .btn {
            padding: 15px 20px;
            border-radius: 10px;
            text-decoration: none;
            text-align: center;
            font-weight: 600;
            transition: transform 0.2s;
            display: block;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-secondary {
            background: #f5f5f5;
            color: #333;
        }
        .open-app-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
        }
        .section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }
        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
        }
        .service-item, .product-item, .staff-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .service-name, .product-name, .staff-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .service-price, .product-price {
            color: #667eea;
            font-weight: 600;
        }
        .review-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .review-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .review-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            object-fit: cover;
        }
        .review-name {
            font-weight: 600;
            color: #333;
        }
        .review-rating {
            color: #ffa500;
            margin-left: auto;
        }
        .review-text {
            color: #666;
            line-height: 1.6;
        }
        .hours-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .hours-day {
            font-weight: 600;
            color: #333;
        }
        .hours-time {
            color: #666;
        }
        .hours-closed {
            color: #999;
            font-style: italic;
        }
        .rating-badge {
            display: inline-flex;
            align-items: center;
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 20px;
            margin-top: 10px;
        }
        .rating-stars {
            color: #ffa500;
            margin-right: 5px;
        }
        .empty-state {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${salonName}</h1>
            <p>Book your appointment</p>
        </div>
        <div class="content">
            ${salonImage ? `<img src="${salonImage}" alt="${salonName}" class="salon-image" onerror="this.style.display='none'">` : ''}
            <div class="salon-info">
                <h2>${salonName}</h2>
                ${ratingBadgeHtml}
                <p>${salonDescription}</p>
                ${salonAddress ? `<p class="address">📍 ${salonAddress}</p>` : ''}
                ${salonMobile ? `<p class="address">📞 ${salonMobile}</p>` : ''}
            </div>
            
            ${openingHoursHtml}
            ${servicesHtml}
            ${productsHtml}
            ${staffHtml}
            ${reviewsHtml}
            
            <button onclick="openApp()" class="open-app-btn">
                Open in Skedisy App
            </button>
            
            <div id="download-section">
                <p style="text-align: center; margin-bottom: 20px; color: #666;">
                    Don't have the app? Download it now:
                </p>
                <div class="download-buttons">
                    <a href="https://play.google.com/store/apps/details?id=${androidPackage}" class="btn btn-primary" target="_blank">
                        Download for Android
                    </a>
                    ${iosAppStoreId ? `<a href="https://apps.apple.com/app/id${iosAppStoreId}" class="btn btn-primary" target="_blank">
                        Download for iOS
                    </a>` : ''}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Salon Web Page] Error:", error);
    res.status(500).send("Error loading salon page");
  }
};