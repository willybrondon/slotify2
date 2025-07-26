// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class CustomTitle extends StatelessWidget {
  final String title;
  final Widget method;
  Widget? widget;
  double? leftPadding;

  CustomTitle({
    super.key,
    required this.title,
    required this.method,
    this.widget,
    this.leftPadding,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SizedBox(
              width: Get.width * 0.85,
              child: Text(
                title,
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo500,
                  color: AppColors.appText,
                  fontSize: 14,
                ),
              ).paddingOnly(bottom: 12, left: leftPadding ?? 5),
            ),
            widget ?? const SizedBox()
          ],
        ),
        method
      ],
    );
  }
}
