// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
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
  final String paymentType;

  CheckOutDialog(
      {super.key,
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
      required this.userName});

  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return paymentType == 'cashAfterService'
        ? Container(
            height: Get.height * 0.49,
            padding: const EdgeInsets.only(bottom: 20),
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
                      "Accept Payment",
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontSize: 18,
                        fontFamily: FontFamily.sfProDisplayBold,
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      height: 90,
                      width: 90,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1)),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: CachedNetworkImage(
                          imageUrl: serviceImage,
                          fit: BoxFit.cover,
                          placeholder: (context, url) {
                            return Image.asset(AppAsset.icPlaceholder);
                          },
                          errorWidget: (context, url, error) {
                            return Image.asset(AppAsset.icPlaceholder);
                          },
                        ),
                      ),
                    ).paddingOnly(top: 10, left: 15, right: 10),
                    Container(
                      height: 90,
                      margin: const EdgeInsets.only(top: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                height: 20,
                                width: 90,
                                child: Text(
                                  serviceName,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontFamily: FontFamily.sfProDisplayBold,
                                    color: AppColors.blackColor,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ).paddingOnly(right: 8),
                              Text(
                                "#$id",
                                style:
                                    TextStyle(fontSize: 12.5, fontFamily: FontFamily.sfProDisplay, color: AppColors.blackColor),
                              ),
                            ],
                          ),
                          Text(
                            subCategoryName,
                            style:
                                TextStyle(fontSize: 15, fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.greyColor2),
                          ).paddingOnly(top: 8),
                          // Container(
                          //   height: 28,
                          //   width: 78,
                          //   decoration: BoxDecoration(
                          //     borderRadius: BorderRadius.circular(6),
                          //     color: AppColors.green,
                          //   ),
                          //   child: Center(
                          //     child: Text(
                          //       "$currency $rupee",
                          //       style:
                          //           TextStyle(fontSize: 16, fontFamily: FontFamily.sfProDisplayBold, color: AppColors.currency),
                          //     ),
                          //   ),
                          // ),
                          Spacer(),
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
                                style:
                                    TextStyle(fontSize: 12, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.service),
                              )
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
                SizedBox(height: Get.height * 0.03),
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    text: 'Reminder that ',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontFamily: FontFamily.sfProDisplayMedium,
                      color: AppColors.captionDialog,
                    ),
                    children: [
                      TextSpan(
                        text: userName,
                        style: TextStyle(
                          fontSize: 14,
                          fontFamily: FontFamily.sfProDisplay,
                          color: AppColors.primaryTextColor.withOpacity(0.9),
                        ),
                      ),
                      TextSpan(
                        text: ' selected the\n',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontFamily: FontFamily.sfProDisplay,
                          color: AppColors.captionDialog,
                        ),
                      ),
                      TextSpan(
                        text: ' Cash After Service',
                        style: TextStyle(
                          fontSize: 17,
                          fontFamily: FontFamily.sfProDisplay,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                      TextSpan(
                        text: ' \npayment option for this service',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontFamily: FontFamily.sfProDisplayMedium,
                          color: AppColors.captionDialog,
                        ),
                      ),
                    ],
                  ),
                ).paddingOnly(left: 30, right: 30),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 6),
                  child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
                ),
                GetBuilder<BookingScreenController>(
                  id: Constant.idPaymentReceive,
                  builder: (logic) {
                    return InkWell(
                      onTap: () {
                        logic.onPaymentReceive();
                      },
                      child: Row(
                        children: [
                          Container(
                            height: 20,
                            width: 20,
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.primaryAppColor, width: 1),
                              borderRadius: BorderRadius.circular(5),
                              color: logic.isPaymentReceive == true ? AppColors.primaryAppColor : AppColors.transparent,
                            ),
                            padding: const EdgeInsets.all(5),
                            margin: const EdgeInsets.only(right: 8),
                            child: logic.isPaymentReceive == true
                                ? Image.asset(
                                    AppAsset.icCheck,
                                    color: Colors.white,
                                  )
                                : const SizedBox.shrink(),
                          ),
                          Text(
                            "Receive Payment",
                            style: TextStyle(
                              fontSize: 17,
                              fontFamily: FontFamily.sfProDisplayMedium,
                              color: AppColors.captionDialog,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ).paddingOnly(left: 20);
                  },
                ),
                SizedBox(height: Get.height * 0.02),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppButton(
                      height: 50,
                      width: Get.width * 0.31,
                      buttonColor: AppColors.whiteColor,
                      buttonText: "txtCancel".tr,
                      fontSize: 16.5,
                      borderColor: AppColors.greyColor.withOpacity(0.2),
                      borderWidth: 1,
                      fontFamily: FontFamily.sfProDisplay,
                      textColor: AppColors.currency,
                      boxShadow: Constant.boxShadow,
                      onTap: () {
                        Get.back();
                      },
                    ),
                    GetBuilder<BookingScreenController>(
                      id: Constant.idPaymentReceive,
                      builder: (logic) {
                        return AppButton(
                          height: 50,
                          width: Get.width * 0.31,
                          buttonColor: logic.isCheckOut == true ? AppColors.primaryAppColor : AppColors.grey.withOpacity(0.5),
                          buttonText: "txtCheckOut".tr,
                          textColor: AppColors.whiteColor,
                          fontFamily: FontFamily.sfProDisplay,
                          fontSize: 16.5,
                          onTap: () async {
                            if (logic.isCheckOut == true) {
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
                                  logic.isCheckOut = false;
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
                    )
                  ],
                ).paddingOnly(left: 15, right: 15)
              ],
            ))
        : Container(
            height: Get.height * 0.43,
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
                    child: Text("txtCheckOut".tr,
                        style: TextStyle(color: AppColors.whiteColor, fontSize: 18, fontFamily: FontFamily.sfProDisplayBold)),
                  ),
                ),
                Row(
                  children: [
                    ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          serviceImage,
                          height: 100,
                          width: 100,
                          fit: BoxFit.cover,
                        )).paddingOnly(top: 10, left: 15, right: 10),
                    Container(
                      height: 100,
                      margin: const EdgeInsets.only(top: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                height: 20,
                                width: 90,
                                child: Text(
                                  serviceName,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontFamily: FontFamily.sfProDisplayBold,
                                    color: AppColors.blackColor,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                              Text(
                                "#$id",
                                style: TextStyle(fontSize: 15, fontFamily: FontFamily.sfProDisplay, color: AppColors.blackColor),
                              ),
                            ],
                          ),
                          Text(
                            subCategoryName,
                            style:
                                TextStyle(fontSize: 15, fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.greyColor2),
                          ),
                          Container(
                            height: 28,
                            width: 78,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              color: AppColors.green,
                            ),
                            child: Center(
                              child: Text(
                                "$currency $rupee",
                                style:
                                    TextStyle(fontSize: 16, fontFamily: FontFamily.sfProDisplayBold, color: AppColors.currency),
                              ),
                            ),
                          ),
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
                                style:
                                    TextStyle(fontSize: 12, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.service),
                              )
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
                SizedBox(height: Get.height * 0.03),
                Text(
                  "txtCheckOutOrder".tr,
                  style: TextStyle(
                    fontSize: 17,
                    fontFamily: FontFamily.sfProDisplayMedium,
                    color: AppColors.captionDialog,
                  ),
                  textAlign: TextAlign.center,
                ).paddingOnly(left: 40, right: 40),
                SizedBox(height: Get.height * 0.03),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppButton(
                      height: 50,
                      width: Get.width * 0.31,
                      buttonColor: AppColors.whiteColor,
                      buttonText: "txtCancel".tr,
                      fontSize: 16.5,
                      borderColor: AppColors.greyColor.withOpacity(0.2),
                      borderWidth: 1,
                      fontFamily: FontFamily.sfProDisplay,
                      textColor: AppColors.currency,
                      boxShadow: Constant.boxShadow,
                      onTap: () {
                        Get.back();
                      },
                    ),
                    AppButton(
                      height: 50,
                      width: Get.width * 0.31,
                      buttonColor: AppColors.primaryAppColor,
                      buttonText: "txtCheckOut".tr,
                      textColor: AppColors.whiteColor,
                      fontFamily: FontFamily.sfProDisplay,
                      fontSize: 16.5,
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
                    )
                  ],
                ).paddingOnly(left: 15, right: 15)
              ],
            ));
  }
}
