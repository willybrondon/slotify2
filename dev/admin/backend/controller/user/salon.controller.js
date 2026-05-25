const mongoose = require("mongoose");
const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Favorite = require("../../models/favourite.model");

const { deleteFile } = require("../../middleware/deleteFile");
const {
  getWebCopy,
  resolveLang,
  idfBannerHtml,
  skedisyFooterHtml,
  formatSalonHoursItemHtml,
} = require("../../lib/webPageCopy");

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

    // First, get the salon without populate to check if it exists
    const salon = await Salon.findOne({
      _id: salonId,
      isActive: true,
      isDelete: false,
    }).lean();

    if (!salon) {
      return res.status(404).send({
        status: false,
        message: "Salon Not Found",
      });
    }

    // Now populate services separately to handle errors better
    const salonWithServices = await Salon.findOne({
      _id: salonId,
      isActive: true,
      isDelete: false,
    }).populate({
      path: "serviceIds.id",
      match: { isDelete: false, status: true }, // Only populate active, non-deleted services
      populate: {
        path: "categoryId",
        select: "name nameEn nameFr namePt",
        match: { isDelete: false } // Only populate non-deleted categories
      }
    }).lean();

    // Use salonWithServices if available, otherwise fallback to salon
    const salonData = salonWithServices || salon;

    console.log("Salon Data API - Salon found:", salonData.name);
    console.log("Salon Data API - Total services in salon:", salonData.serviceIds?.length || 0);
    console.log("Salon Data API - Raw addressDetails:", JSON.stringify(salonData.addressDetails));
    console.log("Salon Data API - Raw mainImage:", salonData.mainImage);
    console.log("Salon Data API - Raw image array:", salonData.image);

    // Filter out services where the populated service (id) is null/undefined
    // This happens when service references are invalid (deleted services)
    // Preserve the original structure but ensure all fields are present
    let finalServices = (salonData.serviceIds || [])
      .filter(service => {
        // Keep service if id exists and is not null (valid service reference)
        // Also check if the service itself is not deleted and is active
        if (!service || !service.id) return false;
        // Check if service has _id and is not deleted
        if (!service.id._id || service.id.isDelete === true || service.id.status === false) return false;
        return true;
      })
      .map(service => {
        // Convert ObjectIds to strings for proper JSON serialization
        const serviceId = service.id;
        const categoryId = serviceId.categoryId;
        
        // Build the service object with all required fields, converting ObjectIds to strings
        const serviceObject = {
          _id: serviceId._id ? String(serviceId._id) : null,
          name: serviceId.name || "",
          nameEn: serviceId.nameEn || "",
          nameFr: serviceId.nameFr || "",
          namePt: serviceId.namePt || "",
          duration: serviceId.duration || 0,
          status: serviceId.status !== undefined ? serviceId.status : true,
          isDelete: serviceId.isDelete !== undefined ? serviceId.isDelete : false,
          image: serviceId.image || "",
          categoryId: categoryId ? (categoryId._id ? String(categoryId._id) : String(categoryId)) : null,
          createdAt: serviceId.createdAt ? serviceId.createdAt.toISOString() : null,
          updatedAt: serviceId.updatedAt ? serviceId.updatedAt.toISOString() : null,
        };
        
        // If categoryId is populated as an object, include category details
        if (categoryId && typeof categoryId === 'object' && categoryId._id) {
          serviceObject.categoryId = String(categoryId._id);
          // Optionally include category name if needed
          if (categoryId.name) {
            serviceObject.categoryName = categoryId.name;
          }
        }
        
        // Ensure all required fields are present with defaults
        return {
          id: serviceObject,
          price: service.price !== null && service.price !== undefined ? service.price : 0,
          allowCities: service.allowCities || [],
          _id: service._id ? String(service._id) : String(service.id._id)
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

    // salonData is already a plain object from lean(), create a copy for modification
    let salonResponseData = { ...salonData };
    
    // Replace serviceIds with filtered and formatted services
    salonResponseData.serviceIds = finalServices;
    
    // Ensure addressDetails is properly formatted (not null) with all required fields
    // Handle cases where addressDetails might be null, undefined, or have null fields
    if (!salonResponseData.addressDetails || 
        typeof salonResponseData.addressDetails !== 'object' || 
        salonResponseData.addressDetails === null ||
        Object.keys(salonResponseData.addressDetails).length === 0) {
      salonResponseData.addressDetails = {
        addressLine1: "",
        landMark: "",
        city: "",
        state: "",
        country: ""
      };
    } else {
      // Ensure all address fields exist, defaulting to empty string if null/undefined
      salonResponseData.addressDetails = {
        addressLine1: (salonResponseData.addressDetails.addressLine1 !== null && salonResponseData.addressDetails.addressLine1 !== undefined) ? String(salonResponseData.addressDetails.addressLine1) : "",
        landMark: (salonResponseData.addressDetails.landMark !== null && salonResponseData.addressDetails.landMark !== undefined) ? String(salonResponseData.addressDetails.landMark) : "",
        city: (salonResponseData.addressDetails.city !== null && salonResponseData.addressDetails.city !== undefined) ? String(salonResponseData.addressDetails.city) : "",
        state: (salonResponseData.addressDetails.state !== null && salonResponseData.addressDetails.state !== undefined) ? String(salonResponseData.addressDetails.state) : "",
        country: (salonResponseData.addressDetails.country !== null && salonResponseData.addressDetails.country !== undefined) ? String(salonResponseData.addressDetails.country) : ""
      };
    }
    
    // Ensure locationCoordinates is properly formatted
    if (!salonResponseData.locationCoordinates || 
        typeof salonResponseData.locationCoordinates !== 'object' || 
        salonResponseData.locationCoordinates === null) {
      salonResponseData.locationCoordinates = {
        latitude: "",
        longitude: ""
      };
    } else {
      salonResponseData.locationCoordinates = {
        latitude: (salonResponseData.locationCoordinates.latitude !== null && salonResponseData.locationCoordinates.latitude !== undefined) ? String(salonResponseData.locationCoordinates.latitude) : "",
        longitude: (salonResponseData.locationCoordinates.longitude !== null && salonResponseData.locationCoordinates.longitude !== undefined) ? String(salonResponseData.locationCoordinates.longitude) : ""
      };
    }
    
    // Ensure mainImage is always a string (not null)
    // Try multiple fallback options
    let mainImageValue = "";
    if (salonResponseData.mainImage && salonResponseData.mainImage !== null && salonResponseData.mainImage !== undefined) {
      mainImageValue = String(salonResponseData.mainImage);
    } else if (salonResponseData.heroImage && salonResponseData.heroImage !== null && salonResponseData.heroImage !== undefined) {
      mainImageValue = String(salonResponseData.heroImage);
    } else if (salonResponseData.image && Array.isArray(salonResponseData.image) && salonResponseData.image.length > 0) {
      // Find first non-null image in array
      const firstImage = salonResponseData.image.find(img => img && img !== null && img !== undefined && img !== "");
      mainImageValue = firstImage ? String(firstImage) : "";
    }
    salonResponseData.mainImage = mainImageValue;
    
    // Ensure image array is always present (not null) and filter out null/empty values
    if (Array.isArray(salonResponseData.image)) {
      salonResponseData.image = salonResponseData.image.filter(img => img && img !== null && img !== undefined && img !== "");
    } else {
      salonResponseData.image = [];
    }
    
    // Add distance if coordinates are provided
    if (req.query.latitude && req.query.longitude) {
      const device1 = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
      };
      const device2 = {
        latitude: parseFloat(salonResponseData.locationCoordinates.latitude || 0),
        longitude: parseFloat(salonResponseData.locationCoordinates.longitude || 0),
      };
      
      if (device2.latitude && device2.longitude) {
        const distanceInKilometers = geolib.getDistance(device1, device2) / 1000;
        salonResponseData.distance = distanceInKilometers;
      }
    }

    // Convert all ObjectIds to strings for proper JSON serialization
    // This is critical for the Flutter app to parse the response correctly
    const salonResponse = {
      ...salonResponseData,
      _id: salonResponseData._id ? String(salonResponseData._id) : null,
      serviceIds: finalServices, // Ensure services are included
      addressDetails: salonResponseData.addressDetails, // Ensure addressDetails is included
      locationCoordinates: salonResponseData.locationCoordinates, // Ensure locationCoordinates is included
      mainImage: salonResponseData.mainImage, // Ensure mainImage is included
      image: salonResponseData.image, // Ensure image array is included
    };
    
    // Convert experts ObjectIds to strings
    // Experts are already populated, so we need to handle them carefully
    const expertsData = (experts || []).map(expert => {
      const expertObj = expert.toObject ? expert.toObject() : expert;
      // Handle serviceId - it might be an array of service objects or ObjectIds
      let serviceIdArray = [];
      if (Array.isArray(expertObj.serviceId)) {
        serviceIdArray = expertObj.serviceId.map(sid => {
          if (typeof sid === 'object' && sid._id) {
            return String(sid._id);
          }
          return String(sid);
        });
      } else if (expertObj.serviceId) {
        serviceIdArray = [String(expertObj.serviceId)];
      }
      
      return {
        ...expertObj,
        _id: expertObj._id ? String(expertObj._id) : null,
        salonId: expertObj.salonId ? String(expertObj.salonId) : null,
        serviceId: serviceIdArray,
        userId: expertObj.userId ? String(expertObj.userId) : null,
      };
    });
    
    // Convert reviews ObjectIds to strings
    const reviewsData = (reviews || []).map(review => {
      const reviewObj = review.toObject ? review.toObject() : review;
      const userIdObj = reviewObj.userId;
      return {
        ...reviewObj,
        _id: reviewObj._id ? String(reviewObj._id) : null,
        salonId: reviewObj.salonId ? String(reviewObj.salonId) : null,
        userId: userIdObj ? (userIdObj._id ? String(userIdObj._id) : (typeof userIdObj === 'string' ? userIdObj : String(userIdObj))) : null,
        expertId: reviewObj.expertId ? String(reviewObj.expertId) : null,
      };
    });
    
    // Convert products ObjectIds to strings
    const productsData = (product || []).map(prod => {
      return {
        ...prod,
        _id: prod._id ? String(prod._id) : null,
        salon: prod.salon ? String(prod.salon) : null,
        category: prod.category ? String(prod.category) : null,
      };
    });

    // Ensure all required fields are present in the response
    const responseData = {
      status: true,
      message: "Success",
      salon: salonResponse,
      product: productsData,
      reviews: reviewsData,
      experts: expertsData,
      tax: tax || 0,
    };

    console.log("Salon Data API - Final response - Services count:", responseData.salon.serviceIds.length);
    console.log("Salon Data API - Final response - Experts count:", responseData.experts.length);
    console.log("Salon Data API - Final response - Products count:", responseData.product.length);
    console.log("Salon Data API - Address Details:", JSON.stringify(responseData.salon.addressDetails));
    console.log("Salon Data API - Main Image:", responseData.salon.mainImage);
    console.log("Salon Data API - Image Array Length:", responseData.salon.image?.length || 0);
    console.log("Salon Data API - Salon _id:", responseData.salon._id);
    console.log("Salon Data API - Service IDs in response:", JSON.stringify(responseData.salon.serviceIds.map(s => ({ 
      serviceId: s.id?._id, 
      serviceName: s.id?.name,
      price: s.price,
      categoryId: s.id?.categoryId
    })), null, 2));
    console.log("Salon Data API - First service structure:", JSON.stringify(responseData.salon.serviceIds[0], null, 2));

    // Final validation - ensure critical fields are not null
    if (!responseData.salon.addressDetails || 
        responseData.salon.addressDetails.addressLine1 === null ||
        responseData.salon.addressDetails.city === null) {
      console.warn("Salon Data API - WARNING: Address details still contain null values!");
    }
    
    // Validate service structure
    if (responseData.salon.serviceIds.length > 0) {
      const firstService = responseData.salon.serviceIds[0];
      if (!firstService.id || !firstService.id._id) {
        console.error("Salon Data API - ERROR: Service structure is invalid! Service:", JSON.stringify(firstService, null, 2));
      }
    }

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

    const pageLang = resolveLang(req.query.lang || req.query.language);
    const copy = getWebCopy(pageLang);

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
      })
        .select("fname lname image review reviewCount serviceId")
        .limit(24)
        .lean(),
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
    const salonDescription = salon.about || copy.defaultSalonDesc(salonName);
    // Get value proposition data
    const valueProposition = salon.valueProposition || {};
    const valuePropTitle = valueProposition.title || copy.defaultHeroTitle(salonName);
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
      openingHoursHtml = salon.salonTime
        .map((time) => formatSalonHoursItemHtml(time, pageLang, copy))
        .join("");
      openingHoursHtml = `<div class="section"><h3 class="section-title">${copy.openingHours}</h3><div class="hours-grid">${openingHoursHtml}</div></div>`;
    }

    const bookingServices = [];
    const categoryMap = new Map();
    if (salon.serviceIds && salon.serviceIds.length > 0) {
      salon.serviceIds.forEach((service) => {
        if (!service.id || !service.id._id) return;
        const cat = service.id.categoryId;
        const categoryId = cat?._id?.toString() || "other";
        const categoryName =
          getTranslatedCategoryName(cat, pageLang) || copy.otherServices;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, { id: categoryId, name: categoryName });
        }
        bookingServices.push({
          id: String(service.id._id),
          name: service.id.name || "Service",
          price: service.price || 0,
          duration: service.id.duration || 0,
          categoryId,
          categoryName,
        });
      });
    }
    const bookingCategories = Array.from(categoryMap.values());
    const bookingExperts = (experts || []).map((expert) => ({
      id: String(expert._id),
      name: `${expert.fname || ""} ${expert.lname || ""}`.trim(),
      image: expert.image || "",
      review: expert.review || 0,
      reviewCount: expert.reviewCount || 0,
      serviceIds: (expert.serviceId || []).map((id) => String(id)),
    }));

    let servicesHtml = "";
    if (bookingServices.length > 0) {
      servicesHtml = `<div class="section sq-salon-services-block">
        <h3 class="section-title">${copy.services}</h3>
        <div class="sq-service-tabs" id="salonServiceTabs" role="tablist"></div>
        <div class="sq-services-grid-4" id="salonServicesGrid"></div>
      </div>`;
    } else {
      servicesHtml = `<div class="section"><h3 class="section-title">${copy.services}</h3><p class="empty-state">${copy.noServices}</p></div>`;
    }

    // Products Section
    let productsHtml = '';
    if (products && products.length > 0) {
      productsHtml = products
        .map((product) => {
          const productName = (product.productName || "Product").replace(
            /"/g,
            "&quot;"
          );
          const productImage = product.mainImage || "";
          const productPrice = product.price || 0;
          const imageHtml = productImage
            ? `<img src="${productImage}" alt="${productName}" class="sq-product-card__img" loading="lazy" onerror="this.style.display='none'">`
            : `<div class="sq-product-card__placeholder">${productName.charAt(0).toUpperCase()}</div>`;
          return `<article class="sq-product-card">
        <div class="sq-product-card__thumb">${imageHtml}</div>
        <div class="sq-product-card__body">
          <span class="sq-product-card__name">${productName}</span>
          <span class="sq-product-card__price">${currency}${productPrice}</span>
        </div>
      </article>`;
        })
        .join("");
      productsHtml = `<div class="section sq-salon-products-block"><h3 class="section-title">${copy.products}</h3><div class="sq-products-row">${productsHtml}</div></div>`;
    } else {
      productsHtml = `<div class="section"><h3 class="section-title">${copy.products}</h3><p class="empty-state">${copy.noProducts}</p></div>`;
    }

    let staffHtml = "";
    if (bookingExperts.length > 0) {
      staffHtml = `<div class="section sq-salon-experts-block">
        <h3 class="section-title">${copy.salonExpertsTitle}</h3>
        <div class="sq-experts-row" id="salonExpertsRow"></div>
      </div>`;
    } else {
      staffHtml = `<div class="section"><h3 class="section-title">${copy.salonExpertsTitle}</h3><p class="empty-state">${copy.noStaff}</p></div>`;
    }

    // Reviews Section - Show expert/staff info
    let reviewsHtml = '';
    if (reviews && reviews.length > 0) {
      reviewsHtml = reviews.map(review => {
        const userFname = (review.userId?.fname || '').replace(/"/g, '&quot;');
        const userLname = (review.userId?.lname || '').replace(/"/g, '&quot;');
        const userName = `${userFname} ${userLname}`.trim() || copy.anonymous;
        const userImage = review.userId?.image || '';
        const reviewRating = review.rating || 0;
        const reviewComment = ((review.review || review.comment || review.message || '').replace(/"/g, '&quot;').replace(/\n/g, '<br>'));
        
        // Expert/Staff information
        const expertFname = (review.expertId?.fname || '').replace(/"/g, '&quot;');
        const expertLname = (review.expertId?.lname || '').replace(/"/g, '&quot;');
        const expertName = `${expertFname} ${expertLname}`.trim();
        const expertInfo = expertName ? `<div class="review-expert">👤 ${copy.withExpert} ${expertName}</div>` : '';
        
        const imageHtml = userImage ? `<img src="${userImage}" alt="${userName}" class="review-avatar" onerror="this.style.display='none'">` : `<div class="review-avatar">${userName.charAt(0).toUpperCase()}</div>`;
        const ratingHtml = reviewRating > 0 ? `<div class="review-rating">${'⭐'.repeat(Math.round(reviewRating))} ${reviewRating.toFixed(1)}</div>` : '';
        const commentHtml = reviewComment ? `<div class="review-text">${reviewComment}</div>` : '';
        return `<div class="review-item"><div class="review-header">${imageHtml}<div class="review-info"><div class="review-name">${userName}</div>${ratingHtml}${expertInfo}</div></div>${commentHtml}</div>`;
      }).join('');
      reviewsHtml = `<div class="section"><h3 class="section-title">${copy.reviews}</h3><div class="reviews-container">${reviewsHtml}</div></div>`;
    } else {
      reviewsHtml = `<div class="section"><h3 class="section-title">${copy.reviews}</h3><p class="empty-state">${copy.noReviews}</p></div>`;
    }

    // Rating badge HTML
    const ratingBadgeHtml = salonRating > 0 ? `<div class="rating-badge"><span class="rating-stars">⭐</span><span>${salonRating.toFixed(1)} (${salonReviewCount} ${copy.reviewsCount})</span></div>` : '';

    const salonCoverHtml = salonImage
      ? `<div class="sq-salon-detail__cover"><img src="${salonImage}" alt="" class="sq-salon-detail__cover-img" loading="eager" onerror="this.parentElement.classList.add('sq-salon-detail__cover--placeholder')"></div>`
      : `<div class="sq-salon-detail__cover sq-salon-detail__cover--placeholder" aria-hidden="true"></div>`;

    const salonRatingBlock = ratingBadgeHtml
      ? `<div class="sq-salon-detail__rating">${ratingBadgeHtml}</div>`
      : "";
    const salonAddressBlock = salonAddress
      ? `<p class="sq-salon-detail__address"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${salonAddress}</p>`
      : "";

    const bookingCardHtml = `<div class="booking-card">
                            <h3>${copy.bookingCardTitle}</h3>
                            <button type="button" onclick="window.SalonBooking && SalonBooking.open()" class="open-app-btn">
                                <i class="fas fa-calendar-check"></i> ${copy.bookNow}
                            </button>
                            <div id="download-section" class="sq-salon-download">
                                <p class="sq-salon-download__lead">${copy.noAppDesc}</p>
                                <a href="#" onclick="openPhoneSelection('customer'); return false;" class="sq-btn sq-btn-fill sq-salon-download__cta">${copy.downloadAppCta}</a>
                                <div class="sq-store-badges-mount" data-app="customer" data-center="true"></div>
                            </div>
                        </div>`;

    const footerHtml = skedisyFooterHtml(baseURL, copy);
    const idfBanner = idfBannerHtml(copy);

    // Generate HTML with Open Graph and App Links meta tags
    const html = `<!DOCTYPE html>
<html lang="${pageLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${copy.metaSalonTitle(salonName).replace(/"/g, '&quot;')}</title>
    <meta name="description" content="${(salon.about ? salonDescription : copy.metaSalonDesc(salonName)).replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${salonName}, ${copy.metaKeywords}${salonAddress ? ', ' + salonAddress.split(',').join(', ') : ''}">
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
        function openApp(serviceId) {
            const serviceIdParam = (serviceId !== undefined && serviceId !== null && String(serviceId).trim() !== "")
                ? String(serviceId).trim() : "";
            let deepLink = "${deepLinkScheme}://salon/${salon._id}";
            if (serviceIdParam) {
                deepLink += "?serviceId=" + encodeURIComponent(serviceIdParam);
            }
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
            
            // For desktop/computer: redirect to marketing home (get-app anchors; same as salonportal script.js)
            if (!isMobile) {
                const base = (downloadPageUrl || "https://skedisy.com").replace(/\/+$/, "");
                window.location.href = base + "/#download-customer";
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
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
    ${global.settingJSON?.isStripePay && global.settingJSON?.stripePublishableKey ? `<script src="https://js.stripe.com/v3/"></script>` : ""}
</head>
<body class="sk-public-page sq-page">
    <!-- Login Button Above QR Code -->
    <div class="login-above-qr">
        <a href="${baseURL}/salonpanel/" class="btn-login-above">Login</a>
    </div>
    
    <!-- QR Code — app cliente uniquement -->
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
    
    <div class="main-wrapper sq-salon-detail">
        ${idfBanner}

        <div class="content-wrapper sq-salon-detail__page">
            <div class="container">
                <div class="sq-salon-detail__head">
                    <div class="sq-salon-detail__meta">
                        <h1 class="sq-salon-detail__title">${salonName.replace(/"/g, "&quot;").replace(/</g, "&lt;")}</h1>
                        ${salonRatingBlock}
                        <p class="sq-salon-detail__desc">${salonDescription}</p>
                        ${salonAddressBlock}
                    </div>
                    <aside class="sq-salon-detail__aside sidebar-content">
                        ${bookingCardHtml}
                    </aside>
                </div>

                ${salonCoverHtml}

                <div class="sq-salon-detail__body content-grid">
                    <div class="main-content">
                        ${openingHoursHtml}
                        ${staffHtml}
                        ${servicesHtml}
                        ${productsHtml}
                        ${reviewsHtml}
                    </div>
                    <div class="sq-salon-detail__rail" aria-hidden="true"></div>
                </div>
            </div>
        </div>
        
        ${footerHtml}
    </div>
    
    <!-- Sticky Booking Button (Mobile Only) -->
    <div class="sticky-booking-btn">
        <button type="button" onclick="window.SalonBooking && SalonBooking.open()">
            <i class="fas fa-calendar-check"></i> ${copy.bookNow}
        </button>
    </div>

    <div id="salonBookingModal" class="sq-booking-modal" aria-hidden="true">
        <div class="sq-booking-modal__backdrop" data-close-booking></div>
        <div class="sq-booking-modal__panel" role="dialog" aria-labelledby="bookingModalTitle">
            <button type="button" class="sq-booking-modal__close" data-close-booking aria-label="Fermer">&times;</button>
            <h2 id="bookingModalTitle" class="sq-booking-modal__title">${copy.bookNow}</h2>
            <div id="salonBookingSteps" class="sq-booking-steps"></div>
        </div>
    </div>

    <script>
        window.SKEDISY_SALON_BOOKING = {
            salonId: "${salon._id}",
            salonName: ${JSON.stringify(salonName)},
            slug: ${JSON.stringify(salonSlugWithId)},
            language: ${JSON.stringify(pageLang)},
            currency: ${JSON.stringify(currency)},
            tax: ${global.settingJSON?.tax || 0},
            services: ${JSON.stringify(bookingServices)},
            categories: ${JSON.stringify(bookingCategories)},
            experts: ${JSON.stringify(bookingExperts)},
            copy: {
                allCategoriesTab: ${JSON.stringify(copy.allCategoriesTab)},
                selectServices: ${JSON.stringify(copy.selectServices)},
                selectExpert: ${JSON.stringify(copy.selectExpert)},
                selectDateTime: ${JSON.stringify(copy.selectDateTime)},
                yourDetails: ${JSON.stringify(copy.yourDetails)},
                paymentTitle: ${JSON.stringify(copy.paymentTitle)},
                confirmBooking: ${JSON.stringify(copy.confirmBooking)},
                payAtSalon: ${JSON.stringify(copy.payAtSalon)},
                payWithStripe: ${JSON.stringify(copy.payWithStripe)},
                couponCode: ${JSON.stringify(copy.couponCode)},
                applyCoupon: ${JSON.stringify(copy.applyCoupon)},
                removeCoupon: ${JSON.stringify(copy.removeCoupon)},
                couponApplied: ${JSON.stringify(copy.couponApplied)},
                subtotal: ${JSON.stringify(copy.subtotal)},
                taxLabel: ${JSON.stringify(copy.taxLabel)},
                discount: ${JSON.stringify(copy.discount)},
                totalLabel: ${JSON.stringify(copy.totalLabel)},
                selectPayment: ${JSON.stringify(copy.selectPayment)},
                stripeSecure: ${JSON.stringify(copy.stripeSecure)},
                bookingSuccess: ${JSON.stringify(copy.bookingSuccess)},
                min: ${JSON.stringify(copy.min)},
                bookNow: ${JSON.stringify(copy.bookNow)},
                continue: ${JSON.stringify(copy.continue)},
                back: ${JSON.stringify(copy.back)},
                enterCouponCode: ${JSON.stringify(copy.enterCouponCode)},
                couponInvalid: ${JSON.stringify(copy.couponInvalid)},
                couponPlaceholder: ${JSON.stringify(copy.couponPlaceholder)},
                missingFields: ${JSON.stringify(copy.missingFields)},
                stripeUnavailable: ${JSON.stringify(copy.stripeUnavailable)},
                stripeNotLoaded: ${JSON.stringify(copy.stripeNotLoaded)},
                stripeEnterCard: ${JSON.stringify(copy.stripeEnterCard)},
                paymentCancelled: ${JSON.stringify(copy.paymentCancelled)},
                selectOneService: ${JSON.stringify(copy.selectOneService)},
                noExpertForService: ${JSON.stringify(copy.noExpertForService)},
                dateLabel: ${JSON.stringify(copy.dateLabel)},
                loading: ${JSON.stringify(copy.loading)},
                slotsClosed: ${JSON.stringify(copy.slotsClosed)},
                slotMorning: ${JSON.stringify(copy.slotMorning)},
                slotAfternoon: ${JSON.stringify(copy.slotAfternoon)},
                emailLabel: ${JSON.stringify(copy.emailLabel)},
                phoneLabel: ${JSON.stringify(copy.phoneLabel)},
                otpLabel: ${JSON.stringify(copy.otpLabel)},
                otpPlaceholder: ${JSON.stringify(copy.otpPlaceholder)},
                sendOtp: ${JSON.stringify(copy.sendOtp)},
                otpSent: ${JSON.stringify(copy.otpSent)},
                genericError: ${JSON.stringify(copy.genericError)},
                emailPhoneRequired: ${JSON.stringify(copy.emailPhoneRequired)},
                enterOtp: ${JSON.stringify(copy.enterOtp)},
                verifyFailed: ${JSON.stringify(copy.verifyFailed)},
                sessionExpired: ${JSON.stringify(copy.sessionExpired)},
                bookingFailed: ${JSON.stringify(copy.bookingFailed)},
                missingFieldAccount: ${JSON.stringify(copy.missingFieldAccount)},
                missingFieldExpert: ${JSON.stringify(copy.missingFieldExpert)},
                missingFieldSalon: ${JSON.stringify(copy.missingFieldSalon)},
                missingFieldService: ${JSON.stringify(copy.missingFieldService)},
                missingFieldDate: ${JSON.stringify(copy.missingFieldDate)},
                missingFieldSlot: ${JSON.stringify(copy.missingFieldSlot)},
                missingFieldAmount: ${JSON.stringify(copy.missingFieldAmount)},
                missingFieldAmountTtc: ${JSON.stringify(copy.missingFieldAmountTtc)},
                missingFieldPlace: ${JSON.stringify(copy.missingFieldPlace)}
            },
            payment: {
                isStripePay: ${!!global.settingJSON?.isStripePay},
                cashAfterService: ${global.settingJSON?.cashAfterService !== false},
                stripePublishableKey: ${JSON.stringify((global.settingJSON?.stripePublishableKey || "").trim())},
                currencyName: ${JSON.stringify((global.settingJSON?.currencyName || "eur").toLowerCase())}
            }
        };
    </script>
    <script src="${baseURL}/salon-booking.js"></script>
    <script type="module" src="${baseURL}/qr-code-init.js"></script>
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