// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class OrderDetailTitle extends StatelessWidget {
  final String title;
  final String subTitle;
  Widget? widget;
  Color? titleColor;
  Color? subTitleColor;
  String? titleFontFamily;
  String? subTitleFontFamily;
  double? titleFontSize;
  double? subTitleFontSize;
  double? bottomPadding;
  double? subTitleWidth;
  OrderDetailTitle({
    super.key,
    required this.title,
    required this.subTitle,
    this.widget,
    this.titleColor,
    this.subTitleColor,
    this.titleFontFamily,
    this.subTitleFontFamily,
    this.titleFontSize,
    this.subTitleFontSize,
    this.bottomPadding,
    this.subTitleWidth,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: TextStyle(
            color: titleColor ?? AppColors.primaryAppColor,
            fontFamily: titleFontFamily ?? AppFontFamily.heeBo600,
            fontSize: titleFontSize ?? 17,
          ),
        ),
        widget ?? const SizedBox(),
        const Spacer(),
        SizedBox(
          width: subTitleWidth,
          child: Text(
            subTitle,
            style: TextStyle(
              color: subTitleColor ?? AppColors.currencyGrey,
              fontFamily: subTitleFontFamily ?? AppFontFamily.heeBo500,
              fontSize: subTitleFontSize ?? 15,
            ),
          ),
        ),
      ],
    ).paddingOnly(bottom: bottomPadding ?? 15);
  }
}
