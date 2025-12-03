# Selfie Analysis → Beauty Recommendations → Salon Matching → Booking Flow

## 🎯 Complete User Journey

```
📸 Selfie Upload 
    ↓
🔍 AI Analysis (Skin, Hair, Face Shape, Features)
    ↓
💡 Personalized Beauty Recommendations
    ↓
🏪 Salon & Expert Matching
    ↓
📅 Service Selection & Booking
    ↓
✅ Complete Booking
```

## 📋 Detailed Flow Breakdown

### Step 1: Selfie Analysis 📸

**What happens:**
- User takes/uploads a selfie through the AI Concierge
- Image is analyzed using AI Vision (GPT-4 Vision, Gemini Vision, or Claude Vision)
- AI identifies:
  - **Skin Analysis:**
    - Skin type (oily, dry, combination, sensitive)
    - Skin tone/undertone
    - Skin concerns (acne, wrinkles, dark spots, etc.)
    - Skin condition assessment
  - **Hair Analysis:**
    - Hair type (straight, wavy, curly, coily)
    - Hair texture (fine, medium, thick)
    - Hair color and condition
    - Scalp health indicators
  - **Facial Features:**
    - Face shape (oval, round, square, heart, etc.)
    - Eye shape and features
    - Lip shape
    - Overall facial structure
  - **Beauty Profile:**
    - Age estimation (for appropriate recommendations)
    - Overall beauty assessment
    - Areas that could benefit from services

**Technical Implementation:**
- Use OpenAI GPT-4 Vision API or Google Gemini Vision
- Process image → Extract features → Generate analysis report

### Step 2: Beauty Recommendations 💡

**What happens:**
- Based on analysis, AI recommends:
  - **Recommended Services:**
    - Facial treatments (based on skin type/concerns)
    - Hair services (cuts, colors, treatments)
    - Makeup services (if applicable)
    - Skincare treatments
    - Specialized services (eyebrow shaping, lash extensions, etc.)
  - **Service Priority:**
    - Most beneficial services first
    - Services that address specific concerns
    - Services that enhance natural features
  - **Beauty Tips:**
    - Personalized skincare routine suggestions
    - Hair care recommendations
    - Makeup tips based on features
  - **Occasion-Based Suggestions:**
    - If user mentions event (wedding, party, etc.)
    - Complete beauty packages

**Technical Implementation:**
- AI matches analysis results with available services in database
- Considers user preferences, budget, and occasion
- Generates ranked list of recommendations

### Step 3: Salon & Expert Matching 🏪

**What happens:**
- AI matches user with best salons/experts based on:
  - **Service Expertise:**
    - Salons that specialize in recommended services
    - Experts with relevant skills and experience
  - **Location:**
    - Nearby salons (using user location)
    - Convenient locations
  - **Ratings & Reviews:**
    - Top-rated salons for specific services
    - Expert ratings and specialties
  - **Availability:**
    - Salons with available slots
    - Expert availability
  - **Budget:**
    - Salons within price range
    - Service pricing comparison
  - **User History:**
    - Previously visited salons
    - Favorite experts
    - Past service preferences

**Technical Implementation:**
- Query database for matching salons/experts
- Rank by relevance score (expertise + location + ratings + availability)
- Present top 3-5 matches with detailed info

### Step 4: Booking Integration 📅

**What happens:**
- User selects recommended service
- User chooses preferred salon/expert
- AI assists with:
  - **Service Details:**
    - Duration, price, description
    - What to expect
    - Preparation tips
  - **Booking Time Suggestions:**
    - Optimal times based on availability
    - Best times for specific services
    - Quick booking options
  - **Complete Booking:**
    - Navigate to existing booking flow
    - Pre-fill service, salon, expert selections
    - Streamlined booking process

**Technical Implementation:**
- Integrate with existing booking system
- Pre-populate booking form with AI recommendations
- Seamless transition to payment

## 🔧 Technical Implementation

### Backend: AI Vision Analysis Service

