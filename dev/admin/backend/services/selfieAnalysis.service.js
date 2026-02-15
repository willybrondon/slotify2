const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/service.model');
const Salon = require('../models/salon.model');
const Expert = require('../models/expert.model');
const geolib = require('geolib');
const fs = require('fs');
const path = require('path');

// Initialize Google Gemini (same pattern as Twilio/SendGrid - simple and direct)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('[Selfie Analysis] ✅ Gemini API initialized successfully');
  } catch (error) {
    console.error('[Selfie Analysis] ❌ Failed to initialize Gemini:', error.message);
  }
}

class SelfieAnalysisService {
  /**
   * Analyze selfie image and extract beauty features using Google Gemini
   */
  async analyzeSelfie(imagePath, userId = null, context = {}) {
    try {
      // Validate image path
      if (!imagePath || !fs.existsSync(imagePath)) {
        throw new Error('Image file not found');
      }

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Get image MIME type
      const mimeType = this.getImageMimeType(imagePath);

      // Create detailed analysis prompt
      const analysisPrompt = `You are a professional beauty consultant analyzing a selfie photo. Provide a detailed beauty analysis in JSON format only. Focus on:

1. Skin Analysis:
   - Skin type (oily, dry, combination, sensitive, normal)
   - Skin tone (fair, light, medium, tan, dark)
   - Undertone (warm, cool, neutral)
   - Visible skin concerns (acne, wrinkles, dark spots, pigmentation, fine lines, pores, etc.)
   - Overall skin condition (excellent, good, fair, needs attention)
   - Skin texture assessment

2. Hair Analysis:
   - Hair type (straight, wavy, curly, coily)
   - Hair texture (fine, medium, thick)
   - Hair color (black, brown, blonde, red, gray, etc.)
   - Hair condition (healthy, damaged, dry, oily, normal)
   - Scalp visibility/health indicators
   - Hair length (short, medium, long)

3. Facial Features:
   - Face shape (oval, round, square, heart, diamond, oblong, triangle)
   - Eye shape (almond, round, hooded, monolid, etc.)
   - Lip shape (thin, medium, full)
   - Eyebrow shape (straight, arched, rounded)
   - Overall facial structure

4. Beauty Profile:
   - Age estimation (approximate range)
   - Overall beauty assessment
   - Areas that could benefit from professional services
   - Natural features to enhance

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "skin": {
    "type": "combination",
    "tone": "medium",
    "undertone": "warm",
    "concerns": ["acne", "dark spots"],
    "condition": "good",
    "texture": "smooth"
  },
  "hair": {
    "type": "wavy",
    "texture": "medium",
    "color": "brown",
    "condition": "healthy",
    "length": "medium"
  },
  "face": {
    "shape": "oval",
    "eyeShape": "almond",
    "lipShape": "full",
    "eyebrowShape": "arched"
  },
  "beautyProfile": {
    "ageEstimate": "25-30",
    "assessment": "Good overall condition",
    "areasToImprove": ["skin clarity", "hair styling"],
    "featuresToEnhance": ["natural lip color", "eyebrow definition"]
  }
}`;

      // Try Gemini first (primary)
      let analysisText = null;
      let analysis = {};
      let usedProvider = 'gemini';
      let geminiError = null;
      let ollamaError = null;

      // Check if Gemini is configured - try to initialize if not already done (same pattern as Twilio)
      if (!genAI && process.env.GEMINI_API_KEY) {
        try {
          genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          console.log('[Selfie Analysis] ✅ Gemini API initialized successfully (runtime initialization)');
        } catch (error) {
          console.error('[Selfie Analysis] ❌ Failed to initialize Gemini at runtime:', error.message);
        }
      }

      // If still not initialized, set error (same pattern as Twilio - check in function when needed)
      if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
          geminiError = new Error('GEMINI_API_KEY not found in environment variables. Add it to your .env file and restart the server.');
        } else {
          geminiError = new Error('GEMINI_API_KEY is set but initialization failed. Please check server logs and verify the key is correct.');
        }
      } else {
        try {
          // Try different model names in order of preference (use valid models that support image analysis)
          const modelNames = [
            'gemini-2.5-flash',      // Latest flash model (if available)
            'gemini-1.5-flash',      // Widely available, fast, supports images
            'gemini-1.5-pro',        // Higher quality
            'gemini-1.5-flash-8b',   // Lighter variant
            'gemini-pro-vision',     // Legacy vision model
            'gemini-1.0-pro-vision'  // Fallback vision model
          ];
          
          let model = null;
          let lastError = null;
          
          for (const modelName of modelNames) {
            try {
              model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent([
                analysisPrompt,
                {
                  inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                  }
                }
              ]);
              
              analysisText = result.response.text();
              usedProvider = 'gemini';
              console.log(`[Selfie Analysis] ✅ Successfully used model: ${modelName}`);
              break; // Success, exit loop
            } catch (modelError) {
              lastError = modelError;
              console.warn(`[Selfie Analysis] ⚠️ Model ${modelName} failed:`, modelError.message);
              // Continue to next model
            }
          }
          
          if (!analysisText && lastError) {
            throw lastError;
          }
        } catch (error) {
          geminiError = error;
          console.error('[Selfie Analysis] ❌ Gemini API error:', error.message);
        }
      }

      // Fallback to Ollama if Gemini failed
      if (!analysisText) {
        try {
          if (!process.env.OLLAMA_HOST) {
            throw new Error('OLLAMA_HOST not configured');
          }
          analysisText = await this.analyzeWithOllama(base64Image, analysisPrompt);
          usedProvider = 'ollama';
        } catch (error) {
          ollamaError = error;
          console.error('[Selfie Analysis] Ollama fallback error:', error.message);
          
          // If both failed, provide helpful error message (same pattern as Twilio error handling)
          const errorDetails = [];
          
          if (geminiError) {
            if (!process.env.GEMINI_API_KEY) {
              errorDetails.push('Gemini: API key not configured. Add GEMINI_API_KEY to your .env file');
            } else {
              errorDetails.push(`Gemini: ${geminiError.message}`);
            }
          }
          
          if (ollamaError && !ollamaError.message.includes('not configured')) {
            errorDetails.push(`Ollama: ${ollamaError.message}`);
          }
          
          if (errorDetails.length > 0) {
            throw new Error(`Both AI services failed:\n${errorDetails.join('\n')}\n\nPlease configure at least one AI service. See AI_CONCIERGE_SETUP.md for instructions.`);
          }
        }
      }

      // Parse AI response
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanedText = analysisText.trim();
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to extract JSON from response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse text response
          analysis = this.parseTextAnalysis(cleanedText);
        }
      } catch (parseError) {
        console.error('[Selfie Analysis] JSON parse error:', parseError);
        analysis = this.parseTextAnalysis(analysisText);
      }

      // Validate analysis structure
      analysis = this.validateAnalysisStructure(analysis);

      // Get recommendations based on analysis
      const recommendations = await this.getServiceRecommendations(analysis, userId, context);

      return {
        analysis: analysis,
        recommendations: recommendations,
        rawResponse: analysisText,
        provider: usedProvider
      };
    } catch (error) {
      console.error('[Selfie Analysis] Error:', error);
      throw new Error(`Failed to analyze selfie: ${error.message}`);
    }
  }

  /**
   * Fallback: Analyze with Ollama (local)
   */
  async analyzeWithOllama(base64Image, prompt) {
    try {
      // Check if Ollama is configured
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      
      // Try to require ollama
      let ollama;
      try {
        const ollamaModule = require('ollama');
        // For ollama v0.5.x, the default export is the Ollama class
        // Check different possible export formats
        if (ollamaModule.default && typeof ollamaModule.default === 'function') {
          ollama = new ollamaModule.default({ host: ollamaHost });
        } else if (ollamaModule.Ollama && typeof ollamaModule.Ollama === 'function') {
          ollama = new ollamaModule.Ollama({ host: ollamaHost });
        } else if (typeof ollamaModule === 'function') {
          ollama = new ollamaModule({ host: ollamaHost });
        } else {
          // For ollama v0.5.x, it might export directly
          ollama = ollamaModule;
          if (typeof ollama !== 'object' || !ollama.chat) {
            throw new Error('Ollama package structure unexpected. Please check package version.');
          }
        }
      } catch (requireError) {
        if (requireError.message.includes('Cannot find module')) {
          throw new Error('Ollama package not installed. Run: npm install ollama');
        }
        throw requireError;
      }

      // Check if Ollama server is reachable (if list method exists)
      if (ollama.list && typeof ollama.list === 'function') {
        try {
          await ollama.list();
        } catch (connectionError) {
          throw new Error(`Cannot connect to Ollama at ${ollamaHost}. Make sure Ollama is running.`);
        }
      }

      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || 'qwen2.5-vl:7b',
        messages: [{
          role: 'user',
          content: prompt,
          images: [base64Image]
        }],
        options: {
          temperature: 0.7,
          num_predict: 1500
        }
      });

      if (!response || !response.message || !response.message.content) {
        throw new Error('Ollama returned empty response');
      }

      return response.message.content;
    } catch (error) {
      throw new Error(`Ollama analysis failed: ${error.message}`);
    }
  }

  /**
   * Get image MIME type from file path
   */
  getImageMimeType(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Parse text response into structured analysis
   */
  parseTextAnalysis(text) {
    const analysis = {
      skin: { type: 'normal', tone: 'medium', undertone: 'neutral', concerns: [], condition: 'good' },
      hair: { type: 'straight', texture: 'medium', color: 'brown', condition: 'healthy' },
      face: { shape: 'oval', eyeShape: 'almond', lipShape: 'medium' },
      beautyProfile: { ageEstimate: 'unknown', assessment: '', areasToImprove: [], featuresToEnhance: [] }
    };

    // Try to extract information from text using keywords
    const lowerText = text.toLowerCase();

    // Skin type
    if (lowerText.includes('oily')) analysis.skin.type = 'oily';
    else if (lowerText.includes('dry')) analysis.skin.type = 'dry';
    else if (lowerText.includes('combination')) analysis.skin.type = 'combination';
    else if (lowerText.includes('sensitive')) analysis.skin.type = 'sensitive';

    // Hair type
    if (lowerText.includes('curly')) analysis.hair.type = 'curly';
    else if (lowerText.includes('wavy')) analysis.hair.type = 'wavy';
    else if (lowerText.includes('straight')) analysis.hair.type = 'straight';

    return analysis;
  }

  /**
   * Validate and ensure analysis structure is complete
   */
  validateAnalysisStructure(analysis) {
    if (!analysis.skin) {
      analysis.skin = { type: 'normal', tone: 'medium', undertone: 'neutral', concerns: [], condition: 'good' };
    }
    if (!analysis.hair) {
      analysis.hair = { type: 'straight', texture: 'medium', color: 'brown', condition: 'healthy' };
    }
    if (!analysis.face) {
      analysis.face = { shape: 'oval', eyeShape: 'almond', lipShape: 'medium' };
    }
    if (!analysis.beautyProfile) {
      analysis.beautyProfile = { ageEstimate: 'unknown', assessment: '', areasToImprove: [], featuresToEnhance: [] };
    }
    return analysis;
  }

  /**
   * Get service recommendations based on analysis
   */
  async getServiceRecommendations(analysis, userId, context) {
    try {
      const serviceQueries = [];
      const serviceKeywords = [];

      // Skin-based recommendations
      if (analysis.skin) {
        if (analysis.skin.concerns && analysis.skin.concerns.length > 0) {
          const concernServiceMap = {
            'acne': ['facial', 'acne treatment', 'deep cleansing', 'skin care'],
            'wrinkles': ['anti-aging', 'facial', 'botox', 'facial massage'],
            'dark spots': ['brightening', 'facial', 'chemical peel', 'laser'],
            'pigmentation': ['pigmentation', 'facial', 'skin whitening', 'brightening'],
            'dry': ['hydrating', 'moisturizing', 'facial'],
            'oily': ['oil control', 'deep cleansing', 'facial', 'pore treatment'],
            'fine lines': ['anti-aging', 'facial', 'wrinkle treatment'],
            'pores': ['pore treatment', 'facial', 'deep cleansing']
          };

          analysis.skin.concerns.forEach(concern => {
            const services = concernServiceMap[concern.toLowerCase()] || ['facial'];
            serviceKeywords.push(...services);
          });
        }

        // Add general facial services
        serviceKeywords.push('facial', 'skin care', 'beauty treatment');
      }

      // Hair-based recommendations
      if (analysis.hair) {
        serviceKeywords.push('hair cut', 'hair styling', 'hair');

        if (analysis.hair.condition === 'damaged' || analysis.hair.condition === 'dry') {
          serviceKeywords.push('hair treatment', 'hair spa', 'hair repair', 'hair care');
        }

        if (analysis.hair.color) {
          serviceKeywords.push('hair color', 'hair highlights', 'hair coloring');
        }
      }

      // Face shape-based recommendations
      if (analysis.face && analysis.face.shape) {
        serviceKeywords.push('hair cut', 'hair styling', 'makeup');
      }

      // Beauty profile recommendations
      if (analysis.beautyProfile && analysis.beautyProfile.areasToImprove) {
        analysis.beautyProfile.areasToImprove.forEach(area => {
          if (area.toLowerCase().includes('eyebrow')) {
            serviceKeywords.push('eyebrow', 'threading', 'waxing');
          }
          if (area.toLowerCase().includes('lip')) {
            serviceKeywords.push('lip', 'makeup');
          }
          if (area.toLowerCase().includes('hair')) {
            serviceKeywords.push('hair cut', 'hair styling');
          }
        });
      }

      // Query database for matching services (case-insensitive search)
      const services = await Service.find({
        $or: serviceKeywords.map(keyword => ({
          name: { $regex: keyword, $options: 'i' }
        })),
        isDelete: false,
        status: true
      })
        .populate('categoryId')
        .limit(15);

      // Add service URL/slug to each service for web linking
      // Services should link to their category page, not a service-specific page
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
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
      
      const servicesWithUrl = services.map(service => {
        const serviceObj = service.toObject();
        
        // Link to category page instead of service page
        // Format: /category/{categorySlug}-{categoryShortId}
        if (serviceObj.categoryId && serviceObj.categoryId._id) {
          const categoryName = serviceObj.categoryId.name || "";
          const categorySlug = generateSlug(categoryName);
          const categoryShortId = serviceObj.categoryId._id.toString().substring(0, 6);
          const categorySlugWithId = `${categorySlug}-${categoryShortId}`;
          serviceObj.shareUrl = `${baseURL}/category/${categorySlugWithId}`;
          
          // Save categoryName before overwriting categoryId
          serviceObj.categoryName = categoryName;
          serviceObj.categoryId = serviceObj.categoryId._id;
        } else {
          // Fallback: if no category, use service page
          const slug = generateSlug(service.name);
          const shortId = service._id.toString().substring(0, 6);
          const slugWithId = `${slug}-${shortId}`;
          serviceObj.shareUrl = `${baseURL}/service/${slugWithId}`;
          serviceObj.categoryId = serviceObj.categoryId ? (serviceObj.categoryId._id || serviceObj.categoryId) : null;
          serviceObj.categoryName = null;
        }
        
        return serviceObj;
      });

      // Get salon matches (pass analysis for hair-based filtering)
      const salonMatches = await this.getSalonMatches(services, context, analysis);

      // Generate beauty tips
      const beautyTips = this.generateBeautyTips(analysis);

      return {
        services: servicesWithUrl,
        salons: salonMatches.salons, // Already formatted in getSalonMatches
        experts: salonMatches.experts,
        beautyTips: beautyTips
      };
    } catch (error) {
      console.error('[Selfie Analysis] Recommendation error:', error);
      return { services: [], salons: [], experts: [], beautyTips: [] };
    }
  }

  /**
   * Match salons and experts based on recommended services, location, and hair analysis
   * Prioritize salons based on their service types matching user's needs
   */
  async getSalonMatches(services, context, analysis = null) {
    try {
      // Always try to get salon recommendations, even if no services found
      // This ensures users always see salon recommendations
      const serviceIds = services && services.length > 0 ? services.map(s => s._id) : [];

      // Find salons that offer these services
      // If no services found, still try to get some salons (fallback)
      let salons = [];
      
      if (serviceIds && serviceIds.length > 0) {
        salons = await Salon.find({
          'serviceIds.id': { $in: serviceIds },
          isActive: true,
          isDelete: false
        })
          .populate({
            path: 'serviceIds.id',
            populate: {
              path: 'categoryId',
              select: 'name'
            }
          })
          .lean(); // Use lean() for better JSON serialization
      }
      
      // If no salons found with matching services, get top-rated salons as fallback
      // This ensures we always have salon recommendations
      if (salons.length === 0) {
        console.log('[Selfie Analysis] No salons found with matching services, using fallback: top-rated salons');
        salons = await Salon.find({
          isActive: true,
          isDelete: false
        })
          .populate({
            path: 'serviceIds.id',
            populate: {
              path: 'categoryId',
              select: 'name'
            }
          })
          .sort({ review: -1, reviewCount: -1 })
          .limit(10)
          .lean();
      }
      
      // Score and rank salons based on service type matching
      salons = this.scoreSalonsByServiceTypes(salons, services, analysis);
      
      // Filter salons based on hair type/color if analysis is provided
      if (analysis && analysis.hair) {
        salons = this.filterSalonsByHairType(salons, analysis.hair);
      }
      
      // Calculate distance and filter by location if provided
      if (context.latitude && context.longitude) {
        const userLocation = {
          latitude: parseFloat(context.latitude),
          longitude: parseFloat(context.longitude)
        };
        
        // Check if coordinates are valid (not NaN)
        const isValidLocation = !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude);
        
        if (isValidLocation) {
          salons = salons.map(salon => {
            if (salon.locationCoordinates && salon.locationCoordinates.latitude && salon.locationCoordinates.longitude) {
              const salonLat = parseFloat(salon.locationCoordinates.latitude);
              const salonLng = parseFloat(salon.locationCoordinates.longitude);
              
              // Check if salon coordinates are valid
              if (!isNaN(salonLat) && !isNaN(salonLng)) {
                const salonLocation = {
                  latitude: salonLat,
                  longitude: salonLng
                };
                try {
                  const distanceInMeters = geolib.getDistance(userLocation, salonLocation);
                  salon.distance = distanceInMeters / 1000; // Convert to kilometers
                } catch (distanceError) {
                  console.error('[Selfie Analysis] Distance calculation error:', distanceError);
                  salon.distance = null;
                }
              } else {
                salon.distance = null;
              }
            } else {
              salon.distance = null;
            }
            return salon;
          });
          
          // Separate salons with and without distance
          const salonsWithDistance = salons.filter(salon => salon.distance !== null);
          const salonsWithoutDistance = salons.filter(salon => salon.distance === null);
          
          // Filter nearby salons (within 100km for better coverage, especially for Cameroon)
          // If no salons within 100km, include all salons with distance
          const nearbySalons = salonsWithDistance.filter(salon => salon.distance <= 100);
          const salonsToShow = nearbySalons.length > 0 ? nearbySalons : salonsWithDistance;
          
          // Sort by service match score first, then distance, then rating
          salonsToShow.sort((a, b) => {
            // Sort by service match score first (if available), then distance, then rating
            if (a.serviceMatchScore !== undefined && b.serviceMatchScore !== undefined) {
              if (b.serviceMatchScore !== a.serviceMatchScore) {
                return b.serviceMatchScore - a.serviceMatchScore;
              }
            }
            if (a.distance !== null && b.distance !== null) {
              if (a.distance !== b.distance) {
                return a.distance - b.distance;
              }
            }
            return (b.review || 0) - (a.review || 0);
          });
          
          // Add salons without distance at the end (sorted by score and rating)
          salonsWithoutDistance.sort((a, b) => {
            if (a.serviceMatchScore !== undefined && b.serviceMatchScore !== undefined) {
              if (b.serviceMatchScore !== a.serviceMatchScore) {
                return b.serviceMatchScore - a.serviceMatchScore;
              }
            }
            return (b.review || 0) - (a.review || 0);
          });
          
          // Combine: nearby salons first, then salons without distance
          salons = [...salonsToShow, ...salonsWithoutDistance];
        } else {
          console.warn('[Selfie Analysis] Invalid location coordinates provided');
          // If location is invalid, treat as no location
          salons.sort((a, b) => {
            if (a.serviceMatchScore !== undefined && b.serviceMatchScore !== undefined) {
              if (b.serviceMatchScore !== a.serviceMatchScore) {
                return b.serviceMatchScore - a.serviceMatchScore;
              }
            }
            return (b.review || 0) - (a.review || 0);
          });
        }
      } else {
        // If no location, sort by service match score first, then rating
        salons.sort((a, b) => {
          if (a.serviceMatchScore !== undefined && b.serviceMatchScore !== undefined) {
            if (b.serviceMatchScore !== a.serviceMatchScore) {
              return b.serviceMatchScore - a.serviceMatchScore;
            }
          }
          return (b.review || 0) - (a.review || 0);
        });
      }
      
      // Limit to top 5-8 most relevant salons (increased for better coverage)
      const maxSalons = context.latitude && context.longitude ? 8 : 5;
      salons = salons.slice(0, maxSalons);
      
      // Format salons to ensure _id is included and properly formatted
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
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, '');
      
      const formattedSalons = salons.map(salon => {
        // With lean(), salon is already a plain object
        const addressDetails = salon.addressDetails || {};
        const addressLine1 = addressDetails.addressLine1 || "";
        const city = addressDetails.city || "";
        const country = addressDetails.country || "";
        const fullAddress = [addressLine1, city, country].filter(Boolean).join(", ");
        
        // Generate salon share URL: /salon/{slug}-{shortId}
        const salonSlug = generateSlug(salon.name);
        const salonShortId = salon._id.toString().substring(0, 6);
        const salonSlugWithId = `${salonSlug}-${salonShortId}`;
        const shareUrl = `${baseURL}/salon/${salonSlugWithId}`;
        
        return {
          _id: salon._id,
          id: salon._id ? salon._id.toString() : null, // Add id field for compatibility
          name: salon.name || "",
          mainImage: salon.mainImage || (salon.image && salon.image.length > 0 ? salon.image[0] : ""),
          review: salon.review || 0,
          reviewCount: salon.reviewCount || 0,
          addressDetails: addressDetails,
          address: fullAddress, // Add formatted address string for easy access
          locationCoordinates: salon.locationCoordinates || {},
          distance: salon.distance || null, // Include distance if calculated
          shareUrl: shareUrl, // Add share URL for web linking
          matchingServiceCount: salon.matchingServiceCount || 0, // Number of matching services
          matchingServiceTypes: salon.matchingServiceTypes || [] // Types of matching services
        };
      });

      // Find experts specialized in these services (limit to 3)
      const experts = await Expert.find({
        serviceId: { $in: serviceIds },
        isActive: true,
        isDelete: false
      })
        .populate('serviceId')
        .sort({ review: -1 })
        .limit(3);

      return {
        salons: formattedSalons, // Use formatted salons
        experts: experts
      };
    } catch (error) {
      console.error('[Selfie Analysis] Salon matching error:', error);
      return { salons: [], experts: [] };
    }
  }
  
  /**
   * Score salons based on how well their service types match the recommended services
   * and user's analysis needs
   */
  scoreSalonsByServiceTypes(salons, recommendedServices, analysis = null) {
    if (!salons || salons.length === 0) return salons;
    
    // Create a map of recommended service IDs for quick lookup
    const recommendedServiceIds = new Set(recommendedServices.map(s => s._id.toString()));
    
    // Create service type categories based on analysis
    const serviceTypeCategories = {
      skin: [],
      hair: [],
      facial: [],
      beauty: []
    };
    
    if (analysis) {
      // Categorize services based on analysis
      recommendedServices.forEach(service => {
        const serviceName = (service.name || '').toLowerCase();
        const categoryName = service.categoryId?.name?.toLowerCase() || '';
        
        if (analysis.skin && (serviceName.includes('facial') || serviceName.includes('skin') || 
            serviceName.includes('acne') || serviceName.includes('treatment') ||
            categoryName.includes('skin') || categoryName.includes('facial'))) {
          serviceTypeCategories.skin.push(service._id.toString());
        }
        
        if (analysis.hair && (serviceName.includes('hair') || serviceName.includes('cut') || 
            serviceName.includes('color') || serviceName.includes('styling') ||
            categoryName.includes('hair'))) {
          serviceTypeCategories.hair.push(service._id.toString());
        }
        
        if (analysis.face && (serviceName.includes('makeup') || serviceName.includes('eyebrow') ||
            serviceName.includes('threading') || categoryName.includes('makeup'))) {
          serviceTypeCategories.facial.push(service._id.toString());
        }
        
        // General beauty services
        if (serviceName.includes('beauty') || serviceName.includes('spa') ||
            categoryName.includes('beauty') || categoryName.includes('spa')) {
          serviceTypeCategories.beauty.push(service._id.toString());
        }
      });
    }
    
    // Score each salon based on service type matching
    const scoredSalons = salons.map(salon => {
      let serviceMatchScore = 0;
      let matchingServiceCount = 0;
      let matchingServiceTypes = new Set();
      
      if (salon.serviceIds && salon.serviceIds.length > 0) {
        salon.serviceIds.forEach(serviceItem => {
          if (serviceItem.id && serviceItem.id._id) {
            const serviceId = serviceItem.id._id.toString();
            
            // Check if this service is in recommended services
            if (recommendedServiceIds.has(serviceId)) {
              matchingServiceCount++;
              serviceMatchScore += 10; // Base score for matching service
              
              // Check service category/type
              const serviceName = (serviceItem.id.name || '').toLowerCase();
              const categoryName = (serviceItem.id.categoryId?.name || '').toLowerCase();
              
              // Add bonus points for service type matching
              if (analysis) {
                // Skin services
                if (analysis.skin && (serviceName.includes('facial') || serviceName.includes('skin') ||
                    serviceName.includes('acne') || serviceName.includes('treatment') ||
                    categoryName.includes('skin') || categoryName.includes('facial'))) {
                  serviceMatchScore += 5;
                  matchingServiceTypes.add('skin');
                }
                
                // Hair services
                if (analysis.hair && (serviceName.includes('hair') || serviceName.includes('cut') ||
                    serviceName.includes('color') || serviceName.includes('styling') ||
                    categoryName.includes('hair'))) {
                  serviceMatchScore += 5;
                  matchingServiceTypes.add('hair');
                }
                
                // Facial/beauty services
                if (analysis.face && (serviceName.includes('makeup') || serviceName.includes('eyebrow') ||
                    categoryName.includes('makeup'))) {
                  serviceMatchScore += 5;
                  matchingServiceTypes.add('facial');
                }
              }
              
              // Bonus for salon having multiple matching services
              if (matchingServiceCount > 1) {
                serviceMatchScore += (matchingServiceCount - 1) * 2;
              }
            }
          }
        });
      }
      
      // Store the score and matching info
      salon.serviceMatchScore = serviceMatchScore;
      salon.matchingServiceCount = matchingServiceCount;
      salon.matchingServiceTypes = Array.from(matchingServiceTypes);
      
      return salon;
    });
    
    // Sort by service match score (highest first)
    scoredSalons.sort((a, b) => {
      if (b.serviceMatchScore !== a.serviceMatchScore) {
        return b.serviceMatchScore - a.serviceMatchScore;
      }
      // If scores are equal, prefer salons with more matching services
      if (b.matchingServiceCount !== a.matchingServiceCount) {
        return b.matchingServiceCount - a.matchingServiceCount;
      }
      // Then by rating
      return (b.review || 0) - (a.review || 0);
    });
    
    return scoredSalons;
  }
  
  /**
   * Filter salons based on hair type/color from analysis
   * Prioritize salons that specialize in the user's hair type
   */
  filterSalonsByHairType(salons, hairAnalysis) {
    if (!hairAnalysis) return salons;
    
    const hairType = hairAnalysis.type?.toLowerCase() || '';
    const hairColor = hairAnalysis.color?.toLowerCase() || '';
    const hairCondition = hairAnalysis.condition?.toLowerCase() || '';
    
    // Score salons based on how well they match the hair type
    const scoredSalons = salons.map(salon => {
      let score = 0;
      
      // Check if salon services match hair type
      if (salon.serviceIds && salon.serviceIds.length > 0) {
        salon.serviceIds.forEach(serviceItem => {
          if (serviceItem.id && serviceItem.id.name) {
            const serviceName = serviceItem.id.name.toLowerCase();
            
            // Match hair type
            if (hairType) {
              if (hairType === 'curly' || hairType === 'coily') {
                if (serviceName.includes('curly') || serviceName.includes('afro') || serviceName.includes('textured')) {
                  score += 10;
                }
              } else if (hairType === 'straight') {
                if (serviceName.includes('straight') || serviceName.includes('smoothing') || serviceName.includes('keratin')) {
                  score += 10;
                }
              } else if (hairType === 'wavy') {
                if (serviceName.includes('wave') || serviceName.includes('texture')) {
                  score += 10;
                }
              }
            }
            
            // Match hair color services
            if (hairColor && (serviceName.includes('color') || serviceName.includes('highlight') || serviceName.includes('dye'))) {
              score += 5;
            }
            
            // Match hair condition services
            if (hairCondition === 'damaged' || hairCondition === 'dry') {
              if (serviceName.includes('treatment') || serviceName.includes('repair') || serviceName.includes('spa')) {
                score += 8;
              }
            }
          }
        });
      }
      
      return { salon, score };
    });
    
    // Sort by score (highest first), then by rating
    scoredSalons.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.salon.review || 0) - (a.salon.review || 0);
    });
    
    // Return salons (remove score)
    return scoredSalons.map(item => item.salon);
  }

  /**
   * Generate personalized beauty tips based on analysis
   */
  generateBeautyTips(analysis) {
    const tips = [];

    // Skin tips
    if (analysis.skin) {
      if (analysis.skin.type === 'oily') {
        tips.push('Use oil-free moisturizer and non-comedogenic products');
        tips.push('Consider regular deep cleansing facials to control oil production');
      } else if (analysis.skin.type === 'dry') {
        tips.push('Use hydrating serums and rich moisturizers');
        tips.push('Consider hydrating facial treatments to restore moisture');
      }

      if (analysis.skin.concerns && analysis.skin.concerns.includes('acne')) {
        tips.push('Avoid touching your face and use gentle, non-comedogenic products');
        tips.push('Consider professional acne treatment for best results');
      }

      if (analysis.skin.concerns && analysis.skin.concerns.includes('dark spots')) {
        tips.push('Use sunscreen daily to prevent further darkening');
        tips.push('Consider brightening treatments to even out skin tone');
      }
    }

    // Hair tips
    if (analysis.hair) {
      if (analysis.hair.condition === 'damaged') {
        tips.push('Use deep conditioning treatments regularly');
        tips.push('Consider professional hair spa treatments to restore health');
      }

      if (analysis.hair.type === 'curly' || analysis.hair.type === 'coily') {
        tips.push('Use products specifically designed for curly hair');
        tips.push('Avoid over-washing to maintain natural oils');
      }
    }

    // Face shape tips
    if (analysis.face && analysis.face.shape) {
      tips.push(`Your ${analysis.face.shape} face shape can be enhanced with the right haircut and styling`);
    }

    return tips.length > 0 ? tips : ['Maintain a regular beauty routine for best results'];
  }
}

module.exports = new SelfieAnalysisService();

