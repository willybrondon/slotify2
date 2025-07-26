import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class ExitDialog extends StatelessWidget {
  const ExitDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 345,
        decoration: BoxDecoration(
          color: AppColors.dialogBg,
          borderRadius: BorderRadius.circular(48),
        ),
        child: Column(
          children: [
            Container(
              height: 52,
              decoration: BoxDecoration(
                  borderRadius:
                      const BorderRadius.only(topLeft: Radius.circular(48), topRight: Radius.circular(48)),
                  color: AppColors.primaryAppColor),
              child: Center(
                child: Text(
                  "txtConfirmExit".tr,
                  style: TextStyle(
                      color: AppColors.whiteColor, fontSize: 16.5, fontFamily: AppFontFamily.sfProDisplay),
                ),
              ),
            ),
            Image.asset(
              AppAsset.imLogOut,
              height: 120,
              width: 120,
            ).paddingOnly(top: 10, bottom: 13),
            Text(
              "desExit".tr,
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayMedium, fontSize: 20, color: AppColors.primaryTextColor),
            ).paddingOnly(left: 15, right: 15),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 10),
                AppButton(
                  buttonColor: AppColors.whiteColor,
                  buttonText: "txtCancel".tr,
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
                  buttonColor: AppColors.primaryAppColor,
                  buttonText: "txtExit".tr,
                  textColor: AppColors.whiteColor,
                  fontFamily: AppFontFamily.sfProDisplay,
                  fontSize: 16.5,
                  height: 48,
                  width: Get.width * 0.31,
                  onTap: () {
                    exit(0);
                  },
                ),
                const SizedBox(width: 10),
              ],
            ).paddingOnly(bottom: 15, left: 13, right: 13)
          ],
        ));
  }
}
