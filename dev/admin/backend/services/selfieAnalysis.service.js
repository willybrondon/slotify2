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

/** Mots-clés Skedisy — 5 catégories beauté afro IDF */
const AFRO_CATEGORY_KEYWORDS = {
  tresses: [
    'tresse', 'tresses', 'braid', 'braids', 'box braid', 'knotless', 'vanille', 'vanilles',
    'tissage', 'crochet', 'ghana', 'fulani', 'lemonade', 'natte', 'nattes', 'cornrow',
    'dépose', 'protective'
  ],
  locks: ['lock', 'locks', 'dread', 'retwist', 'starter loc', 'faux lock', 'entretien lock', 'dépose lock'],
  perruques: ['perruque', 'wig', 'lace', 'closure', 'couture', 'extension', 'frontal'],
  homme: ['fade', 'barbe', 'beard', 'coupe homme', 'skin fade', 'barber', 'rasage', 'contour', 'nattes homme', 'homme'],
  esthetique: [
    'ongle', 'manucure', 'pédicure', 'maquillage', 'makeup', 'cil', 'sourcil', 'épilation',
    'soin visage', 'nettoyage', 'gel', 'nail', 'microblading'
  ],
};

const IDF_LOCATION_HINTS = [
  'paris', 'île-de-france', 'ile-de-france', 'idf', 'seine', 'val-de-marne', 'val de marne',
  'hauts-de-seine', 'bobigny', 'montreuil', 'créteil', 'creteil', 'versailles', 'nanterre',
  'saint-denis', 'argenteuil', 'cergy', 'melun', 'évry', 'evry', 'france'
];

/** Max salons proposés — ancré catalogue Skedisy */
const MAX_SALON_PROPOSALS = 4;
/** Score minimum (0–100) pour afficher un salon — évite les faux positifs */
const MIN_CONFIDENCE_SCORE = 42;
const IDF_RADIUS_KM = 55;

class SelfieAnalysisService {
  normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Termes de recherche dérivés de l'analyse photo (cheveux texturés / afro).
   */
  extractSearchTermsFromAnalysis(analysis) {
    const terms = new Set();
    const add = (v) => {
      if (!v) return;
      if (Array.isArray(v)) v.forEach((x) => terms.add(this.normalizeText(x)));
      else terms.add(this.normalizeText(v));
    };

    const needs = analysis.recommendedNeeds || analysis.beautyProfile?.recommendedNeeds || {};
    (needs.serviceKeywords || []).forEach((k) => terms.add(this.normalizeText(k)));
    (needs.primaryCategories || []).forEach((c) => terms.add(this.normalizeText(c)));

    if (analysis.hair) {
      const hairType = this.normalizeText(analysis.hair.type);
      const texture = this.normalizeText(analysis.hair.texture);
      const condition = this.normalizeText(analysis.hair.condition);

      if (hairType === 'coily' || hairType === 'curly' || texture === 'thick') {
        ['tresses', 'knotless', 'box braids', 'locks', 'retwist', 'coiffure afro', 'textured'].forEach((t) => terms.add(t));
      }
      if (hairType === 'wavy') {
        terms.add('tissage');
        terms.add('coiffure');
      }
      if (hairType === 'straight') {
        terms.add('lissage');
        terms.add('tissage');
      }
      if (condition === 'damaged' || condition === 'dry') {
        terms.add('soin');
        terms.add('traitement');
        terms.add('masque');
      }
      if (analysis.hair.color) {
        terms.add('coloration');
        terms.add('couleur');
      }
    }

    if (analysis.skin?.concerns?.length) {
      analysis.skin.concerns.forEach((c) => {
        const x = this.normalizeText(c);
        if (x.includes('acne') || x.includes('bouton')) terms.add('soin visage');
        if (x.includes('spot') || x.includes('tache') || x.includes('pigment')) terms.add('soin visage');
      });
    }

    if (analysis.beautyProfile?.areasToImprove?.length) {
      analysis.beautyProfile.areasToImprove.forEach((area) => {
        const a = this.normalizeText(area);
        if (a.includes('hair') || a.includes('cheveu')) terms.add('coiffure');
        if (a.includes('eyebrow') || a.includes('sourcil')) terms.add('sourcil');
        if (a.includes('skin') || a.includes('peau')) terms.add('soin visage');
      });
    }

    Object.entries(AFRO_CATEGORY_KEYWORDS).forEach(([cat, words]) => {
      words.forEach((w) => {
        if ([...terms].some((t) => this.termMatchesKeyword(t, w))) terms.add(cat);
      });
    });

    // Do not infer "homme" from generic braid keywords (e.g. "nattes" alone)
    if (terms.has('homme')) {
      const hasMaleSignal = [...terms].some(
        (t) =>
          t.includes('homme') ||
          t.includes('barbe') ||
          t.includes('beard') ||
          t.includes('barber') ||
          t.includes('fade') ||
          t.includes('rasage')
      );
      if (!hasMaleSignal) terms.delete('homme');
    }

    if (terms.size === 0) {
      ['coiffure afro', 'tresses', 'salon'].forEach((t) => terms.add(t));
    }

    return [...terms];
  }

