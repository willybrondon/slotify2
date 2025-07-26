import 'package:flutter/material.dart';
import 'package:salon_2/ui/confirm_booking_screen/widget/confirm_booking_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class ConfirmBookingScreen extends StatelessWidget {
  const ConfirmBookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.confirmBookingBg,
      bottomNavigationBar: const ConfirmBookingBottomView(),
      body: const SingleChildScrollView(
        child: Column(
          children: [
            ConfirmBookingPaymentView(),
            ConfirmBookingInfoView(),
          ],
        ),
      ),
    );
  }
}
