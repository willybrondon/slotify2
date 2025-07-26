// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/utils.dart';

class CancelOrderDialog extends StatelessWidget {
  final String serviceImage;
  final String serviceName;
  final String bookingId;
  final String subCategoryName;
  final String rupee;
  final String expertImage;
  final String expertName;
  final int index;
  final String id;
  final String date;
  final String time;

  CancelOrderDialog({
    super.key,
    required this.serviceImage,
    required this.serviceName,
    required this.bookingId,
    required this.subCategoryName,
    required this.rupee,
    required this.expertImage,
    required this.expertName,
    required this.index,
    required this.id,
    required this.date,
    required this.time,
  });

  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 480,
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(40),
      ),
      child: Column(
        children: [
          Container(
            height: 55,
            width: Get.width,
            decoration: BoxDecoration(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(40),
                  topRight: Radius.circular(40),
                ),
                color: AppColors.iconColor),
            child: Center(
              child: Text(
                "Cancel Order",
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
          const SizedBox(height: 13),
          TextFormFieldCustom(
            method: TextFieldCustom(
              hintText: "txtEnterSpecificReason".tr,
              obscureText: false,
              controller: bookingScreenController.reasonEditingController,
              textInputAction: TextInputAction.done,
              maxLines: 4,
            ),
            title: "",
            borderColor: AppColors.greyColor.withOpacity(0.1),
            borderWidth: 1,
            hintTextColor: AppColors.subTitle,
            hintTextSize: 14.5,
            hintTextStyle: AppFontFamily.sfProDisplayRegular,
          ).paddingOnly(left: 10, right: 10),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: AppButton(
                  height: 50,
                  buttonColor: AppColors.primaryAppColor,
                  buttonText: "txtClose".tr,
                  fontSize: 17,
                  borderRadius: 10,
                  fontFamily: AppFontFamily.heeBo700,
                  textColor: AppColors.whiteColor,
                  onTap: () {
                    bookingScreenController.reasonEditingController.clear();
                    Get.back();
                  },
                ),
              ),
              Expanded(
                child: AppButton(
                  height: 50,
                  buttonColor: AppColors.redColor,
                  buttonText: "txtCancel".tr,
                  textColor: AppColors.whiteColor,
                  fontFamily: AppFontFamily.heeBo700,
                  fontSize: 17,
                  borderRadius: 10,
                  onTap: () async {
                    if (bookingScreenController.reasonEditingController.text.isEmpty) {
                      Utils.showToast(Get.context!, "txtPleaseEnterSpecificReason".tr);
                    } else {
                      FocusScopeNode currentFocus = FocusScope.of(context);
                      currentFocus.focusedChild?.unfocus();

                      await bookingScreenController.onUpdateBookingStatusApiCall(
                        bookingId: bookingId,
                        status: "cancel",
                        reason: bookingScreenController.reasonEditingController.text,
                        person: 'expert',
                      );

                      if (bookingScreenController.cancelConfirmBookingCategory?.status == true) {
                        Utils.showToast(Get.context!, bookingScreenController.cancelConfirmBookingCategory?.message ?? "");

                        bookingScreenController.startPending = 0;
                        bookingScreenController.getPending = [];

                        Get.back();
                        await bookingScreenController.onStatusWiseBookingApiCall(
                            expertId: Constant.storage.read<String>("expertId").toString(),
                            status: "pending",
                            start: bookingScreenController.startPending.toString(),
                            limit: bookingScreenController.limitPending.toString());

                        bookingScreenController.reasonEditingController.clear();
                      } else {
                        Get.back();
                        Utils.showToast(Get.context!, bookingScreenController.cancelConfirmBookingCategory?.message ?? "");
                      }
                    }
                  },
                ),
              )
            ],
          ).paddingOnly(left: 15, right: 15, bottom: 15)
        ],
      ),
    );
  }
}
