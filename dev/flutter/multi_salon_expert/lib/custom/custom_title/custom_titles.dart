// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class CustomTitles extends StatelessWidget {
  final String title;
  double? fontSize;
  CustomTitles({super.key, required this.title,this.fontSize});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Image.asset(AppAsset.icPoint, height: 20).paddingOnly(right: 8),
        Text(
          title,
          style: TextStyle(
            fontFamily: AppFontFamily.heeBo700,
            color: AppColors.primaryTextColor,
            fontSize: fontSize ?? 19,
          ),
        ),
      ],
    );
  }
}