  detectAfroCategoriesInText(text) {
    const norm = this.normalizeText(text);
    const found = new Set();
    Object.entries(AFRO_CATEGORY_KEYWORDS).forEach(([cat, words]) => {
      if (words.some((w) => norm.includes(w))) found.add(cat);
    });
    return found;
  }

  textMatchScore(haystack, searchTerms) {
    const norm = this.normalizeText(haystack);
    if (!norm) return 0;
    let score = 0;
    searchTerms.forEach((term) => {
      if (term.length < 3) return;
      if (norm.includes(term)) score += 4;
    });
    return score;
  }

  buildHairProfilePromptBlock(context = {}) {
    const lines = [];
    if (context.hairType) lines.push(`- Hair type (client): ${context.hairType}`);
    if (context.hairCondition) lines.push(`- Hair condition (client): ${context.hairCondition}`);
    if (context.styleInterest) lines.push(`- Style interest (client): ${context.styleInterest}`);
    if (context.scalpSensitivity) lines.push(`- Scalp sensitivity (client): ${context.scalpSensitivity}`);
    if (context.bookingGoal) lines.push(`- Booking goal (client): ${context.bookingGoal}`);
    if (!lines.length) return '';
    return `\nClient hair profile (from Skedisy app — trust and refine with the photo):\n${lines.join('\n')}\n`;
  }

  isLookCapture(context = {}) {
    return (
      context.mediaType === 'video' ||
      context.mediaType === 'look'
    );
  }

  termMatchesKeyword(term, keyword) {
    if (!term || !keyword) return false;
    if (term === keyword) return true;
    // Prefer matching full keyword inside term (e.g. "box braids" in "box braids long")
    if (keyword.length >= 4 && term.includes(keyword)) return true;
    // Avoid "nattes" matching "nattes homme" via substring on keyword
    if (term.length >= 4 && keyword.includes(term) && term.length >= keyword.length * 0.55) {
      return true;
    }
    return false;
  }

  inferSubjectPresentation(analysis) {
    const fromAi = analysis?.subjectPresentation?.apparentGender;
    if (fromAi === 'female' || fromAi === 'male') return fromAi;

    const blob = this.normalizeText(
      [
        analysis?.beautyProfile?.assessment,
        ...(analysis?.recommendedNeeds?.serviceKeywords || []),
        ...(analysis?.recommendedNeeds?.primaryCategories || []),
      ].join(' ')
    );

    const femaleSignals = ['femme', 'woman', 'female', 'girl', 'madame', 'elle', 'braids woman'];
    const maleSignals = ['homme', 'man', 'male', 'boy', 'monsieur', 'il', 'barber', 'fade', 'barbe'];

    const female = femaleSignals.some((s) => blob.includes(s));
    const male = maleSignals.some((s) => blob.includes(s));
    if (female && !male) return 'female';
    if (male && !female) return 'male';
    return 'unknown';
  }

