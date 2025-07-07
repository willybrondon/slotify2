import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class DeleteAccountDialog extends StatelessWidget {
  const DeleteAccountDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 345,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.dialogBgColor,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          children: [
            Image.asset(
              AppAsset.imDeleteAccount,
              height: 100,
              width: 100,
            ),
            const SizedBox(height: 10),
            Text(
              "txtDeleteAccount".tr,
              style: TextStyle(
                  fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 26),
            ),
            const SizedBox(height: 15),
            SizedBox(
              width: Get.width * 0.6,
              child: Text(
                "desAccountDeleted".tr,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.primaryTextColor, fontSize: 18.5),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 10),
                AppButton(
                  height: 50,
                  width: Get.width * 0.30,
                  buttonColor: AppColors.whiteColor,
                  buttonText: "txtCancel".tr,
                  textColor: AppColors.primaryAppColor,
                  onTap: () {
                    Get.back();
                  },
                ),
                const Spacer(),
                AppButton(
                  height: 50,
                  width: Get.width * 0.30,
                  buttonColor: AppColors.primaryAppColor,
                  buttonText: "txtDelete".tr,
                  textColor: AppColors.whiteColor,
                  onTap: () async {
                    Get.back();
                  },
                ),
                const SizedBox(width: 10),
              ],
            )
          ],
        ));
  }
}
