import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/on_boarding_screen/controller/on_boarding_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class OnBoardingView extends StatelessWidget {
  const OnBoardingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.whiteColor,
      child: GetBuilder<OnBoardingController>(
        id: Constant.idOnBoarding,
        builder: (logic) {
          return Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: logic.pageController,
                  onPageChanged: (int page) {
                    logic.onPageChanged(page: page);
                  },
                  itemCount: logic.title.length,
                  itemBuilder: (context, index) {
                    return OnboardingItemView(
                      title: logic.title[index],
                      image: logic.image[index],
                    );
                  },
                ),
              ),
              // Responsive button container to prevent overlap
              Container(
                width: Get.width,
                height: Get.height * 0.15, // Responsive height for button area
                color: AppColors.whiteColor,
                padding: EdgeInsets.only(bottom: Get.height * 0.02),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GetBuilder<OnBoardingController>(
                      id: Constant.idOnBoarding,
                      builder: (logic) {
                        return GestureDetector(
                          onTap: () {
                            logic.onPageScroll(currentPage: logic.currentPage);
                          },
                          child: logic.currentPage == 2
                              ? Image.asset(AppAsset.icStart, height: 55)
                              : Image.asset(AppAsset.icNextRound, height: 60),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class OnboardingItemView extends StatelessWidget {
  final String title;
  final String image;

  const OnboardingItemView({
    super.key,
    required this.title,
    required this.image,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage(AppAsset.imBoardingScreenBg),
          fit: BoxFit.cover,
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            SizedBox(height: Get.height * 0.05),
            Image.asset(
              image,
              height: Get.height * 0.3, // Responsive image height
              fit: BoxFit.contain,
            ).paddingOnly(left: 15, right: 15),
            SizedBox(height: Get.height * 0.03),
            Text(
              title,
              style: TextStyle(
                color: AppColors.primaryAppColor,
                fontFamily: AppFontFamily.heeBo800,
                fontSize: Get.width * 0.07, // Responsive font size
              ),
              textAlign: TextAlign.center,
            ).paddingAll(20),
            Text(
              "Transform Your Look, Transform Your Life, Your Ultimate Desire Awaits Here.",
              style: TextStyle(
                color: AppColors.termsDialog,
                fontFamily: AppFontFamily.heeBo500,
                fontSize: Get.width * 0.04, // Responsive font size
              ),
              textAlign: TextAlign.center,
            ).paddingOnly(left: 20, right: 20, bottom: 20),
            // Responsive spacing to prevent overlap with button area
            SizedBox(height: Get.height * 0.08),
          ],
        ),
      ),
    );
  }
}
