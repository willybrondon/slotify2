import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/ui/ai_concierge_screen/widget/ai_concierge_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
class AiConciergeScreen extends StatelessWidget {
  const AiConciergeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        backgroundColor: AppColors.whiteColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.primaryAppColor),
          onPressed: () => Get.back(),
        ),
        title: Text(
          "AI Beauty Concierge",
          style: TextStyle(
            color: AppColors.primaryAppColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: GetBuilder<AiConciergeController>(
        id: Constant.idProgressView,
        builder: (logic) {
          // Show results if analysis is complete
          if (logic.beautyAnalysis != null && logic.recommendations != null) {
            return const AiConciergeResultsView();
          }

          // Show image picker and analysis screen
          return const AiConciergeMainView();
        },
      ),
    );
  }
}

