// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/delete_account_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/setting/controller/setting_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';

class SettingScreen extends StatelessWidget {
  SettingScreen({super.key});

  SettingController settingController = Get.find<SettingController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtSetting".tr,
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
      body: GetBuilder<LoginScreenController>(
        id: Constant.idBookingAndLogin,
        builder: (logic) {
          return logic.isLogIn != true
              ? Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  child: Column(
                    children: [
                      settingMenu(
                        leadingImage: AppAsset.icLanguage,
                        title: "txtLanguage".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.language)!.then((value) {
                            settingController.getLanguageData();
                          });
                        },
                      ),
                    ],
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  child: Column(
                    children: [
                      settingMenu(
                        leadingImage: AppAsset.icLanguage,
                        title: "txtLanguage".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.language)!.then((value) {
                            settingController.getLanguageData();
                          });
                        },
                      ),
                      settingMenu(
                        leadingImage: AppAsset.icDeleteAccount,
                        title: "txtDeleteAccount".tr,
                        onTap: () {
                          Get.dialog(
                            barrierColor: AppColors.blackColor.withOpacity(0.8),
                            Dialog(
                              backgroundColor: AppColors.transparent,
                              surfaceTintColor: AppColors.transparent,
                              shadowColor: AppColors.transparent,
                              elevation: 0,
                              child: DeleteAccountDialog(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                );
        },
      ),
    );
  }

  settingMenu({String? leadingImage, title, Function()? onTap}) {
    return Column(
      children: [
        InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: onTap,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    height: 42,
                    width: 42,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.roundBg),
                    child: Image.asset(leadingImage!, height: 24, width: 24),
                  ),
                  SizedBox(width: Get.width * 0.05),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayMedium, fontSize: 15.5, color: AppColors.primaryTextColor),
                      ),
                    ],
                  ),
                ],
              ),
              title != "txtDeleteAccount".tr ? Image.asset(AppAsset.icArrowRight, height: 22, width: 22) : const SizedBox()
            ],
          ),
        ),
        SizedBox(height: Get.height * 0.03),
      ],
    );
  }
}
