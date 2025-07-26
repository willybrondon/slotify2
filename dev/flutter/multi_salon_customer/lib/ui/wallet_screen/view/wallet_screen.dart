import 'package:flutter/material.dart';
import 'package:salon_2/ui/wallet_screen/widget/wallet_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const WalletAppBarView(),
      ),
      body: Column(
        children: [
          const WalletBalanceView(),
          const WalletButtonView(),
          Divider(color: AppColors.greyColor.withOpacity(0.2)),
          const WalletCurrentTransactionTitleView(),
          const Expanded(child: WalletCurrentTransactionView()),
        ],
      ),
    );
  }
}
