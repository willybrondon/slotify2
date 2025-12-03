# AI Beauty Concierge Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for adding an AI Beauty Concierge feature to the salon booking app. This feature will provide personalized beauty recommendations, answer questions, and assist users in finding the perfect services and salons.

## ✅ Feasibility Assessment

**YES, this is absolutely possible with your current tech stack!**

Your app already has:
- ✅ Flutter frontend with GetX state management
- ✅ Node.js/Express backend with MongoDB
- ✅ Firebase integration (Auth, Storage, Messaging)
- ✅ RESTful API architecture
- ✅ Service, Salon, Expert, Booking data models
- ✅ Payment integrations

## 🎯 Core Features

1. **Intelligent Service Recommendations**
   - Suggest services based on user queries
   - Recommend based on skin type, hair type, occasion, etc.

2. **Salon & Expert Matching**
   - Match users with best salons/experts based on preferences
   - Consider location, ratings, availability, specialties

3. **Beauty Q&A**
   - Answer beauty-related questions
   - Provide tips and advice

4. **Booking Assistance**
   - Help users choose services
   - Suggest optimal booking times
   - Explain service details

5. **Personalized Beauty Profile**
   - Learn user preferences over time
   - Remember past bookings and preferences

## 📋 Implementation Steps

### Phase 1: Backend Setup (Week 1-2)

#### Step 1.1: Choose AI Provider
**Options:**
- **OpenAI GPT-4/GPT-3.5** (Recommended - Best quality, easy integration)
- **Google Gemini** (Good alternative, cost-effective)
- **Anthropic Claude** (Excellent for safety and quality)
- **Self-hosted LLM** (More control, but complex setup)

**Recommendation:** Start with OpenAI GPT-4 or GPT-3.5-turbo for best results.

#### Step 1.2: Install Backend Dependencies
```bash
cd dev/admin/backend
npm install openai axios
# or
npm install @google/generative-ai
```

#### Step 1.3: Create AI Service Module
**File:** `dev/admin/backend/services/aiConcierge.service.js`

```javascript
const OpenAI = require('openai');
const Service = require('../models/service.model');
const Salon = require('../models/salon.model');
const Expert = require('../models/expert.model');
const Booking = require('../models/booking.model');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for AI concierge
const SYSTEM_PROMPT = `You are a friendly and knowledgeable AI Beauty Concierge for a salon booking app. 
Your role is to:
1. Help users find the perfect beauty services
2. Recommend salons and experts based on their needs
3. Answer beauty-related questions
4. Assist with booking decisions
5. Provide personalized beauty advice

Always be helpful, professional, and concise. When recommending services, consider:
- User's preferences and requirements
- Service availability
- Salon locations and ratings
- Expert specialties
- Pricing and budget considerations

Format your responses in a friendly, conversational manner.`;

class AIConciergeService {
  async getRecommendation(userQuery, userId = null, context = {}) {
    try {
      // Get relevant data from database
      const services = await this.getAvailableServices();
      const salons = await this.getAvailableSalons(context.location);
      const userHistory = userId ? await this.getUserHistory(userId) : null;

      // Build context for AI
      const contextData = {
        availableServices: services,
        availableSalons: salons,
        userHistory: userHistory,
        location: context.location,
        budget: context.budget,
        occasion: context.occasion
      };

      // Create user message with context
      const userMessage = this.buildUserMessage(userQuery, contextData);

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview", // or "gpt-3.5-turbo" for cost savings
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0].message.content;

      // Parse response and extract actionable recommendations
      const recommendations = this.parseRecommendations(aiResponse, services, salons);

      return {
        response: aiResponse,
        recommendations: recommendations,
        suggestedServices: recommendations.services || [],
        suggestedSalons: recommendations.salons || []
      };
    } catch (error) {
      console.error('AI Concierge Error:', error);
      throw new Error('Failed to get AI recommendation');
    }
  }

  async getAvailableServices() {
    return await Service.find({ isActive: true, isDelete: false })
      .select('name description price duration category')
      .limit(50);
  }

  async getAvailableSalons(location = null) {
    let query = { isActive: true, isDelete: false };
    if (location) {
      // Add location-based filtering
    }
    return await Salon.find(query)
      .select('name addressDetails review reviewCount image')
      .limit(20);
  }

  async getUserHistory(userId) {
    return await Booking.find({ userId })
      .populate('serviceId')
      .populate('salonId')
      .sort({ createdAt: -1 })
      .limit(10);
  }

  buildUserMessage(query, context) {
    let message = `User query: "${query}"\n\n`;
    
    if (context.userHistory) {
      message += `User's booking history:\n${JSON.stringify(context.userHistory, null, 2)}\n\n`;
    }
    
    if (context.availableServices) {
      message += `Available services:\n${JSON.stringify(context.availableServices, null, 2)}\n\n`;
    }
    
    if (context.availableSalons) {
      message += `Available salons:\n${JSON.stringify(context.availableSalons, null, 2)}\n\n`;
    }
    
    if (context.location) {
      message += `User location: ${context.location}\n`;
    }
    
    if (context.budget) {
      message += `Budget: ${context.budget}\n`;
    }
    
    message += `\nPlease provide helpful recommendations based on the user's query and the available services/salons.`;
    
    return message;
  }

  parseRecommendations(aiResponse, services, salons) {
    // Extract service and salon recommendations from AI response
    // This can be enhanced with more sophisticated parsing
    const recommendations = {
      services: [],
      salons: []
    };

    // Simple keyword matching (can be enhanced with NLP)
    services.forEach(service => {
      if (aiResponse.toLowerCase().includes(service.name.toLowerCase())) {
        recommendations.services.push(service);
      }
    });

    salons.forEach(salon => {
      if (aiResponse.toLowerCase().includes(salon.name.toLowerCase())) {
        recommendations.salons.push(salon);
      }
    });

    return recommendations;
  }
}

