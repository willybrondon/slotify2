import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:share_plus/share_plus.dart';

enum Availability { loading, available, unavailable }

class AboutAppScreen extends StatefulWidget {
  const AboutAppScreen({super.key});

  @override
  State<AboutAppScreen> createState() => _AboutAppScreenState();
}

class _AboutAppScreenState extends State<AboutAppScreen> {
  final InAppReview _inAppReview = InAppReview.instance;
  String _microsoftStoreId = '';
  Availability availability = Availability.loading;

  @override
  void initState() {
    super.initState();
    (<T>(T? o) => o!)(WidgetsBinding.instance).addPostFrameCallback((_) async {
      try {
        final isAvailable = await _inAppReview.isAvailable();
        setState(() {
          availability = isAvailable && !Platform.isAndroid
              ? Availability.available
              : Availability.unavailable;
        });
      } catch (_) {
        setState(() => availability = Availability.unavailable);
      }
    });
  }

  Future<void> _requestReview() => _inAppReview.requestReview();

  Future<void> _openStoreListing() => _inAppReview.openStoreListing(
        appStoreId: Constant.appStoreId,
        microsoftStoreId: _microsoftStoreId,
      );

  void _shareApp() {
    Share.share("txtShareAppMessage".tr);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtAboutApp".tr,
          method: InkWell(
            onTap: Get.back,
            child: Icon(
              Icons.arrow_back,
              color: AppColors.blackColor,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 30),
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                children: [
                  Text(
                    "txtAppName".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo800,
                      fontSize: 24,
                      color: AppColors.blackColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "txtWelcomeService".tr,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo400,
                      fontSize: 14,
                      color: AppColors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 15),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Text(
                "txtAboutAppDescription".tr,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo400,
                  fontSize: 14,
                  height: 1.5,
                  color: AppColors.blackColor.withOpacity(0.75),
                ),
              ),
            ),
            const SizedBox(height: 15),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "txtAppFeatures".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo700,
                      fontSize: 18,
                      color: AppColors.blackColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _feature("txtFeature1".tr),
                  _feature("txtFeature2".tr),
                  _feature("txtFeature3".tr),
                  _feature("txtFeature4".tr),
                  _feature("txtFeature5".tr),
                ],
              ),
            ),
            const SizedBox(height: 15),
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                    child: Text(
                      "txtRateShare".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 18,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icShare,
                    title: "txtShare".tr,
                    onTap: _shareApp,
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icRate,
                    title: "txtRate".tr,
                    onTap: () {
                      _requestReview();
                      _openStoreListing();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 15),
            InkWell(
              onTap: () => Utils.launchURL("https://skedisy.com/professionnel/"),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  boxShadow: Constant.boxShadow,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.language, color: AppColors.buttonColor, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      "txtWebsite".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo600,
                        fontSize: 16,
                        color: AppColors.buttonColor,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "txtCopyright".tr,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: AppFontFamily.heeBo400,
                fontSize: 12,
                color: AppColors.grey,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ).paddingSymmetric(horizontal: 12),
      ),
    );
  }

  Widget _feature(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: AppFontFamily.heeBo400,
          fontSize: 14,
          height: 1.45,
          color: AppColors.blackColor.withOpacity(0.75),
        ),
      ),
    );
  }
}
