import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/utils.dart';

class CancelAppointmentDialog extends StatelessWidget {
  final String bookingId;
  final int index;

  CancelAppointmentDialog({super.key, required this.index, required this.bookingId});

  final BookingDetailScreenController bookingDetailScreenController = Get.find<BookingDetailScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 385,
        padding: const EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
        decoration: BoxDecoration(
          color: AppColors.dialogBg,
          borderRadius: BorderRadius.circular(45),
        ),
        child: Column(
          children: [
            Image.asset(
              AppAsset.icAppointment,
              height: 90,
              width: 90,
            ).paddingOnly(bottom: 5),
            Text(
              "txtCancelAppointment".tr,
              style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 23),
            ),
            Text(
              "desCancelBooking".tr,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: FontFamily.sfProDisplayRegular,
                color: AppColors.captionDialog,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 15),
            TextFormFieldCustom(
              method: TextFieldCustom(
                hintText: "txtEnterSpecificReason".tr,
                obscureText: false,
                controller: bookingDetailScreenController.reasonEditingController,
                textInputAction: TextInputAction.done,
                maxLine: 4,
              ),
              title: "",
              borderColor: AppColors.greyColor.withOpacity(0.1),
              borderWidth: 1,
              hintTextColor: AppColors.subTitle,
              hintTextSize: 14.5,
              hintTextStyle: FontFamily.sfProDisplayRegular,
            ).paddingOnly(left: 10),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 10),
                Button(
                  buttonColor: AppColors.whiteColor,
                  buttonText: "txtClose".tr,
                  textColor: AppColors.primaryAppColor,
                  fontStyle: FontFamily.sfProDisplay,
                  fontSize: 16.5,
                  height: 45,
                  width: Get.width * 0.31,
                  onTap: () {
                    bookingDetailScreenController.reasonEditingController.clear();
                    Get.back();
                  },
                ),
                const Spacer(),
                Button(
                  buttonColor: AppColors.cancelButton,
                  buttonText: "txtCancel".tr,
                  textColor: AppColors.whiteColor,
                  fontStyle: FontFamily.sfProDisplay,
                  fontSize: 16.5,
                  height: 45,
                  width: Get.width * 0.31,
                  onTap: () async {
                    if (bookingDetailScreenController.reasonEditingController.text.isEmpty) {
                      Utils.showToast(Get.context!, "txtPleaseEnterSpecificReason".tr);
                    } else {
                      FocusScopeNode currentFocus = FocusScope.of(context);
                      currentFocus.focusedChild?.unfocus();

                      await bookingDetailScreenController.onCancelBookingApiCall(
                        bookingId: bookingId,
                        reason: bookingDetailScreenController.reasonEditingController.text,
                        person: "user",
                      );
                      if (bookingDetailScreenController.cancelBookingCategory?.status == true) {
                        Utils.showToast(Get.context!, bookingDetailScreenController.cancelBookingCategory?.message ?? "");

                        bookingDetailScreenController.startPending = 0;
                        bookingDetailScreenController.getPending = [];
                        bookingDetailScreenController.reasonEditingController.clear();

                        Get.back();
                        await bookingDetailScreenController.onGetAllBookingApiCall(
                          userId: Constant.storage.read<String>('UserId') ?? "",
                          status: "pending",
                          start: bookingDetailScreenController.startPending.toString(),
                          limit: bookingDetailScreenController.limitPending.toString(),
                        );

                        if (bookingDetailScreenController.getAllBookingCategory?.status == true) {
                        } else {
                          Get.back();
                          Utils.showToast(Get.context!, bookingDetailScreenController.getAllBookingCategory?.message ?? "");
                        }
                      } else {
                        Utils.showToast(Get.context!, bookingDetailScreenController.cancelBookingCategory?.message ?? "");
                        log("Please Wait !!");
                      }
                    }
                  },
                ),
                const SizedBox(width: 10),
              ],
            )
          ],
        ));
  }
}
