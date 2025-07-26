// ignore_for_file: must_be_immutable

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';

class TextFormFieldCustom extends StatelessWidget {
  final Widget method;
  final String title;
  Color? hintTextColor;
  String? hintTextStyle;
  double? hintTextSize;
  double? borderWidth;
  double? height;
  Color? borderColor;

  TextFormFieldCustom(
      {super.key,
      required this.method,
      required this.title,
      this.hintTextStyle,
      this.hintTextSize,
      this.hintTextColor,
      this.borderColor,
      this.height,
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
                style: TextStyle(fontSize: hintTextSize, color: hintTextColor, fontFamily: hintTextStyle),
              ).paddingOnly(left: 5, bottom: 5),
        Container(
          height: height,
          padding: const EdgeInsets.only(left: 10),
          decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(11),
              border: Border.all(color: borderColor ?? AppColors.transparent, width: borderWidth ?? 0.0)),
          child: method,
        ),
      ],
    );
  }
}
