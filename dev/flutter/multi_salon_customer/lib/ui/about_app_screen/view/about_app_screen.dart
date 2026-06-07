import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
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
  String appVersion = '';
  String buildNumber = '';
  Availability availability = Availability.loading;

  @override
  void initState() {
    super.initState();
    _getAppVersion();

    ///------- Rate App --------- ///
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

  Future<void> _getAppVersion() async {
    try {
      PackageInfo packageInfo = await PackageInfo.fromPlatform();
      setState(() {
        appVersion = packageInfo.version;
        buildNumber = packageInfo.buildNumber;
      });
    } catch (e) {
      setState(() {
        appVersion = '1.1.0';
        buildNumber = '6';
      });
    }
  }

  ///------- Rate App --------- ///
  void setAppStoreId(String id) => Constant.appStoreId = id;

  void setMicrosoftStoreId(String id) => _microsoftStoreId = id;

  Future<void> _requestReview() => _inAppReview.requestReview();

  Future<void> _openStoreListing() => _inAppReview.openStoreListing(
        appStoreId: Constant.appStoreId,
        microsoftStoreId: _microsoftStoreId,
      );

  ///------- Share App --------- ///
  void _shareApp() {
    Share.share("txtShareAppMessage".tr);
  }

  @override
  Widget build(BuildContext context) {
    // Get the existing SplashController instance
    final splashController = Get.isRegistered<SplashController>()
        ? Get.find<SplashController>()
        : Get.put(SplashController());

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
              color: AppColors.blackColor,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // App Logo and Name Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 30),
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                children: [
                  // App Icon
                  Container(
                    height: 100,
                    width: 100,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: AppColors.whiteColor,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.blackColor.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Image.asset(
                        AppAsset.icSkedisyLogo,
                        height: 60,
                        width: 60,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  // App Name
                  Text(
                    "txtAppName".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.blackColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Version
                  Text(
                    "${"txtVersion".tr} $appVersion${buildNumber.isNotEmpty ? " ($buildNumber)" : ""}",
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                      fontSize: 14,
                      color: AppColors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Description Section
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
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 14,
                  height: 1.5,
                  color: AppColors.blackColor.withOpacity(0.7),
                ),
              ),
            ),
            const SizedBox(height: 15),

            // Features Section
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
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.blackColor,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildFeatureItem("txtFeature1".tr),
                  _buildFeatureItem("txtFeature2".tr),
                  _buildFeatureItem("txtFeature3".tr),
                  _buildFeatureItem("txtFeature4".tr),
                  _buildFeatureItem("txtFeature5".tr),
                  _buildFeatureItem("txtFeature6".tr),
                  _buildFeatureItem("txtFeature7".tr),
                  _buildFeatureItem("txtFeature8".tr),
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Legal Information Section
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
                      "txtLegalInformation".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icPrivacyPolicy,
                    imageHeight: 20,
                    imageWidth: 20,
                    title: "txtPrivacyPolicy".tr,
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                    fontSize: 14.5,
                    onTap: () {
                      log("PRIVACY_POLICY_URL link  :: ${splashController.settingCategory?.setting?.privacyPolicyLink ?? ""}");
                      Utils.launchURL(splashController
                              .settingCategory?.setting?.privacyPolicyLink ??
                          "https://skedisy.com/privacy-policy");
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
                      log("TC link  :: ${splashController.settingCategory?.setting?.tnc ?? ""}");
                      Utils.launchURL(
                          splashController.settingCategory?.setting?.tnc ??
                              "https://skedisy.com/terms-conditions");
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Rate & Share Section
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
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icShare,
                    imageHeight: 20,
                    imageWidth: 20,
                    title: "txtShare".tr,
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                    fontSize: 14.5,
                    onTap: () {
                      _shareApp();
                    },
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icRate,
                    imageHeight: 20,
                    imageWidth: 20,
                    title: "txtRate".tr,
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                    fontSize: 14.5,
                    onTap: () {
                      _requestReview();
                      _openStoreListing();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Website Section
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: InkWell(
                onTap: () {
                  Utils.launchURL("https://skedisy.com");
                },
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.language,
                        color: AppColors.buttonColor,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        "txtWebsite".tr,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 16,
                          color: AppColors.buttonColor,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Copyright Section
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                "txtCopyright".tr,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 12,
                  color: AppColors.grey,
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ).paddingOnly(left: 12, right: 12, top: 12),
      ),
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: AppFontFamily.sfProDisplayRegular,
          fontSize: 14,
          height: 1.5,
          color: AppColors.blackColor.withOpacity(0.7),
        ),
      ),
    );
  }
}
