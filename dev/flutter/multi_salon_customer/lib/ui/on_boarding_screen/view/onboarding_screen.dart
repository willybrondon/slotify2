import 'package:flutter/material.dart';
import 'package:salon_2/ui/on_boarding_screen/widget/on_boarding_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class OnBoardingScreen extends StatelessWidget {
  const OnBoardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: const OnBoardingView(),
    );
  }
}
