// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/utils.dart';

class CheckOutDialog extends StatelessWidget {
  final String serviceImage;
  final String serviceName;
  final String subCategoryName;
  final String bookingId;
  final String rupee;
  final String expertImage;
  final String expertName;
  final String userName;
  final int index;
  final String id;
  final String date;
  final String time;
  final String paymentType;

  CheckOutDialog({
    super.key,
    required this.serviceImage,
    required this.serviceName,
    required this.subCategoryName,
    required this.bookingId,
    required this.rupee,
    required this.expertImage,
    required this.expertName,
    required this.index,
    required this.id,
    required this.paymentType,
    required this.userName,
    required this.date,
    required this.time,
  });

  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return paymentType == 'cashAfterService'
        ? Container(
            height: 410,
            padding: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: AppColors.dialogBg,
              borderRadius: BorderRadius.circular(45),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 55,
                  width: Get.width,
                  decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(45),
                        topRight: Radius.circular(45),
                      ),
                      color: AppColors.iconColor),
                  child: Center(
                    child: Text(
                      "Accept Payment",
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontSize: 18,
                        fontFamily: AppFontFamily.sfProDisplayBold,
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        height: 100,
                        width: 100,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                        child: CachedNetworkImage(
                          imageUrl: serviceImage,
                          fit: BoxFit.cover,
                          placeholder: (context, url) {
                            return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                          },
                          errorWidget: (context, url, error) {
                            return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                          },
                        ),
                      ),
                    ).paddingOnly(top: 10, left: 15, right: 10),
                    Container(
                      height: 105,
                      margin: const EdgeInsets.only(top: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: Get.width * 0.27,
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    serviceName,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontFamily: AppFontFamily.heeBo700,
                                      color: AppColors.primaryTextColor,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                              ).paddingOnly(right: 8),
                              Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  color: AppColors.currencyBoxBg,
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                                child: Text(
                                  "#$id",
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontFamily: AppFontFamily.heeBo600,
                                    color: AppColors.primaryAppColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            subCategoryName,
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: AppFontFamily.sfProDisplayRegular,
                              color: AppColors.service,
                            ),
                          ).paddingOnly(bottom: 3),
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              color: AppColors.currencyBoxBg,
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                              child: Text(
                                "$currency $rupee",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.heeBo800,
                                  color: AppColors.primaryAppColor,
                                ),
                              ),
                            ),
                          ),
                          const Spacer(),
                          Row(
                            children: [
                              Container(
                                height: 19,
                                width: 19,
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                    image: NetworkImage(expertImage),
                                    fit: BoxFit.cover,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Text(
                                "  $expertName",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  color: AppColors.service,
                                ),
                              )
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
                Text(
                  "Payment Confirmation",
                  style: TextStyle(
                    color: AppColors.primaryAppColor,
                    fontSize: 15,
                    fontFamily: AppFontFamily.heeBo700,
                  ),
                ).paddingOnly(left: 15, top: 15, bottom: 7),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SizedBox(
                      width: Get.width * 0.55,
                      child: Text(
                        "Do You Receive Payment Confirmation?",
                        style: TextStyle(
                          color: AppColors.greyText,
                          fontSize: 13,
                          fontFamily: AppFontFamily.heeBo600,
                        ),
                      ),
                    ),
                    GetBuilder<BookingScreenController>(
                      id: Constant.idSwitchOn,
                      builder: (logic) {
                        return SizedBox(
                          height: 30,
                          child: Switch(
                            value: logic.isSwitchOn,
                            activeColor: AppColors.greenColor,
                            activeTrackColor: AppColors.whiteColor,
                            inactiveThumbColor: AppColors.redColor,
                            inactiveTrackColor: AppColors.whiteColor,
                            trackOutlineColor: WidgetStatePropertyAll(AppColors.grey.withOpacity(0.15)),
                            trackColor: WidgetStatePropertyAll(AppColors.switchBox),
                            onChanged: (value) {
                              logic.onSwitch(value);
                            },
                          ),
                        );
                      },
                    ),
                  ],
                ).paddingOnly(left: 15, right: 15),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.bgTime,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.grey.withOpacity(0.15),
                      width: 1,
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 10),
                  child: Row(
                    children: [
                      Container(
                        height: 40,
                        width: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.bgCircle,
                        ),
                        child: Image.asset(AppAsset.icBooking).paddingAll(10),
                      ).paddingOnly(right: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            date,
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
                            time,
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
                ).paddingOnly(top: 12, left: 12, right: 12, bottom: 15),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: AppButton(
                        height: 50,
                        buttonColor: AppColors.redColor,
                        buttonText: "txtCancel".tr,
                        fontSize: 17,
                        fontFamily: AppFontFamily.heeBo700,
                        textColor: AppColors.whiteColor,
                        borderRadius: 10,
                        onTap: () {
                          Get.back();
                        },
                      ),
                    ),
                    Expanded(
                      child: GetBuilder<BookingScreenController>(
                        id: Constant.idSwitchOn,
                        builder: (logic) {
                          return AppButton(
                            height: 50,
                            buttonColor: logic.isSwitchOn == true ? AppColors.primaryAppColor : AppColors.grey.withOpacity(0.5),
                            buttonText: "txtCheckOut".tr,
                            textColor: AppColors.whiteColor,
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 17,
                            borderRadius: 10,
                            onTap: () async {
                              if (logic.isSwitchOn == true) {
                                await logic.onUpdatePaymentStatusApiCall(bookingId: bookingId);

                                if (logic.updatePaymentStatusCategory?.status == true) {
                                  await logic.onCompleteBookingApiCall(bookingId: bookingId);
                                  if (logic.completeBookingCategory?.status == true) {
                                    logic.startPending = 0;
                                    logic.getPending = [];

                                    await logic.onStatusWiseBookingApiCall(
                                      expertId: Constant.storage.read<String>("expertId").toString(),
                                      status: "pending",
                                      start: logic.startPending.toString(),
                                      limit: logic.limitPending.toString(),
                                    );
                                    logic.isPaymentReceive = false;
                                    logic.isSwitchOn = false;
                                    Get.back();
                                  } else {
                                    Get.back();
                                    Utils.showToast(Get.context!, logic.completeBookingCategory?.message.toString() ?? "");
                                  }
                                } else {
                                  Get.back();
                                  Utils.showToast(Get.context!, logic.statusWiseBookingCategory?.message ?? "");
                                }
                              }
                            },
                          );
                        },
                      ),
                    )
                  ],
                ).paddingOnly(left: 15, right: 15)
              ],
            ),
          )
        : Container(
            height: 350,
            padding: const EdgeInsets.only(bottom: 25),
            decoration: BoxDecoration(
              color: AppColors.dialogBg,
              borderRadius: BorderRadius.circular(45),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 55,
                  width: Get.width,
                  decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(45),
                        topRight: Radius.circular(45),
                      ),
                      color: AppColors.iconColor),
                  child: Center(
                    child: Text(
                      "txtCheckOut".tr,
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontSize: 18,
                        fontFamily: AppFontFamily.sfProDisplayBold,
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        height: 100,
                        width: 100,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                        child: CachedNetworkImage(
                          imageUrl: serviceImage,
                          fit: BoxFit.cover,
                          placeholder: (context, url) {
                            return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                          },
                          errorWidget: (context, url, error) {
                            return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                          },
                        ),
                      ),
                    ).paddingOnly(top: 10, left: 15, right: 10),
                    Container(
                      height: 105,
                      margin: const EdgeInsets.only(top: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: Get.width * 0.27,
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    serviceName,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontFamily: AppFontFamily.heeBo700,
                                      color: AppColors.primaryTextColor,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                              ).paddingOnly(right: 8),
                              Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  color: AppColors.currencyBoxBg,
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                                child: Text(
                                  "#$id",
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontFamily: AppFontFamily.heeBo600,
                                    color: AppColors.primaryAppColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            subCategoryName,
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: AppFontFamily.sfProDisplayRegular,
                              color: AppColors.service,
                            ),
                          ).paddingOnly(bottom: 3),
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              color: AppColors.currencyBoxBg,
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                              child: Text(
                                "$currency $rupee",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.heeBo800,
                                  color: AppColors.primaryAppColor,
                                ),
                              ),
                            ),
                          ),
                          const Spacer(),
                          Row(
                            children: [
                              Container(
                                height: 19,
                                width: 19,
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                    image: NetworkImage(expertImage),
                                    fit: BoxFit.cover,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Text(
                                "  $expertName",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  color: AppColors.service,
                                ),
                              )
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
                const Spacer(),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.bgTime,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.grey.withOpacity(0.15),
                      width: 1,
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 10),
                  child: Row(
                    children: [
                      Container(
                        height: 40,
                        width: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.bgCircle,
                        ),
                        child: Image.asset(AppAsset.icBooking).paddingAll(10),
                      ).paddingOnly(right: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            date,
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
                            time,
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
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: AppButton(
                        height: 50,
                        buttonColor: AppColors.redColor,
                        buttonText: "txtCancel".tr,
                        fontSize: 17,
                        fontFamily: AppFontFamily.heeBo700,
                        textColor: AppColors.whiteColor,
                        borderRadius: 10,
                        onTap: () {
                          Get.back();
                        },
                      ),
                    ),
                    Expanded(
                      child: AppButton(
                        height: 50,
                        buttonColor: AppColors.primaryAppColor,
                        buttonText: "txtCheckOut".tr,
                        textColor: AppColors.whiteColor,
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 17,
                        borderRadius: 10,
                        onTap: () async {
                          await bookingScreenController.onCompleteBookingApiCall(bookingId: bookingId);

                          if (bookingScreenController.completeBookingCategory?.status == true) {
                            bookingScreenController.startPending = 0;
                            bookingScreenController.getPending = [];

                            Get.back();
                            await bookingScreenController.onStatusWiseBookingApiCall(
                              expertId: Constant.storage.read<String>("expertId").toString(),
                              status: "pending",
                              start: bookingScreenController.startPending.toString(),
                              limit: bookingScreenController.limitPending.toString(),
                            );
                          } else {
                            Get.back();
                            Utils.showToast(
                                Get.context!, bookingScreenController.completeBookingCategory?.message.toString() ?? "");
                          }
                        },
                      ),
                    )
                  ],
                ).paddingOnly(left: 15, right: 15)
              ],
            ));
  }
}
