import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
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
    final orderId = orderData.orderId ?? '';
    final total = orderData.finalTotal ?? items.purchasedTimeProductPrice ?? 0;

    return Container(
      width: Get.width * 0.88,
      constraints: const BoxConstraints(maxWidth: 360),
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor.withOpacity(0.12),
            offset: const Offset(0, 8),
            blurRadius: 24,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 72,
            width: 72,
            decoration: BoxDecoration(
              color: AppColors.primaryAppColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Image.asset(
                AppAsset.inSuccessfully,
                height: 44,
                width: 44,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "txtOrderPlacedSuccessfully".tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              color: AppColors.primaryTextColor,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "txtYourOrderHasSuccessfully".tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayRegular,
              color: AppColors.email,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.backGround,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (orderId.isNotEmpty)
                  Text(
                    orderId,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo700,
                      fontSize: 13,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                const SizedBox(height: 6),
                Text(
                  items.product?.productName ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo500,
                    fontSize: 13,
                    color: AppColors.appText,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "txtTotalAmount".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo500,
                        fontSize: 13,
                        color: AppColors.email,
                      ),
                    ),
                    Text(
                      '$currency $total',
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo800,
                        fontSize: 16,
                        color: AppColors.primaryAppColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          AppButton(
            buttonColor: AppColors.primaryAppColor,
            width: double.infinity,
            height: 48,
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
          const SizedBox(height: 10),
          AppButton(
            buttonColor: AppColors.whiteColor,
            width: double.infinity,
            height: 46,
            buttonText: "txtCancel".tr,
            borderColor: AppColors.greyColor.withOpacity(0.2),
            borderWidth: 1,
            fontFamily: AppFontFamily.sfProDisplay,
            fontSize: 15,
            color: AppColors.primaryTextColor,
            onTap: () => Get.back(),
          ),
        ],
      ),
    );
  }
}
