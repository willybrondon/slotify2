// ignore_for_file: must_be_immutable

import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
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
      height: 335,
      padding: const EdgeInsets.only(left: 15, right: 15, top: 20, bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Image.asset(
            AppAsset.inSuccessfully,
            height: 70,
            width: 70,
          ).paddingOnly(top: 5, bottom: 15),
          Text(
            "txtBookingSuccessful".tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              color: AppColors.categoryService,
              fontSize: 20,
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
                fontSize: 14,
              ),
            ),
          ).paddingOnly(top: 8, bottom: 5),
          const Spacer(),
          GetBuilder<BottomBarController>(
            id: Constant.idBottomBar,
            builder: (logic) {
              return AppButton(
                buttonColor: AppColors.primaryAppColor,
                width: Get.width * 0.6,
                height: 42,
                buttonText: "txtGotoBookings".tr,
                color: AppColors.whiteColor,
                fontFamily: AppFontFamily.sfProDisplay,
                borderColor: AppColors.grey.withOpacity(0.1),
                borderWidth: 1,
                fontSize: 14,
                onTap: () async {
                  Get.back(); // Close dialog first
                  // Force reload booking data before navigating
                  try {
                    BookingDetailScreenController? bookingController =
                        Get.isRegistered<BookingDetailScreenController>()
                            ? Get.find<BookingDetailScreenController>()
                            : null;

                    if (bookingController != null) {
                      log("SuccessDialog - Forcing reload of pending bookings...");
                      bookingController.startPending = 0;
                      bookingController.getPending = [];
                      bookingController.tabController?.index =
                          0; // Set to pending tab

                      // Load pending bookings
                      await bookingController.onGetAllBookingApiCall(
                        userId: Constant.storage.read<String>('userId') ?? "",
                        status: "pending",
                        start: bookingController.startPending.toString(),
                        limit: bookingController.limitPending.toString(),
                        search: bookingController
                            .bookingDetailScreenEditingController.text
                            .trim(),
                      );
                      log("SuccessDialog - ✅ Pending bookings reloaded");
                    }
                  } catch (e) {
                    log("SuccessDialog - ⚠️ Error reloading bookings: $e");
                  }
                  // Navigate to bookings tab
                  logic.onClick(1);
                },
              );
            },
          ),
          const SizedBox(height: 6),
          AppButton(
            buttonColor: AppColors.whiteColor,
            width: Get.width * 0.6,
            height: 42,
            buttonText: "txtCancel".tr,
            borderColor: AppColors.greyColor.withOpacity(0.1),
            borderWidth: 1,
            fontFamily: AppFontFamily.sfProDisplay,
            fontSize: 14,
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
