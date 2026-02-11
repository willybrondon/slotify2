import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';

class ContinueBookingDialog extends StatelessWidget {
  const ContinueBookingDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Container(
            height: 58,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(44),
                topRight: Radius.circular(44),
              ),
              color: AppColors.primaryAppColor,
            ),
            child: Center(
              child: Text(
                "txtWalletRecharged".tr,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplay,
                  color: AppColors.whiteColor,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle,
                    color: AppColors.primaryAppColor,
                    size: 60,
                  ),
                  const SizedBox(height: 15),
                  Text(
                    "txtWalletRechargedSuccessfully".tr,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      color: AppColors.currency,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "txtContinueBookingQuestion".tr,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                      color: AppColors.captionDialog,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Button(
                buttonColor: AppColors.whiteColor,
                buttonText: "txtCancel".tr,
                textColor: AppColors.primaryAppColor,
                borderColor: AppColors.greyColor.withOpacity(0.2),
                borderWidth: 1,
                fontStyle: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: () {
                  // Stay on wallet page from profile
                  Get.back(result: 'cancel'); // Close dialog and return cancel
                },
              ),
              Button(
                buttonColor: AppColors.primaryAppColor,
                buttonText: "txtContinue".tr,
                textColor: AppColors.whiteColor,
                fontStyle: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: () {
                  // Return to booking screen to continue payment
                  Get.back(result: 'continue_booking');
                },
              )
            ],
          ).paddingOnly(left: 13, right: 13, bottom: 25)
        ],
      ),
    );
  }
}