  isMaleTargetedServiceName(name) {
    const n = this.normalizeText(name);
    return (
      n.includes('homme') ||
      n.includes(' barbe') ||
      n.startsWith('barbe') ||
      n.includes('beard') ||
      n.includes('barber') ||
      n.includes('fade') ||
      n.includes('rasage') ||
      n.includes('nattes homme')
    );
  }

  isFemaleTargetedServiceName(name) {
    const n = this.normalizeText(name);
    return (
      n.includes('femme') ||
      n.includes('woman') ||
      n.includes('madame') ||
      (n.includes('nattes') && !n.includes('homme')) ||
      (n.includes('tresse') && !n.includes('homme')) ||
      n.includes('knotless') ||
      n.includes('box braid')
    );
  }

  filterServicesByPresentation(services, analysis) {
    const presentation = this.inferSubjectPresentation(analysis);
    if (presentation === 'unknown') return services;

    return services.filter((service) => {
      const name = service.name || '';
      if (presentation === 'female' && this.isMaleTargetedServiceName(name)) return false;
      if (presentation === 'male' && this.isFemaleTargetedServiceName(name)) return false;
      return true;
    });
  }

  buildSelfieAnalysisPrompt(context = {}) {
    const hairProfileBlock = this.buildHairProfilePromptBlock(context);
    return `You are the Skedisy AI beauty concierge for Afro beauty salons in Île-de-France (France).
Analyze this selfie for a client from the Afro community. Focus on textured/coily/curly hair and realistic salon services (not generic Western spa menus).

Categories on Skedisy: Tresses, Locks, Perruques, Homme (barber), Esthétique (nails, makeup, skin, waxing).
${hairProfileBlock}
1. Skin: type, tone, undertone, concerns (hyperpigmentation, dryness…), condition
2. Hair (priority): type (straight, wavy, curly, coily), texture, color, condition, length, protective-style needs
3. Face: shape, eyes, lips, brows
4. recommendedNeeds: what to book at an Afro salon in IDF (categories + service keywords in French/English, e.g. knotless, box braids, retwist, lace front, fade, soin visage)
5. subjectPresentation: who is in the photo — apparentGender must be "female", "male", or "unknown" (use visible cues: hairstyle context, facial features; if woman with braids → female, never recommend barber/homme)
${context.occasion ? `\nClient occasion / goal: ${context.occasion}` : ''}

Return ONLY valid JSON (no markdown):
{
  "skin": { "type": "", "tone": "", "undertone": "", "concerns": [], "condition": "", "texture": "" },
  "hair": { "type": "", "texture": "", "color": "", "condition": "", "length": "" },
  "face": { "shape": "", "eyeShape": "", "lipShape": "", "eyebrowShape": "" },
  "subjectPresentation": { "apparentGender": "female|male|unknown", "confidence": "high|medium|low" },
  "beautyProfile": {
    "ageEstimate": "",
    "assessment": "",
    "areasToImprove": [],
    "featuresToEnhance": []
  },
  "recommendedNeeds": {
    "primaryCategories": ["Tresses"],
    "serviceKeywords": ["knotless", "box braids"],
    "summary": "One sentence in French for the client"
  }
}`;
  }

