import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/utils.dart';

class HelpScreen extends StatelessWidget {
  HelpScreen({super.key});

  final SplashScreenController splashScreenController = Get.find<SplashScreenController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtHelp".tr,
          method: InkWell(
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
      body: Column(
        children: [
          CustomMenu(
            leadingImage: AppAsset.icPrivacyPolicy,
            title: "txtPrivacyPolicy".tr,
            onTap: () {
              log("PRIVACY_POLICY_URL link  :: ${splashScreenController.settingCategory?.setting?.privacyPolicyLink ?? ""}");
              Utils.launchURL(splashScreenController.settingCategory?.setting?.privacyPolicyLink ?? "");
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icTerms,
            title: "txtTermsCondition".tr,
            onTap: () {
              log("TC link  :: ${splashScreenController.settingCategory?.setting?.tnc ?? ""}");
              Utils.launchURL(splashScreenController.settingCategory?.setting?.tnc ?? "");
            },
          ),
        ],
      ).paddingOnly(top: 15),
    );
  }
}
