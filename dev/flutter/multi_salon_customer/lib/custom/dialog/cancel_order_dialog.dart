import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/ui/order_detail_screen/controller/order_detail_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class CancelOrderDialog extends StatelessWidget {
  const CancelOrderDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Container(
          height: 345,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.dialogBg,
            borderRadius: BorderRadius.circular(48),
          ),
          child: Column(
            children: [
              Image.asset(
                AppAsset.icAppointment,
                height: 100,
                width: 100,
              ).paddingOnly(top: 15, bottom: 35),
              Text(
                "txtCancelOrder".tr,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  color: AppColors.primaryTextColor,
                  fontSize: 24,
                ),
              ),
              SizedBox(
                width: Get.width * 0.6,
                child: Text(
                  "Are you sure you want to cancel this order ?",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                    color: AppColors.captionDialog,
                    fontSize: 16,
                  ),
                ),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 10),
                  Button(
                    buttonColor: AppColors.whiteColor,
                    buttonText: "txtClose".tr,
                    textColor: AppColors.primaryAppColor,
                    fontStyle: AppFontFamily.sfProDisplay,
                    fontSize: 16.5,
                    height: 48,
                    width: Get.width * 0.31,
                    onTap: () {
                      Get.back();
                    },
                  ),
                  const Spacer(),
                  Button(
                    buttonColor: AppColors.cancelButton,
                    buttonText: "txtCancel".tr,
                    textColor: AppColors.whiteColor,
                    fontStyle: AppFontFamily.sfProDisplay,
                    fontSize: 16.5,
                    height: 48,
                    width: Get.width * 0.31,
                    onTap: () async {
                      await logic.onCancelOrderClick();
                    },
                  ),
                  const SizedBox(width: 10),
                ],
              ).paddingOnly(bottom: 15)
            ],
          ),
        );
      },
    );
  }
}