module.exports = new AIConciergeService();
```

#### Step 1.4: Create API Controller
**File:** `dev/admin/backend/controller/user/aiConcierge.controller.js`

```javascript
const aiConciergeService = require('../../services/aiConcierge.service');
const mongoose = require('mongoose');

exports.chatWithConcierge = async (req, res) => {
  try {
    const { message, userId, location, budget, occasion } = req.body;

    if (!message || !message.trim()) {
      return res.status(200).json({
        status: false,
        message: 'Please provide a message'
      });
    }

    const context = {
      location: location || null,
      budget: budget || null,
      occasion: occasion || null
    };

    const userIdObj = userId ? new mongoose.Types.ObjectId(userId) : null;

    const result = await aiConciergeService.getRecommendation(
      message,
      userIdObj,
      context
    );

    return res.status(200).json({
      status: true,
      message: 'AI recommendation retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('AI Concierge Controller Error:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal server error'
    });
  }
};

exports.getQuickSuggestions = async (req, res) => {
  try {
    const { occasion, skinType, hairType, budget } = req.query;
    const userId = req.query.userId ? new mongoose.Types.ObjectId(req.query.userId) : null;

    const query = `I need ${occasion || 'beauty'} services. 
    ${skinType ? `My skin type is ${skinType}.` : ''}
    ${hairType ? `My hair type is ${hairType}.` : ''}
    ${budget ? `My budget is ${budget}.` : ''}
    Please recommend the best services and salons for me.`;

    const context = { location: null, budget, occasion };
    const result = await aiConciergeService.getRecommendation(query, userId, context);

    return res.status(200).json({
      status: true,
      message: 'Quick suggestions retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Quick Suggestions Error:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal server error'
    });
  }
};
```

#### Step 1.5: Create API Routes
**File:** `dev/admin/backend/route/client/aiConcierge.route.js`

```javascript
const express = require('express');
const router = express.Router();
const aiConciergeController = require('../../controller/user/aiConcierge.controller');

router.post('/chat', aiConciergeController.chatWithConcierge);
router.get('/quickSuggestions', aiConciergeController.getQuickSuggestions);

module.exports = router;
```

#### Step 1.6: Register Routes
**File:** `dev/admin/backend/route/index.js` (or similar)

Add:
```javascript
const aiConciergeRoute = require('./client/aiConcierge.route');
app.use('/user/aiConcierge', aiConciergeRoute);
```

#### Step 1.7: Add Environment Variable
**File:** `.env` (create if doesn't exist)

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Phase 2: Flutter Frontend (Week 2-3)

#### Step 2.1: Add Dependencies
**File:** `dev/flutter/multi_salon_customer/pubspec.yaml`

Add to dependencies:
```yaml
dependencies:
  # ... existing dependencies
  flutter_chat_bubble: ^1.0.0  # For chat UI
  # or
  flutter_chat_ui: ^1.6.0  # More comprehensive chat UI
  speech_to_text: ^7.0.0  # Already in your pubspec.yaml
```

#### Step 2.2: Create AI Concierge Screen
**File:** `dev/flutter/multi_salon_customer/lib/ui/ai_concierge_screen/ai_concierge_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/ui/ai_concierge_screen/widget/ai_concierge_widget.dart';

class AIConciergeScreen extends StatelessWidget {
  const AIConciergeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(AIConciergeController());
    return Scaffold(
      appBar: AppBar(
        title: Text('AI Beauty Concierge'),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: AIConciergeChatWidget(),
          ),
          AIConciergeInputWidget(),
        ],
      ),
    );
  }
}
```

#### Step 2.3: Create Controller
**File:** `dev/flutter/multi_salon_customer/lib/ui/ai_concierge_screen/controller/ai_concierge_controller.dart`

```dart
import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';

