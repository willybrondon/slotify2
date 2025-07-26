// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class SuccessDialog extends StatelessWidget {
  SuccessDialog({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 365,
      width: 300,
      padding: const EdgeInsets.only(left: 10, right: 10, top: 15, bottom: 15),
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Image.asset(
            AppAsset.inSuccessfully,
            height: 90,
            width: 90,
          ).paddingOnly(top: 10, bottom: 20),
          Text(
            "txtBookingSuccessful".tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              color: AppColors.categoryService,
              fontSize: 23,
            ),
          ),
          SizedBox(
            width: Get.width * 0.6,
            child: Text(
              "desSuccessfullyBooked".tr,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                color: AppColors.captionDialog,
                fontSize: 16,
              ),
            ),
          ),
          const Spacer(),
          GetBuilder<BottomBarController>(
            id: Constant.idBottomBar,
            builder: (logic) {
              return AppButton(
                buttonColor: AppColors.primaryAppColor,
                width: Get.width * 0.65,
                height: 46,
                buttonText: "txtGotoBookings".tr,
                color: AppColors.whiteColor,
                fontFamily: AppFontFamily.sfProDisplay,
                borderColor: AppColors.grey.withOpacity(0.1),
                borderWidth: 1,
                fontSize: 15,
                onTap: () {
                  logic.onClick(1);
                  Get.back();
                },
              );
            },
          ),
          const SizedBox(height: 8),
          AppButton(
            buttonColor: AppColors.whiteColor,
            width: Get.width * 0.65,
            height: 46,
            buttonText: "txtCancel".tr,
            borderColor: AppColors.greyColor.withOpacity(0.1),
            borderWidth: 1,
            fontFamily: AppFontFamily.sfProDisplay,
            fontSize: 15,
            color: AppColors.primaryTextColor,
            onTap: () {
              Get.back();
            },
          )
        ],
      ),
    );
  }
}
