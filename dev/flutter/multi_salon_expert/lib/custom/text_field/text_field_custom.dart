// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class TextFieldCustom extends StatelessWidget {
  Widget? suffixIcon;
  Widget? prefixIcon;
  Function()? onEditingComplete;
  Function()? onTap;
  int? maxLines;
  String? hintText;
  String? errorText;
  bool? obscureText;
  double? width;
  double? height;
  String? fieldName;
  TextInputType? textInputType;
  List<TextInputFormatter>? inputFormatters;
  String? Function(String?)? validator;
  TextEditingController? controller;
  TextInputAction? textInputAction;

  TextFieldCustom(
      {super.key,
      this.suffixIcon,
      this.prefixIcon,
      this.onTap,
      this.onEditingComplete,
      this.maxLines,
      this.hintText,
      this.errorText,
      this.obscureText,
      this.width,
      this.height,
      this.fieldName,
      this.textInputType,
      this.inputFormatters,
      this.validator,
      this.controller,
      this.textInputAction});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: AppColors.whiteColor,
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: textInputType,
        obscureText: obscureText!,
        validator: validator,
        cursorColor: AppColors.primaryAppColor,
        maxLines: maxLines,
        inputFormatters: inputFormatters ?? [],
        style: TextStyle(
          fontSize: 16,
          fontFamily: FontFamily.sfProDisplayBold,
          color: AppColors.primaryTextColor,
        ),
        onEditingComplete: onEditingComplete,
        textInputAction: textInputAction,
        decoration: InputDecoration(
          suffixIcon: suffixIcon,
          prefixIcon: prefixIcon,
          hintText: hintText,
          errorText: errorText,
          errorStyle: TextStyle(
            fontSize: 12,
            fontFamily: FontFamily.sfProDisplayRegular,
            color: AppColors.redColor,
          ),
          hintStyle: TextStyle(
            color: AppColors.grey.withOpacity(0.8),
            fontSize: 14,
            fontFamily: FontFamily.sfProDisplayRegular,
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(
              color: AppColors.transparent,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          border: const OutlineInputBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(12),
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(
              color: AppColors.bgColor,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
