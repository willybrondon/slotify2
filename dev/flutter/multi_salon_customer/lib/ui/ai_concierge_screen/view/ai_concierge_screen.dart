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
    return GetBuilder<AiConciergeController>(
      id: Constant.idProgressView,
      builder: (logic) {
        final capture = logic.captureMode;
        return Scaffold(
          backgroundColor:
              capture ? AppColors.brandBlack : AppColors.backGround,
          appBar: AppBar(
            backgroundColor:
                capture ? AppColors.brandBlack : AppColors.whiteColor,
            elevation: 0,
            iconTheme: IconThemeData(
              color: capture
                  ? AppColors.brandTerracotta
                  : AppColors.iconAccent,
            ),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Get.back(),
            ),
            title: Text(
              capture
                  ? "txtCaptureScreenTitle".tr
                  : "txtAiConciergeTitle".tr,
              style: TextStyle(
                color: capture
                    ? AppColors.brandWhite
                    : AppColors.primaryTextColor,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            centerTitle: true,
          ),
          body: logic.beautyAnalysis != null && logic.recommendations != null
              ? const AiConciergeResultsView()
              : const AiConciergeMainView(),
        );
      },
    );
  }
}