class ChatMessage {
  final String message;
  final bool isUser;
  final DateTime timestamp;
  final Map<String, dynamic>? recommendations;

  ChatMessage({
    required this.message,
    required this.isUser,
    required this.timestamp,
    this.recommendations,
  });
}

class AIConciergeController extends GetxController {
  RxList<ChatMessage> messages = <ChatMessage>[].obs;
  RxBool isLoading = false.obs;
  final TextEditingController messageController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    // Add welcome message
    messages.add(ChatMessage(
      message: "Hello! I'm your AI Beauty Concierge. How can I help you today?",
      isUser: false,
      timestamp: DateTime.now(),
    ));
  }

  Future<void> sendMessage(String message) async {
    if (message.trim().isEmpty) return;

    // Add user message
    messages.add(ChatMessage(
      message: message,
      isUser: true,
      timestamp: DateTime.now(),
    ));
    messageController.clear();

    // Show loading
    isLoading.value = true;
    update();

    try {
      String userId = Constant.storage.read<String>('userId') ?? "";
      
      final response = await http.post(
        Uri.parse('${ApiConstant.BASE_URL}user/aiConcierge/chat'),
        headers: {
          'key': ApiConstant.SECRET_KEY,
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'message': message,
          'userId': userId.isNotEmpty ? userId : null,
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['status'] == true) {
          final data = jsonResponse['data'];
          
          // Add AI response
          messages.add(ChatMessage(
            message: data['response'] ?? 'I apologize, I couldn\'t process that request.',
            isUser: false,
            timestamp: DateTime.now(),
            recommendations: data,
          ));
        } else {
          messages.add(ChatMessage(
            message: jsonResponse['message'] ?? 'Something went wrong. Please try again.',
            isUser: false,
            timestamp: DateTime.now(),
          ));
        }
      } else {
        throw Exception('Failed to get response');
      }
    } catch (e) {
      messages.add(ChatMessage(
        message: 'Sorry, I\'m having trouble connecting. Please try again later.',
        isUser: false,
        timestamp: DateTime.now(),
      ));
    } finally {
      isLoading.value = false;
      update();
    }
  }

  void navigateToService(String serviceId) {
    // Navigate to service detail
    // Get.toNamed(AppRoutes.categoryDetail, arguments: serviceId);
  }

  void navigateToSalon(String salonId) {
    // Navigate to salon detail
    // Get.toNamed(AppRoutes.branchDetail, arguments: salonId);
  }

  @override
  void onClose() {
    messageController.dispose();
    super.onClose();
  }
}
```

#### Step 2.4: Create Chat Widget
**File:** `dev/flutter/multi_salon_customer/lib/ui/ai_concierge_screen/widget/ai_concierge_widget.dart`

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class AIConciergeChatWidget extends StatelessWidget {
  const AIConciergeChatWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AIConciergeController>();
    
    return Obx(() => ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: controller.messages.length,
      itemBuilder: (context, index) {
        final message = controller.messages[index];
        return ChatBubble(message: message);
      },
    ));
  }
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: Get.width * 0.75),
        decoration: BoxDecoration(
          color: message.isUser 
              ? AppColors.primaryAppColor 
              : AppColors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.message,
              style: TextStyle(
                color: message.isUser 
                    ? AppColors.whiteColor 
                    : AppColors.primaryTextColor,
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 14,
              ),
            ),
            if (message.recommendations != null && !message.isUser)
              RecommendationsWidget(recommendations: message.recommendations!),
          ],
        ),
      ),
    );
  }
}

class RecommendationsWidget extends StatelessWidget {
  final Map<String, dynamic> recommendations;

  const RecommendationsWidget({super.key, required this.recommendations});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AIConciergeController>();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 12),
        if (recommendations['suggestedServices'] != null && 
            (recommendations['suggestedServices'] as List).isNotEmpty)
          ...(recommendations['suggestedServices'] as List).map((service) {
            return GestureDetector(
              onTap: () => controller.navigateToService(service['_id']),
              child: Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryAppColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.spa, color: AppColors.primaryAppColor, size: 20),
                    SizedBox(width: 8),
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
                    Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.primaryAppColor),
                  ],
                ),
              ),
            );
          }).toList(),
        if (recommendations['suggestedSalons'] != null && 
            (recommendations['suggestedSalons'] as List).isNotEmpty)
          ...(recommendations['suggestedSalons'] as List).map((salon) {
            return GestureDetector(
              onTap: () => controller.navigateToSalon(salon['_id']),
              child: Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryAppColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.store, color: AppColors.primaryAppColor, size: 20),
                    SizedBox(width: 8),
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
                    Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.primaryAppColor),
                  ],
                ),
              ),
            );
          }).toList(),
      ],
    );
  }
}

class AIConciergeInputWidget extends StatelessWidget {
  const AIConciergeInputWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AIConciergeController>();
    
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        boxShadow: [
          BoxShadow(
            color: AppColors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller.messageController,
              decoration: InputDecoration(
                hintText: 'Ask me anything about beauty services...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(25),
                  borderSide: BorderSide(color: AppColors.grey.withOpacity(0.3)),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onSubmitted: (value) => controller.sendMessage(value),
            ),
          ),
          SizedBox(width: 12),
          Obx(() => controller.isLoading.value
              ? CircularProgressIndicator()
              : IconButton(
                  icon: Icon(Icons.send, color: AppColors.primaryAppColor),
                  onPressed: () {
                    if (controller.messageController.text.isNotEmpty) {
                      controller.sendMessage(controller.messageController.text);
                    }
                  },
                )),
        ],
      ),
    );
  }
}
```

