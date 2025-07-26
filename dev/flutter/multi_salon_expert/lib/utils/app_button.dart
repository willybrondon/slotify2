// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';

class AppButton extends StatelessWidget {
  Function()? onTap;
  String? buttonText;
  double? width;
  double? height;
  double? fontSize;
  Color? buttonColor;
  Color? textColor = AppColors.whiteColor;
  String? icon;
  String? fontFamily;
  Color? iconColor;
  Color? borderColor;
  double? borderWidth;
  double? borderRadius;
  List<BoxShadow>? boxShadow;

  AppButton({
    super.key,
    this.onTap,
    this.buttonText,
    this.width,
    this.height,
    this.fontSize,
    this.icon,
    this.iconColor,
    this.textColor,
    this.boxShadow,
    this.borderWidth,
    this.borderColor,
    this.fontFamily,
    this.buttonColor,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      highlightColor: Colors.transparent,
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 5),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(borderRadius ?? 48),
            border: Border.all(
              color: borderColor ?? AppColors.transparent,
              width: borderWidth ?? 0,
            ),
            color: buttonColor,
            boxShadow: boxShadow),
        height: height,
        width: width,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: Get.height * 0.01),
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null && icon!.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(right: 5),
                    child: Image.asset(icon!, color: iconColor, height: 17, width: 17),
                  ),
                Text(
                  buttonText!,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: textColor ?? AppColors.whiteColor,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
