import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class LogOutDialog extends StatelessWidget {
  const LogOutDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 345,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.dialogBg,
          borderRadius: BorderRadius.circular(48),
        ),
        child: Column(
          children: [
            Image.asset(
              AppAsset.icLogo,
              height: 100,
              width: 100,
            ).paddingOnly(top: 15, bottom: 30),
            Text(
              "txtLogOut".tr,
              style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 24),
            ),
            SizedBox(
              width: Get.width * 0.6,
              child: Text(
                "desLogOut".tr,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular, color: AppColors.primaryTextColor, fontSize: 17),
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 10),
                AppButton(
                  buttonColor: AppColors.whiteColor,
                  buttonText: "txtClose".tr,
                  textColor: AppColors.primaryAppColor,
                  fontFamily: AppFontFamily.sfProDisplay,
                  fontSize: 16.5,
                  height: 48,
                  width: Get.width * 0.31,
                  onTap: () {
                    Get.back();
                  },
                ),
                const Spacer(),
                AppButton(
                  buttonColor: AppColors.cancelButton,
                  buttonText: "txtLogOut".tr,
                  textColor: AppColors.whiteColor,
                  fontFamily: AppFontFamily.sfProDisplay,
                  fontSize: 16.5,
                  height: 48,
                  width: Get.width * 0.31,
                  onTap: () {
                    Constant.storage.erase();

                    log("Log Out SuccessFully !!");

                    Get.toNamed(AppRoutes.initial);
                  },
                ),
                const SizedBox(width: 10),
              ],
            ).paddingOnly(bottom: 15)
          ],
        ));
  }
}
