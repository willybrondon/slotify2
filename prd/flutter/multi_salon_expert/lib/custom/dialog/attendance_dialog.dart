// ignore_for_file: must_be_immutable


import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/revenue_screen/controller/revenue_screen_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/utils.dart';

class AttendanceDialog extends StatelessWidget {
  const AttendanceDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: Get.height * 0.41,
        padding: const EdgeInsets.only(bottom: 25),
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
                color: AppColors.iconColor,
              ),
              child: Center(
                child: Text(
                  "txtAttendance".tr,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontSize: 18,
                    fontFamily: FontFamily.sfProDisplayBold,
                  ),
                ),
              ),
            ),
            Image.asset(
              AppAsset.icAttendanceNo,
              height: 115,
              width: 115,
              color: AppColors.primaryAppColor,
            ).paddingOnly(top: 15, bottom: 15),
            Text(
              "txtNoAttendance".tr,
              style: TextStyle(
                color: AppColors.title,
                fontSize: 18,
                fontFamily: FontFamily.sfProDisplayMedium,
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GetBuilder<RevenueScreenController>(
                  builder: (logic) {
                    return AppButton(
                      height: 50,
                      width: Get.width * 0.31,
                      buttonColor: AppColors.transparent,
                      buttonText: "txtNo".tr,
                      textColor: AppColors.primaryAppColor,
                      fontFamily: FontFamily.sfProDisplay,
                      borderColor: AppColors.primaryAppColor,
                      borderWidth: 1,
                      fontSize: 16.5,
                      onTap: () async {
                        await logic.onExpertAttendanceApiCall(
                          expertId: Constant.storage.read<String>("expertId").toString(),
                          action: "absent",
                        );

                        if (logic.expertAttendanceCategory?.status == true) {
                          Get.back();
                          Utils.showToast(Get.context!, logic.expertAttendanceCategory?.message ?? "");
                        } else {
                          Utils.showToast(Get.context!, logic.expertAttendanceCategory?.message ?? "");
                        }
                      },
                    );
                  },
                ),
                GetBuilder<RevenueScreenController>(
                  builder: (logic) {
                    return AppButton(
                      height: 50,
                      width: Get.width * 0.31,
                      buttonColor: AppColors.primaryAppColor,
                      buttonText: "txtYes".tr,
                      textColor: AppColors.whiteColor,
                      fontFamily: FontFamily.sfProDisplay,
                      fontSize: 16.5,
                      onTap: () async {
                        await logic.onExpertAttendanceApiCall(
                          expertId: Constant.storage.read<String>("expertId").toString(),
                          action: "attend",
                        );

                        if (logic.expertAttendanceCategory?.status == true) {
                          Get.back();
                          Utils.showToast(Get.context!, logic.expertAttendanceCategory?.message ?? "");
                        } else {
                          Utils.showToast(Get.context!, logic.expertAttendanceCategory?.message ?? "");
                        }
                      },
                    );
                  },
                )
              ],
            ).paddingOnly(left: 15, right: 15)
          ],
        ));
  }
}
