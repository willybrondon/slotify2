// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';

class Button extends StatelessWidget {
  Function()? onTap;
  String? buttonText;
  String? fontStyle;
  double? fontSize;
  Color? buttonColor;
  Color? textColor;
  Color? borderColor;
  double? borderWidth;
  double? borderRadius;
  double? height;
  double? width;

  Button(
      {super.key,
      this.onTap,
      this.buttonText,
      this.fontStyle,
      this.fontSize,
      this.buttonColor,
      this.textColor,
      this.borderRadius,
      this.borderColor,
      this.borderWidth,
      this.height,
      this.width});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: height,
        width: width,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius ?? 48),
          border: Border.all(color: borderColor ?? AppColors.transparent, width: borderWidth ?? 0),
          color: buttonColor,
          boxShadow: Constant.boxShadow,
        ),
        child: Center(
          child: Text(
            buttonText!,
            style: TextStyle(
              color: textColor,
              fontFamily: fontStyle,
              fontSize: fontSize,
            ),
          ),
        ),
      ),
    );
  }
}
