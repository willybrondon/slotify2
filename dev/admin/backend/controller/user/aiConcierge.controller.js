const selfieAnalysisService = require('../../services/selfieAnalysis.service');
const { validateImageFile, sanitizeImageFile } = require('../../utils/imageSecurity.util');
const path = require('path');
const fs = require('fs');

/**
 * Analyze selfie image and provide beauty recommendations
 */
exports.analyzeSelfie = async (req, res) => {
  try {
    // Check if image file is uploaded (multer stores in req.file for single upload)
    if (!req.file) {
      console.error('[AI Concierge] No file received. Check: 1) Field name must be "image" 2) Content-Type: multipart/form-data 3) File size under 10MB');
      return res.status(200).send({
        status: false,
        message: 'Please upload a selfie image. Make sure to select or take a photo first.'
      });
    }

    // Use absolute path for file access (handles different working directories)
    let imagePath = path.isAbsolute(req.file.path) ? req.file.path : path.resolve(process.cwd(), req.file.path);

    const validation = validateImageFile(imagePath, req.file.mimetype);
    if (!validation.ok) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(200).send({
        status: false,
        message: validation.error || 'Invalid image file',
      });
    }

    const sanitized = await sanitizeImageFile(imagePath);
    if (!sanitized.ok) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(200).send({
        status: false,
        message: sanitized.error || 'Failed to process image safely',
      });
    }
    imagePath = sanitized.path;

    const userId = req.body.userId || req.query.userId || null;
    
    // Context information (optional)
    const context = {
      latitude: req.body.latitude || req.query.latitude || null,
      longitude: req.body.longitude || req.query.longitude || null,
      city: req.body.city || req.query.city || null,
      occasion: req.body.occasion || req.query.occasion || null,
      hairType: req.body.hairType || req.query.hairType || null,
      hairCondition: req.body.hairCondition || req.query.hairCondition || null,
      styleInterest: req.body.styleInterest || req.query.styleInterest || null,
      scalpSensitivity: req.body.scalpSensitivity || req.query.scalpSensitivity || null,
      bookingGoal: req.body.bookingGoal || req.query.bookingGoal || null,
    };

    // Analyze the selfie
    const result = await selfieAnalysisService.analyzeSelfie(imagePath, userId, context);

    // Clean up uploaded file after analysis (optional - you may want to keep it)
    // fs.unlinkSync(imagePath);

    return res.status(200).send({
      status: true,
      message: 'Selfie analyzed successfully',
      data: {
        analysis: result.analysis,
        recommendations: result.recommendations,
        provider: result.provider,
        locationUsed: !!(result.recommendations && result.recommendations.locationUsed),
      }
    });
  } catch (error) {
    // Only log error if it's not a configuration issue (those are expected)
    if (!error.message || (!error.message.includes('not configured') && !error.message.includes('API key not configured'))) {
      console.error('[AI Concierge] Analyze selfie error:', error.message);
    }
    
    // Clean up file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[AI Concierge] Error deleting file:', unlinkError);
      }
    }

    // Provide helpful error message
    let errorMessage = error.message || 'Failed to analyze selfie. Please try again.';
    
    // Check if it's a configuration error - only add help if key is truly missing
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';
    if ((errorMessage.includes('Both AI services failed') || errorMessage.includes('not configured')) && !hasGeminiKey) {
      errorMessage += '\n\nTo fix this:\n1. Get a free Gemini API key from https://aistudio.google.com/app/apikey\n2. Add GEMINI_API_KEY=your_key_here to your .env file\n3. Restart the server';
    }

    return res.status(200).send({
      status: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      configurationHelp: {
        geminiConfigured: hasGeminiKey,
        ollamaConfigured: !!(process.env.OLLAMA_HOST && process.env.OLLAMA_HOST.trim() !== ''),
        setupGuide: 'See AI_CONCIERGE_SETUP.md for detailed setup instructions'
      }
    });
  }
};

/**
 * Get AI chat response for beauty consultation
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { message, userId, conversationHistory } = req.body;

    if (!message || message.trim() === '') {
      return res.status(200).send({
        status: false,
        message: 'Please provide a message'
      });
    }

    // For now, return a simple response
    // You can integrate with Gemini chat API here
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).send({
        status: false,
        message: 'AI service not configured. Please contact administrator.'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation context
    const systemPrompt = `You are the Skedisy AI concierge for Afro beauty in Île-de-France (France).
    Skedisy connects clients with Afro salons (braids, tresses, locks, wigs, barber, esthetics) — booking is on the Skedisy app or website.
    Give practical advice for textured/coily/curly hair, protective styles, salon visits in IDF.
    Be warm, clear, and community-aware. Do not recommend generic Western-only salons or treatments unsuited to Afro hair.
    When suggesting a salon visit, mention they can book on Skedisy.`;

    const chat = model.startChat({
      history: conversationHistory || [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    return res.status(200).send({
      status: true,
      message: 'AI response generated successfully',
      data: {
        response: text,
        provider: 'gemini'
      }
    });
  } catch (error) {
    console.error('[AI Concierge] Chat error:', error);
    return res.status(200).send({
      status: false,
      message: error.message || 'Failed to get AI response. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Health check for AI services
 */
exports.checkAIServiceStatus = async (req, res) => {
  try {
    const status = {
      gemini: false,
      ollama: false,
      message: ''
    };

    const messages = [];

    // Check Gemini (same simple pattern as Twilio/SendGrid)
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Quick test - just create instance, don't call API
        status.gemini = true;
        messages.push('✓ Gemini API configured');
      } catch (error) {
        messages.push('✗ Gemini API key invalid: ' + error.message);
      }
    } else {
      messages.push('✗ Gemini API key not configured (GEMINI_API_KEY missing)');
    }

    // Check Ollama (optional - same pattern as Twilio)
    if (process.env.OLLAMA_HOST) {
      try {
        const ollamaModule = require('ollama');
        let ollama;
        
        // Handle different export formats
        if (ollamaModule.default && typeof ollamaModule.default === 'function') {
          ollama = new ollamaModule.default({ host: process.env.OLLAMA_HOST });
        } else if (ollamaModule.Ollama && typeof ollamaModule.Ollama === 'function') {
          ollama = new ollamaModule.Ollama({ host: process.env.OLLAMA_HOST });
        } else if (typeof ollamaModule === 'function') {
          ollama = new ollamaModule({ host: process.env.OLLAMA_HOST });
        } else {
          ollama = ollamaModule;
        }
        
        // Try to connect to Ollama (if list method exists)
        if (ollama.list && typeof ollama.list === 'function') {
          try {
            await ollama.list();
            status.ollama = true;
            messages.push('✓ Ollama configured and reachable');
          } catch (connectionError) {
            messages.push('ℹ Ollama configured but not reachable (Ollama server may not be running)');
          }
        } else {
          status.ollama = true;
          messages.push('✓ Ollama package loaded');
        }
      } catch (error) {
        if (error.message.includes('Cannot find module')) {
          messages.push('ℹ Ollama package not installed (optional fallback - run: npm install ollama if needed)');
        } else {
          messages.push('ℹ Ollama: ' + error.message);
        }
      }
    } else {
      messages.push('ℹ Ollama not configured (optional - only needed as fallback if Gemini fails)');
    }

    status.message = messages.join(' | ');

    return res.status(200).send({
      status: status.gemini || status.ollama,
      data: status
    });
  } catch (error) {
    return res.status(200).send({
      status: false,
      message: error.message || 'Failed to check AI service status'
    });
  }
};

