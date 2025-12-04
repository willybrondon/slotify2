import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/ui/ai_concierge_screen/model/ai_concierge_model.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// Main view for image selection and analysis
class AiConciergeMainView extends StatelessWidget {
  const AiConciergeMainView({super.key});

  @override
  Widget build(BuildContext context) {

    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 20),
          
          // Header Section
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.blackColor.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  Icons.face_retouching_natural,
                  size: 60,
                  color: AppColors.primaryAppColor,
                ),
                const SizedBox(height: 16),
                Text(
                  "Get Personalized Beauty Recommendations",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryAppColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Upload your selfie and let AI analyze your skin, hair, and facial features to recommend the perfect beauty services for you.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.grey,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // Image Selection Section
          GetBuilder<AiConciergeController>(
            builder: (logic) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Selected Image Preview
                    if (logic.selectImageFile != null)
                      Container(
                        height: Get.height * 0.4,
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.lineColor,
                            width: 2,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(
                            logic.selectImageFile!,
                            fit: BoxFit.cover,
                          ),
                        ),
                      )
                    else
                      // Placeholder
                      Container(
                        height: Get.height * 0.4,
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: AppColors.lineColor.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.lineColor,
                            width: 2,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.add_photo_alternate_outlined,
                              size: 80,
                              color: AppColors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "Upload Your Selfie",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.grey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Tap the button below to select",
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: logic.selectImageFile != null
                                ? () {
                                    logic.clearImage();
                                  }
                                : () {
                                    logic.showImageSourceDialog();
                                  },
                            icon: Icon(
                              logic.selectImageFile != null
                                  ? Icons.refresh
                                  : Icons.add_photo_alternate,
                              color: AppColors.whiteColor,
                            ),
                            label: Text(
                              logic.selectImageFile != null
                                  ? "Change Image"
                                  : "Select Image",
                              style: TextStyle(
                                color: AppColors.whiteColor,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryAppColor,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Analyze Button
                    if (logic.selectImageFile != null)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: logic.isLoading.value
                              ? null
                              : () async {
                                  final userId = Constant.storage.read<String>('userId');
                                  await logic.onAnalyzeSelfieApiCall(
                                    userId: userId,
                                    latitude: latitude?.toString(),
                                    longitude: longitude?.toString(),
                                    city: city,
                                  );
                                },
                          icon: logic.isLoading.value
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.whiteColor,
                                    ),
                                  ),
                                )
                              : Icon(
                                  Icons.auto_awesome,
                                  color: AppColors.whiteColor,
                                ),
                          label: Text(
                            logic.isLoading.value
                                ? "Analyzing..."
                                : "Analyze My Beauty",
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryAppColor,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 2,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

/// Results view showing analysis and recommendations
class AiConciergeResultsView extends StatelessWidget {
  const AiConciergeResultsView({super.key});

  @override
  Widget build(BuildContext context) {

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with image
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.selectImageFile != null) {
                return Container(
                  height: Get.height * 0.3,
                  width: double.infinity,
                  margin: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.file(
                      controller.selectImageFile!,
                      fit: BoxFit.cover,
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),

          // Analysis Results
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.beautyAnalysis != null) {
                return _buildAnalysisSection(controller.beautyAnalysis!);
              }
              return const SizedBox.shrink();
            },
          ),

          // Recommendations
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.recommendations != null) {
                return _buildRecommendationsSection(controller.recommendations!);
              }
              return const SizedBox.shrink();
            },
          ),

          const SizedBox(height: 20),

          // Action Buttons
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          controller.resetAnalysis();
                          controller.clearImage();
                        },
                        icon: const Icon(Icons.refresh),
                        label: const Text("Analyze Another"),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Get.back();
                        },
                        icon: Icon(Icons.home, color: AppColors.whiteColor),
                        label: Text(
                          "Back to Home",
                          style: TextStyle(color: AppColors.whiteColor),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryAppColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildAnalysisSection(BeautyAnalysis analysis) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Beauty Analysis",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryAppColor,
            ),
          ),
          const SizedBox(height: 20),

          // Skin Analysis
          if (analysis.skin != null) _buildSkinAnalysis(analysis.skin!),
          const SizedBox(height: 16),

          // Hair Analysis
          if (analysis.hair != null) _buildHairAnalysis(analysis.hair!),
          const SizedBox(height: 16),

          // Face Analysis
          if (analysis.face != null) _buildFaceAnalysis(analysis.face!),
        ],
      ),
    );
  }

  Widget _buildSkinAnalysis(SkinAnalysis skin) {
    return _buildAnalysisCard(
      icon: Icons.face,
      title: "Skin Analysis",
      items: {
        "Type": skin.type ?? "N/A",
        "Tone": skin.tone ?? "N/A",
        "Undertone": skin.undertone ?? "N/A",
        "Condition": skin.condition ?? "N/A",
        if (skin.concerns != null && skin.concerns!.isNotEmpty)
          "Concerns": skin.concerns!.join(", "),
      },
      color: Colors.pink,
    );
  }

  Widget _buildHairAnalysis(HairAnalysis hair) {
    return _buildAnalysisCard(
      icon: Icons.content_cut,
      title: "Hair Analysis",
      items: {
        "Type": hair.type ?? "N/A",
        "Texture": hair.texture ?? "N/A",
        "Color": hair.color ?? "N/A",
        "Condition": hair.condition ?? "N/A",
        if (hair.length != null) "Length": hair.length!,
      },
      color: Colors.brown,
    );
  }

  Widget _buildFaceAnalysis(FaceAnalysis face) {
    return _buildAnalysisCard(
      icon: Icons.face,
      title: "Facial Features",
      items: {
        "Face Shape": face.shape ?? "N/A",
        "Eye Shape": face.eyeShape ?? "N/A",
        "Lip Shape": face.lipShape ?? "N/A",
        if (face.eyebrowShape != null) "Eyebrow": face.eyebrowShape!,
      },
      color: Colors.blue,
    );
  }

  Widget _buildAnalysisCard({
    required IconData icon,
    required String title,
    required Map<String, String> items,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items.entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 100,
                      child: Text(
                        "${entry.key}:",
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        entry.value,
                        style: TextStyle(
                          color: AppColors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildRecommendationsSection(Recommendations recommendations) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Services
        if (recommendations.services != null &&
            recommendations.services!.isNotEmpty)
          _buildServicesSection(recommendations.services!),

        // Salons
        if (recommendations.salons != null &&
            recommendations.salons!.isNotEmpty)
          _buildSalonsSection(recommendations.salons!),

        // Beauty Tips
        if (recommendations.beautyTips != null &&
            recommendations.beautyTips!.isNotEmpty)
          _buildBeautyTipsSection(recommendations.beautyTips!),
      ],
    );
  }

  Widget _buildServicesSection(List<ServiceItem> services) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Recommended Services",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryAppColor,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return Container(
                  width: 150,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (service.image != null && service.image!.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: service.image!,
                            height: 60,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.lineColor,
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: AppColors.lineColor,
                              child: const Icon(Icons.image),
                            ),
                          ),
                        )
                      else
                        Container(
                          height: 60,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.lineColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.spa),
                        ),
                      const SizedBox(height: 8),
                      Text(
                        service.name ?? "Service",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryTextColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSalonsSection(List<SalonItem> salons) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Recommended Salons",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryAppColor,
            ),
          ),
          const SizedBox(height: 12),
          ...salons.map((salon) => GestureDetector(
                onTap: () {
                  Get.toNamed(
                    AppRoutes.branchDetail,
                    arguments: [salon.id],
                  );
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      if (salon.image != null && salon.image!.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: salon.image!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              width: 60,
                              height: 60,
                              color: AppColors.lineColor,
                            ),
                            errorWidget: (context, url, error) => Container(
                              width: 60,
                              height: 60,
                              color: AppColors.lineColor,
                              child: const Icon(Icons.business),
                            ),
                          ),
                        )
                      else
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.lineColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.business),
                        ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              salon.name ?? "Salon",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryTextColor,
                              ),
                            ),
                            if (salon.review != null)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.star,
                                    size: 14,
                                    color: Colors.amber,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    salon.review!.toStringAsFixed(1),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            if (salon.address != null)
                              Text(
                                salon.address!,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.grey,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: AppColors.grey,
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildBeautyTipsSection(List<String> tips) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline, color: Colors.amber),
              const SizedBox(width: 8),
              Text(
                "Beauty Tips",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryAppColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...tips.map((tip) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6, right: 12),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: AppColors.primaryAppColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        tip,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.primaryTextColor,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

