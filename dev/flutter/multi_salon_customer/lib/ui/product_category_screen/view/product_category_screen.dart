import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/product_category_screen/widget/product_category_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class ProductCategoryScreen extends StatelessWidget {
  const ProductCategoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const ProductCategoryAppBarView(),
      ),
      body: const ProductCategoryItemView().paddingAll(12),
    );
  }
}
