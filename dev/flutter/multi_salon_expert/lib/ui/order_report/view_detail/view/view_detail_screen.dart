// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/order_report/view_detail/controller/view_detail_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class ViewDetailScreen extends StatelessWidget {
  ViewDetailScreen({super.key});

  ViewDetailController viewDetailController = Get.find<ViewDetailController>();

  @override
  Widget build(BuildContext context) {
    viewDetailController.str = viewDetailController.orderDetails?.date.toString() ?? "";
    viewDetailController.parts = viewDetailController.str?.split(' ');
    viewDetailController.date = viewDetailController.parts?[0];
    viewDetailController.time = viewDetailController.parts![1].trim();

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.transparent,
        flexibleSpace: AppBarCustom(
          title: "txtViewDetails".tr,
          method: InkWell(
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
      body: Column(
        children: [
          Container(
            width: Get.width,
            margin: const EdgeInsets.only(top: 15, right: 15, left: 15),
            padding: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Stack(
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: GestureDetector(
                    onLongPress: () {
                      String bookingId = viewDetailController.orderDetails?.bookingId ?? "";
                      FlutterClipboard.copy(bookingId);
                      Utils.showToast(Get.context!, "Copied $bookingId");
                      log("Copy Booking ID :: $bookingId");
                    },
                    child: Container(
                      height: 30,
                      width: Get.width * 0.2,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(15), topRight: Radius.circular(12)),
                        color: AppColors.tabUnSelect,
                      ),
                      child: Text(
                        "#${viewDetailController.orderDetails?.bookingId}",
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: FontFamily.sfProDisplay,
                          color: AppColors.buttonText,
                        ),
                      ),
                    ),
                  ),
                ),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(
                    "${viewDetailController.orderDetails?.userFname} ${viewDetailController.orderDetails?.userLname}",
                    style: TextStyle(
                      fontSize: 20,
                      fontFamily: FontFamily.sfProDisplayBold,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  Text(
                    viewDetailController.orderDetails?.service?.first ?? "",
                    style: TextStyle(
                      fontSize: 14,
                      fontFamily: FontFamily.sfProDisplayMedium,
                      color: AppColors.title,
                    ),
                  ),
                  SizedBox(height: Get.height * 0.01),
                  Row(
                    children: [
                      Image.asset(
                        AppAsset.icBooking,
                        height: 21,
                        width: 21,
                      ),
                      SizedBox(width: Get.width * 0.02),
                      Text(
                        viewDetailController.date.toString(),
                        style: TextStyle(
                          fontFamily: FontFamily.sfProDisplayMedium,
                          fontSize: 13,
                          color: AppColors.service,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: Get.height * 0.02),
                  Row(
                    children: [
                      Image.asset(
                        AppAsset.icClock,
                        height: 21,
                        width: 21,
                      ),
                      SizedBox(width: Get.width * 0.01),
                      Text(
                        viewDetailController.orderDetails?.startTime ?? '',
                        style: TextStyle(
                          fontFamily: FontFamily.sfProDisplayMedium,
                          fontSize: 13,
                          color: AppColors.service,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: Get.height * 0.01),
                  Container(
                    height: 32,
                    width: 78,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      color: AppColors.green,
                    ),
                    child: Center(
                      child: Text(
                        '$currency ${viewDetailController.orderDetails?.withoutTax?.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 16,
                          fontFamily: FontFamily.sfProDisplayBold,
                          color: AppColors.currency,
                        ),
                      ),
                    ),
                  ),
                  Divider(color: AppColors.greyColor.withOpacity(0.2)).paddingOnly(top: 5, bottom: 5),
                  Text(
                    'txtPaymentMethod'.tr,
                    style: TextStyle(
                      fontSize: 17,
                      fontFamily: FontFamily.sfProDisplayBold,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  SizedBox(height: Get.height * 0.01),
                  Row(
                    children: [
                      Container(
                        height: 40,
                        width: 40,
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: AppColors.roundBg,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1),
                        ),
                        child: viewDetailController.orderDetails?.paymentType == "Razorpay"
                            ? Image.asset(AppAsset.icRazorPay)
                            : viewDetailController.orderDetails?.paymentType == "Stripe"
                                ? Image.asset(AppAsset.icStripe)
                                : viewDetailController.orderDetails?.paymentType == "cashAfterService"
                                    ? Image.asset(AppAsset.icCashAfterService)
                                    : viewDetailController.orderDetails?.paymentType == "flutterWave"
                                        ? Image.asset(AppAsset.icFlutterWave)
                                        : null,
                      ),
                      Container(
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.green,
                            border: Border.all(color: AppColors.primaryAppColor.withOpacity(0.02), width: 1)),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                          child: Text(
                            "${viewDetailController.orderDetails?.paymentType}",
                            style: TextStyle(fontSize: 17, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.currency),
                          ),
                        ),
                      )
                    ],
                  ),
                  SizedBox(height: Get.height * 0.03),
                  Text(
                    'txtOrderStatus'.tr,
                    style: TextStyle(fontSize: 17, fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor),
                  ),
                  SizedBox(height: Get.height * 0.01),
                  (viewDetailController.orderDetails?.status == "completed")
                      ? Row(
                          children: [
                            Image.asset(
                              AppAsset.icOrderConfirm,
                              height: 22,
                              width: 22,
                            ).paddingOnly(right: 5),
                            Text(
                              'txtOrderSuccessfully'.tr,
                              style:
                                  TextStyle(fontSize: 18, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.greenColor),
                            ),
                          ],
                        )
                      : (viewDetailController.orderDetails?.status == "cancel")
                          ? Row(
                              children: [
                                Container(
                                  height: 15,
                                  width: 15,
                                  margin: const EdgeInsets.only(right: 10),
                                  decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.redColor),
                                ),
                                Text(
                                  'txtCancelled'.tr,
                                  style: TextStyle(
                                      fontSize: 16, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.redColor),
                                ),
                              ],
                            )
                          : (viewDetailController.orderDetails?.status == "pending")
                              ? Row(
                                  children: [
                                    Container(
                                      height: 15,
                                      width: 15,
                                      margin: const EdgeInsets.only(right: 10),
                                      decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.greenColor),
                                    ),
                                    Text(
                                      'txtPending'.tr,
                                      style: TextStyle(
                                          fontSize: 16, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.greenColor),
                                    ),
                                  ],
                                )
                              : Row(
                                  children: [
                                    Container(
                                      height: 15,
                                      width: 15,
                                      margin: const EdgeInsets.only(right: 10),
                                      decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.greenColor),
                                    ),
                                    Text(
                                      'Pending',
                                      style: TextStyle(
                                          fontSize: 16, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.greenColor),
                                    ),
                                  ],
                                ),
                  (viewDetailController.orderDetails?.status == "completed")
                      ? Row(
                          children: [
                            Image.asset(
                              AppAsset.icCheckIn1,
                              height: 22,
                              width: 22,
                            ).paddingOnly(right: 5),
                            Text(
                              viewDetailController.orderDetails?.checkInTime ?? "",
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayMedium,
                                fontSize: 13,
                                color: AppColors.service,
                              ),
                            ),
                            const Spacer(),
                            Image.asset(
                              AppAsset.icCheckOut,
                              height: 22,
                              width: 22,
                            ).paddingOnly(right: 5),
                            Text(
                              viewDetailController.orderDetails?.checkOutTime ?? "",
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayMedium,
                                fontSize: 13,
                                color: AppColors.service,
                              ),
                            ).paddingOnly(right: 15),
                          ],
                        ).paddingOnly(top: 8)
                      : (viewDetailController.orderDetails?.status == "cancel")
                          ? Row(
                              children: [
                                Image.asset(
                                  AppAsset.icCancel,
                                  height: 22,
                                  width: 22,
                                ).paddingOnly(right: 5),
                                Text(
                                  viewDetailController.orderDetails?.cancel?.time ?? "",
                                  style: TextStyle(
                                    fontFamily: FontFamily.sfProDisplayMedium,
                                    fontSize: 13,
                                    color: AppColors.service,
                                  ),
                                ),
                              ],
                            ).paddingOnly(top: 8)
                          : const Offstage()
                ]).paddingOnly(left: 12, top: 10),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