**File:** `dev/admin/backend/services/selfieAnalysis.service.js`

```javascript
const OpenAI = require('openai');
const Service = require('../models/service.model');
const Salon = require('../models/salon.model');
const Expert = require('../models/expert.model');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class SelfieAnalysisService {
  /**
   * Analyze selfie image and extract beauty features
   */
  async analyzeSelfie(imagePath, userId = null, context = {}) {
    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Create analysis prompt
      const analysisPrompt = `Analyze this selfie photo and provide a detailed beauty analysis. 
      Focus on:
      1. Skin Analysis:
         - Skin type (oily, dry, combination, sensitive, normal)
         - Skin tone and undertone
         - Visible skin concerns (acne, wrinkles, dark spots, pigmentation, etc.)
         - Overall skin condition
         - Skin texture assessment
      
      2. Hair Analysis:
         - Hair type (straight, wavy, curly, coily)
         - Hair texture (fine, medium, thick)
         - Hair color
         - Hair condition (healthy, damaged, etc.)
         - Scalp visibility/health indicators
      
      3. Facial Features:
         - Face shape (oval, round, square, heart, diamond, oblong)
         - Eye shape and features
         - Lip shape and size
         - Eyebrow shape
         - Overall facial structure
      
      4. Beauty Profile:
         - Age estimation (for appropriate recommendations)
         - Overall beauty assessment
         - Areas that could benefit from professional services
         - Natural features to enhance
      
      Provide your analysis in JSON format:
      {
        "skin": {
          "type": "combination",
          "tone": "medium",
          "undertone": "warm",
          "concerns": ["acne", "dark spots"],
          "condition": "good"
        },
        "hair": {
          "type": "wavy",
          "texture": "medium",
          "color": "brown",
          "condition": "healthy"
        },
        "face": {
          "shape": "oval",
          "eyeShape": "almond",
          "lipShape": "full"
        },
        "recommendations": {
          "priority": ["facial treatment", "hair cut", "eyebrow shaping"],
          "tips": ["Use oil-free moisturizer", "Consider color treatment"]
        }
      }`;

      // Call OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview", // or "gpt-4o" for latest
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      // Parse AI response
      const analysisText = response.choices[0].message.content;
      let analysis = {};
      
      try {
        // Try to extract JSON from response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse text response
          analysis = this.parseTextAnalysis(analysisText);
        }
      } catch (e) {
        analysis = this.parseTextAnalysis(analysisText);
      }

      // Get recommendations based on analysis
      const recommendations = await this.getServiceRecommendations(analysis, userId, context);

      return {
        analysis: analysis,
        recommendations: recommendations,
        rawResponse: analysisText
      };
    } catch (error) {
      console.error('Selfie Analysis Error:', error);
      throw new Error('Failed to analyze selfie');
    }
  }

  /**
   * Get service recommendations based on analysis
   */
  async getServiceRecommendations(analysis, userId, context) {
    try {
      // Build query based on analysis
      const serviceQueries = [];
      
      // Skin-based recommendations
      if (analysis.skin) {
        if (analysis.skin.concerns && analysis.skin.concerns.length > 0) {
          // Map skin concerns to services
          const concernServiceMap = {
            'acne': ['Acne Treatment', 'Facial', 'Deep Cleansing'],
            'wrinkles': ['Anti-Aging Facial', 'Botox', 'Facial Massage'],
            'dark spots': ['Brightening Facial', 'Chemical Peel', 'Laser Treatment'],
            'pigmentation': ['Pigmentation Treatment', 'Facial', 'Skin Whitening'],
            'dry': ['Hydrating Facial', 'Moisturizing Treatment'],
            'oily': ['Oil Control Facial', 'Deep Cleansing', 'Pore Treatment']
          };
          
          analysis.skin.concerns.forEach(concern => {
            const services = concernServiceMap[concern.toLowerCase()] || ['Facial'];
            serviceQueries.push(...services);
          });
        }
        
        // Add general facial services
        serviceQueries.push('Facial', 'Skin Care');
      }

      // Hair-based recommendations
      if (analysis.hair) {
        serviceQueries.push('Hair Cut', 'Hair Styling');
        
        if (analysis.hair.condition === 'damaged') {
          serviceQueries.push('Hair Treatment', 'Hair Spa', 'Hair Repair');
        }
        
        if (analysis.hair.color) {
          serviceQueries.push('Hair Color', 'Hair Highlights');
        }
      }

      // Face shape-based recommendations
      if (analysis.face && analysis.face.shape) {
        serviceQueries.push('Hair Cut', 'Hair Styling'); // Face shape affects haircut recommendations
      }

      // Query database for matching services
      const services = await Service.find({
        name: { $in: serviceQueries },
        isActive: true,
        isDelete: false
      }).limit(10);

      // Get salon matches
      const salonMatches = await this.getSalonMatches(services, context);

      return {
        services: services,
        salons: salonMatches.salons,
        experts: salonMatches.experts,
        beautyTips: this.generateBeautyTips(analysis)
      };
    } catch (error) {
      console.error('Recommendation Error:', error);
      return { services: [], salons: [], experts: [], beautyTips: [] };
    }
  }

  /**
   * Match salons and experts based on recommended services
   */
  async getSalonMatches(services, context) {
    try {
      const serviceIds = services.map(s => s._id);
      
      // Find salons that offer these services
      const salons = await Salon.find({
        'serviceIds.id': { $in: serviceIds },
        isActive: true,
        isDelete: false
      })
      .populate('serviceIds.id')
      .sort({ review: -1 })
      .limit(5);

      // Find experts specialized in these services
      const experts = await Expert.find({
        serviceId: { $in: serviceIds },
        isActive: true,
        isDelete: false
      })
      .populate('serviceId')
      .sort({ review: -1 })
      .limit(5);

      return { salons, experts };
    } catch (error) {
      console.error('Salon Matching Error:', error);
      return { salons: [], experts: [] };
    }
  }

  /**
   * Generate personalized beauty tips
   */
  generateBeautyTips(analysis) {
    const tips = [];
    
    if (analysis.skin) {
      if (analysis.skin.type === 'oily') {
        tips.push('Use oil-free products and avoid heavy moisturizers');
      } else if (analysis.skin.type === 'dry') {
        tips.push('Use hydrating serums and moisturizers regularly');
      }
      
      if (analysis.skin.concerns && analysis.skin.concerns.includes('acne')) {
        tips.push('Consider regular facials to control acne');
      }
    }
    
    if (analysis.hair && analysis.hair.condition === 'damaged') {
      tips.push('Consider hair spa or treatment to restore hair health');
    }
    
    return tips;
  }

  /**
   * Parse text-based analysis if JSON parsing fails
   */
  parseTextAnalysis(text) {
    // Simple text parsing fallback
    const analysis = {
      skin: { type: 'normal', concerns: [] },
      hair: { type: 'straight', condition: 'healthy' },
      face: { shape: 'oval' }
    };
    
    // Extract keywords (simplified - can be enhanced)
    if (text.toLowerCase().includes('oily')) analysis.skin.type = 'oily';
    if (text.toLowerCase().includes('dry')) analysis.skin.type = 'dry';
    if (text.toLowerCase().includes('acne')) analysis.skin.concerns.push('acne');
    
    return analysis;
  }
}

module.exports = new SelfieAnalysisService();
```

