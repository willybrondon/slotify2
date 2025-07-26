import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class AppActiveDialog extends StatelessWidget {
  const AppActiveDialog({super.key});

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
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(48), topRight: Radius.circular(48)),
                color: AppColors.primaryAppColor),
            child: Center(
              child: Text(
                "txtUnderMaintenance".tr,
                style: TextStyle(color: AppColors.whiteColor, fontSize: 16.5, fontFamily: AppFontFamily.sfProDisplay),
              ),
            ),
          ),
          Image.asset(
            AppAsset.icTechnical,
            height: 125,
            width: 125,
          ).paddingOnly(top: 10, bottom: 13),
          Text(
            "txtSorryUnderMaintenance".tr,
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: AppFontFamily.sfProDisplayMedium, fontSize: 20, color: AppColors.primaryTextColor),
          ).paddingOnly(left: 15, right: 15),
          const Spacer(),
          AppButton(
            height: 48,
            buttonColor: AppColors.primaryAppColor,
            buttonText: "txtCloseApp".tr,
            textColor: AppColors.whiteColor,
            fontSize: 17,
            fontFamily: AppFontFamily.sfProDisplay,
            onTap: () {
              exit(0);
            },
          ).paddingOnly(left: 15, right: 15, bottom: 15)
        ],
      ),
    );
  }
}
