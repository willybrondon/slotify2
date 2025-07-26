import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/best_deal_offer_screen/widget/best_deal_offer_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class BestDealOfferScreen extends StatelessWidget {
  const BestDealOfferScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const BestDealOfferAppBarView(),
      ),
      body: const BestDealOfferItemView().paddingAll(12),
    );
  }
}
