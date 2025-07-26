import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/product_payment_screen/model/create_order_model.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class OrderConfirmDialog extends StatelessWidget {
  final Items items;
  final OrderData orderData;
  const OrderConfirmDialog({super.key, required this.items, required this.orderData});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 365,
      width: 300,
      padding: const EdgeInsets.only(left: 10, right: 10, top: 15, bottom: 15),
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Image.asset(
            AppAsset.inSuccessfully,
            height: 90,
            width: 90,
          ).paddingOnly(top: 10, bottom: 20),
          Text(
            "txtOrderPlacedSuccessfully".tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              color: AppColors.categoryService,
              fontSize: 20,
            ),
          ),
          SizedBox(
            width: Get.width * 0.6,
            child: Text(
              "txtYourOrderHasSuccessfully".tr,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                color: AppColors.captionDialog,
                fontSize: 14,
              ),
            ),
          ),
          const Spacer(),
          AppButton(
            buttonColor: AppColors.primaryAppColor,
            width: Get.width * 0.65,
            height: 46,
            buttonText: "txtGoToOrderDetails".tr,
            color: AppColors.whiteColor,
            fontFamily: AppFontFamily.sfProDisplay,
            borderColor: AppColors.grey.withOpacity(0.1),
            borderWidth: 1,
            fontSize: 15,
            onTap: () {
              Get.back();
              Get.toNamed(
                AppRoutes.orderDetail,
                arguments: [items, orderData],
              );
            },
          ),
          const SizedBox(height: 8),
          AppButton(
            buttonColor: AppColors.whiteColor,
            width: Get.width * 0.65,
            height: 46,
            buttonText: "txtCancel".tr,
            borderColor: AppColors.greyColor.withOpacity(0.2),
            borderWidth: 1,
            fontFamily: AppFontFamily.sfProDisplay,
            fontSize: 15,
            color: AppColors.primaryTextColor,
            onTap: () {
              Get.back();
            },
          )
        ],
      ),
    );
  }
}
