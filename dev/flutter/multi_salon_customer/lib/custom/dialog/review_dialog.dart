// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/utils.dart';

class ReviewDialog extends StatelessWidget {
  final String bookingId;

  const ReviewDialog({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 390,
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Container(
            height: 55,
            width: Get.width,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              color: AppColors.primaryAppColor,
            ),
            child: Center(
              child: Text(
                "txtEnterReview".tr,
                style: TextStyle(
                  color: AppColors.whiteColor,
                  fontSize: 18,
                  fontFamily: AppFontFamily.sfProDisplayBold,
                ),
              ),
            ),
          ),
          SizedBox(height: Get.height * 0.02),
          Container(
            height: 50,
            width: Get.width,
            margin: const EdgeInsets.only(left: 12, right: 12),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(8),
              boxShadow: Constant.boxShadow,
            ),
            child: Row(
              children: [
                Text(
                  "txtYourReview".tr,
                  style: TextStyle(
                    color: AppColors.darkGrey5,
                    fontSize: 14,
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 48,
                  width: Get.width * 0.46,
                  child: GetBuilder<BookingDetailScreenController>(
                    id: Constant.idSelectedStar,
                    builder: (logic) {
                      return ListView.builder(
                        itemCount: 5,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          return GestureDetector(
                            onTap: () {
                              logic.onSelectedStar(index);
                            },
                            child: Image.asset(
                              index <= logic.selectedStarIndex ? AppAsset.icStarFilled : AppAsset.icStarOutline,
                              height: 25,
                              width: 25,
                            ).paddingOnly(left: 8),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ).paddingOnly(left: 10),
          ),
          SizedBox(height: Get.height * 0.02),
          GetBuilder<BookingDetailScreenController>(
            builder: (logic) {
              return Container(
                height: 168,
                width: Get.width,
                margin: const EdgeInsets.only(left: 12, right: 12),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: Constant.boxShadow,
                ),
                child: TextField(
                  minLines: 1,
                  maxLines: 3,
                  controller: logic.reviewEditingController,
                  decoration: InputDecoration(
                    hintText: 'txtEnterYourReview'.tr,
                    border: InputBorder.none,
                    hintStyle: TextStyle(
                      color: AppColors.darkGrey5,
                      fontSize: 14,
                      fontFamily: AppFontFamily.sfProDisplayMedium,
                    ),
                  ),
                ).paddingOnly(left: 10),
              );
            },
          ),
          SizedBox(height: Get.height * 0.02),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SizedBox(width: 10),
              Button(
                buttonColor: AppColors.whiteColor,
                buttonText: "txtCancel".tr,
                textColor: AppColors.primaryTextColor,
                fontStyle: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 48,
                width: Get.width * 0.31,
                borderColor: AppColors.grey.withOpacity(0.1),
                borderWidth: 1,
                onTap: () {
                  Get.back();
                },
              ),
              const Spacer(),
              GetBuilder<BookingDetailScreenController>(
                id: Constant.idProgressView,
                builder: (logic) {
                  return Button(
                    buttonColor: AppColors.primaryAppColor,
                    buttonText: "txtSubmit".tr,
                    textColor: AppColors.whiteColor,
                    fontStyle: AppFontFamily.sfProDisplay,
                    fontSize: 16.5,
                    height: 48,
                    width: Get.width * 0.31,
                    onTap: () async {
                      if (logic.selectedStarIndex == -1) {
                        Utils.showToast(Get.context!, "txtPleaseAddReview".tr);
                      } else {
                        FocusScopeNode currentFocus = FocusScope.of(context);
                        currentFocus.focusedChild?.unfocus();

                        if (logic.selectedStarIndex == 0) {
                          Utils.showToast(Get.context!, "Please Enter All Details");
                        } else {
                          await logic.onUserReviewApiCall(
                            rating: logic.selectedStarIndex + 1,
                            bookingId: bookingId,
                            review: logic.reviewEditingController.text,
                          );

                          if (logic.userSubmitReviewCategory?.status == true) {
                            Utils.showToast(Get.context!, logic.userSubmitReviewCategory?.message ?? '');

                            logic.selectedStarIndex = -1;
                            logic.reviewEditingController.clear();
                            Get.back();
                          } else {
                            Utils.showToast(Get.context!, logic.userSubmitReviewCategory?.message ?? '');
                          }
                        }
                      }
                    },
                  );
                },
              ),
              const SizedBox(width: 10),
            ],
          ).paddingOnly(left: 12, right: 12),
        ],
      ),
    );
  }
}