  buildLookCapturePrompt(context = {}) {
    const hairProfileBlock = this.buildHairProfilePromptBlock(context);
    const fromVideo = context.mediaType === 'video';
    return `You are the Skedisy AI beauty concierge for Afro beauty salons in Île-de-France (France).
The client shared ${fromVideo ? 'a screen recording (frame) from TikTok, Instagram, Facebook, Snapchat or another app' : 'a screenshot from social media (Instagram, TikTok, Facebook, Snapchat…)'}.
Your job: identify the HAIRSTYLE / LOOK shown and match it to real Afro salon services in IDF — not a generic selfie analysis.

Focus on: braid type (knotless, box braids, cornrows…), locs, wig/lace, color, length, fade/barber, protective style, glam.
Identify the subject's apparent gender (female/male/unknown) — recommendations must match (no barber/homme for women with braids).
Categories on Skedisy: Tresses, Locks, Perruques, Homme (barber), Esthétique.
${hairProfileBlock}
${context.occasion ? `Client goal: ${context.occasion}\n` : ''}
If the image is blurry or UI chrome is visible, infer the hairstyle intent anyway.

Return ONLY valid JSON (no markdown):
{
  "skin": { "type": "", "tone": "", "undertone": "", "concerns": [], "condition": "", "texture": "" },
  "hair": { "type": "", "texture": "", "color": "", "condition": "", "length": "" },
  "face": { "shape": "", "eyeShape": "", "lipShape": "", "eyebrowShape": "" },
  "subjectPresentation": { "apparentGender": "female|male|unknown", "confidence": "high|medium|low" },
  "beautyProfile": {
    "ageEstimate": "",
    "assessment": "Describe the shared look in French",
    "areasToImprove": [],
    "featuresToEnhance": []
  },
  "recommendedNeeds": {
    "primaryCategories": ["Tresses"],
    "serviceKeywords": ["knotless", "box braids"],
    "summary": "One sentence in French: we found this style, book at an Afro salon near you"
  }
}`;
  }

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
      const analysisPrompt = this.isLookCapture(context)
        ? this.buildLookCapturePrompt(context)
        : this.buildSelfieAnalysisPrompt(context);

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
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
          ];
          
          let model = null;
          let lastError = null;
          
          for (const modelName of modelNames) {
            try {
              model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.25, topP: 0.9, maxOutputTokens: 2048 },
              });
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
    if (!analysis.recommendedNeeds) {
      analysis.recommendedNeeds = {
        primaryCategories: [],
        serviceKeywords: [],
        summary: analysis.beautyProfile.assessment || '',
      };
    }
    if (!analysis.subjectPresentation) {
      analysis.subjectPresentation = { apparentGender: 'unknown', confidence: 'low' };
    }
    return analysis;
  }

  /**
   * Get service recommendations based on analysis
   */
  async getServiceRecommendations(analysis, userId, context) {
    try {
      const searchTerms = this.extractSearchTermsFromAnalysis(analysis);
      const serviceKeywords = [...searchTerms];

      (analysis.recommendedNeeds?.serviceKeywords || []).forEach((k) =>
        serviceKeywords.push(this.normalizeText(k))
      );
      (analysis.recommendedNeeds?.primaryCategories || []).forEach((cat) => {
        const key = this.normalizeText(cat);
        const words = AFRO_CATEGORY_KEYWORDS[key] || AFRO_CATEGORY_KEYWORDS[cat?.toLowerCase?.()] || [];
        serviceKeywords.push(key, ...words);
      });

      const uniqueKeywords = [...new Set(serviceKeywords.filter((k) => k && k.length > 1))].slice(0, 24);

      let services = [];
      if (uniqueKeywords.length > 0) {
        services = await Service.find({
          $or: uniqueKeywords.map((keyword) => ({
            name: { $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
          })),
          isDelete: false,
          status: true,
        })
          .populate('categoryId')
          .limit(20);
      }

      services = this.filterServicesByPresentation(services, analysis);

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

      const detectedService = this.buildDetectedService(analysis, servicesWithUrl);
      const topServices = servicesWithUrl.slice(0, MAX_SALON_PROPOSALS);
      const hasSalons = (salonMatches.salons || []).length > 0;

      return {
        detectedService,
        services: topServices,
        salons: salonMatches.salons,
        experts: salonMatches.experts,
        beautyTips: beautyTips,
        locationUsed: salonMatches.locationUsed,
        noMatch: !hasSalons,
        noMatchMessage: hasSalons
          ? null
          : 'Aucun salon en Île-de-France ne propose exactement cette prestation près de chez vous. Essayez une autre photo ou parcourez les catégories sur l\'accueil.',
      };
    } catch (error) {
      console.error('[Selfie Analysis] Recommendation error:', error);
      return { services: [], salons: [], experts: [], beautyTips: [], locationUsed: false, noMatch: true, noMatchMessage: 'Impossible de générer des recommandations pour le moment.' };
    }
  }

  /**
   * Prestation détectée après analyse photo (avant matching catalogue).
   */
  buildDetectedService(analysis, catalogServices = []) {
    const needs = analysis?.recommendedNeeds || {};
    const keywords = needs.serviceKeywords || [];
    const catalog = catalogServices[0];
    const label =
      catalog?.name ||
      (keywords.length ? keywords.slice(0, 2).join(' · ') : null) ||
      needs.primaryCategories?.[0] ||
      'Prestation identifiée';

    return {
      label,
      summary: needs.summary || null,
      categories: needs.primaryCategories || [],
      keywords,
      catalogMatch: catalog
        ? {
            id: catalog._id?.toString?.() || catalog.id,
            name: catalog.name,
            duration: catalog.duration || null,
            shareUrl: catalog.shareUrl || null,
          }
        : null,
    };
  }

  /**
   * Score composite 0–100 : match prestation, distance, note salon, prix, expert.
   */
  computeConfidenceScore(salon, matchedService) {
    let score = 0;
    const rawMatch = salon.serviceMatchScore || 0;
    score += Math.min(40, rawMatch * 0.45);

    if (salon.distance != null && !isNaN(salon.distance)) {
      score += Math.max(0, 25 * (1 - salon.distance / IDF_RADIUS_KM));
    } else {
      score += 10;
    }

    score += Math.min(15, ((salon.review || 0) / 5) * 15);

    if (matchedService?.price != null && matchedService.price > 0) {
      score += 10;
    } else if (matchedService) {
      score += 4;
    }

    if (salon.matchedExpert?.review) {
      score += Math.min(10, (salon.matchedExpert.review / 5) * 10);
    }

    return Math.round(Math.min(100, score));
  }

  pickBestMatchedService(salon, terms, recommendedServiceIds, primaryCats, analysis) {
    let best = null;
    let bestScore = 0;

    if (!salon.serviceIds?.length) return null;

    salon.serviceIds.forEach((serviceItem) => {
      const svc = serviceItem.id;
      if (!svc?._id) return;

      const serviceId = svc._id.toString();
      const serviceName = svc.name || '';
      const categoryName = svc.categoryId?.name || '';
      const blob = `${serviceName} ${categoryName}`;

      let score = 0;
      const termHits = this.textMatchScore(blob, terms);
      const catHits = this.detectAfroCategoriesInText(blob);

      if (recommendedServiceIds.has(serviceId)) score += 24;
      if (termHits > 0) score += 8 + termHits;

      primaryCats.forEach((pc) => {
        if (this.normalizeText(categoryName).includes(pc) || catHits.has(pc)) {
          score += 10;
        }
      });

      if (analysis?.hair) {
        const hairType = this.normalizeText(analysis.hair.type);
        const normName = this.normalizeText(serviceName);
        const presentation = this.inferSubjectPresentation(analysis);

        if (presentation === 'female' && this.isMaleTargetedServiceName(serviceName)) {
          score -= 40;
        }
        if (presentation === 'male' && this.isFemaleTargetedServiceName(serviceName) && !normName.includes('homme')) {
          score -= 25;
        }

        if (
          (hairType === 'coily' || hairType === 'curly') &&
          (normName.includes('tresse') ||
            normName.includes('braid') ||
            normName.includes('knotless') ||
            normName.includes('lock') ||
            normName.includes('afro'))
        ) {
          score += 8;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = {
          id: serviceId,
          name: serviceName,
          image: svc.image || null,
          duration: svc.duration || null,
          price: serviceItem.price != null ? serviceItem.price : null,
          categoryName: categoryName || null,
          serviceMatchScore: score,
        };
      }
    });

    return bestScore > 0 ? best : null;
  }

  async attachExpertsToSalons(salons) {
    const enriched = [];
    for (const salon of salons) {
      const serviceId = salon.matchedService?.id;
      let matchedExpert = null;

      if (serviceId && salon._id) {
        const expert = await Expert.findOne({
          salonId: salon._id,
          serviceId: { $in: [serviceId] },
          isBlock: false,
          isDelete: false,
        })
          .select('fname lname image review reviewCount')
          .sort({ review: -1 })
          .lean();

        if (expert) {
          matchedExpert = {
            id: expert._id.toString(),
            name: `${expert.fname || ''} ${expert.lname || ''}`.trim(),
            image: expert.image || '',
            review: expert.review || 0,
            reviewCount: expert.reviewCount || 0,
          };
        }
      }

      enriched.push({ ...salon, matchedExpert });
    }
    return enriched;
  }

  /**
   * Match salons and experts — max 4, seuil de confiance, pas de fallback générique.
   */
  async getSalonMatches(services, context, analysis = null) {
    let locationUsed = false;
    try {
      const serviceIds = services?.length ? services.map((s) => s._id) : [];
      if (!serviceIds.length) {
        console.log('[Selfie Analysis] No catalog services matched — skipping salon proposals');
        return { salons: [], experts: [], locationUsed: false };
      }

      let salons = await Salon.find({
        'serviceIds.id': { $in: serviceIds },
        isActive: true,
        isDelete: false,
      })
        .populate({
          path: 'serviceIds.id',
          populate: { path: 'categoryId', select: 'name' },
        })
        .lean();

      if (!salons.length) {
        console.log('[Selfie Analysis] No salons offer matched catalog services');
        return { salons: [], experts: [], locationUsed: false };
      }

      const searchTerms = this.extractSearchTermsFromAnalysis(analysis);
      salons = this.scoreSalonsByServiceTypes(salons, services, analysis, searchTerms);

      // Garder uniquement les salons avec une prestation catalogue identifiée
      salons = salons
        .filter((s) => s.matchedService && (s.serviceMatchScore || 0) > 0)
        .slice(0, MAX_SALON_PROPOSALS * 2);

      if (context.latitude && context.longitude) {
        const userLocation = {
          latitude: parseFloat(context.latitude),
          longitude: parseFloat(context.longitude),
        };
        const isValidLocation =
          !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude);

        if (isValidLocation) {
          locationUsed = true;
          salons = salons.map((salon) => {
            if (
              salon.locationCoordinates?.latitude &&
              salon.locationCoordinates?.longitude
            ) {
              const salonLat = parseFloat(salon.locationCoordinates.latitude);
              const salonLng = parseFloat(salon.locationCoordinates.longitude);
              if (!isNaN(salonLat) && !isNaN(salonLng)) {
                try {
                  const distanceInMeters = geolib.getDistance(userLocation, {
                    latitude: salonLat,
                    longitude: salonLng,
                  });
                  salon.distance = distanceInMeters / 1000;
                } catch (e) {
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

          const withDist = salons.filter((s) => s.distance != null);
          const withoutDist = salons.filter((s) => s.distance == null);
          let nearby = withDist.filter((s) => s.distance <= IDF_RADIUS_KM);
          if (!nearby.length) nearby = withDist.filter((s) => s.distance <= 100);
          const pool = nearby.length ? nearby : withDist;

          const sortFn = (a, b) => {
            if (a.distance != null && b.distance != null && a.distance !== b.distance) {
              return a.distance - b.distance;
            }
            if ((b.confidenceScore || 0) !== (a.confidenceScore || 0)) {
              return (b.confidenceScore || 0) - (a.confidenceScore || 0);
            }
            return (b.review || 0) - (a.review || 0);
          };

          pool.sort(sortFn);
          withoutDist.sort(sortFn);
          salons = [...pool, ...withoutDist.slice(0, 1)];
        }
      } else {
        salons.sort((a, b) => {
          if ((b.confidenceScore || 0) !== (a.confidenceScore || 0)) {
            return (b.confidenceScore || 0) - (a.confidenceScore || 0);
          }
          return (b.review || 0) - (a.review || 0);
        });
      }

      salons = await this.attachExpertsToSalons(salons);

      salons = salons
        .map((salon) => ({
          ...salon,
          confidenceScore: this.computeConfidenceScore(salon, salon.matchedService),
        }))
        .filter((s) => s.confidenceScore >= MIN_CONFIDENCE_SCORE)
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, MAX_SALON_PROPOSALS);

      const generateSlug = (name) => {
        if (!name) return '';
        return name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      };
      const baseURL = (process.env.baseURL || 'https://skedisy.com').replace(/\/+$/, '');

      const formattedSalons = salons.map((salon) => {
        const addressDetails = salon.addressDetails || {};
        const fullAddress = [
          addressDetails.addressLine1,
          addressDetails.city,
          addressDetails.country,
        ]
          .filter(Boolean)
          .join(', ');
        const salonSlug = generateSlug(salon.name);
        const salonShortId = salon._id.toString().substring(0, 6);

        return {
          _id: salon._id,
          id: salon._id.toString(),
          name: salon.name || '',
          mainImage:
            salon.mainImage ||
            salon.heroImage ||
            (Array.isArray(salon.image) ? salon.image.find((img) => img && String(img).trim()) : '') ||
            '',
          image:
            salon.mainImage ||
            salon.heroImage ||
            (Array.isArray(salon.image) ? salon.image.find((img) => img && String(img).trim()) : '') ||
            '',
          review: salon.review || 0,
          reviewCount: salon.reviewCount || 0,
          addressDetails,
          address: fullAddress,
          locationCoordinates: salon.locationCoordinates || {},
          distance: salon.distance ?? null,
          shareUrl: `${baseURL}/salon/${salonSlug}-${salonShortId}`,
          matchingServiceCount: salon.matchingServiceCount || 0,
          matchingServiceTypes: salon.matchingServiceTypes || [],
          matchSummary: salon.matchSummary || null,
          confidenceScore: salon.confidenceScore,
          matchReason: salon.matchReason || null,
          matchedService: salon.matchedService || null,
          matchedExpert: salon.matchedExpert || null,
        };
      });

      const experts = formattedSalons
        .filter((s) => s.matchedExpert)
        .map((s) => ({
          ...s.matchedExpert,
          salonId: s.id,
          salonName: s.name,
          serviceId: s.matchedService?.id,
        }));

      return { salons: formattedSalons, experts, locationUsed };
    } catch (error) {
      console.error('[Selfie Analysis] Salon matching error:', error);
      return { salons: [], experts: [], locationUsed: false };
    }
  }
  
  /**
   * Score salons : prestations recommandées + catégories + description + texte des services vs analyse photo.
   */
  scoreSalonsByServiceTypes(salons, recommendedServices, analysis = null, searchTerms = []) {
    if (!salons || salons.length === 0) return salons;

    const terms =
      searchTerms?.length
        ? searchTerms
        : analysis
          ? this.extractSearchTermsFromAnalysis(analysis)
          : [];

    const recommendedServiceIds = new Set(
      (recommendedServices || []).map((s) => String(s._id))
    );

    const primaryCats = (analysis?.recommendedNeeds?.primaryCategories || []).map((c) =>
      this.normalizeText(c)
    );

    const scoredSalons = salons.map((salon) => {
      let serviceMatchScore = 0;
      let matchingServiceCount = 0;
      const matchingServiceTypes = new Set();

      const aboutText = salon.about || '';
      serviceMatchScore += this.textMatchScore(aboutText, terms) * 2;

      const addrBlob = [
        salon.addressDetails?.addressLine1,
        salon.addressDetails?.city,
        salon.addressDetails?.country,
      ]
        .filter(Boolean)
        .join(' ');
      if (IDF_LOCATION_HINTS.some((h) => this.normalizeText(addrBlob).includes(h))) {
        serviceMatchScore += 6;
      }

      if (salon.serviceIds?.length) {
        salon.serviceIds.forEach((serviceItem) => {
          const svc = serviceItem.id;
          if (!svc?._id) return;

          const serviceId = svc._id.toString();
          const serviceName = svc.name || '';
          const categoryName = svc.categoryId?.name || '';
          const blob = `${serviceName} ${categoryName}`;
          const termHits = this.textMatchScore(blob, terms);
          const catHits = this.detectAfroCategoriesInText(blob);

          if (recommendedServiceIds.has(serviceId)) {
            matchingServiceCount++;
            serviceMatchScore += 12;
          } else if (termHits > 0) {
            matchingServiceCount++;
            serviceMatchScore += 6 + termHits;
          }

          catHits.forEach((c) => matchingServiceTypes.add(c));

          primaryCats.forEach((pc) => {
            if (this.normalizeText(categoryName).includes(pc) || catHits.has(pc)) {
              serviceMatchScore += 8;
              matchingServiceTypes.add(pc);
            }
          });

          if (analysis?.hair) {
            const hairType = this.normalizeText(analysis.hair.type);
            const normName = this.normalizeText(serviceName);
            if (
              (hairType === 'coily' || hairType === 'curly') &&
              (normName.includes('tresse') ||
                normName.includes('braid') ||
                normName.includes('knotless') ||
                normName.includes('lock') ||
                normName.includes('afro'))
            ) {
              serviceMatchScore += 6;
              matchingServiceTypes.add('tresses');
            }
          }
        });
      }

      if (matchingServiceCount > 1) {
        serviceMatchScore += (matchingServiceCount - 1) * 3;
      }

      const matchedService = this.pickBestMatchedService(
        salon,
        terms,
        recommendedServiceIds,
        primaryCats,
        analysis
      );

      const catLabels = [...matchingServiceTypes];
      salon.serviceMatchScore = serviceMatchScore;
      salon.matchingServiceCount = matchingServiceCount;
      salon.matchingServiceTypes = catLabels.length ? catLabels : primaryCats.slice(0, 2);
      salon.matchSummary = analysis?.recommendedNeeds?.summary || null;
      salon.matchedService = matchedService;
      salon.matchReason = matchedService
        ? `Prestation catalogue : ${matchedService.name}${matchedService.price ? ` · ${matchedService.price} €` : ''}`
        : null;
      salon.confidenceScore = this.computeConfidenceScore(
        { ...salon, matchedExpert: null },
        matchedService
      );

      return salon;
    });

    scoredSalons.sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }
      if (b.serviceMatchScore !== a.serviceMatchScore) {
        return b.serviceMatchScore - a.serviceMatchScore;
      }
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

    if (analysis.recommendedNeeds?.summary) {
      tips.push(analysis.recommendedNeeds.summary);
    }

    if (analysis.hair) {
      const ht = this.normalizeText(analysis.hair.type);
      if (ht === 'coily' || ht === 'curly') {
        tips.push('Privilégiez un salon afro qui maîtrise les tresses, locks ou styles protecteurs adaptés à vos cheveux texturés.');
        tips.push('Hydratez le cuir chevelu régulièrement entre deux rendez-vous en salon.');
      }
      if (analysis.hair.condition === 'damaged' || analysis.hair.condition === 'dry') {
        tips.push('Un soin en salon (masque, traitement) avant une pose longue durée peut renforcer vos cheveux.');
      }
    }

    if (analysis.skin?.concerns?.length) {
      tips.push('Pour la peau, les salons partenaires Skedisy proposent des soins visage et épilation en Île-de-France.');
    }

    tips.push('Réservez votre créneau sur l\'app Skedisy ou sur la fiche salon du site — sans échanges WhatsApp interminables.');

    return tips.length > 0 ? tips.slice(0, 5) : ['Trouvez un salon afro en Île-de-France sur Skedisy et réservez en quelques clics.'];
  }
}

module.exports = new SelfieAnalysisService();

