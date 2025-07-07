import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';

class SettingScreen extends StatelessWidget {
  const SettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtSetting".tr,
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
            leadingImage: AppAsset.icLanguage,
            title: "txtLanguage".tr,
            onTap: () {
              Get.toNamed(AppRoutes.language);
            },
          ),
        ],
      ).paddingOnly(top: 15),
    );
  }
}
