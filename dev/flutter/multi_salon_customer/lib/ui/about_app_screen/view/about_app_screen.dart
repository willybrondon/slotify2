import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class AboutAppScreen extends StatelessWidget {
  const AboutAppScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtAboutApp".tr,
          method: InkWell(
            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back,
              color: AppColors.whiteColor,
            ),
          ),
        ),
      ),
      body: GetBuilder<SplashController>(
        builder: (logic) {
          return Column(
            children: [
              CustomMenu(
                leadingImage: AppAsset.icPrivacyPolicy,
                imageHeight: 20,
                imageWidth: 20,
                title: "txtPrivacyPolicy".tr,
                fontFamily: AppFontFamily.sfProDisplayMedium,
                fontSize: 14.5,
                onTap: () {
                  log("PRIVACY_POLICY_URL link  :: ${logic.settingCategory?.setting?.privacyPolicyLink ?? ""}");
                  Utils.launchURL(logic.settingCategory?.setting?.privacyPolicyLink ?? "");
                },
              ),
              CustomMenu(
                leadingImage: AppAsset.icTerms,
                imageHeight: 20,
                imageWidth: 20,
                title: "txtTermsCondition".tr,
                fontFamily: AppFontFamily.sfProDisplayMedium,
                fontSize: 14.5,
                onTap: () {
                  log("TC link  :: ${logic.settingCategory?.setting?.tnc ?? ""}");
                  Utils.launchURL(logic.settingCategory?.setting?.tnc ?? "");
                },
              ),
            ],
          ).paddingOnly(left: 12, right: 12, top: 12);
        },
      ),
    );
  }
}
