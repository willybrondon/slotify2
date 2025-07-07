// ignore_for_file: must_be_immutable

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
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
  });

  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 390,
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
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
                "Cancel Order",
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
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  serviceImage,
                  height: 100,
                  width: 100,
                  fit: BoxFit.cover,
                ),
              ).paddingOnly(top: 10, left: 10, right: 10),
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
                          width: 85,
                          child: Text(
                            serviceName,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 16,
                              fontFamily: FontFamily.sfProDisplayBold,
                              color: AppColors.blackColor,
                            ),
                          ),
                        ),
                        Text(
                          " #$id",
                          style: TextStyle(
                            fontSize: 15,
                            fontFamily: FontFamily.sfProDisplay,
                            color: AppColors.blackColor,
                          ),
                        ).paddingOnly(right: 6),
                      ],
                    ),
                    Text(
                      subCategoryName,
                      style: TextStyle(
                        fontSize: 15,
                        fontFamily: FontFamily.sfProDisplayRegular,
                        color: AppColors.greyColor2,
                      ),
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
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: FontFamily.sfProDisplayBold,
                            color: AppColors.currency,
                          ),
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
                          style: TextStyle(
                            fontSize: 12,
                            fontFamily: FontFamily.sfProDisplayMedium,
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
          const SizedBox(height: 15),
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
            hintTextStyle: FontFamily.sfProDisplayRegular,
          ).paddingOnly(left: 10, right: 10),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppButton(
                height: 50,
                width: Get.width * 0.31,
                buttonColor: AppColors.whiteColor,
                buttonText: "txtClose".tr,
                fontSize: 16.5,
                borderColor: AppColors.greyColor.withOpacity(0.2),
                borderWidth: 1,
                fontFamily: FontFamily.sfProDisplay,
                textColor: AppColors.currency,
                boxShadow: Constant.boxShadow,
                onTap: () {
                  bookingScreenController.reasonEditingController.clear();
                  Get.back();
                },
              ),
              AppButton(
                height: 50,
                width: Get.width * 0.31,
                buttonColor: AppColors.redColor,
                buttonText: "txtCancel".tr,
                textColor: AppColors.whiteColor,
                fontFamily: FontFamily.sfProDisplay,
                fontSize: 16.5,
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
              )
            ],
          ).paddingOnly(left: 15, right: 15, bottom: 15)
        ],
      ),
    );
  }
}
