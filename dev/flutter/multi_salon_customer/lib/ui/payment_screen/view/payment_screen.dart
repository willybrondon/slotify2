import 'package:flutter/material.dart';
import 'package:salon_2/ui/payment_screen/widget/payment_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.whiteColor,
        foregroundColor: AppColors.blackColor,
        iconTheme: IconThemeData(color: AppColors.blackColor),
        flexibleSpace: const PaymentAppBarView(),
      ),
      bottomNavigationBar: const PaymentScreenBottomView(),
      body: const PaymentMethodView(),
    );
  }
}
