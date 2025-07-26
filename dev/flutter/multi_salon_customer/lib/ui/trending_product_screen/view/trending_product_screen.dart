import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/trending_product_screen/widget/trending_product_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class TrendingProductScreen extends StatelessWidget {
  const TrendingProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const TrendingProductAppBarView(),
      ),
      body: const TrendingProductItemView().paddingAll(12),
    );
  }
}
