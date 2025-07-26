// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class ViewAll extends StatelessWidget {
  final String title;
  final String subtitle;
  Color? textColor;
  String? fontFamily;
  double? fontSize;
  Function()? onTap;

  ViewAll({
    super.key,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.textColor,
    this.fontFamily,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              fontFamily: fontFamily ?? AppFontFamily.heeBo700,
              fontSize: fontSize ?? 18,
              color: textColor ?? AppColors.primaryTextColor,
            ),
          ),
          Column(
            children: [
              Text(
                subtitle,
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 12,
                  color: AppColors.grey,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
