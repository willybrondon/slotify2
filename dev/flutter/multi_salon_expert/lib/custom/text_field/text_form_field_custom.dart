// ignore_for_file: must_be_immutable

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class TextFormFieldCustom extends StatelessWidget {
  final Widget method;
  final String title;
  Color? hintTextColor;
  String? hintTextStyle;
  double? hintTextSize;
  double? borderWidth;
  Color? borderColor;
  double? height;

  TextFormFieldCustom(
      {super.key,
      required this.method,
      required this.title,
      this.height,
      this.hintTextStyle,
      this.hintTextSize,
      this.hintTextColor,
      this.borderColor,
      this.borderWidth});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        title.isEmpty
            ? const SizedBox.shrink()
            : Text(
                title,
                style: TextStyle(
                  fontSize: 14.5,
                  color: AppColors.subTitle,
                  fontFamily: AppFontFamily.sfProDisplayMedium,
                ),
              ).paddingOnly(left: 3, bottom: 5),
        Container(
          margin: const EdgeInsets.only(bottom: 13),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(11),
            boxShadow: Constant.boxShadow,
            border: Border.all(
              color: borderColor ?? AppColors.transparent,
              width: borderWidth ?? 0.0,
            ),
          ),
          child: method,
        ),
      ],
    );
  }
}
