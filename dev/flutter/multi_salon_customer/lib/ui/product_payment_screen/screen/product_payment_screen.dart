import 'package:flutter/material.dart';
import 'package:salon_2/ui/product_payment_screen/widget/product_payment_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class ProductPaymentScreen extends StatelessWidget {
  const ProductPaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const ProductPaymentAppBarView(),
      ),
      bottomNavigationBar: const ProductPaymentScreenBottomView(),
      body: const ProductPaymentMethodView(),
    );
  }
}
