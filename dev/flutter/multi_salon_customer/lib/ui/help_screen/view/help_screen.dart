import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class HelpScreen extends StatelessWidget {
  HelpScreen({super.key});

  final SplashController splashController = Get.find<SplashController>();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtHelp".tr,
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
      body: Column(
        children: [
          CustomMenu(
            leadingImage: AppAsset.icPrivacyPolicy,
            imageHeight: 20,
            imageWidth: 20,
            title: "txtPrivacyPolicy".tr,
            fontFamily: FontFamily.sfProDisplayMedium,
            fontSize: 14.5,
            onTap: () {
              log("PRIVACY_POLICY_URL link  :: ${splashController.settingCategory?.setting?.privacyPolicyLink ?? ""}");
              Utils.launchURL(splashController.settingCategory?.setting?.privacyPolicyLink ?? "");
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icTerms,
            imageHeight: 20,
            imageWidth: 20,
            title: "txtTermsCondition".tr,
            fontFamily: FontFamily.sfProDisplayMedium,
            fontSize: 14.5,
            onTap: () {
              log("TC link  :: ${splashController.settingCategory?.setting?.tnc ?? ""}");
              Utils.launchURL(splashController.settingCategory?.setting?.tnc ?? "");
            },
          ),
        ],
      ).paddingOnly(left: 15, right: 15, top: 15),
    );
  }
}
