const selfieAnalysisService = require('../../services/selfieAnalysis.service');
const path = require('path');
const fs = require('fs');

/**
 * Analyze selfie image and provide beauty recommendations
 */
exports.analyzeSelfie = async (req, res) => {
  try {
    // Check if image file is uploaded
    if (!req.file) {
      return res.status(200).send({
        status: false,
        message: 'Please upload a selfie image'
      });
    }

    const imagePath = req.file.path;
    const userId = req.body.userId || req.query.userId || null;
    
    // Context information (optional)
    const context = {
      latitude: req.body.latitude || req.query.latitude || null,
      longitude: req.body.longitude || req.query.longitude || null,
      city: req.body.city || req.query.city || null,
      occasion: req.body.occasion || req.query.occasion || null
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
        provider: result.provider
      }
    });
  } catch (error) {
    console.error('[AI Concierge] Analyze selfie error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[AI Concierge] Error deleting file:', unlinkError);
      }
    }

    return res.status(200).send({
      status: false,
      message: error.message || 'Failed to analyze selfie. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    const systemPrompt = `You are a professional beauty consultant AI assistant for a salon booking app. 
    Help users with beauty advice, service recommendations, and answer questions about skincare, haircare, and beauty treatments.
    Be friendly, professional, and provide helpful, accurate information.`;

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

    // Check Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // Quick test (we won't actually call, just check if configured)
        status.gemini = true;
        status.message = 'Gemini API configured';
      } catch (error) {
        status.message = 'Gemini API key invalid';
      }
    } else {
      status.message = 'Gemini API key not configured';
    }

    // Check Ollama (optional)
    if (process.env.OLLAMA_HOST) {
      try {
        const { Ollama } = require('ollama');
        const ollama = new Ollama({ host: process.env.OLLAMA_HOST });
        // Just check if module is available
        status.ollama = true;
        if (status.message) {
          status.message += ' | Ollama configured';
        } else {
          status.message = 'Ollama configured';
        }
      } catch (error) {
        // Ollama not installed or not available
        if (!status.message) {
          status.message = 'Ollama not available';
        }
      }
    }

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

