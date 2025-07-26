import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';

class ConfirmDialog extends StatefulWidget {
  const ConfirmDialog({super.key});

  @override
  State<ConfirmDialog> createState() => _ConfirmDialogState();
}

class _ConfirmDialogState extends State<ConfirmDialog> {
  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: bookingScreenController.checkItem.length <= 2 ? 335 : 375,
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Container(
            height: 58,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(44),
                topRight: Radius.circular(44),
              ),
              color: AppColors.primaryAppColor,
            ),
            child: Center(
              child: Text(
                "txtConfirmBooking".tr,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplay,
                  color: AppColors.whiteColor,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          SizedBox(
            height: bookingScreenController.checkItem.length <= 2 ? 60 : 115,
            child: ListView.builder(
              itemCount: bookingScreenController.checkItem.length,
              physics: const AlwaysScrollableScrollPhysics(),
              scrollDirection: Axis.vertical,
              itemBuilder: (context, index) {
                return Row(
                  children: [
                    Container(
                      height: 18,
                      width: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.currency,
                      ),
                      padding: const EdgeInsets.all(5),
                      margin: const EdgeInsets.only(right: 5),
                      child: Image.asset(AppAsset.icCheck),
                    ),
                    Text(
                      bookingScreenController.checkItem[index],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        color: AppColors.currency,
                        fontSize: 16,
                      ),
                    )
                  ],
                ).paddingOnly(bottom: 8);
              },
            ),
          ).paddingOnly(top: 15, left: 25, bottom: 18),
          Text(
            "txtBookAppointment".tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayRegular,
              color: AppColors.captionDialog,
              fontSize: 17,
            ),
          ),
          InkWell(
            onTap: () {
              setState(() {
                bookingScreenController.checkValue = !bookingScreenController.checkValue;
              });
            },
            highlightColor: AppColors.transparent,
            splashColor: AppColors.transparent,
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      bookingScreenController.checkValue = !bookingScreenController.checkValue;
                    });
                  },
                  child: Container(
                    height: 23,
                    width: 23,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.primaryAppColor),
                    ),
                    child: bookingScreenController.checkValue
                        ? Icon(
                            Icons.check,
                            size: 16,
                            color: AppColors.primaryAppColor,
                          )
                        : const SizedBox(),
                  ).paddingOnly(left: 5, right: 3),
                ),
                SizedBox(
                  width: Get.width * 0.6,
                  child: Text(
                    "desDisclaimerAgree".tr,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.termsDialog,
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                    ),
                    textAlign: TextAlign.center,
                  ).paddingOnly(right: 15),
                ),
              ],
            ).paddingOnly(left: 10, right: 10, top: 8),
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Button(
                buttonColor: AppColors.whiteColor,
                buttonText: "txtCancel".tr,
                textColor: AppColors.primaryAppColor,
                borderColor: AppColors.greyColor.withOpacity(0.2),
                borderWidth: 1,
                fontStyle: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: () {
                  Get.back();
                },
              ),
              Button(
                buttonColor:
                    bookingScreenController.checkValue == true ? AppColors.buttonDialog : AppColors.grey.withOpacity(0.5),
                buttonText: "txtConfirm".tr,
                textColor: AppColors.whiteColor,
                fontStyle: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: () {
                  if (bookingScreenController.checkValue == true) {
                    bookingScreenController.confirmDialogButton(context);
                  } else {
                    // Utils.showToast(Get.context!, "desPleaseAcceptConditions".tr);
                  }
                },
              )
            ],
          ).paddingOnly(left: 13, right: 13, bottom: 25)
        ],
      ),
    );
  }
}
