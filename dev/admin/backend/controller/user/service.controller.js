const Service = require("../../models/service.model");
const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");

const geolib = require("geolib");
const mongoose = require("mongoose");

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

// Find service by short ID (first 6 characters of ObjectId)
const findServiceByShortId = async (shortId) => {
  try {
    const services = await Service.find({
      isDelete: false,
      status: true,
    }).select("_id");
    
    const service = services.find(s => s._id.toString().toLowerCase().startsWith(shortId.toLowerCase()));
    return service ? service._id : null;
  } catch (error) {
    console.error("Error finding service by short ID:", error);
    return null;
  }
};

const normalizeCityName = (cityName) => {
  return cityName
    .replace(/\s*\(.*?\)$/, "")
    .trim()
    .toLowerCase();
};

exports.getAll = async (req, res) => {
  try {
    console.log("req.query ====================== ", req.query);

    const search = req.query.search || "";
    const city = req.query.city ? normalizeCityName(req.query.city) : "";

    console.log("Service API - Received city:", city);
    console.log("Service API - Search term:", search);

    let query = {};

    const tax = global.settingJSON;
    
    // Only apply search filter if search term is not empty
    if (search && search.trim() !== "") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, 
          { categoryname: { $regex: search, $options: "i" } }
        ],
      };
    }

    // First, get all services to check city matching
    let allServices = await Service.find({
      isDelete: false,
      status: true,
    }).populate("categoryId");

    console.log("Service API - Total services found:", allServices.length);

    // Filter services by city with flexible matching (only if city is provided)
    let cityFilteredServices = allServices;
    if (city && city.trim() !== "") {
      cityFilteredServices = allServices.filter(service => {
        if (!service.allowCities || service.allowCities.length === 0) {
          console.log(`Service ${service.name} has no allowCities`);
          return false;
        }

        const hasMatchingCity = service.allowCities.some(allowedCity => {
          const allowedCityName = allowedCity.city.toLowerCase().trim();
          const requestedCityName = city.toLowerCase().trim();
          
          // Exact match
          if (allowedCityName === requestedCityName) {
            console.log(`Service ${service.name} - Exact city match: '${allowedCity.city}' with '${city}'`);
            return true;
          }
          
          // Check if one contains the other
          if (allowedCityName.includes(requestedCityName) || requestedCityName.includes(allowedCityName)) {
            console.log(`Service ${service.name} - Contains city match: '${allowedCity.city}' with '${city}'`);
            return true;
          }
          
          // Check for common variations
          const cityVariations = [
            allowedCityName,
            allowedCityName.replace(/\s+/g, ''), // Remove spaces
            allowedCityName.replace(/[^a-zA-Z]/g, ''), // Remove special characters
            requestedCityName,
            requestedCityName.replace(/\s+/g, ''), // Remove spaces
            requestedCityName.replace(/[^a-zA-Z]/g, ''), // Remove special characters
          ];
          
          const hasVariationMatch = cityVariations.some(variation1 => 
            cityVariations.some(variation2 => variation1 === variation2)
          );
          
          if (hasVariationMatch) {
            console.log(`Service ${service.name} - Variation city match: '${allowedCity.city}' with '${city}'`);
            return true;
          }
          
          console.log(`Service ${service.name} - No city match: '${allowedCity.city}' with '${city}'`);
          return false;
        });

        return hasMatchingCity;
      });

      console.log("Service API - Services after city filtering:", cityFilteredServices.length);

      // Only show fallback if no search term is provided (for browsing, not searching)
      if (cityFilteredServices.length === 0 && allServices.length > 0 && (!search || search.trim() === "")) {
        console.log("Service API - No services found for city '" + city + "'. Showing all services as fallback for browsing.");
        cityFilteredServices = allServices;
      }
    } else {
      console.log("Service API - No city provided, showing all services");
    }

    // Apply search filter to city-filtered services
    let finalServices = cityFilteredServices;
    if (search && search.trim() !== "") {
      finalServices = cityFilteredServices.filter(service => {
        const serviceName = service.name?.toLowerCase() || "";
        const categoryName = service.categoryId?.name?.toLowerCase() || "";
        const searchTerm = search.toLowerCase().trim();
        
        // More strict matching - require at least 3 characters for partial matches
        if (searchTerm.length < 3) {
          // For short search terms, require exact word boundaries or exact matches
          const nameMatch = serviceName === searchTerm || 
                           serviceName.startsWith(searchTerm + " ") ||
                           serviceName.endsWith(" " + searchTerm) ||
                           serviceName.includes(" " + searchTerm + " ");
          const categoryMatch = categoryName === searchTerm ||
                               categoryName.startsWith(searchTerm + " ") ||
                               categoryName.endsWith(" " + searchTerm) ||
                               categoryName.includes(" " + searchTerm + " ");
          
          console.log(`Service ${service.name} - Short search '${searchTerm}': Name match: ${nameMatch}, Category match: ${categoryMatch}`);
          return nameMatch || categoryMatch;
        } else {
          // For longer search terms, allow partial matches but require significant overlap
          const nameMatch = serviceName.includes(searchTerm) && 
                           (serviceName.length <= searchTerm.length * 2 || 
                            serviceName.indexOf(searchTerm) <= 3);
          const categoryMatch = categoryName.includes(searchTerm) && 
                               (categoryName.length <= searchTerm.length * 2 || 
                                categoryName.indexOf(searchTerm) <= 3);
          
          console.log(`Service ${service.name} - Long search '${searchTerm}': Name match: ${nameMatch}, Category match: ${categoryMatch}`);
          return nameMatch || categoryMatch;
        }
      });
    }

    console.log("Service API - Final services after search filtering:", finalServices.length);

    // Transform the results to match the expected format
    const result = finalServices.map(service => ({
      _id: service._id,
      name: service.name,
      status: service.status,
      image: service.image,
      duration: service.duration,
      price: service.price,
      categoryId: service.categoryId?._id,
      categoryname: service.categoryId?.name,
      createdAt: service.createdAt,
    }));

    console.log("Service API - Final result count:", result.length);
    console.log("Service API - Service names:", result.map(s => s.name));

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: result.length,
      services: result,
      tax: tax.tax,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.serviceBasedCategory = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details" });
    }

    const [service, tax] = await Promise.all([
      Service.find({
        categoryId: req.query.categoryId,
        status: true,
        isDelete: false,
      }),
      global.settingJSON,
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      services: service,
      tax: tax.tax,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

// Serve service page with salon listings (similar to category page)
exports.serveServicePage = async (req, res) => {
  try {
    const slugWithId = req.params.slugWithId;

    if (!slugWithId) {
      return res.status(404).send("Service not found");
    }

    // Extract short ID
    const parts = slugWithId.split("-");
    const shortId = parts[parts.length - 1];
    
    if (!/^[0-9a-fA-F]{6}$/.test(shortId)) {
      return res.status(404).send("Service not found");
    }
    
    const fullServiceId = await findServiceByShortId(shortId);
    
    if (!fullServiceId) {
      return res.status(404).send("Service not found");
    }

    // Get service details
    const service = await Service.findOne({
      _id: fullServiceId,
      isDelete: false,
      status: true,
    }).populate('categoryId');
    
    if (!service) {
      return res.status(404).send("Service not found");
    }

    // Get salons that offer this service (using similar logic to serviceBaseSalon)
    const experts = await Expert.find({
      serviceId: fullServiceId,
      isDelete: false,
      isBlock: false,
    });

    const uniqueSalonIds = [...new Set(experts.map((expert) => expert.salonId.toString()))];

    const salons = await Promise.all(
      uniqueSalonIds.map(async (salonId) => {
        const salon = await Salon.findOne({ isDelete: false, _id: salonId });
        if (!salon || !salon.isActive) return null;
        
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;
        
        let distance = null;
        if (latitude && longitude && salon.locationCoordinates?.latitude && salon.locationCoordinates?.longitude) {
          const device1 = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          };
          const device2 = {
            latitude: parseFloat(salon.locationCoordinates.latitude),
            longitude: parseFloat(salon.locationCoordinates.longitude),
          };
          const distanceInMeters = geolib.getDistance(device1, device2);
          distance = distanceInMeters / 1000;
        }

        // Get service price from salon's serviceIds
        const salonService = salon.serviceIds?.find(s => s.id?.toString() === fullServiceId.toString());
        const servicePrice = salonService?.price || null;

        const slug = generateSlug(salon.name);
        const salonShortId = salon._id.toString().substring(0, 6);
        const salonSlugWithId = `${slug}-${salonShortId}`;
        const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
        const shareUrl = `${baseURL}/salon/${salonSlugWithId}`;

        return {
          _id: salon._id,
          name: salon.name,
          mainImage: salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : ""),
          review: salon.review || 0,
          reviewCount: salon.reviewCount || 0,
          address: salon.addressDetails 
            ? `${salon.addressDetails.addressLine1 || ""}, ${salon.addressDetails.city || ""}, ${salon.addressDetails.country || ""}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
            : "",
          minPrice: servicePrice,
          distance: distance,
          shareUrl: shareUrl,
        };
      })
    );

    // Filter out null salons and sort by distance if available
    const validSalons = salons.filter(s => s !== null);
    if (req.query.latitude && req.query.longitude) {
      validSalons.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
    const serviceSlug = generateSlug(service.name);
    const serviceShortId = service._id.toString().substring(0, 6);
    const serviceSlugWithId = `${serviceSlug}-${serviceShortId}`;
    const serviceUrl = `${baseURL}/service/${serviceSlugWithId}`;
    const currency = global.settingJSON?.currencySymbol || "$";

    // Generate HTML (reuse category page HTML structure)
    const salonsHtml = validSalons.length > 0 
      ? validSalons.map(salon => {
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
      : '<div class="no-results"><p>No salons found for this service.</p></div>';

    const serviceDescription = `Find the best ${service.name} services at top-rated salons near you. Book your appointment today!`;
    const serviceImage = service.image || `${baseURL}/logo.png`;

    // Use the same HTML structure as category page (simplified version)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${service.name} - Skedisy | Book ${service.name} Services Online</title>
    <meta name="description" content="${serviceDescription.replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${service.name}, salon services, beauty services, book appointment">
    <link rel="canonical" href="${serviceUrl}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #111; line-height: 1.6; padding-top: 80px; }
        .category-header { background: #fff; padding: 40px 0; border-bottom: 1px solid #eee; }
        .category-header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .category-title { font-size: 2.5rem; font-weight: 700; color: #111; margin-bottom: 12px; }
        .category-description { font-size: 1.1rem; color: #666; margin-bottom: 32px; }
        .salons-section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .salons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .salon-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; transition: all 0.2s; display: block; }
        .salon-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: #111; }
        .salon-card-image { width: 100%; height: 200px; object-fit: cover; }
        .salon-card-image-placeholder { width: 100%; height: 200px; background: #f8f8f8; display: flex; align-items: center; justify-content: center; color: #999; }
        .salon-card-content { padding: 20px; }
        .salon-card-name { font-size: 1.2rem; font-weight: 700; color: #111; margin-bottom: 8px; }
        .salon-rating { display: flex; align-items: center; gap: 6px; color: #666; font-size: 0.9rem; margin-bottom: 8px; }
        .rating-stars { color: #ffa500; }
        .salon-price { font-size: 1rem; font-weight: 600; color: #111; margin-bottom: 8px; }
        .salon-address { font-size: 0.9rem; color: #666; margin-bottom: 4px; }
        .salon-distance { font-size: 0.85rem; color: #999; }
        .no-results { text-align: center; padding: 60px 20px; color: #999; }
        @media (max-width: 768px) {
            body { padding-top: 70px; }
            .category-title { font-size: 2rem; }
            .salons-grid { grid-template-columns: 1fr; gap: 16px; }
        }
    </style>
</head>
<body>
    <div class="category-header">
        <div class="category-header-content">
            <h1 class="category-title">${service.name}</h1>
            <p class="category-description">${serviceDescription}</p>
        </div>
    </div>
    
    <div class="salons-section">
        <div class="salons-grid">
            ${salonsHtml}
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Service Page] Error:", error);
    res.status(500).send("Error loading service page");
  }
};
