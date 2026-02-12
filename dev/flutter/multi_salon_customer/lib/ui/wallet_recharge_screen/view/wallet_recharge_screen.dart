import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/wallet_recharge_screen/widget/wallet_recharge_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class WalletRechargeScreen extends StatelessWidget {
  const WalletRechargeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        title: Text(
          "txtRechargeWallet".tr,
          style: TextStyle(
            color: AppColors.blackColor,
            fontWeight: FontWeight.bold,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
        backgroundColor: AppColors.whiteColor,
        foregroundColor: AppColors.blackColor,
        iconTheme: IconThemeData(color: AppColors.blackColor),
      ),
      body: const WalletRechargeScreenWidget(),
    );
  }
}

