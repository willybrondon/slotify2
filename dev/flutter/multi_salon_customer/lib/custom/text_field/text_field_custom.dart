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
  int? maxLine;
  String? hintText;
  String? errorText;
  bool? obscureText;
  bool? readOnly;
  double? width;
  double? height;
  int? maxLines;
  int? maxLength;
  List<TextInputFormatter>? inputFormatters;
  String? fieldName;
  String? Function(String?)? validator;
  String? Function(String?)? onChanged;
  TextEditingController? controller;
  TextInputType? textInputType;
  TextInputAction? textInputAction;

  TextFieldCustom(
      {super.key,
      this.suffixIcon,
      this.prefixIcon,
      this.onTap,
      this.onEditingComplete,
      this.onChanged,
      this.maxLine,
      this.hintText,
      this.errorText,
      this.obscureText,
      this.readOnly,
      this.maxLines,
      this.width,
      this.height,
      this.inputFormatters,
      this.fieldName,
      this.validator,
      this.textInputType,
      this.textInputAction,
      this.controller,
      this.maxLength});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      onTap: onTap,
      controller: controller,
      obscureText: obscureText ?? false,
      validator: validator,
      maxLines: maxLine,
      cursorColor: AppColors.primaryAppColor,
      keyboardType: textInputType,
      textInputAction: textInputAction,
      readOnly: readOnly ?? false,
      inputFormatters: inputFormatters ?? [],
      maxLength: maxLength,
      style: TextStyle(
        fontSize: 15,
        fontFamily: FontFamily.sfProDisplay,
        color: AppColors.primaryTextColor,
      ),
      onChanged: onChanged,
      onEditingComplete: onEditingComplete,
      decoration: InputDecoration(
        suffixIcon: suffixIcon,
        prefixIcon: prefixIcon,
        hintText: hintText,
        errorText: errorText,
        counterText: "",
        errorStyle: TextStyle(
          fontSize: 12,
          fontFamily: FontFamily.sfProDisplayRegular,
          color: AppColors.redColor,
        ),
        hintStyle: TextStyle(
            color: AppColors.grey.withOpacity(0.7), fontSize: 14, fontFamily: FontFamily.sfProDisplayRegular),
        border: InputBorder.none,
      ),
    );
  }
}