### Backend: API Controller

**File:** `dev/admin/backend/controller/user/selfieAnalysis.controller.js`

```javascript
const selfieAnalysisService = require('../../services/selfieAnalysis.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'storage/selfies';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
    }
  }
});

exports.analyzeSelfie = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(200).json({
        status: false,
        message: 'Please upload a selfie image'
      });
    }

    const { userId, occasion, budget, location } = req.body;
    const imagePath = req.file.path;

    const context = {
      occasion: occasion || null,
      budget: budget || null,
      location: location || null
    };

    // Analyze selfie
    const result = await selfieAnalysisService.analyzeSelfie(
      imagePath,
      userId || null,
      context
    );

    // Clean up uploaded file after analysis (optional - you might want to keep it)
    // fs.unlinkSync(imagePath);

    return res.status(200).json({
      status: true,
      message: 'Selfie analyzed successfully',
      data: result
    });
  } catch (error) {
    console.error('Selfie Analysis Controller Error:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Export multer middleware
exports.upload = upload.single('selfie');
```

### Backend: API Route

**File:** `dev/admin/backend/route/client/selfieAnalysis.route.js`

```javascript
const express = require('express');
const router = express.Router();
const selfieAnalysisController = require('../../controller/user/selfieAnalysis.controller');

router.post(
  '/analyze',
  selfieAnalysisController.upload,
  selfieAnalysisController.analyzeSelfie
);

module.exports = router;
```

