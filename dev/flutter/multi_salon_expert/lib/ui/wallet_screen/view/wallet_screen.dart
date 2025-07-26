import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtWallet".tr,
          method: InkWell(
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back,
              color: AppColors.whiteColor,
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          CustomMenu(
            leadingImage: AppAsset.icRevenue,
            title: "txtMyRevenue".tr,
            textColor: AppColors.countBooking,
            onTap: () {
              Get.toNamed(AppRoutes.revenueDetail);
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icOrderSummary,
            title: "txtOrderSummary".tr,
            textColor: AppColors.countBooking,
            onTap: () {
              Get.toNamed(AppRoutes.orderSummary);
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icAttendance,
            title: "txtAttendance".tr,
            textColor: AppColors.countBooking,
            onTap: () {
              Get.toNamed(AppRoutes.attendance);
            },
          ),
          CustomMenu(
            leadingImage: AppAsset.icPaymentMethod,
            title: "txtWithdrawMethod".tr,
            textColor: AppColors.countBooking,
            onTap: () {
              Get.toNamed(AppRoutes.paymentMethod);
            },
          ),
        ],
      ).paddingOnly(top: 15),
    );
  }
}
