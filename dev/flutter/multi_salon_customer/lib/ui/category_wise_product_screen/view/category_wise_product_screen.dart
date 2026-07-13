import 'package:flutter/material.dart';
import 'package:salon_2/ui/category_wise_product_screen/widget/category_wise_product_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class CategoryWiseProductScreen extends StatelessWidget {
  const CategoryWiseProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const CategoryWiseProductAppBarView(),
      ),
      body: const CategoryWiseProductItemView(),
    );
  }
}