#### Step 2.5: Add Route
**File:** `dev/flutter/multi_salon_customer/lib/routes/app_routes.dart`

Add:
```dart
static const String aiConcierge = '/aiConcierge';
```

**File:** `dev/flutter/multi_salon_customer/lib/routes/app_pages.dart`

Add:
```dart
GetPage(
  name: AppRoutes.aiConcierge,
  page: () => AIConciergeScreen(),
),
```

#### Step 2.6: Add API Constant
**File:** `dev/flutter/multi_salon_customer/lib/utils/api_constant.dart`

Add:
```dart
/// ---------- AI Concierge ---------- ///
static const aiConciergeChat = "user/aiConcierge/chat";
static const aiConciergeQuickSuggestions = "user/aiConcierge/quickSuggestions";
```

#### Step 2.7: Add Entry Point (Home Screen Button)
Add a button in your home screen or bottom navigation to access the AI Concierge.

### Phase 3: Enhanced Features (Week 3-4)

#### Step 3.1: Voice Input
Use existing `speech_to_text` package for voice queries.

#### Step 3.2: Quick Action Buttons
Add quick suggestion buttons like:
- "Recommend services for wedding"
- "Best salons near me"
- "Hair care tips"

#### Step 3.3: Conversation History
Store chat history in local storage or backend.

#### Step 3.4: Context Awareness
Enhance AI to remember user preferences and past conversations.

### Phase 4: Testing & Optimization (Week 4)

1. Test with various queries
2. Optimize API calls (caching, rate limiting)
3. Improve response parsing
4. Add error handling
5. Performance testing

## 💰 Cost Estimation

**OpenAI API Costs:**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4-turbo: ~$0.01 per 1K tokens
- Average conversation: ~500-1000 tokens
- Estimated cost per user session: $0.01 - $0.05

**Monthly Cost Estimate (1000 active users, 2 sessions/month):**
- GPT-3.5: ~$20-40/month
- GPT-4: ~$100-200/month

## 🔒 Security Considerations

1. **API Key Security**: Store OpenAI API key in environment variables, never in code
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Sanitize user inputs
4. **Data Privacy**: Don't send sensitive user data to AI
5. **Error Handling**: Graceful fallbacks if AI service is down

## 🚀 Quick Start Checklist

- [ ] Get OpenAI API key
- [ ] Install backend dependencies
- [ ] Create AI service module
- [ ] Create API endpoints
- [ ] Test backend API
- [ ] Create Flutter UI
- [ ] Integrate with existing app
- [ ] Test end-to-end
- [ ] Deploy and monitor

## 📝 Next Steps

1. **Start with Phase 1** - Set up backend AI integration
2. **Test with Postman** - Verify API works before Flutter integration
3. **Build Flutter UI** - Create chat interface
4. **Iterate** - Improve based on user feedback

## 🎨 UI/UX Recommendations

1. **Floating Action Button** - Add FAB on home screen for quick access
2. **Chat Interface** - Modern, WhatsApp-like chat UI
3. **Typing Indicator** - Show when AI is thinking
4. **Quick Replies** - Pre-defined quick action buttons
5. **Rich Cards** - Show service/salon cards with images
6. **Voice Input** - Microphone button for voice queries

## 🔄 Future Enhancements

1. **Multi-language Support** - Use AI translation
2. **Image Analysis** - Analyze user photos for recommendations
3. **AR Try-On** - Virtual try-on for hairstyles (advanced)
4. **Personalized Feed** - AI-curated beauty content
5. **Smart Notifications** - AI-powered booking reminders

---

**Ready to start?** Begin with Phase 1, Step 1.1 - Get your OpenAI API key and we can start building!

