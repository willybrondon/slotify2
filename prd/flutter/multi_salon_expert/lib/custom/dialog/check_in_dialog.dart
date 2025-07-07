// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
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

class CheckInDialog extends StatelessWidget {
  final String serviceImage;
  final String serviceName;
  final String subCategoryName;
  final String bookingId;
  final String rupee;
  final String expertImage;
  final String expertName;
  final String id;
  final int index;

  CheckInDialog(
      {super.key,
      required this.serviceImage,
      required this.serviceName,
      required this.subCategoryName,
      required this.bookingId,
      required this.rupee,
      required this.expertImage,
      required this.expertName,
      required this.id,
      required this.index});

  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
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
                child: Text("txtCheckIn".tr,
                    style: TextStyle(color: AppColors.whiteColor, fontSize: 18, fontFamily: FontFamily.sfProDisplayBold)),
              ),
            ),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 90,
                    width: 90,
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
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                serviceName,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ).paddingOnly(right: 8),
                          Text(
                            "#$id",
                            style: TextStyle(fontSize: 12.5, fontFamily: FontFamily.sfProDisplay, color: AppColors.blackColor),
                          ),
                        ],
                      ),
                      Text(
                        subCategoryName,
                        style: TextStyle(fontSize: 14, fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.service),
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
                      //       style: TextStyle(fontSize: 16, fontFamily: FontFamily.sfProDisplayBold, color: AppColors.currency),
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
                            style: TextStyle(fontSize: 12, fontFamily: FontFamily.sfProDisplayMedium, color: AppColors.service),
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
              "txtCheckInOrder".tr,
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
                  buttonText: "txtCheckIn".tr,
                  textColor: AppColors.whiteColor,
                  fontFamily: FontFamily.sfProDisplay,
                  fontSize: 16.5,
                  onTap: () async {
                    await bookingScreenController.onUpdateBookingStatusApiCall(
                        bookingId: bookingId, status: "confirm", person: "expert", reason: "");

                    if (bookingScreenController.cancelConfirmBookingCategory?.status == true) {
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
                          Get.context!, bookingScreenController.cancelConfirmBookingCategory?.message.toString() ?? "");
                    }
                  },
                )
              ],
            ).paddingOnly(left: 15, right: 15)
          ],
        ));
  }
}
