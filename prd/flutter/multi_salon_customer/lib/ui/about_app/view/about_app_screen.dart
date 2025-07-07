import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
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

    ///------- Rate App --------- ///
    (<T>(T? o) => o!)(WidgetsBinding.instance).addPostFrameCallback((_) async {
      try {
        final isAvailable = await _inAppReview.isAvailable();


        setState(() {
          availability =
              isAvailable && !Platform.isAndroid ? Availability.available : Availability.unavailable;
        });
      } catch (_) {
        setState(() => availability = Availability.unavailable);
      }
    });
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
    Share.share('https://www.google.com/');
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
            leadingImage: AppAsset.icRate,
            imageHeight: 20,
            imageWidth: 20,
            title: "txtRate".tr,
            fontFamily: FontFamily.sfProDisplayMedium,
            fontSize: 14.5,
            onTap: () {
              _requestReview();
              _openStoreListing();
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icShare,
            imageHeight: 20,
            imageWidth: 20,
            title: "txtShare".tr,
            fontFamily: FontFamily.sfProDisplayMedium,
            fontSize: 14.5,
            onTap: () {
              _shareApp();
            },
          ),
        ],
      ).paddingOnly(left: 15, right: 15, top: 15),
    );
  }
}