### Flutter: Selfie Analysis Screen

**File:** `dev/flutter/multi_salon_customer/lib/ui/ai_concierge_screen/widget/selfie_analysis_widget.dart`

```dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'dart:convert';

class SelfieAnalysisWidget extends StatefulWidget {
  const SelfieAnalysisWidget({super.key});

  @override
  State<SelfieAnalysisWidget> createState() => _SelfieAnalysisWidgetState();
}

class _SelfieAnalysisWidgetState extends State<SelfieAnalysisWidget> {
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  bool _isAnalyzing = false;
  Map<String, dynamic>? _analysisResult;

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        maxWidth: 1024,
        maxHeight: 1024,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _analysisResult = null;
        });
        _analyzeSelfie();
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to pick image: $e');
    }
  }

  Future<void> _analyzeSelfie() async {
    if (_selectedImage == null) return;

    setState(() {
      _isAnalyzing = true;
    });

    try {
      String userId = Constant.storage.read<String>('userId') ?? "";
      
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstant.BASE_URL}user/selfieAnalysis/analyze'),
      );

      request.headers['key'] = ApiConstant.SECRET_KEY;
      request.fields['userId'] = userId;
      request.files.add(
        await http.MultipartFile.fromPath('selfie', _selectedImage!.path),
      );

      var response = await request.send();
      var responseData = await response.stream.bytesToString();
      var jsonResponse = json.decode(responseData);

      if (jsonResponse['status'] == true) {
        setState(() {
          _analysisResult = jsonResponse['data'];
          _isAnalyzing = false;
        });
      } else {
        throw Exception(jsonResponse['message'] ?? 'Analysis failed');
      }
    } catch (e) {
      setState(() {
        _isAnalyzing = false;
      });
      Get.snackbar('Error', 'Failed to analyze selfie: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Image picker section
        Container(
          height: 300,
          margin: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primaryAppColor.withOpacity(0.3),
              width: 2,
              style: BorderStyle.solid,
            ),
          ),
          child: _selectedImage == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.camera_alt,
                        size: 64,
                        color: AppColors.primaryAppColor,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Take or Upload Selfie',
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayBold,
                          fontSize: 18,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Get personalized beauty recommendations',
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 14,
                          color: AppColors.currencyGrey,
                        ),
                      ),
                      SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _pickImage,
                        icon: Icon(Icons.camera_alt),
                        label: Text('Take Selfie'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryAppColor,
                          foregroundColor: AppColors.whiteColor,
                          padding: EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              : Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.file(
                        _selectedImage!,
                        width: double.infinity,
                        height: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    if (_isAnalyzing)
                      Container(
                        color: AppColors.blackColor.withOpacity(0.5),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(
                                color: AppColors.whiteColor,
                              ),
                              SizedBox(height: 16),
                              Text(
                                'Analyzing your beauty profile...',
                                style: TextStyle(
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.sfProDisplay,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
        ),

        // Analysis results
        if (_analysisResult != null)
          Expanded(
            child: AnalysisResultsWidget(analysisResult: _analysisResult!),
          ),
      ],
    );
  }
}

class AnalysisResultsWidget extends StatelessWidget {
  final Map<String, dynamic> analysisResult;

  const AnalysisResultsWidget({super.key, required this.analysisResult});

  @override
  Widget build(BuildContext context) {
    final analysis = analysisResult['analysis'] ?? {};
    final recommendations = analysisResult['recommendations'] ?? {};

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skin Analysis
          if (analysis['skin'] != null)
            _buildAnalysisCard(
              title: 'Skin Analysis',
              icon: Icons.face,
              content: _buildSkinAnalysis(analysis['skin']),
            ),

          SizedBox(height: 16),

          // Hair Analysis
          if (analysis['hair'] != null)
            _buildAnalysisCard(
              title: 'Hair Analysis',
              icon: Icons.content_cut,
              content: _buildHairAnalysis(analysis['hair']),
            ),

          SizedBox(height: 16),

          // Recommended Services
          if (recommendations['services'] != null)
            _buildRecommendationsCard(recommendations),

          SizedBox(height: 16),

          // Beauty Tips
          if (recommendations['beautyTips'] != null &&
              (recommendations['beautyTips'] as List).isNotEmpty)
            _buildTipsCard(recommendations['beautyTips']),
        ],
      ),
    );
  }

  Widget _buildAnalysisCard({
    required String title,
    required IconData icon,
    required Widget content,
  }) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primaryAppColor, size: 24),
              SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  fontSize: 18,
                  color: AppColors.primaryTextColor,
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          content,
        ],
      ),
    );
  }

  Widget _buildSkinAnalysis(Map<String, dynamic> skin) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoRow('Type', skin['type'] ?? 'N/A'),
        _buildInfoRow('Tone', skin['tone'] ?? 'N/A'),
        if (skin['concerns'] != null && (skin['concerns'] as List).isNotEmpty)
          _buildInfoRow(
            'Concerns',
            (skin['concerns'] as List).join(', '),
          ),
        _buildInfoRow('Condition', skin['condition'] ?? 'N/A'),
      ],
    );
  }

  Widget _buildHairAnalysis(Map<String, dynamic> hair) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoRow('Type', hair['type'] ?? 'N/A'),
        _buildInfoRow('Texture', hair['texture'] ?? 'N/A'),
        _buildInfoRow('Color', hair['color'] ?? 'N/A'),
        _buildInfoRow('Condition', hair['condition'] ?? 'N/A'),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplay,
              fontSize: 14,
              color: AppColors.currencyGrey,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              fontSize: 14,
              color: AppColors.primaryTextColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationsCard(Map<String, dynamic> recommendations) {
    final services = recommendations['services'] as List? ?? [];
    final salons = recommendations['salons'] as List? ?? [];

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Recommended Services',
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              fontSize: 18,
              color: AppColors.primaryTextColor,
            ),
          ),
          SizedBox(height: 16),
          ...services.map((service) => _buildServiceCard(service)).toList(),
          if (salons.isNotEmpty) ...[
            SizedBox(height: 24),
            Text(
              'Recommended Salons',
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayBold,
                fontSize: 18,
                color: AppColors.primaryTextColor,
              ),
            ),
            SizedBox(height: 16),
            ...salons.map((salon) => _buildSalonCard(salon)).toList(),
          ],
        ],
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> service) {
    return GestureDetector(
      onTap: () {
        // Navigate to service detail or booking
        // Get.toNamed(AppRoutes.categoryDetail, arguments: service['_id']);
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.primaryAppColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: AppColors.primaryAppColor.withOpacity(0.3),
          ),
        ),
        child: Row(
          children: [
            Icon(Icons.spa, color: AppColors.primaryAppColor),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service['name'] ?? 'Service',
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 14,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  if (service['price'] != null)
                    Text(
                      '\$${service['price']}',
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 12,
                        color: AppColors.currencyGrey,
                      ),
                    ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                // Navigate to booking with pre-filled service
                // Get.toNamed(AppRoutes.booking, arguments: {
                //   'serviceId': service['_id'],
                //   'fromAI': true,
                // });
              },
              child: Text('Book Now'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryAppColor,
                foregroundColor: AppColors.whiteColor,
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSalonCard(Map<String, dynamic> salon) {
    return GestureDetector(
      onTap: () {
        // Navigate to salon detail
        // Get.toNamed(AppRoutes.branchDetail, arguments: salon['_id']);
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.whiteColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: AppColors.grey.withOpacity(0.2),
          ),
        ),
        child: Row(
          children: [
            if (salon['image'] != null && salon['image'].isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  salon['image'][0] ?? salon['mainImage'] ?? '',
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                ),
              )
            else
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.grey.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.store, color: AppColors.primaryAppColor),
              ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    salon['name'] ?? 'Salon',
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 14,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  if (salon['review'] != null)
                    Row(
                      children: [
                        Icon(Icons.star, size: 14, color: Colors.amber),
                        SizedBox(width: 4),
                        Text(
                          '${salon['review']}',
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 12,
                            color: AppColors.currencyGrey,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildTipsCard(List<dynamic> tips) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryAppColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryAppColor.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb, color: AppColors.primaryAppColor),
              SizedBox(width: 12),
              Text(
                'Beauty Tips',
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  fontSize: 18,
                  color: AppColors.primaryTextColor,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          ...tips.map((tip) => Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle,
                        size: 16, color: AppColors.primaryAppColor),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        tip.toString(),
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 14,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                    ),
                  ],
                ),
              )).toList(),
        ],
      ),
    );
  }
}
```

