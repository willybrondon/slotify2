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
            mainAxisAlignment: MainAxisAlignment.center,
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
              Container(
                width: Get.width,
                color: AppColors.whiteColor,
                child: Column(
                  children: [
                    const SizedBox(height: 25),
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
                    const SizedBox(height: 40),
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
      child: Column(
        children: [
          const Spacer(),
          const Spacer(),
          Image.asset(image).paddingOnly(left: 15, right: 15),
          const Spacer(),
          Text(
            title,
            style: TextStyle(
              color: AppColors.primaryAppColor,
              fontFamily: AppFontFamily.heeBo800,
              fontSize: 28,
            ),
            textAlign: TextAlign.center,
          ).paddingAll(20),
          Text(
            "Transform Your Look, Transform Your Life, Your Ultimate Desire Awaits Here.",
            style: TextStyle(
              color: AppColors.termsDialog,
              fontFamily: AppFontFamily.heeBo500,
              fontSize: 17,
            ),
            textAlign: TextAlign.center,
          ).paddingOnly(left: 20, right: 20),
        ],
      ),
    );
  }
}
