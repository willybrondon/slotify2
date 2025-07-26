import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/new_product_screen/widget/new_product_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class NewProductScreen extends StatelessWidget {
  const NewProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const NewProductAppBarView(),
      ),
      body: const NewProductItemView().paddingAll(12),
    );
  }
}
