// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';

class AppButton extends StatelessWidget {
  Function()? onTap;
  String? buttonText;
  String? fontFamily;
  double? width;
  double? height;
  double? fontSize;
  double? borderWidth;
  double? radius;
  Color? buttonColor;
  Color? color;
  Color? borderColor;

  AppButton({
    super.key,
    this.onTap,
    this.buttonText,
    this.fontFamily,
    this.width,
    this.height,
    this.borderWidth,
    this.radius,
    this.fontSize,
    this.buttonColor,
    this.color,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius ?? 50),
          color: buttonColor,
          border: Border.all(
            color: borderColor ?? Colors.transparent,
            width: borderWidth ?? 0.0,
          ),
        ),
        height: height,
        width: width,
        child: Center(
          child: Text(
            buttonText!,
            style: TextStyle(
              letterSpacing: 0.5,
              color: color,
              fontFamily: fontFamily,
              fontSize: fontSize,
            ),
          ),
        ),
      ),
    );
  }
}
