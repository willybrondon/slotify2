import 'package:flutter/material.dart';
import 'package:salon_2/ui/wallet_recharge_screen/widget/wallet_recharge_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class WalletRechargeScreen extends StatelessWidget {
  const WalletRechargeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        title: const Text("Recharge Wallet"),
        backgroundColor: AppColors.primaryAppColor,
        foregroundColor: AppColors.whiteColor,
      ),
      body: const WalletRechargeScreenWidget(),
    );
  }
}

