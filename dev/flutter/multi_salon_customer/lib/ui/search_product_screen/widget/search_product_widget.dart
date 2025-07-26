import 'package:flutter/material.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/utils/app_colors.dart';

class SearchProductAppBarView extends StatelessWidget {
  const SearchProductAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "Search products",
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
        ),
      ),
    );
  }
}