## 🔄 Complete Integration Flow

### 1. User Flow
```
1. User opens AI Concierge
2. Clicks "Analyze My Selfie" button
3. Takes/selects selfie photo
4. AI analyzes image (shows loading)
5. Displays analysis results:
   - Skin analysis
   - Hair analysis
   - Facial features
6. Shows recommended services
7. Shows matched salons/experts
8. User clicks "Book Now" on service
9. Navigates to booking screen (pre-filled)
10. Completes booking
```

### 2. Data Flow
```
Flutter App
  ↓ (upload image)
Backend API
  ↓ (send to OpenAI Vision)
OpenAI GPT-4 Vision
  ↓ (returns analysis)
Backend Service
  ↓ (queries database)
MongoDB (Services, Salons, Experts)
  ↓ (matches & ranks)
Backend Service
  ↓ (returns recommendations)
Flutter App
  ↓ (displays & navigates)
Booking Screen
```

## 💰 Cost Considerations

**OpenAI GPT-4 Vision Pricing:**
- Input: $0.01 per image
- Output: ~$0.03 per 1K tokens
- Average cost per analysis: $0.02-0.05

**Monthly Estimate (1000 users, 1 analysis/month):**
- ~$20-50/month

## 🎨 UI/UX Enhancements

1. **Before/After Preview** - Show potential results
2. **Progress Indicators** - Show analysis progress
3. **Comparison View** - Compare multiple selfies
4. **Save Analysis** - Store analysis in user profile
5. **Share Results** - Share recommendations

## 🔒 Privacy & Security

1. **Image Storage** - Delete images after analysis (or store securely)
2. **Data Privacy** - Don't store sensitive analysis data
3. **User Consent** - Get permission before analysis
4. **Secure Upload** - Use HTTPS for image uploads

## ✅ Implementation Checklist

- [ ] Set up OpenAI Vision API
- [ ] Create backend analysis service
- [ ] Create image upload endpoint
- [ ] Build Flutter selfie capture UI
- [ ] Integrate with existing booking flow
- [ ] Test end-to-end flow
- [ ] Add error handling
- [ ] Optimize image processing
- [ ] Add loading states
- [ ] Test with various images

---

This flow creates a seamless experience from selfie to booking! 🚀

