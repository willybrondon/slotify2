const Service = require("../../models/service.model");

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

      // If no services found for the specific city, show all services as fallback
      if (cityFilteredServices.length === 0 && allServices.length > 0) {
        console.log("Service API - WARNING: No services found for city '" + city + "'. Showing all services as fallback.");
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
        
        const nameMatch = serviceName.includes(searchTerm);
        const categoryMatch = categoryName.includes(searchTerm);
        
        console.log(`Service ${service.name} - Name match: ${nameMatch}, Category match: ${categoryMatch}`);
        
        return nameMatch || categoryMatch;
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
