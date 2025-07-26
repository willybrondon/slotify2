import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/confirm_booking_screen/controller/confirm_booking_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

/// =================== Payment Top view =================== ///
class ConfirmBookingPaymentView extends StatelessWidget {
  const ConfirmBookingPaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: Get.width,
      color: AppColors.confirmBookingBg,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            AppAsset.icConfirm,
            height: 200,
            width: 200,
          ).paddingOnly(top: Get.height * 0.075, bottom: 15),
          Text(
            "Booking Confirmed",
            style: TextStyle(
              color: AppColors.primaryAppColor,
              fontSize: 24,
              fontFamily: AppFontFamily.heeBo800,
            ),
          ).paddingOnly(top: 10),
          Text(
            "Your booking is confirm with expertname at 09:00 PM.",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.bgStepper,
              fontSize: 15,
              fontFamily: AppFontFamily.heeBo600,
            ),
          ).paddingOnly(bottom: 25,left: 20,right: 20),
        ],
      ),
    );
  }
}

/// =================== Appointment Information =================== ///
class ConfirmBookingInfoView extends StatelessWidget {
  const ConfirmBookingInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ConfirmBookingController>(
      builder: (logic) {
        return Container(
          width: Get.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: AppColors.whiteColor,
            border: Border.all(
              color: AppColors.grey.withOpacity(0.1),
              width: 1,
            ),
          ),
          margin: const EdgeInsets.only(bottom: 10),
          child: Stack(
            children: [
              Align(
                alignment: Alignment.topRight,
                child: GestureDetector(
                  onLongPress: () {
                    String bookingId = "256387";
                    FlutterClipboard.copy(bookingId);
                    log("Copy Booking ID :: $bookingId");
                    Utils.showToast(Get.context!, "Copied $bookingId");
                  },
                  child: Container(
                    height: 30,
                    width: Get.width * 0.2,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(15),
                        topRight: Radius.circular(12),
                      ),
                      color: AppColors.primaryAppColor,
                    ),
                    child: Text(
                      "#${256387}",
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 12,
                        color: AppColors.whiteColor,
                      ),
                    ),
                  ),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(top: 10),
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 100,
                            width: 100,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: AppColors.grey.withOpacity(0.05),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: "",
                                fit: BoxFit.cover,
                                placeholder: (context, url) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                },
                                errorWidget: (context, url, error) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                },
                              ),
                            ),
                          ),
                          SizedBox(width: Get.width * 0.03),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(
                                height: 20,
                                width: Get.width * 0.35,
                                child: Text(
                                  "result ?? " "",
                                  style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 17,
                                      overflow: TextOverflow.ellipsis,
                                      color: AppColors.primaryTextColor),
                                ),
                              ),
                              SizedBox(height: Get.height * 0.005),
                              Text(
                                "fname",
                                style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplayMedium, fontSize: 14, color: AppColors.service),
                              ),
                              SizedBox(height: Get.height * 0.005),
                              Container(
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(7),
                                  color: AppColors.currencyBoxBg,
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                  child: Text(
                                    "$currency ${"amount"}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      fontSize: 16,
                                      color: AppColors.primaryAppColor,
                                    ),
                                  ),
                                ),
                              ).paddingOnly(bottom: 2),
                              SizedBox(height: Get.height * 0.005),
                              Row(
                                children: [
                                  Container(
                                    height: 18,
                                    width: 18,
                                    decoration: BoxDecoration(
                                      color: AppColors.grey.withOpacity(0.2),
                                      shape: BoxShape.circle,
                                    ),
                                    clipBehavior: Clip.hardEdge,
                                    child: Image.network(
                                      "iame",
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Icon(
                                          Icons.error_outline,
                                          color: AppColors.blackColor,
                                          size: 10,
                                        );
                                      },
                                    ),
                                  ),
                                  Text(
                                    "  ${"fname"} ${"lname"}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                      fontSize: 11.5,
                                      color: AppColors.service,
                                    ),
                                  ),
                                ],
                              )
                            ],
                          )
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.bgTime,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
                      child: Row(
                        children: [
                          Container(
                            height: 40,
                            width: 40,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.bgCircle,
                            ),
                            child: Image.asset(
                              AppAsset.icBookingFilled,
                              color: AppColors.primaryAppColor,
                            ).paddingAll(10),
                          ).paddingOnly(right: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "date",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 14,
                                  color: AppColors.primaryTextColor,
                                ),
                              ),
                              Text(
                                "Booking Date",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 12,
                                  color: AppColors.service,
                                ),
                              )
                            ],
                          ),
                          const Spacer(),
                          Container(
                            height: 36,
                            width: 2,
                            color: AppColors.serviceBorder,
                          ),
                          const Spacer(),
                          Container(
                            height: 40,
                            width: 40,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.bgCircle,
                            ),
                            child: Image.asset(
                              AppAsset.icClock,
                            ).paddingAll(10),
                          ).paddingOnly(right: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "time",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 14,
                                  color: AppColors.primaryTextColor,
                                ),
                              ),
                              Text(
                                "Booking Timing",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 12,
                                  color: AppColors.service,
                                ),
                              )
                            ],
                          ),
                          const Spacer(),
                        ],
                      ),
                    ).paddingOnly(top: 12, left: 12, right: 12),
                    Image.asset(AppAsset.icLine1).paddingOnly(top: 15, bottom: 15, left: 12, right: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Name :",
                          style: TextStyle(
                            fontSize: 15,
                            fontFamily: AppFontFamily.heeBo600,
                            color: AppColors.currencyGrey,
                          ),
                        ),
                        Text(
                          "William Andrew",
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: AppFontFamily.heeBo800,
                            color: AppColors.primaryAppColor,
                          ),
                        )
                      ],
                    ).paddingOnly(left: 12, right: 12),
                    const SizedBox(height: 15),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Amount :",
                          style: TextStyle(
                            fontSize: 15,
                            fontFamily: AppFontFamily.heeBo600,
                            color: AppColors.currencyGrey,
                          ),
                        ),
                        Text(
                          "$currency ${850.00}",
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: AppFontFamily.heeBo800,
                            color: AppColors.primaryAppColor,
                          ),
                        )
                      ],
                    ).paddingOnly(left: 12, right: 12),
                    const SizedBox(height: 15),
                  ],
                ),
              ),
            ],
          ),
        ).paddingAll(10);
      },
    );
  }
}

/// =================== Bottom View =================== ///
class ConfirmBookingBottomView extends StatelessWidget {
  const ConfirmBookingBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppButton(
      height: 52,
      buttonColor: AppColors.primaryAppColor,
      color: AppColors.whiteColor,
      fontFamily: AppFontFamily.heeBo700,
      fontSize: 17,
      radius: 10,
      buttonText: "Back to home page",
      onTap: () {
        Get.offAllNamed(AppRoutes.bottom);
      },
    ).paddingAll(15);
  }
}
